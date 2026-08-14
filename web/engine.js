(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./data.js') : root.GAME_DATA);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GAME_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const byId = (items, id) => items.find((item) => item.id === id);

  function seededRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  class GameEngine {
    constructor(options = {}) {
      this.random = options.random || Math.random;
      this.data = options.data || DATA;
      this.state = options.state ? deepClone(options.state) : this.createInitialState();
      this.ensureStateShape();
    }

    createInitialState() {
      const districtState = {};
      const homes = Object.fromEntries(this.data.rivalGangs.map((gang) => [gang.home, gang.id]));
      this.data.world.locations.forEach((location) => {
        const rivalGangId = homes[location.id] || (
          location.id === 'location.tunnel.west' ? 'rival.grey_union' :
          location.id === 'location.archive.sublevel' ? 'rival.neon_ghosts' :
          location.id === 'location.blocks.east' ? 'rival.red_knives' : null
        );
        const playerBase = location.id === this.data.world.startLocationId;
        districtState[location.id] = {
          control: playerBase ? 76 : clamp(18 + (55 - location.rival) * .34),
          police: location.police,
          rival: playerBase ? 5 : location.rival,
          unrest: clamp((location.risk + location.rival) / 2),
          intel: playerBase ? 2 : 0,
          owner: playerBase ? 'player' : (homes[location.id] || 'neutral'),
          rivalGangId
        };
      });
      return {
        schema: this.data.schema,
        version: this.data.version,
        turn: 1,
        selectedLocationId: this.data.world.startLocationId,
        resources: { money: 1500, supplies: 10 },
        boss: { respect: 48, fear: 32, loyalty: 66, influence: 37, heat: 14, notoriety: 25 },
        districts: districtState,
        gang: deepClone(this.data.starterGang),
        rivals: this.data.rivalGangs.map((gang) => ({
          id: gang.id,
          power: gang.power,
          wealth: gang.wealth,
          aggression: gang.aggression,
          economy: gang.economy,
          stealth: gang.stealth,
          lastMove: 'Beobachtet die Lage.'
        })),
        assets: [],
        usedRecruitNames: [],
        history: [{ turn: 1, type: 'system', text: 'LIVING-CITY-02 aktiv: Rivalengangs, Besitzverwaltung und taktische Kämpfe sind freigeschaltet.' }],
        actionCounts: {},
        pendingCombat: null,
        lastCombat: null,
        temporary: { propertyBoost: 0 },
        stats: {
          recruitsJoined: 0, policeRaids: 0, rivalMoves: 0, totalIncome: 0, propertyIncome: 0,
          propertiesBought: 0, propertiesSold: 0, upgrades: 0, combats: 0, combatWins: 0,
          retreats: 0, districtsTaken: 0, districtsLost: 0
        }
      };
    }

    ensureStateShape() {
      const fresh = this.createInitialState();
      if (!this.state.resources) this.state.resources = fresh.resources;
      if (!this.state.boss) this.state.boss = fresh.boss;
      if (!this.state.districts) this.state.districts = {};
      this.data.world.locations.forEach((location) => {
        const fallback = fresh.districts[location.id];
        const current = this.state.districts[location.id] || {};
        this.state.districts[location.id] = { ...fallback, ...current };
        if (!('owner' in current)) {
          this.state.districts[location.id].owner = location.id === this.data.world.startLocationId ? 'player' : 'neutral';
        }
        if (!('rivalGangId' in current)) this.state.districts[location.id].rivalGangId = fallback.rivalGangId;
        if (typeof this.state.districts[location.id].intel !== 'number') this.state.districts[location.id].intel = 0;
      });
      if (!Array.isArray(this.state.gang)) this.state.gang = deepClone(this.data.starterGang);
      this.state.gang.forEach((member) => {
        if (!member.id) member.id = `migrated-${member.name.replace(/\W/g, '').slice(0, 8)}-${this.state.gang.indexOf(member)}`;
      });
      if (!Array.isArray(this.state.rivals)) this.state.rivals = deepClone(fresh.rivals);
      this.data.rivalGangs.forEach((definition) => {
        if (!this.state.rivals.some((rival) => rival.id === definition.id)) {
          this.state.rivals.push(deepClone(fresh.rivals.find((rival) => rival.id === definition.id)));
        }
      });
      if (!Array.isArray(this.state.assets)) this.state.assets = [];
      this.state.assets.forEach((asset) => {
        if (!asset.level) asset.level = 1;
        if (!Array.isArray(asset.assignedCrewIds)) asset.assignedCrewIds = [];
        if (typeof asset.invested !== 'number') asset.invested = asset.purchasePrice || 0;
        if (typeof asset.lastIncome !== 'number') asset.lastIncome = 0;
      });
      if (!Array.isArray(this.state.history)) this.state.history = [];
      if (!Array.isArray(this.state.usedRecruitNames)) this.state.usedRecruitNames = [];
      if (!this.state.actionCounts) this.state.actionCounts = {};
      if (!this.state.temporary) this.state.temporary = { propertyBoost: 0 };
      if (typeof this.state.temporary.propertyBoost !== 'number') this.state.temporary.propertyBoost = 0;
      if (!this.state.stats) this.state.stats = {};
      Object.keys(fresh.stats).forEach((key) => {
        if (typeof this.state.stats[key] !== 'number') this.state.stats[key] = 0;
      });
      if (!('pendingCombat' in this.state)) this.state.pendingCombat = null;
      if (!('lastCombat' in this.state)) this.state.lastCombat = null;
      this.state.schema = this.data.schema;
      this.state.version = this.data.version;
    }

    getLocation(id = this.state.selectedLocationId) {
      return byId(this.data.world.locations, id) || this.data.world.locations[0];
    }
    getDistrict(id = this.state.selectedLocationId) { return this.state.districts[id]; }
    getRivalDefinition(id) { return byId(this.data.rivalGangs, id); }
    getRivalState(id) { return byId(this.state.rivals, id); }
    getAssetDefinition(id) { return byId(this.data.properties, id); }
    selectLocation(id) { if (this.state.districts[id]) this.state.selectedLocationId = id; return this.getSnapshot(); }

    canAfford(cost = {}) {
      return this.state.resources.money >= (cost.money || 0) && this.state.resources.supplies >= (cost.supplies || 0);
    }

    getActionAvailability(action) {
      if (this.state.pendingCombat) return { ok:false, reason:'Beende zuerst den laufenden Kampf.' };
      if (!this.canAfford(action.cost)) return { ok:false, reason:'Zu wenig Geld oder Vorräte.' };
      if (action.requiresProperty && this.state.assets.length === 0) return { ok:false, reason:'Benötigt mindestens einen eigenen Betrieb.' };
      return { ok:true, reason:'' };
    }

    applyEffects(effects, district) {
      if (effects.money) this.state.resources.money += effects.money;
      ['respect','fear','loyalty','influence','heat','notoriety'].forEach((key) => {
        if (typeof effects[key] === 'number') this.state.boss[key] = clamp(this.state.boss[key] + effects[key]);
      });
      ['control','police','rival','unrest'].forEach((key) => {
        if (typeof effects[key] === 'number') district[key] = clamp(district[key] + effects[key]);
      });
      if (effects.intel) district.intel = clamp(district.intel + effects.intel, 0, 5);
      if (effects.propertyBoost) this.state.temporary.propertyBoost = Math.max(this.state.temporary.propertyBoost, effects.propertyBoost);
    }

    applyAction(actionId) {
      const action = byId(this.data.actions, actionId);
      if (!action) return { ok:false, reason:'Unbekannte Aktion.' };
      if (action.combat) return { ok:false, reason:'Kampfaktionen werden über die taktische Kampfvorbereitung gestartet.', requiresCombat:true };
      const availability = this.getActionAvailability(action);
      if (!availability.ok) return availability;
      const district = this.getDistrict();
      this.state.resources.money -= action.cost.money || 0;
      this.state.resources.supplies -= action.cost.supplies || 0;
      this.applyEffects(action.effects || {}, district);
      this.state.actionCounts[actionId] = (this.state.actionCounts[actionId] || 0) + 1;
      this.recalculateNotoriety();
      this.log('action', `${action.title} in ${this.getLocation().title}: ${this.describeEffects(action.effects || {})}.`);
      this.advanceTurn(action.effects?.joinBoost || 0);
      return { ok:true, action, state:this.getSnapshot() };
    }

    describeEffects(effects) {
      const labels = {money:'Geld',respect:'Respekt',fear:'Furcht',loyalty:'Loyalität',influence:'Einfluss',heat:'Fahndung',control:'Kontrolle',rival:'Rivalen',police:'Polizei',unrest:'Unruhe',intel:'Aufklärung'};
      const parts = Object.entries(labels).filter(([key]) => typeof effects[key] === 'number' && effects[key] !== 0).slice(0,6)
        .map(([key,label]) => `${label} ${effects[key] > 0 ? '+' : ''}${effects[key]}`);
      return parts.length ? parts.join(', ') : 'Lage verändert';
    }

    recalculateNotoriety() {
      const force = (this.state.actionCounts.show_force || 0) + (this.state.actionCounts.raid || 0) * 1.6 + (this.state.actionCounts.sabotage || 0);
      const publicWork = (this.state.actionCounts.protect || 0) + (this.state.actionCounts.city_event || 0) + (this.state.actionCounts.party || 0);
      this.state.boss.notoriety = clamp(Math.max(this.state.boss.notoriety, 18 + force * 4 + publicWork * 2 + this.state.boss.influence * .2));
    }

    getAvailableProperties(locationId = this.state.selectedLocationId) {
      const location = this.getLocation(locationId);
      const district = this.getDistrict(locationId);
      const owned = new Set(this.state.assets.filter((asset) => asset.locationId === locationId).map((asset) => asset.propertyId));
      return this.data.properties.filter((property) => property.kinds.includes(location.kind) && !owned.has(property.id)).map((property) => {
        const multiplier = .82 + location.income / 260 + district.control / 500;
        const cost = Math.round(property.baseCost * multiplier / 10) * 10;
        const pseudo = { propertyId:property.id, locationId, purchasePrice:cost, level:1, assignedCrewIds:[], invested:cost };
        const projection = this.getAssetProjection(pseudo);
        return { ...deepClone(property), cost, projectedNet:projection.net };
      });
    }

    buyProperty(propertyId) {
      if (this.state.pendingCombat) return { ok:false, reason:'Im laufenden Kampf kann kein Besitz gekauft werden.' };
      const offer = this.getAvailableProperties().find((property) => property.id === propertyId);
      if (!offer) return { ok:false, reason:'Objekt hier nicht verfügbar oder bereits im Besitz.' };
      if (this.state.resources.money < offer.cost) return { ok:false, reason:`Für den Kauf fehlen ${offer.cost - this.state.resources.money} €.` };
      const asset = {
        id:`asset-${this.state.turn}-${this.state.assets.length+1}`,
        propertyId:offer.id, locationId:this.state.selectedLocationId, purchasePrice:offer.cost,
        level:1, assignedCrewIds:[], invested:offer.cost, boughtTurn:this.state.turn, lastIncome:0
      };
      this.state.resources.money -= offer.cost;
      this.state.assets.push(asset);
      this.state.stats.propertiesBought += 1;
      ['influence','respect','loyalty','heat'].forEach((key) => {
        if (offer[key]) this.state.boss[key] = clamp(this.state.boss[key] + offer[key]);
      });
      this.log('property', `${offer.title} in ${this.getLocation().title} gekauft: -${offer.cost} €.`);
      this.advanceTurn(offer.joinBoost || 0);
      return { ok:true, asset:deepClone(asset), state:this.getSnapshot() };
    }

    getAssetProjection(asset) {
      const def = this.getAssetDefinition(asset.propertyId);
      const location = this.getLocation(asset.locationId);
      const district = this.getDistrict(asset.locationId);
      if (!def || !location || !district) return { gross:0, upkeep:0, net:0, staffBonus:0, security:0 };
      const assigned = (asset.assignedCrewIds || []).map((id) => byId(this.state.gang,id)).filter(Boolean);
      const staffPower = assigned.reduce((sum,member) => sum + member.power + member.loyalty / 40, 0);
      const staffBonus = Math.min(.28, staffPower * .018);
      const levelFactor = 1 + (asset.level - 1) * .58;
      const locationFactor = .76 + location.income / 180;
      const controlFactor = .62 + district.control / 160;
      const gross = Math.max(0, Math.round(def.baseIncome * levelFactor * locationFactor * controlFactor * (1 + staffBonus) * (1 + this.state.temporary.propertyBoost)));
      const upkeep = Math.round(def.upkeep * (1 + (asset.level - 1) * .55));
      return { gross, upkeep, net:gross-upkeep, staffBonus:Math.round(staffBonus*100), security:(def.security||0)+assigned.length*2 };
    }

    getAssetUpgradeCost(assetId) {
      const asset = byId(this.state.assets, assetId);
      const def = asset && this.getAssetDefinition(asset.propertyId);
      if (!asset || !def || asset.level >= def.maxLevel) return null;
      return Math.round(asset.purchasePrice * (.48 + asset.level * .18) / 10) * 10;
    }

    upgradeProperty(assetId) {
      if (this.state.pendingCombat) return { ok:false, reason:'Beende zuerst den Kampf.' };
      const asset = byId(this.state.assets, assetId);
      const def = asset && this.getAssetDefinition(asset.propertyId);
      if (!asset || !def) return { ok:false, reason:'Besitz nicht gefunden.' };
      const cost = this.getAssetUpgradeCost(assetId);
      if (cost === null) return { ok:false, reason:'Maximale Ausbaustufe erreicht.' };
      if (this.state.resources.money < cost) return { ok:false, reason:`Für den Ausbau fehlen ${cost - this.state.resources.money} €.` };
      this.state.resources.money -= cost;
      asset.level += 1;
      asset.invested += cost;
      this.state.stats.upgrades += 1;
      this.state.boss.influence = clamp(this.state.boss.influence + 2);
      this.log('property', `${def.title} in ${this.getLocation(asset.locationId).title} auf Stufe ${asset.level} ausgebaut: -${cost} €.`);
      this.advanceTurn();
      return { ok:true, asset:deepClone(asset), state:this.getSnapshot() };
    }

    sellProperty(assetId) {
      if (this.state.pendingCombat) return { ok:false, reason:'Beende zuerst den Kampf.' };
      const index = this.state.assets.findIndex((asset) => asset.id === assetId);
      if (index < 0) return { ok:false, reason:'Besitz nicht gefunden.' };
      const asset = this.state.assets[index];
      const def = this.getAssetDefinition(asset.propertyId);
      const district = this.getDistrict(asset.locationId);
      const marketFactor = .55 + district.control / 500;
      const refund = Math.max(50, Math.round(asset.invested * marketFactor / 10) * 10);
      this.state.assets.splice(index,1);
      this.state.resources.money += refund;
      this.state.stats.propertiesSold += 1;
      this.log('property', `${def.title} in ${this.getLocation(asset.locationId).title} verkauft: +${refund} €.`);
      this.advanceTurn();
      return { ok:true, refund, state:this.getSnapshot() };
    }

    assignCrew(assetId, crewIds) {
      const asset = byId(this.state.assets, assetId);
      if (!asset) return { ok:false, reason:'Besitz nicht gefunden.' };
      const unique = [...new Set(crewIds)].slice(0,2);
      const valid = unique.filter((id) => {
        const member = byId(this.state.gang,id);
        return member && !member.injuredUntil;
      });
      if (valid.length !== unique.length) return { ok:false, reason:'Nur einsatzbereite Crew kann zugewiesen werden.' };
      this.state.assets.forEach((other) => {
        if (other.id !== assetId) other.assignedCrewIds = (other.assignedCrewIds || []).filter((id) => !valid.includes(id));
      });
      asset.assignedCrewIds = valid;
      this.log('property', `${valid.length ? valid.map((id)=>byId(this.state.gang,id).name).join(' & ') : 'Keine Crew'} für ${this.getAssetDefinition(asset.propertyId).title} eingeteilt.`);
      return { ok:true, asset:deepClone(asset), state:this.getSnapshot() };
    }

    getAssignedCrewIds() {
      return new Set(this.state.assets.flatMap((asset) => asset.assignedCrewIds || []));
    }

    getAvailableCombatCrew() {
      const assigned = this.getAssignedCrewIds();
      return this.state.gang.filter((member) => !member.injuredUntil && !assigned.has(member.id));
    }

    getCombatPreview(actionId='raid', locationId=this.state.selectedLocationId, crewIds=[]) {
      const action = byId(this.data.actions,actionId);
      if (!action?.combat) return null;
      const district = this.getDistrict(locationId);
      const location = this.getLocation(locationId);
      const available = this.getAvailableCombatCrew();
      const picked = crewIds.length ? available.filter((member) => crewIds.includes(member.id)).slice(0,action.combat.maxCrew) : available.slice(0,action.combat.maxCrew);
      const rival = this.getRivalState(district.rivalGangId);
      const rivalDef = this.getRivalDefinition(district.rivalGangId);
      const crewPower = picked.reduce((sum,member)=>sum+member.power*11+member.loyalty*.24,0);
      const bossBonus = this.state.boss.fear*.28 + this.state.boss.respect*.18 + this.state.boss.influence*.22;
      const intelBonus = district.intel*12;
      const attacker = Math.max(12,crewPower+bossBonus+intelBonus);
      const rivalPower = rival ? rival.power : 48;
      const defender = Math.max(18,district.rival*.72 + district.police*.10 + location.risk*.20 + rivalPower*.48 + (rivalDef?.aggression||50)*.12);
      const probability = Math.max(.15,Math.min(.90,attacker/(attacker+defender)));
      return { probability, percent:Math.round(probability*100), attackerPower:Math.round(attacker), defenderPower:Math.round(defender), crew:picked.map(deepClone), rivalGangId:district.rivalGangId, rivalName:rivalDef?.name || 'Lokale Rivalen' };
    }

    startCombat(actionId='raid', crewIds=[]) {
      const action = byId(this.data.actions,actionId);
      if (!action?.combat) return { ok:false, reason:'Keine Kampfaktion.' };
      const availability = this.getActionAvailability(action);
      if (!availability.ok) return availability;
      const preview = this.getCombatPreview(actionId,this.state.selectedLocationId,crewIds);
      if (!preview.crew.length) return { ok:false, reason:'Mindestens ein freies, einsatzbereites Gangmitglied wählen.' };
      this.state.resources.money -= action.cost.money || 0;
      this.state.resources.supplies -= action.cost.supplies || 0;
      this.applyEffects(action.effects || {},this.getDistrict());
      this.state.actionCounts[actionId]=(this.state.actionCounts[actionId]||0)+1;
      this.state.pendingCombat = {
        id:`combat-${this.state.turn}-${this.state.selectedLocationId}`,
        actionId, locationId:this.state.selectedLocationId, rivalGangId:preview.rivalGangId,
        crewIds:preview.crew.map((member)=>member.id), round:1, maxRounds:3,
        playerMorale:100, enemyMorale:100, advantage:Math.max(-.18,Math.min(.18,preview.probability-.5)), preview,
        log:[`Kampf beginnt in ${this.getLocation().title}: ${preview.crew.map((m)=>m.name).join(', ')} gegen ${preview.rivalName}.`]
      };
      this.state.stats.combats += 1;
      this.recalculateNotoriety();
      return { ok:true, combat:deepClone(this.state.pendingCombat), state:this.getSnapshot() };
    }

    combatDecision(decision) {
      const combat = this.state.pendingCombat;
      if (!combat) return { ok:false, reason:'Kein laufender Kampf.' };
      if (!['attack','cover','retreat'].includes(decision)) return { ok:false, reason:'Unbekannte Kampfentscheidung.' };
      if (decision === 'retreat') {
        combat.log.push('Die Crew bricht kontrolliert ab und rettet den Kern der Truppe.');
        this.state.stats.retreats += 1;
        return this.finishCombat('retreat');
      }

      const tacticalBase = combat.preview.probability + combat.advantage;
      let successChance = tacticalBase;
      let injuryRisk = .14;
      if (decision === 'attack') {
        successChance += .06;
        injuryRisk = .20;
      } else {
        successChance -= .05;
        injuryRisk = .05;
        combat.advantage = Math.min(.22, combat.advantage + .08);
        combat.playerMorale = Math.min(100, combat.playerMorale + 5);
      }
      successChance = Math.max(.12,Math.min(.92,successChance));
      const success = this.random() < successChance;
      const swing = 18 + Math.floor(this.random()*17);
      if (success) {
        combat.enemyMorale = clamp(combat.enemyMorale - swing,0,100);
        combat.log.push(decision==='attack' ? `Runde ${combat.round}: Angriff sitzt. Rivalen -${swing} Moral.` : `Runde ${combat.round}: Deckung hält, Gegenstoß trifft. Rivalen -${swing} Moral.`);
        combat.advantage = Math.min(.28,combat.advantage+.04);
      } else {
        const loss = decision==='cover' ? Math.max(5,Math.round(swing*.42)) : swing;
        combat.playerMorale = clamp(combat.playerMorale-loss,0,100);
        combat.log.push(decision==='attack' ? `Runde ${combat.round}: Angriff läuft fest. Crew -${loss} Moral.` : `Runde ${combat.round}: Druck bleibt hoch. Crew -${loss} Moral.`);
        combat.advantage = Math.max(-.25,combat.advantage-.04);
      }

      if (this.random() < injuryRisk) this.injureCombatMember(combat);
      if (combat.enemyMorale <= 0) return this.finishCombat('win');
      if (combat.playerMorale <= 0) return this.finishCombat('loss');

      if (combat.round >= combat.maxRounds) {
        const finalScore = combat.playerMorale + combat.preview.attackerPower*.18 + combat.advantage*100;
        const enemyScore = combat.enemyMorale + combat.preview.defenderPower*.18;
        return this.finishCombat(finalScore >= enemyScore ? 'win' : 'loss');
      }
      combat.round += 1;
      return { ok:true, finished:false, combat:deepClone(combat), state:this.getSnapshot() };
    }

    injureCombatMember(combat) {
      const pool = combat.crewIds.map((id)=>byId(this.state.gang,id)).filter((member)=>member && !member.injuredUntil);
      if (!pool.length) return;
      const target = pool[Math.floor(this.random()*pool.length)];
      target.injuredUntil = this.state.turn + 2;
      target.loyalty = clamp(target.loyalty-3,1,100);
      combat.log.push(`${target.name} wird verletzt und fällt vorübergehend aus.`);
    }

    finishCombat(outcome) {
      const combat = this.state.pendingCombat;
      const district = this.getDistrict(combat.locationId);
      const location = this.getLocation(combat.locationId);
      const rival = this.getRivalState(combat.rivalGangId);
      const action = byId(this.data.actions,combat.actionId);
      let moneyDelta = 0;
      let takeover = null;
      if (outcome === 'win') {
        moneyDelta = Math.round((action.combat.baseReward + district.rival*2.1) * (.88+this.random()*.24));
        this.state.resources.money += moneyDelta;
        district.control = clamp(district.control + 16);
        district.rival = clamp(district.rival - 20);
        district.unrest = clamp(district.unrest + 4);
        this.state.boss.respect = clamp(this.state.boss.respect+4);
        this.state.stats.combatWins += 1;
        if (rival) { rival.power = clamp(rival.power-5,15,100); rival.wealth=Math.max(0,rival.wealth-80); }
        takeover = this.evaluateTerritoryOwnership(combat.locationId,'player');
      } else if (outcome === 'retreat') {
        moneyDelta = -Math.min(this.state.resources.money,45+Math.floor(this.random()*35));
        this.state.resources.money += moneyDelta;
        district.control = clamp(district.control-2);
        district.rival = clamp(district.rival+3);
        this.state.boss.heat = clamp(this.state.boss.heat-1);
      } else {
        moneyDelta = -Math.min(this.state.resources.money,90+Math.floor(this.random()*90));
        this.state.resources.money += moneyDelta;
        district.control = clamp(district.control-8);
        district.rival = clamp(district.rival+10);
        district.unrest = clamp(district.unrest+8);
        this.state.boss.loyalty = clamp(this.state.boss.loyalty-3);
        if (rival) rival.power = clamp(rival.power+2,15,100);
        takeover = this.evaluateTerritoryOwnership(combat.locationId,combat.rivalGangId);
      }
      const result = {
        ...deepClone(combat), outcome, win:outcome==='win', moneyDelta, takeover,
        locationTitle:location.title, rivalName:this.getRivalDefinition(combat.rivalGangId)?.name || 'Rivalen'
      };
      result.log.push(outcome==='win' ? `Sieg: +${moneyDelta} € und deutlicher Kontrollgewinn.` : outcome==='retreat' ? `Rückzug: ${moneyDelta} € Verlust, Crew bleibt weitgehend intakt.` : `Niederlage: ${moneyDelta} € und Kontrollverlust.`);
      this.state.lastCombat = result;
      this.state.pendingCombat = null;
      this.log(outcome==='win'?'combat-win':outcome==='retreat'?'combat-retreat':'combat-loss',
        `${location.title}: ${outcome==='win'?'SIEG':outcome==='retreat'?'RÜCKZUG':'NIEDERLAGE'} · ${moneyDelta>=0?'+':''}${moneyDelta} €${takeover?` · ${takeover}`:''}.`);
      this.advanceTurn();
      return { ok:true, finished:true, result:deepClone(result), state:this.getSnapshot() };
    }

    evaluateTerritoryOwnership(locationId, preferredOwner) {
      const district = this.getDistrict(locationId);
      const oldOwner = district.owner;
      let newOwner = oldOwner;
      if (preferredOwner === 'player' && district.control >= 62 && district.rival <= 34) newOwner = 'player';
      else if (preferredOwner && preferredOwner !== 'player' && district.rival >= 68 && district.control <= 34) newOwner = preferredOwner;
      if (newOwner === oldOwner) return null;
      district.owner = newOwner;
      if (newOwner === 'player') {
        this.state.stats.districtsTaken += 1;
        this.state.boss.influence = clamp(this.state.boss.influence+5);
      } else if (oldOwner === 'player') {
        this.state.stats.districtsLost += 1;
        this.state.boss.influence = clamp(this.state.boss.influence-4);
      }
      return newOwner === 'player' ? 'Bezirk übernommen' : `Bezirk an ${this.getRivalDefinition(newOwner)?.name || 'Rivalen'} verloren`;
    }

    resolvePassiveIncome() {
      let districtIncome = 0;
      this.data.world.locations.forEach((location)=>{
        const district=this.getDistrict(location.id);
        if (district.owner==='player' || district.control>=55) {
          districtIncome += Math.round(location.income * (district.control/100) * (1-district.unrest/220));
        }
      });
      let propertyIncome = 0;
      this.state.assets.forEach((asset)=>{
        const projection=this.getAssetProjection(asset);
        asset.lastIncome=projection.net;
        propertyIncome += projection.net;
        const def=this.getAssetDefinition(asset.propertyId);
        if (def.supplyChance && this.random() < def.supplyChance * asset.level) this.state.resources.supplies += 1;
        if (def.intel) {
          const district=this.getDistrict(asset.locationId);
          district.intel=clamp(district.intel+def.intel,0,5);
        }
      });
      const income = Math.max(0,districtIncome+propertyIncome);
      if (income>0) {
        this.state.resources.money += income;
        this.state.stats.totalIncome += income;
        this.state.stats.propertyIncome += propertyIncome;
        this.log('income', `Einnahmen: +${income} € (${districtIncome} € Bezirke, ${propertyIncome} € Besitz).`);
      }
      this.state.temporary.propertyBoost=0;
    }

    resolveRivalGangs() {
      this.state.rivals.forEach((rival)=>{
        const def=this.getRivalDefinition(rival.id);
        const territories=this.data.world.locations.filter((location)=>this.getDistrict(location.id).owner===rival.id);
        rival.wealth += territories.reduce((sum,location)=>sum+Math.round(location.income*(def.economy/180)),0);
        if (this.random() > .48) return;

        let candidates=this.data.world.locations.filter((location)=>location.id!==this.data.world.startLocationId);
        if (def.strategy==='aggressive') {
          candidates.sort((a,b)=>(this.getDistrict(a.id).control-this.getDistrict(b.id).control)+(this.getDistrict(b.id).rival-this.getDistrict(a.id).rival));
        } else if (def.strategy==='economic') {
          candidates.sort((a,b)=>b.income-a.income);
        } else {
          candidates.sort((a,b)=>(this.getDistrict(b.id).intel-this.getDistrict(a.id).intel)+(this.getDistrict(a.id).police-this.getDistrict(b.id).police));
        }
        const target=candidates[Math.floor(this.random()*Math.min(3,candidates.length))];
        const district=this.getDistrict(target.id);
        const push = def.strategy==='aggressive' ? 7+Math.floor(this.random()*5) : 4+Math.floor(this.random()*5);
        district.rival=clamp(district.rival+push);
        district.rivalGangId=rival.id;
        if (def.strategy==='aggressive') {
          district.control=clamp(district.control-Math.ceil(push*.55));
          district.unrest=clamp(district.unrest+4);
          rival.power=clamp(rival.power+1,15,100);
          rival.lastMove=`Drückt offen in ${target.title}.`;
        } else if (def.strategy==='economic') {
          const spend=Math.min(rival.wealth,80);
          rival.wealth-=spend;
          district.control=clamp(district.control-3);
          rival.wealth+=45;
          rival.lastMove=`Kauft Einfluss in ${target.title}.`;
        } else {
          district.intel=Math.max(0,district.intel-1);
          district.unrest=clamp(district.unrest+5);
          district.police=clamp(district.police+2);
          rival.lastMove=`Unterwandert ${target.title}.`;
        }
        const takeover=this.evaluateTerritoryOwnership(target.id,rival.id);
        this.state.stats.rivalMoves+=1;
        this.log('rival', `${def.name}: ${rival.lastMove}${takeover?` ${takeover}.`:''}`);
      });
    }

    resolvePolicePressure() {
      const boss=this.state.boss;
      const district=this.getDistrict();
      const raidChance=this.getRaidRisk();
      if (this.random()<raidChance) {
        const loss=Math.min(this.state.resources.money,65+Math.floor(this.random()*100));
        this.state.resources.money-=loss;
        if (this.state.resources.supplies>0 && this.random()<.5) this.state.resources.supplies-=1;
        district.control=clamp(district.control-4);
        district.police=clamp(district.police+5);
        boss.heat=clamp(boss.heat+2);
        this.state.stats.policeRaids+=1;
        this.log('police', `Polizeizugriff in ${this.getLocation().title}: -${loss} € und Kontrolle -4.`);
      } else if (boss.heat>34) boss.heat=clamp(boss.heat-1);
    }

    getRecruitChance(joinBoost=0) {
      if (this.state.gang.length>=16) return 0;
      const boss=this.state.boss, district=this.getDistrict();
      const portfolio=this.getPortfolioSummary();
      let chance=.025+boss.respect*.0011+boss.influence*.0008+boss.loyalty*.0003+district.control*.0004+joinBoost+portfolio.joinBoost;
      chance-=Math.max(0,boss.heat-70)*.0014;
      return Math.min(.44,Math.max(.015,chance));
    }

    resolveRecruitment(joinBoost=0) {
      const chance=this.getRecruitChance(joinBoost);
      if (!chance || this.random()>=chance) return;
      const pool=this.data.recruits.filter((candidate)=>!this.state.usedRecruitNames.includes(candidate.name));
      if (!pool.length) return;
      const boss=this.state.boss;
      const scored=pool.map((candidate)=>{
        const affinity=candidate.affinity==='money'?Math.min(100,this.state.resources.money/18):candidate.affinity==='heat'?100-boss.heat:(boss[candidate.affinity]||50);
        return {candidate,score:affinity+this.random()*35};
      }).sort((a,b)=>b.score-a.score);
      const selected=deepClone(scored[0].candidate);
      selected.id=`recruit-${this.state.turn}-${this.state.gang.length+1}`;
      selected.origin=this.getLocation().title;
      selected.loyalty=clamp(selected.loyalty+Math.round((boss.respect+boss.loyalty-100)/8),30,94);
      this.state.gang.push(selected);
      this.state.usedRecruitNames.push(selected.name);
      this.state.stats.recruitsJoined+=1;
      boss.influence=clamp(boss.influence+2);
      this.log('recruit', `${selected.name} (${selected.role}) schließt sich der Gang an.`);
    }

    resolveGangLoyalty() {
      const boss=this.state.boss;
      this.state.gang.forEach((member)=>{
        let delta=0;
        if (boss.loyalty>70) delta+=1;
        if (boss.heat>80) delta-=1;
        if (boss.fear>78 && boss.respect<35) delta-=1;
        member.loyalty=clamp(member.loyalty+delta,1,100);
        if (member.injuredUntil && this.state.turn>=member.injuredUntil) delete member.injuredUntil;
      });
      if (this.state.gang.length>3) {
        const deserter=this.state.gang.find((member)=>member.loyalty<22 && this.random()<.15);
        if (deserter) {
          this.state.gang=this.state.gang.filter((member)=>member.id!==deserter.id);
          this.state.assets.forEach((asset)=>asset.assignedCrewIds=(asset.assignedCrewIds||[]).filter((id)=>id!==deserter.id));
          this.state.boss.loyalty=clamp(this.state.boss.loyalty-4);
          this.log('warning', `${deserter.name} steigt aus.`);
        }
      }
    }

    advanceTurn(joinBoost=0) {
      this.state.turn+=1;
      this.resolvePassiveIncome();
      this.resolveRivalGangs();
      this.resolvePolicePressure();
      this.resolveRecruitment(joinBoost);
      this.resolveGangLoyalty();
    }

    getGangPower() {
      return this.state.gang.reduce((sum,member)=>sum+(member.injuredUntil?Math.ceil(member.power/2):member.power),0);
    }

    getPortfolioSummary() {
      let gross=0, upkeep=0, net=0, value=0, joinBoost=0;
      this.state.assets.forEach((asset)=>{
        const p=this.getAssetProjection(asset);
        gross+=p.gross; upkeep+=p.upkeep; net+=p.net; value+=asset.invested;
        const def=this.getAssetDefinition(asset.propertyId);
        joinBoost += (def.joinBoost||0)*asset.level;
      });
      return { count:this.state.assets.length,gross,upkeep,net,value,joinBoost,hotels:this.state.assets.filter((a)=>a.propertyId==='hotel').length };
    }

    getRaidRisk() {
      const district=this.getDistrict();
      const security=this.state.assets.filter((asset)=>asset.locationId===this.state.selectedLocationId)
        .reduce((sum,asset)=>sum+this.getAssetProjection(asset).security,0);
      return Math.max(0,Math.min(.72,(this.state.boss.heat-28)/145+district.police/620-security*.008));
    }

    getBossProfile() {
      const b=this.state.boss;
      if (b.heat>=80) return {title:'Gejagter Boss',note:'Hohe Aufmerksamkeit. Lautes Vorgehen wird teuer.'};
      if (b.respect>=70 && b.loyalty>=68) return {title:'Straßenpatron',note:'Schutz, Rückhalt und Nutzen tragen deine Macht.'};
      if (b.fear>=70 && b.respect<55) return {title:'Eiserne Hand',note:'Furcht funktioniert schnell, aber Loyalität wird entscheidend.'};
      if (b.influence>=70) return {title:'Netzwerker',note:'Kontakte, Besitz und Zugang sind deine stärksten Hebel.'};
      if (this.state.assets.length>=5) return {title:'Stadtunternehmer',note:'Dein Portfolio beginnt die Machtstruktur zu ersetzen.'};
      return {title:'Aufsteigender Boss',note:'Taten, Besitz und Beziehungen formen deinen Stil.'};
    }

    getBossRank() {
      const score=this.state.boss.respect+this.state.boss.influence+this.state.assets.length*9+this.getOwnedDistrictCount()*12;
      if (score>=260) return 'Stadtlegende';
      if (score>=210) return 'Ringherr';
      if (score>=165) return 'Bezirksboss';
      if (score>=120) return 'Straßenboss';
      return 'Aufsteiger';
    }

    getOwnedDistrictCount() { return Object.values(this.state.districts).filter((d)=>d.owner==='player').length; }

    getCitySummary() {
      const districts=Object.values(this.state.districts);
      return {
        avgControl:Math.round(districts.reduce((s,d)=>s+d.control,0)/districts.length),
        avgRival:Math.round(districts.reduce((s,d)=>s+d.rival,0)/districts.length),
        controlled:this.getOwnedDistrictCount(), total:districts.length
      };
    }

    getDecisionSupport() {
      const portfolio=this.getPortfolioSummary();
      const ready=this.getAvailableCombatCrew();
      const avgLoyalty=Math.round(this.state.gang.reduce((s,m)=>s+m.loyalty,0)/Math.max(1,this.state.gang.length));
      const warnings=[];
      const raid=Math.round(this.getRaidRisk()*100);
      if (raid>=35) warnings.push(`Razzia-Risiko ${raid}%: Fahndung oder lokale Polizei senken.`);
      if (avgLoyalty<48) warnings.push('Crewtreue ist instabil: soziale Aktionen priorisieren.');
      if (ready.length<2) warnings.push('Kaum freie Einsatzcrew: Betriebspersonal prüfen oder Verletzte erholen lassen.');
      const hot=this.data.world.locations.map((l)=>({l,d:this.getDistrict(l.id)})).sort((a,b)=>(b.d.rival-b.d.control)-(a.d.rival-a.d.control))[0];
      if (hot && hot.d.rival-hot.d.control>22) warnings.push(`${hot.l.title} droht zu kippen.`);
      if (!warnings.length) warnings.push('Lage stabil: Expansion oder Ausbau ist sinnvoll.');
      return {
        rank:this.getBossRank(),
        netWorth:this.state.resources.money+portfolio.value,
        cashflow:portfolio.net,
        raidRisk:raid,
        recruitChance:Math.round(this.getRecruitChance()*100),
        readyCrew:ready.length,
        totalCrew:this.state.gang.length,
        avgLoyalty,
        warnings
      };
    }

    getRivalOverview() {
      return this.state.rivals.map((rival)=>{
        const def=this.getRivalDefinition(rival.id);
        const territories=this.data.world.locations.filter((location)=>this.getDistrict(location.id).owner===rival.id);
        return {...deepClone(rival),name:def.name,short:def.short,strategy:def.strategy,description:def.description,color:def.color,territories:territories.map((l)=>l.title)};
      });
    }

    log(type,text) {
      this.state.history.unshift({turn:this.state.turn,type,text});
      this.state.history=this.state.history.slice(0,120);
    }
    exportState() { return JSON.stringify(this.state); }
    getSnapshot() { return deepClone(this.state); }
  }

  return { GameEngine, seededRandom, clamp };
});
