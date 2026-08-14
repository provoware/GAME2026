(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./data.js') : root.GAME_DATA);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GAME_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
  const deepClone = (value) => JSON.parse(JSON.stringify(value));

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
      this.data.world.locations.forEach((location) => {
        districtState[location.id] = {
          control: location.id === this.data.world.startLocationId ? 72 : clamp(18 + (55 - location.rival) * 0.34),
          police: location.police,
          rival: location.rival,
          unrest: clamp((location.risk + location.rival) / 2),
          intel: 0
        };
      });
      return {
        schema: 2,
        version: this.data.version,
        turn: 1,
        selectedLocationId: this.data.world.startLocationId,
        resources: { money: 1180, supplies: 8 },
        boss: { respect: 46, fear: 32, loyalty: 64, influence: 35, heat: 16, notoriety: 24 },
        districts: districtState,
        gang: deepClone(this.data.starterGang),
        assets: [],
        usedRecruitNames: [],
        history: [{ turn: 1, type: 'system', text: 'Die Crew sammelt sich im Hauptbunker. Stadtgeschäfte und Immobilienmarkt sind offen.' }],
        actionCounts: {},
        lastCombat: null,
        stats: {
          recruitsJoined: 0,
          policeRaids: 0,
          rivalMoves: 0,
          totalIncome: 0,
          propertyIncome: 0,
          propertiesBought: 0,
          combats: 0,
          combatWins: 0
        }
      };
    }

    ensureStateShape() {
      if (!this.state.resources) this.state.resources = { money: 0, supplies: 0 };
      if (!this.state.boss) this.state.boss = { respect: 40, fear: 30, loyalty: 50, influence: 30, heat: 10, notoriety: 10 };
      if (!this.state.districts) this.state.districts = {};
      this.data.world.locations.forEach((location) => {
        if (!this.state.districts[location.id]) {
          this.state.districts[location.id] = { control: 20, police: location.police, rival: location.rival, unrest: location.risk, intel: 0 };
        }
        if (typeof this.state.districts[location.id].intel !== 'number') this.state.districts[location.id].intel = 0;
      });
      if (!Array.isArray(this.state.gang)) this.state.gang = deepClone(this.data.starterGang);
      if (!Array.isArray(this.state.assets)) this.state.assets = [];
      if (!Array.isArray(this.state.history)) this.state.history = [];
      if (!Array.isArray(this.state.usedRecruitNames)) this.state.usedRecruitNames = [];
      if (!this.state.actionCounts) this.state.actionCounts = {};
      if (!this.state.stats) this.state.stats = {};
      const statDefaults = { recruitsJoined: 0, policeRaids: 0, rivalMoves: 0, totalIncome: 0, propertyIncome: 0, propertiesBought: 0, combats: 0, combatWins: 0 };
      Object.entries(statDefaults).forEach(([key, value]) => {
        if (typeof this.state.stats[key] !== 'number') this.state.stats[key] = value;
      });
      if (!('lastCombat' in this.state)) this.state.lastCombat = null;
      this.state.schema = 2;
      this.state.version = this.data.version;
    }

    getLocation(id = this.state.selectedLocationId) {
      return this.data.world.locations.find((location) => location.id === id) || this.data.world.locations[0];
    }

    getDistrict(id = this.state.selectedLocationId) {
      return this.state.districts[id];
    }

    selectLocation(id) {
      if (this.state.districts[id]) this.state.selectedLocationId = id;
      return this.getSnapshot();
    }

    canAfford(action) {
      return this.state.resources.money >= (action.cost.money || 0) && this.state.resources.supplies >= (action.cost.supplies || 0);
    }

    getActionAvailability(action) {
      if (!this.canAfford(action)) return { ok: false, reason: 'Zu wenig Geld oder Vorräte.' };
      if (action.requiresProperty && this.state.assets.length === 0) return { ok: false, reason: 'Benötigt mindestens einen eigenen Betrieb.' };
      return { ok: true, reason: '' };
    }

    applyAction(actionId) {
      const action = this.data.actions.find((item) => item.id === actionId);
      if (!action) return { ok: false, reason: 'Unbekannte Aktion.' };
      const availability = this.getActionAvailability(action);
      if (!availability.ok) return availability;

      const location = this.getLocation();
      const district = this.getDistrict();
      const effects = action.effects || {};
      this.state.resources.money -= action.cost.money || 0;
      this.state.resources.supplies -= action.cost.supplies || 0;
      this.applyEffects(effects, district);

      this.state.actionCounts[actionId] = (this.state.actionCounts[actionId] || 0) + 1;
      const forceWeight = (this.state.actionCounts.show_force || 0) + (this.state.actionCounts.raid || 0) * 1.5 + (this.state.actionCounts.sabotage || 0);
      const socialWeight = (this.state.actionCounts.protect || 0) + (this.state.actionCounts.party || 0) + (this.state.actionCounts.protection_contract || 0);
      const calculatedNotoriety = 18 + forceWeight * 4 + socialWeight * 2 + this.state.boss.influence * 0.18;
      this.state.boss.notoriety = clamp(Math.max(this.state.boss.notoriety, calculatedNotoriety));

      let combat = null;
      if (action.combat) {
        combat = this.resolveCombat(action, location, district);
      } else {
        this.log('action', `${action.title} in ${location.title}: ${this.describeEffects(effects)}.`);
      }

      this.advanceTurn(effects.joinBoost || 0);
      return { ok: true, action, combat, state: this.getSnapshot() };
    }

    applyEffects(effects, district) {
      if (effects.money) this.state.resources.money += effects.money;
      ['respect', 'fear', 'loyalty', 'influence', 'heat', 'notoriety'].forEach((key) => {
        if (typeof effects[key] === 'number') this.state.boss[key] = clamp(this.state.boss[key] + effects[key]);
      });
      ['control', 'police', 'rival', 'unrest'].forEach((key) => {
        if (typeof effects[key] === 'number') district[key] = clamp(district[key] + effects[key]);
      });
      if (effects.intel) district.intel = clamp(district.intel + effects.intel, 0, 5);
    }

    describeEffects(effects) {
      const labels = {
        respect: 'Respekt',
        fear: 'Furcht',
        loyalty: 'Loyalität',
        influence: 'Einfluss',
        heat: 'Fahndung',
        control: 'Kontrolle',
        rival: 'Rivalen',
        police: 'Polizei',
        unrest: 'Unruhe',
        money: 'Geld'
      };
      const parts = Object.entries(labels)
        .filter(([key]) => typeof effects[key] === 'number' && effects[key] !== 0)
        .slice(0, 5)
        .map(([key, label]) => `${label} ${effects[key] > 0 ? '+' : ''}${effects[key]}`);
      return parts.length ? parts.join(', ') : 'Lage verändert';
    }

    getCombatOdds(actionId, locationId = this.state.selectedLocationId) {
      const action = this.data.actions.find((item) => item.id === actionId);
      if (!action || !action.combat) return null;
      const location = this.getLocation(locationId);
      const district = this.getDistrict(locationId);
      const portfolio = this.getPortfolioBonuses();
      const readyPower = this.getGangPower();
      const attackScore =
        readyPower * 3.05 +
        this.state.boss.fear * 0.22 +
        this.state.boss.respect * 0.12 +
        this.state.boss.influence * 0.18 +
        district.intel * 9 +
        portfolio.intel * 5 +
        (action.combat.stealthBonus || 0) * 100;
      const defenseScore = district.rival * 0.66 + district.police * 0.12 + location.risk * 0.22 + 18;
      const probability = Math.max(0.18, Math.min(0.91, attackScore / (attackScore + defenseScore)));
      return {
        probability,
        percent: Math.round(probability * 100),
        attackerPower: Math.round(attackScore),
        defenderPower: Math.round(defenseScore),
        intel: district.intel + portfolio.intel
      };
    }

    resolveCombat(action, location, district) {
      const odds = this.getCombatOdds(action.id, location.id);
      const roll = this.random();
      const win = roll < odds.probability;
      const cfg = action.combat;
      const beforeMoney = this.state.resources.money;
      let moneyDelta = 0;

      if (win) {
        const rewardFactor = 0.82 + Math.min(0.32, district.rival / 250) + this.random() * 0.18;
        moneyDelta = Math.round(cfg.reward * rewardFactor);
        this.state.resources.money += moneyDelta;
        district.control = clamp(district.control + cfg.controlWin);
        district.rival = clamp(district.rival + cfg.rivalWin);
        district.unrest = clamp(district.unrest + 5);
        this.state.boss.respect = clamp(this.state.boss.respect + 3);
        this.state.stats.combatWins += 1;
      } else {
        const loss = Math.min(this.state.resources.money, 55 + Math.round(cfg.reward * (0.2 + this.random() * 0.24)));
        moneyDelta = -loss;
        this.state.resources.money -= loss;
        district.control = clamp(district.control + cfg.controlLoss);
        district.rival = clamp(district.rival + cfg.rivalLoss);
        district.unrest = clamp(district.unrest + 8);
        this.state.boss.loyalty = clamp(this.state.boss.loyalty - 3);
      }

      district.intel = Math.max(0, district.intel - 1);
      const injuryChance = cfg.injuryRisk + (win ? -0.05 : 0.12) - Math.min(0.08, this.getPortfolioBonuses().recoveryBonus * 0.025);
      const injured = this.resolveCombatInjury(Math.max(0.03, injuryChance), location);
      this.state.stats.combats += 1;

      const combat = {
        turn: this.state.turn,
        actionId: action.id,
        actionTitle: action.title,
        locationId: location.id,
        locationTitle: location.title,
        win,
        probability: odds.percent,
        attackerPower: odds.attackerPower,
        defenderPower: odds.defenderPower,
        roll: Math.round(roll * 100),
        moneyDelta,
        moneyAfter: this.state.resources.money,
        injured,
        phases: win
          ? ['Crew rückt vor', 'Rivalenlinie bricht', 'Gebiet gesichert']
          : ['Kontakt hergestellt', 'Gegendruck zu stark', 'Crew zieht sich zurück']
      };
      this.state.lastCombat = combat;
      this.log(win ? 'combat-win' : 'combat-loss',
        `${action.title} in ${location.title}: ${win ? 'SIEG' : 'RÜCKZUG'} · ${moneyDelta >= 0 ? '+' : ''}${moneyDelta} €${injured ? ` · ${injured} verletzt` : ''}.`
      );
      if (beforeMoney === this.state.resources.money && moneyDelta !== 0) throw new Error('Kampf-Geldfluss inkonsistent.');
      return deepClone(combat);
    }

    resolveCombatInjury(risk, location) {
      if (!risk || this.state.gang.length === 0 || this.random() >= risk) return null;
      const ready = this.state.gang.filter((member) => !member.injuredUntil);
      const pool = ready.length ? ready : this.state.gang;
      const target = pool[Math.floor(this.random() * pool.length)];
      target.loyalty = clamp(target.loyalty - 4, 1, 100);
      const recoveryBonus = this.getPortfolioBonuses().recoveryBonus;
      target.injuredUntil = this.state.turn + Math.max(1, 3 - recoveryBonus);
      return target.name;
    }

    getAvailableProperties(locationId = this.state.selectedLocationId) {
      const location = this.getLocation(locationId);
      const district = this.getDistrict(locationId);
      const ownedIds = new Set(this.state.assets.filter((asset) => asset.locationId === locationId).map((asset) => asset.propertyId));
      return this.data.properties
        .filter((property) => property.kinds.includes(location.kind) && !ownedIds.has(property.id))
        .map((property) => {
          const multiplier = 0.82 + location.income / 260 + district.control / 500;
          const cost = Math.round(property.baseCost * multiplier / 10) * 10;
          const projection = this.getPropertyProjection(property, locationId);
          return { ...deepClone(property), cost, projectedNet: projection.net };
        });
    }

    buyProperty(propertyId) {
      const offer = this.getAvailableProperties().find((property) => property.id === propertyId);
      if (!offer) return { ok: false, reason: 'Dieses Objekt ist hier nicht verfügbar oder bereits im Besitz.' };
      if (this.state.resources.money < offer.cost) return { ok: false, reason: `Für den Kauf fehlen ${offer.cost - this.state.resources.money} €.` };

      const location = this.getLocation();
      this.state.resources.money -= offer.cost;
      const asset = {
        id: `asset-${this.state.turn}-${this.state.assets.length + 1}`,
        propertyId: offer.id,
        locationId: location.id,
        purchasePrice: offer.cost,
        boughtTurn: this.state.turn
      };
      this.state.assets.push(asset);
      this.state.stats.propertiesBought += 1;
      if (offer.influence) this.state.boss.influence = clamp(this.state.boss.influence + offer.influence);
      if (offer.respect) this.state.boss.respect = clamp(this.state.boss.respect + offer.respect);
      if (offer.loyalty) this.state.boss.loyalty = clamp(this.state.boss.loyalty + offer.loyalty);
      if (offer.heat) this.state.boss.heat = clamp(this.state.boss.heat + offer.heat);
      this.log('property', `${offer.title} in ${location.title} gekauft: -${offer.cost} €. Erwarteter Nettoertrag aktuell ${offer.projectedNet} €/Zug.`);
      this.advanceTurn(offer.joinBoost || 0);
      return { ok: true, asset: deepClone(asset), offer, state: this.getSnapshot() };
    }

    getPropertyDefinition(propertyId) {
      return this.data.properties.find((property) => property.id === propertyId);
    }

    getPropertyProjection(propertyOrAsset, locationId) {
      const property = propertyOrAsset.propertyId ? this.getPropertyDefinition(propertyOrAsset.propertyId) : propertyOrAsset;
      const id = locationId || propertyOrAsset.locationId || this.state.selectedLocationId;
      const district = this.getDistrict(id);
      const stability = Math.max(0.42, 1 - district.unrest / 210 - district.police / 420 + district.control / 360);
      const gross = Math.max(0, Math.round(property.income * stability));
      const net = Math.max(0, gross - property.upkeep);
      return { gross, upkeep: property.upkeep, net, stability: Math.round(stability * 100) };
    }

    getPortfolioSummary() {
      let projectedGross = 0;
      let projectedNet = 0;
      let bookValue = 0;
      const byLocation = {};
      this.state.assets.forEach((asset) => {
        const projection = this.getPropertyProjection(asset);
        projectedGross += projection.gross;
        projectedNet += projection.net;
        bookValue += asset.purchasePrice;
        byLocation[asset.locationId] = (byLocation[asset.locationId] || 0) + 1;
      });
      return {
        count: this.state.assets.length,
        projectedGross,
        projectedNet,
        bookValue,
        hotelCount: this.state.assets.filter((asset) => asset.propertyId === 'hotel').length,
        byLocation
      };
    }

    getPortfolioBonuses() {
      return this.state.assets.reduce((sum, asset) => {
        const property = this.getPropertyDefinition(asset.propertyId);
        if (!property) return sum;
        sum.joinBoost += property.joinBoost || 0;
        sum.recoveryBonus += property.recoveryBonus || 0;
        sum.intel += property.intel || 0;
        sum.supplies += property.supplies || 0;
        return sum;
      }, { joinBoost: 0, recoveryBonus: 0, intel: 0, supplies: 0 });
    }

    getAssetsAtLocation(locationId = this.state.selectedLocationId) {
      return this.state.assets
        .filter((asset) => asset.locationId === locationId)
        .map((asset) => ({ ...deepClone(asset), property: deepClone(this.getPropertyDefinition(asset.propertyId)), projection: this.getPropertyProjection(asset) }));
    }

    advanceTurn(joinBoost = 0) {
      this.state.turn += 1;
      this.resolvePassiveIncome();
      this.resolveRivalMove();
      this.resolvePolicePressure();
      this.resolveRecruitment(joinBoost);
      this.resolveGangLoyalty();
      this.resolveRecovery();
    }

    resolvePassiveIncome() {
      let districtIncome = 0;
      this.data.world.locations.forEach((location) => {
        const district = this.state.districts[location.id];
        if (district.control >= 45) {
          const stability = 1 - district.unrest / 180;
          districtIncome += Math.max(0, Math.round(location.income * (district.control / 100) * stability));
        }
      });

      let propertyIncome = 0;
      this.state.assets.forEach((asset) => {
        propertyIncome += this.getPropertyProjection(asset).net;
      });

      const bonuses = this.getPortfolioBonuses();
      if (bonuses.supplies > 0 && this.state.turn % 3 === 0) {
        this.state.resources.supplies += bonuses.supplies;
        this.log('income', `Eigene Logistik liefert +${bonuses.supplies} Vorrat.`);
      }

      const total = districtIncome + propertyIncome;
      if (total > 0) {
        this.state.resources.money += total;
        this.state.stats.totalIncome += total;
        this.state.stats.propertyIncome += propertyIncome;
        const split = propertyIncome > 0 ? ` · davon ${propertyIncome} € Besitz` : '';
        this.log('income', `Einnahmen: +${total} €${split}.`);
      }
    }

    resolveRivalMove() {
      const candidates = this.data.world.locations
        .map((location) => ({ location, district: this.state.districts[location.id] }))
        .filter(({ location }) => location.id !== this.data.world.startLocationId)
        .sort((a, b) => (b.district.rival - b.district.control) - (a.district.rival - a.district.control));
      if (!candidates.length || this.random() > 0.76) return;
      const pick = candidates[Math.min(candidates.length - 1, Math.floor(this.random() * Math.min(3, candidates.length)))];
      const assetDefense = (this.getPortfolioSummary().byLocation[pick.location.id] || 0) * 0.6;
      const push = Math.max(2, 3 + Math.floor(this.random() * 5) - Math.floor(assetDefense));
      pick.district.rival = clamp(pick.district.rival + push);
      pick.district.control = clamp(pick.district.control - Math.max(1, Math.floor(push / 2)));
      pick.district.unrest = clamp(pick.district.unrest + 3);
      this.state.stats.rivalMoves += 1;
      this.log('rival', `Rivalen drücken in ${pick.location.title}: Kontrolle -${Math.max(1, Math.floor(push / 2))}.`);
    }

    getRaidChance(locationId = this.state.selectedLocationId) {
      const district = this.getDistrict(locationId);
      const heat = this.state.boss.heat;
      return Math.min(0.82, Math.max(0, (heat - 48) / 150) + district.police / 650);
    }

    resolvePolicePressure() {
      const heat = this.state.boss.heat;
      const location = this.getLocation();
      const district = this.getDistrict();
      const raidChance = this.getRaidChance();
      if (this.random() < raidChance) {
        const portfolio = this.getPortfolioSummary();
        const moneyLoss = Math.min(this.state.resources.money, 55 + Math.floor(this.random() * 90) + Math.min(80, portfolio.count * 8));
        this.state.resources.money -= moneyLoss;
        if (this.state.resources.supplies > 0 && this.random() < 0.55) this.state.resources.supplies -= 1;
        district.control = clamp(district.control - 4);
        district.police = clamp(district.police + 5);
        this.state.boss.heat = clamp(this.state.boss.heat + 3);
        this.state.stats.policeRaids += 1;
        this.log('police', `Polizeidruck in ${location.title}: ${moneyLoss} € Verlust und Kontrolle -4.`);
      } else if (heat > 35) {
        this.state.boss.heat = clamp(heat - 1);
      }
    }

    getRecruitmentChance(joinBoost = 0) {
      const boss = this.state.boss;
      const district = this.getDistrict();
      const bonuses = this.getPortfolioBonuses();
      let chance = 0.035 + boss.respect * 0.00115 + boss.influence * 0.00085 + boss.loyalty * 0.00035;
      chance += district.control * 0.00045 + joinBoost + bonuses.joinBoost;
      chance -= Math.max(0, boss.heat - 70) * 0.0014;
      return Math.min(0.48, Math.max(0.02, chance));
    }

    resolveRecruitment(joinBoost) {
      if (this.state.gang.length >= 16) return;
      const chance = this.getRecruitmentChance(joinBoost);
      if (this.random() >= chance) return;
      const boss = this.state.boss;
      const pool = this.data.recruits.filter((candidate) => !this.state.usedRecruitNames.includes(candidate.name));
      if (!pool.length) return;
      const scored = pool.map((candidate) => {
        const affinityValue = candidate.affinity === 'money'
          ? Math.min(100, this.state.resources.money / 15)
          : candidate.affinity === 'heat'
            ? 100 - boss.heat
            : (boss[candidate.affinity] || 50);
        return { candidate, score: affinityValue + this.random() * 35 };
      }).sort((a, b) => b.score - a.score);
      const selected = deepClone(scored[0].candidate);
      selected.id = `recruit-${this.state.turn}-${this.state.gang.length + 1}`;
      selected.origin = this.getLocation().title;
      selected.loyalty = clamp(selected.loyalty + Math.round((boss.respect + boss.loyalty - 100) / 8), 30, 92);
      this.state.gang.push(selected);
      this.state.usedRecruitNames.push(selected.name);
      this.state.stats.recruitsJoined += 1;
      this.state.boss.influence = clamp(this.state.boss.influence + 2);
      this.log('recruit', `${selected.name} (${selected.role}) schließt sich der Gang in ${selected.origin} an.`);
    }

    resolveGangLoyalty() {
      const boss = this.state.boss;
      this.state.gang.forEach((member) => {
        let delta = 0;
        if (boss.loyalty > 70) delta += 1;
        if (boss.heat > 78) delta -= 1;
        if (boss.fear > 78 && boss.respect < 35) delta -= 1;
        member.loyalty = clamp(member.loyalty + delta, 1, 100);
      });
      if (this.state.gang.length > 3) {
        const deserter = this.state.gang.find((member) => member.loyalty < 24 && this.random() < 0.18);
        if (deserter) {
          this.state.gang = this.state.gang.filter((member) => member.id !== deserter.id);
          this.state.boss.loyalty = clamp(this.state.boss.loyalty - 4);
          this.log('warning', `${deserter.name} steigt aus. Die Crew registriert den Vertrauensverlust.`);
        }
      }
    }

    resolveRecovery() {
      this.state.gang.forEach((member) => {
        if (member.injuredUntil && this.state.turn >= member.injuredUntil) {
          delete member.injuredUntil;
          this.log('system', `${member.name} ist wieder einsatzbereit.`);
        }
      });
    }

    getGangPower() {
      return this.state.gang.reduce((sum, member) => sum + (member.injuredUntil ? Math.ceil(member.power / 2) : member.power), 0);
    }

    getGangReadiness() {
      const ready = this.state.gang.filter((member) => !member.injuredUntil).length;
      const total = this.state.gang.length;
      return { ready, total, percent: total ? Math.round(ready / total * 100) : 0 };
    }

    getBossProfile() {
      const b = this.state.boss;
      if (b.heat >= 78) return { title: 'Gejagter Boss', note: 'Viel Aufmerksamkeit. Investitionen und laute Aktionen stehen unter hohem Risiko.' };
      if (b.respect >= 68 && b.loyalty >= 66) return { title: 'Straßenpatron', note: 'Die Leute folgen, weil Schutz, Nutzen und Stabilität sichtbar sind.' };
      if (b.fear >= 68 && b.respect < 55) return { title: 'Eiserne Hand', note: 'Kontrolle durch Furcht. Wirksam, aber Crew und Besitz werden anfälliger.' };
      if (b.influence >= 67) return { title: 'Netzwerker', note: 'Kontakte, Betriebe und Zugang sind deine stärkste Waffe.' };
      if (b.notoriety >= 62) return { title: 'Stadtgespräch', note: 'Dein Name arbeitet inzwischen auch ohne dich.' };
      return { title: 'Aufsteigender Boss', note: 'Taten, Besitz und Beziehungen formen deinen Stil.' };
    }

    getDominantStyle() {
      const b = this.state.boss;
      return [['Respekt', b.respect], ['Furcht', b.fear], ['Loyalität', b.loyalty], ['Einfluss', b.influence]].sort((a, b2) => b2[1] - a[1])[0][0];
    }

    getBossRank() {
      const portfolio = this.getPortfolioSummary();
      const score = this.state.boss.respect + this.state.boss.influence + this.state.boss.notoriety + portfolio.count * 10 + this.getCitySummary().controlled * 6;
      if (score >= 290) return { title: 'Stadtboss', level: 5, next: 'Macht halten' };
      if (score >= 235) return { title: 'Unterweltgröße', level: 4, next: 'Stadtboss ab 290 Machtpunkten' };
      if (score >= 185) return { title: 'Bezirksboss', level: 3, next: 'Unterweltgröße ab 235 Machtpunkten' };
      if (score >= 140) return { title: 'Strippenzieher', level: 2, next: 'Bezirksboss ab 185 Machtpunkten' };
      return { title: 'Straßenboss', level: 1, next: 'Strippenzieher ab 140 Machtpunkten' };
    }

    getThreatenedDistrict() {
      return this.data.world.locations
        .map((location) => {
          const district = this.state.districts[location.id];
          return { location, district, pressure: district.rival + district.police * 0.55 + district.unrest * 0.25 - district.control };
        })
        .sort((a, b) => b.pressure - a.pressure)[0];
    }

    getBossDashboard() {
      const portfolio = this.getPortfolioSummary();
      const readiness = this.getGangReadiness();
      const threat = this.getThreatenedDistrict();
      const rank = this.getBossRank();
      const netWorth = this.state.resources.money + portfolio.bookValue;
      const raidRisk = Math.round(this.getRaidChance() * 100);
      const recruitChance = Math.round(this.getRecruitmentChance() * 100);
      const avgLoyalty = this.state.gang.length
        ? Math.round(this.state.gang.reduce((sum, member) => sum + member.loyalty, 0) / this.state.gang.length)
        : 0;
      const alerts = [];
      if (this.state.boss.heat >= 65) alerts.push('Fahndung hoch: ruhige oder einflussbasierte Aktionen sind sinnvoll.');
      if (raidRisk >= 20) alerts.push(`Razzia-Risiko im gewählten Bezirk: ${raidRisk}%.`);
      if (readiness.percent < 80) alerts.push('Crew nicht vollständig einsatzbereit.');
      if (threat && threat.pressure > 45) alerts.push(`${threat.location.title} steht unter starkem Außendruck.`);
      if (portfolio.count === 0 && this.state.resources.money >= 350) alerts.push('Kapital verfügbar: ein erster Betrieb kann dauerhaften Cashflow erzeugen.');
      if (!alerts.length) alerts.push('Lage stabil: Expansion oder Investition ist möglich.');
      return {
        rank,
        netWorth,
        projectedIncome: portfolio.projectedNet,
        raidRisk,
        recruitChance,
        readiness,
        avgLoyalty,
        threat: threat ? { title: threat.location.title, pressure: Math.round(threat.pressure) } : null,
        alerts
      };
    }

    getCitySummary() {
      const districts = Object.values(this.state.districts);
      return {
        avgControl: Math.round(districts.reduce((sum, d) => sum + d.control, 0) / districts.length),
        avgRival: Math.round(districts.reduce((sum, d) => sum + d.rival, 0) / districts.length),
        controlled: districts.filter((d) => d.control >= 55).length,
        total: districts.length,
        assets: this.state.assets.length
      };
    }

    getActionPreview(actionId) {
      const action = this.data.actions.find((item) => item.id === actionId);
      if (!action) return null;
      const availability = this.getActionAvailability(action);
      const combat = action.combat ? this.getCombatOdds(actionId) : null;
      return {
        available: availability.ok,
        reason: availability.reason,
        combat,
        cost: deepClone(action.cost),
        effects: deepClone(action.effects)
      };
    }

    log(type, text) {
      this.state.history.unshift({ turn: this.state.turn, type, text });
      this.state.history = this.state.history.slice(0, 100);
    }

    exportState() {
      return JSON.stringify(this.state);
    }

    getSnapshot() {
      return deepClone(this.state);
    }
  }

  return { GameEngine, seededRandom, clamp };
});
