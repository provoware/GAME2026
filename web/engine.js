(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./data.js') : root.GAME_DATA);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GAME_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0)));
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const SKILLS = ['combat','stealth','business','social','analysis','driving','endurance'];
  const SKILL_LABELS = { combat:'Kampf', stealth:'Tarnung', business:'Geschäft', social:'Sozial', analysis:'Analyse', driving:'Fahren', endurance:'Ausdauer' };

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
        let owner = 'neutral';
        let rivalGangId = null;
        if (location.id === this.data.world.startLocationId) owner = 'player';
        const homeRival = this.data.rivalGangs.find((r) => r.home === location.id);
        if (homeRival) { owner = homeRival.id; rivalGangId = homeRival.id; }
        districtState[location.id] = {
          control: owner === 'player' ? 72 : clamp(18 + (55 - location.rival) * 0.34),
          police: location.police,
          rival: homeRival ? clamp(Math.max(location.rival, 68)) : location.rival,
          unrest: clamp((location.risk + location.rival) / 2),
          intel: 0,
          owner,
          rivalGangId
        };
      });
      const gang = this.data.starterGang.map((m) => this.normalizeMember(m));
      const companies = {};
      this.data.companies.forEach((company) => {
        companies[company.id] = {
          id: company.id,
          price: company.basePrice,
          lastPrice: company.basePrice,
          revenue: company.baseRevenue,
          profit: Math.round(company.baseRevenue * .16),
          development: 50,
          momentum: 0,
          history:[company.basePrice],
          marketIntel:0
        };
      });
      return {
        schema: this.data.schema,
        version: this.data.version,
        turn: 1,
        currentLocationId: this.data.world.startLocationId,
        selectedLocationId: this.data.world.startLocationId,
        resources: { money: 1450, supplies: 9 },
        boss: {
          respect:46, fear:32, loyalty:64, influence:35, heat:16, notoriety:24,
          skills:{combat:4,stealth:4,business:5,social:5,analysis:5,driving:3,endurance:5},
          skillXp:{combat:0,stealth:0,business:0,social:0,analysis:0,driving:0,endurance:0}
        },
        districts: districtState,
        gang,
        assets: [],
        rivals: this.data.rivalGangs.map((r) => ({ id:r.id, power:r.power, wealth:r.wealth, lastMove:'Beobachtet die Lage.', pressure:0 })),
        usedRecruitNames: [],
        history: [{ turn:1, type:'system', text:'LIVING-CITY-03 gestartet: Crew, Bank, Casino, Reisen und Netzwerke sind aktiv.' }],
        actionCounts:{},
        lastCombat:null,
        combatSession:null,
        bank:{ balance:500, holdings:{}, totalDividends:0, totalInterest:0 },
        market:{ companies },
        moles:[],
        streetOperations:[],
        inventory:[],
        casino:{ poker:null, lastSlot:null, totalWon:0, totalLost:0 },
        flags:{ recruitBoost:0, travelDiscount:0, propertyBoost:0 },
        stats:{
          recruitsJoined:0, policeRaids:0, rivalMoves:0, totalIncome:0, propertyIncome:0, propertiesBought:0,
          propertiesSold:0, propertiesUpgraded:0, combats:0, combatWins:0, territoriesTaken:0, territoriesLost:0,
          autonomousCycles:0, molesPlaced:0, molesLost:0, sharesBought:0, sharesSold:0, dividends:0, travels:0,
          casinoHands:0, casinoSpins:0, gearBought:0, martialArtsLearned:0, streetOpsStarted:0
        }
      };
    }

    ensureStateShape() {
      if (!this.state.resources) this.state.resources = { money:0, supplies:0 };
      if (!this.state.boss) this.state.boss = { respect:40,fear:30,loyalty:50,influence:30,heat:10,notoriety:10 };
      if (!this.state.boss.skills) this.state.boss.skills = {combat:4,stealth:4,business:4,social:4,analysis:4,driving:3,endurance:4};
      if (!this.state.boss.skillXp) this.state.boss.skillXp = {};
      SKILLS.forEach((s) => { if (!Number.isFinite(this.state.boss.skills[s])) this.state.boss.skills[s] = 4; if (!Number.isFinite(this.state.boss.skillXp[s])) this.state.boss.skillXp[s] = 0; });
      if (!this.state.districts) this.state.districts = {};
      this.data.world.locations.forEach((location) => {
        const homeRival = this.data.rivalGangs.find((r) => r.home === location.id);
        if (!this.state.districts[location.id]) {
          this.state.districts[location.id] = {control:20,police:location.police,rival:location.rival,unrest:location.risk,intel:0,owner:homeRival?homeRival.id:'neutral',rivalGangId:homeRival?homeRival.id:null};
        }
        const d = this.state.districts[location.id];
        ['control','police','rival','unrest','intel'].forEach((k) => { if (!Number.isFinite(d[k])) d[k] = k==='intel'?0:20; });
        if (!d.owner) d.owner = location.id === this.data.world.startLocationId ? 'player' : (homeRival?homeRival.id:'neutral');
        if (!('rivalGangId' in d)) d.rivalGangId = homeRival?homeRival.id:null;
      });
      if (!Array.isArray(this.state.gang)) this.state.gang = [];
      this.state.gang = this.state.gang.map((m) => this.normalizeMember(m));
      if (!Array.isArray(this.state.assets)) this.state.assets = [];
      this.state.assets.forEach((a) => { if (!a.level) a.level=1; if (!Array.isArray(a.assignedCrewIds)) a.assignedCrewIds=[]; if (!a.invested) a.invested=a.purchasePrice||0; });
      if (!Array.isArray(this.state.rivals)) this.state.rivals = this.data.rivalGangs.map((r)=>({id:r.id,power:r.power,wealth:r.wealth,lastMove:'Beobachtet die Lage.',pressure:0}));
      if (!Array.isArray(this.state.history)) this.state.history=[];
      if (!Array.isArray(this.state.usedRecruitNames)) this.state.usedRecruitNames=[];
      if (!this.state.actionCounts) this.state.actionCounts={};
      if (!this.state.bank) this.state.bank={balance:0,holdings:{},totalDividends:0,totalInterest:0};
      if (!this.state.bank.holdings) this.state.bank.holdings={};
      if (!this.state.market) this.state.market={companies:{}};
      if (!this.state.market.companies) this.state.market.companies={};
      this.data.companies.forEach((c)=>{
        if (!this.state.market.companies[c.id]) this.state.market.companies[c.id]={id:c.id,price:c.basePrice,lastPrice:c.basePrice,revenue:c.baseRevenue,profit:Math.round(c.baseRevenue*.16),development:50,momentum:0,history:[c.basePrice],marketIntel:0};
      });
      if (!Array.isArray(this.state.moles)) this.state.moles=[];
      if (!Array.isArray(this.state.streetOperations)) this.state.streetOperations=[];
      if (!Array.isArray(this.state.inventory)) this.state.inventory=[];
      if (!this.state.casino) this.state.casino={poker:null,lastSlot:null,totalWon:0,totalLost:0};
      if (!this.state.flags) this.state.flags={recruitBoost:0,travelDiscount:0,propertyBoost:0};
      if (!this.state.stats) this.state.stats={};
      const defaults={recruitsJoined:0,policeRaids:0,rivalMoves:0,totalIncome:0,propertyIncome:0,propertiesBought:0,propertiesSold:0,propertiesUpgraded:0,combats:0,combatWins:0,territoriesTaken:0,territoriesLost:0,autonomousCycles:0,molesPlaced:0,molesLost:0,sharesBought:0,sharesSold:0,dividends:0,travels:0,casinoHands:0,casinoSpins:0,gearBought:0,martialArtsLearned:0,streetOpsStarted:0};
      Object.entries(defaults).forEach(([k,v])=>{ if (!Number.isFinite(this.state.stats[k])) this.state.stats[k]=v; });
      if (!this.state.currentLocationId) this.state.currentLocationId=this.state.selectedLocationId||this.data.world.startLocationId;
      if (!this.state.selectedLocationId) this.state.selectedLocationId=this.state.currentLocationId;
      if (!('combatSession' in this.state)) this.state.combatSession=null;
      if (!('lastCombat' in this.state)) this.state.lastCombat=null;
      this.state.schema=this.data.schema;
      this.state.version=this.data.version;
    }

    normalizeMember(member) {
      const m = deepClone(member || {});
      if (!m.id) m.id=`member-${Math.floor(this.random()*1e9)}`;
      if (!m.name) m.name='Unbekannt';
      if (!m.role) m.role='Crew';
      if (!m.trait) m.trait='Unauffällig';
      if (!m.origin) m.origin='Stadtsektor';
      if (!m.bio) m.bio='Noch keine ausführliche Biografie hinterlegt.';
      if (!Number.isFinite(m.age)) m.age=30;
      if (!Number.isFinite(m.power)) m.power=3;
      if (!Number.isFinite(m.loyalty)) m.loyalty=55;
      if (!m.skills) m.skills={};
      if (!m.skillXp) m.skillXp={};
      SKILLS.forEach((s)=>{ if (!Number.isFinite(m.skills[s])) m.skills[s]=4; if (!Number.isFinite(m.skillXp[s])) m.skillXp[s]=0; });
      if (!Array.isArray(m.career)) m.career=[];
      if (!Array.isArray(m.martialArts)) m.martialArts=[];
      if (!Array.isArray(m.equippedGearIds)) m.equippedGearIds=[];
      if (!('assignment' in m)) m.assignment=null;
      if (!Number.isFinite(m.missions)) m.missions=0;
      if (!Number.isFinite(m.wins)) m.wins=0;
      return m;
    }

    getLocation(id=this.state.selectedLocationId) { return this.data.world.locations.find((l)=>l.id===id)||this.data.world.locations[0]; }
    getCurrentLocation() { return this.getLocation(this.state.currentLocationId); }
    getDistrict(id=this.state.selectedLocationId) { return this.state.districts[id]; }
    selectLocation(id) { if (this.state.districts[id]) this.state.selectedLocationId=id; return this.getSnapshot(); }
    getMember(id) { return this.state.gang.find((m)=>m.id===id)||null; }
    getRivalDefinition(id) { return this.data.rivalGangs.find((r)=>r.id===id)||null; }
    getRivalState(id) { return this.state.rivals.find((r)=>r.id===id)||null; }
    getAssetDefinition(id) { return this.data.properties.find((p)=>p.id===id)||null; }
    getCompanyDefinition(id) { return this.data.companies.find((c)=>c.id===id)||null; }
    getInstitution(id) { return this.data.institutions.find((i)=>i.id===id)||null; }
    getAction(id) { return this.data.actions.find((a)=>a.id===id)||null; }

    canAfford(cost={}) { return this.state.resources.money >= (cost.money||0) && this.state.resources.supplies >= (cost.supplies||0); }
    getActionAvailability(action) {
      if (!action) return {ok:false,reason:'Unbekannte Aktion.'};
      if (this.state.selectedLocationId!==this.state.currentLocationId) return {ok:false,reason:'Erst in diesen Bezirk reisen, um hier zu handeln.'};
      if (!this.canAfford(action.cost)) return {ok:false,reason:'Zu wenig Geld oder Vorräte.'};
      if (action.requiresProperty && !this.state.assets.length) return {ok:false,reason:'Benötigt mindestens einen eigenen Betrieb.'};
      return {ok:true,reason:''};
    }

    applyAction(actionId) {
      const action=this.getAction(actionId);
      const availability=this.getActionAvailability(action);
      if (!availability.ok) return availability;
      if (action.combat) return {ok:false,requiresCombat:true,reason:'Crew auswählen und Kampf vorbereiten.',preview:this.getCombatPreview(actionId,[])};
      const district=this.getDistrict();
      this.state.resources.money-=action.cost.money||0;
      this.state.resources.supplies-=action.cost.supplies||0;
      this.applyEffects(action.effects||{},district);
      this.state.actionCounts[action.id]=(this.state.actionCounts[action.id]||0)+1;
      this.awardActionSkills(action);
      this.applyLocalCompanyMomentum(action);
      this.log('action',`${action.title} in ${this.getLocation().title}: ${this.describeEffects(action.effects||{})}.`);
      this.advanceTurn(action.effects.joinBoost||0);
      return {ok:true,action,state:this.getSnapshot()};
    }

    applyEffects(effects,district) {
      if (effects.money) this.state.resources.money+=effects.money;
      ['respect','fear','loyalty','influence','heat','notoriety'].forEach((k)=>{ if (Number.isFinite(effects[k])) this.state.boss[k]=clamp(this.state.boss[k]+effects[k]); });
      ['control','police','rival','unrest'].forEach((k)=>{ if (Number.isFinite(effects[k])) district[k]=clamp(district[k]+effects[k]); });
      if (effects.intel) district.intel=clamp(district.intel+effects.intel,0,5);
      if (effects.propertyBoost) this.state.flags.propertyBoost=Math.max(this.state.flags.propertyBoost,effects.propertyBoost);
      this.evaluateTerritoryOwnership(this.state.selectedLocationId);
    }

    describeEffects(effects) {
      const labels={money:'Geld',respect:'Respekt',fear:'Furcht',loyalty:'Loyalität',influence:'Einfluss',heat:'Fahndung',control:'Kontrolle',rival:'Rivalen',police:'Polizei',unrest:'Unruhe',intel:'Aufklärung'};
      const parts=[];
      Object.entries(labels).forEach(([k,label])=>{ if (Number.isFinite(effects[k])&&effects[k]!==0) parts.push(`${label} ${effects[k]>0?'+':''}${effects[k]}`); });
      return parts.slice(0,6).join(', ')||'Lage verändert';
    }

    skillThreshold(level) { return 40 + level * 18; }
    awardMemberSkillXp(memberId,skill,amount,reason='Praxis') {
      const member=this.getMember(memberId);
      if (!member||!SKILLS.includes(skill)||amount<=0) return null;
      member.skillXp[skill]+=amount;
      let levelUps=0;
      while (member.skills[skill]<10 && member.skillXp[skill]>=this.skillThreshold(member.skills[skill])) {
        member.skillXp[skill]-=this.skillThreshold(member.skills[skill]);
        member.skills[skill]+=1;
        levelUps+=1;
      }
      if (levelUps) {
        member.power=clamp(member.power+(skill==='combat'?levelUps:0),1,20);
        member.career.unshift({turn:this.state.turn,type:'skill',text:`${SKILL_LABELS[skill]} auf ${member.skills[skill]} gestiegen (${reason}).`});
        member.career=member.career.slice(0,20);
        this.log('skill',`${member.name}: ${SKILL_LABELS[skill]} steigt auf ${member.skills[skill]}.`);
      }
      return {skill,level:member.skills[skill],xp:member.skillXp[skill],levelUps};
    }

    awardBossSkillXp(skill,amount) {
      if (!SKILLS.includes(skill)||amount<=0) return;
      this.state.boss.skillXp[skill]+=amount;
      while (this.state.boss.skills[skill]<10 && this.state.boss.skillXp[skill]>=this.skillThreshold(this.state.boss.skills[skill])) {
        this.state.boss.skillXp[skill]-=this.skillThreshold(this.state.boss.skills[skill]);
        this.state.boss.skills[skill]+=1;
        this.log('skill',`Boss-Skill ${SKILL_LABELS[skill]} steigt auf ${this.state.boss.skills[skill]}.`);
      }
    }

    awardActionSkills(action) {
      const xp=action.skillXp||{};
      const free=this.getFreeCrew().slice(0,2);
      Object.entries(xp).forEach(([skill,amount])=>{
        this.awardBossSkillXp(skill,Math.max(2,Math.round(amount*.55)));
        free.forEach((member)=>this.awardMemberSkillXp(member.id,skill,Math.max(1,Math.round(amount/free.length*.7)),action.title));
      });
    }

    getMemberStatus(member) {
      if (member.injuredUntil && member.injuredUntil>this.state.turn) return {key:'injured',label:`Verletzt bis Z${member.injuredUntil}`};
      if (this.state.moles.some((m)=>m.memberId===member.id)) return {key:'mole',label:'Als Maulwurf eingesetzt'};
      if (member.assignment) return {key:'assigned',label:this.getTaskLabel(member.assignment.taskId)};
      const asset=this.state.assets.find((a)=>(a.assignedCrewIds||[]).includes(member.id));
      if (asset) return {key:'asset',label:`Betrieb: ${this.getAssetDefinition(asset.propertyId)?.title||'Objekt'}`};
      return {key:'ready',label:'Frei / einsatzbereit'};
    }

    getFreeCrew() {
      return this.state.gang.filter((m)=>{
        if (m.injuredUntil&&m.injuredUntil>this.state.turn) return false;
        if (m.assignment) return false;
        if (this.state.moles.some((mole)=>mole.memberId===m.id)) return false;
        if (this.state.assets.some((a)=>(a.assignedCrewIds||[]).includes(m.id))) return false;
        return true;
      });
    }

    getTaskLabel(taskId) { return this.data.autonomousTasks.find((t)=>t.id===taskId)?.title||'Dauerauftrag'; }
    assignCrewTask(memberId,taskId,targetId=null) {
      const member=this.getMember(memberId); const task=this.data.autonomousTasks.find((t)=>t.id===taskId);
      if (!member||!task) return {ok:false,reason:'Crew oder Aufgabe unbekannt.'};
      if (member.injuredUntil&&member.injuredUntil>this.state.turn) return {ok:false,reason:'Verletzte Crew kann keinen Dauerauftrag starten.'};
      if (this.state.moles.some((m)=>m.memberId===memberId)) return {ok:false,reason:'Diese Person ist bereits als Maulwurf eingesetzt.'};
      this.state.assets.forEach((a)=>a.assignedCrewIds=(a.assignedCrewIds||[]).filter((id)=>id!==memberId));
      if (task.targetType==='asset'&&!this.state.assets.some((a)=>a.id===targetId)) return {ok:false,reason:'Betrieb als Ziel fehlt.'};
      if (task.targetType==='location'&&!this.state.districts[targetId]) return {ok:false,reason:'Bezirk als Ziel fehlt.'};
      if (task.targetType==='company'&&!this.state.market.companies[targetId]) return {ok:false,reason:'Unternehmen als Ziel fehlt.'};
      if (task.targetType==='institution'&&!this.getInstitution(targetId)) return {ok:false,reason:'Institution als Ziel fehlt.'};
      member.assignment={taskId,targetId,startedTurn:this.state.turn,cycles:0,progress:0};
      member.career.unshift({turn:this.state.turn,type:'assignment',text:`Dauerauftrag gestartet: ${task.title}.`});
      this.log('crew',`${member.name} erhält dauerhaft den Auftrag „${task.title}“.`);
      return {ok:true,assignment:deepClone(member.assignment)};
    }

    clearCrewTask(memberId) {
      const member=this.getMember(memberId); if (!member) return {ok:false,reason:'Crew unbekannt.'};
      member.assignment=null;
      this.log('crew',`${member.name} ist wieder frei verfügbar.`);
      return {ok:true};
    }

    resolveAutonomousTasks() {
      this.state.flags.recruitBoost=0; this.state.flags.travelDiscount=0;
      this.state.gang.forEach((member)=>{
        const a=member.assignment; if (!a) return;
        const task=this.data.autonomousTasks.find((t)=>t.id===a.taskId); if (!task) {member.assignment=null;return;}
        a.cycles+=1; a.progress=clamp(a.progress+8+member.skills[task.skill]*2,0,100);
        this.awardMemberSkillXp(member.id,task.skill,5,task.title);
        if (task.id==='task.manage_asset') {
          const asset=this.state.assets.find((x)=>x.id===a.targetId); if (asset) asset.managerBonus=Math.min(.28,(asset.managerBonus||0)+.015+member.skills.business*.002);
        } else if (task.id==='task.scout') {
          const d=this.state.districts[a.targetId]; if (d) d.intel=clamp(d.intel+(member.skills.analysis>=7?1:0),0,5);
        } else if (task.id==='task.recruit') {
          this.state.flags.recruitBoost+=.008+member.skills.social*.002;
        } else if (task.id==='task.security') {
          const d=this.state.districts[a.targetId]; if (d) { d.control=clamp(d.control+1); d.unrest=clamp(d.unrest-1); }
        } else if (task.id==='task.market') {
          const c=this.state.market.companies[a.targetId]; if (c) c.marketIntel=clamp(c.marketIntel+1,0,5);
        } else if (task.id==='task.mole_handler') {
          const mole=this.state.moles.find((m)=>m.institutionId===a.targetId); if (mole) mole.support=clamp((mole.support||0)+1,0,10);
        } else if (task.id==='task.driver') {
          this.state.flags.travelDiscount=Math.max(this.state.flags.travelDiscount,.08+member.skills.driving*.015);
        } else if (task.id==='task.rest') {
          if (member.injuredUntil) member.injuredUntil=Math.max(this.state.turn,member.injuredUntil-1);
          member.loyalty=clamp(member.loyalty+1);
        }
        if (a.progress>=100) {
          a.progress=0;
          member.career.unshift({turn:this.state.turn,type:'goal',text:`Etappenziel im Dauerauftrag „${task.title}“ erreicht.`});
        }
        this.state.stats.autonomousCycles+=1;
      });
    }

    getAvailableProperties(locationId=this.state.selectedLocationId) {
      const location=this.getLocation(locationId); const district=this.getDistrict(locationId);
      const owned=new Set(this.state.assets.filter((a)=>a.locationId===locationId).map((a)=>a.propertyId));
      return this.data.properties.filter((p)=>p.kinds.includes(location.kind)&&!owned.has(p.id)).map((p)=>{
        const multiplier=.82+location.income/260+district.control/500;
        const cost=Math.round(p.baseCost*multiplier/10)*10;
        const proj=this.getPropertyProjection(p,locationId,1,0);
        return {...deepClone(p),cost,projectedNet:proj.net};
      });
    }

    getPropertyProjection(property,locationId,level=1,staffCount=0) {
      const location=this.getLocation(locationId), district=this.getDistrict(locationId);
      const locationFactor=.72+location.income/160+district.control/260-district.unrest/450-district.police/700;
      const levelFactor=1+(level-1)*.52;
      const staffFactor=1+Math.min(.28,staffCount*.08);
      const gross=Math.max(0,Math.round(property.baseIncome*locationFactor*levelFactor*staffFactor));
      const upkeep=Math.round(property.upkeep*(1+(level-1)*.35));
      return {gross,upkeep,net:gross-upkeep,security:(property.security||0)*level+staffCount};
    }

    getAssetProjection(asset) {
      const def=this.getAssetDefinition(asset.propertyId); if (!def) return {gross:0,upkeep:0,net:0,security:0};
      const base=this.getPropertyProjection(def,asset.locationId,asset.level||1,(asset.assignedCrewIds||[]).length);
      let businessSkill=0;
      (asset.assignedCrewIds||[]).forEach((id)=>{ const m=this.getMember(id); businessSkill+=m?m.skills.business:0; });
      const manager=this.state.gang.find((m)=>m.assignment?.taskId==='task.manage_asset'&&m.assignment.targetId===asset.id);
      if (manager) businessSkill+=manager.skills.business;
      const skillBoost=1+Math.min(.25,businessSkill*.012)+(asset.managerBonus||0)+(this.state.flags.propertyBoost||0);
      return {...base,gross:Math.round(base.gross*skillBoost),net:Math.round(base.gross*skillBoost)-base.upkeep};
    }

    buyProperty(propertyId) {
      const offer=this.getAvailableProperties().find((p)=>p.id===propertyId); if (!offer) return {ok:false,reason:'Objekt hier nicht verfügbar oder bereits im Besitz.'};
      if (this.state.resources.money<offer.cost) return {ok:false,reason:`Es fehlen ${offer.cost-this.state.resources.money} €.`};
      this.state.resources.money-=offer.cost;
      const asset={id:`asset-${this.state.turn}-${this.state.assets.length+1}`,propertyId:offer.id,locationId:this.state.selectedLocationId,purchasePrice:offer.cost,invested:offer.cost,level:1,assignedCrewIds:[],boughtTurn:this.state.turn,managerBonus:0};
      this.state.assets.push(asset); this.state.stats.propertiesBought+=1;
      this.state.boss.influence=clamp(this.state.boss.influence+(offer.influence||0));
      this.log('property',`${offer.title} in ${this.getLocation().title} gekauft: -${offer.cost} €.`);
      this.advanceTurn(offer.joinBoost||0); return {ok:true,asset:deepClone(asset)};
    }

    upgradeProperty(assetId) {
      const asset=this.state.assets.find((a)=>a.id===assetId); if (!asset) return {ok:false,reason:'Betrieb nicht gefunden.'};
      const def=this.getAssetDefinition(asset.propertyId); if (asset.level>=def.maxLevel) return {ok:false,reason:'Maximale Ausbaustufe erreicht.'};
      const cost=Math.round(def.baseCost*(.48+asset.level*.18)/10)*10;
      if (this.state.resources.money<cost) return {ok:false,reason:`Für den Ausbau fehlen ${cost-this.state.resources.money} €.`};
      this.state.resources.money-=cost; asset.level+=1; asset.invested+=cost; asset.managerBonus=Math.max(0,(asset.managerBonus||0)-.04);
      this.state.stats.propertiesUpgraded+=1; this.log('property',`${def.title} auf Stufe ${asset.level} ausgebaut: -${cost} €.`); this.advanceTurn(); return {ok:true,cost,asset:deepClone(asset)};
    }

    sellProperty(assetId) {
      const asset=this.state.assets.find((a)=>a.id===assetId); if (!asset) return {ok:false,reason:'Betrieb nicht gefunden.'};
      const d=this.getDistrict(asset.locationId); const price=Math.max(80,Math.round(asset.invested*(.62+d.control/300-d.unrest/600)/10)*10);
      this.state.resources.money+=price; this.state.assets=this.state.assets.filter((a)=>a.id!==assetId);
      this.state.gang.forEach((m)=>{ if (m.assignment?.targetId===assetId) m.assignment=null; });
      this.state.stats.propertiesSold+=1; this.log('property',`${this.getAssetDefinition(asset.propertyId)?.title||'Betrieb'} verkauft: +${price} €.`); this.advanceTurn(); return {ok:true,price};
    }

    assignCrewToAsset(assetId,memberId) {
      const asset=this.state.assets.find((a)=>a.id===assetId), member=this.getMember(memberId); if (!asset||!member) return {ok:false,reason:'Betrieb oder Crew unbekannt.'};
      if (member.injuredUntil&&member.injuredUntil>this.state.turn) return {ok:false,reason:'Verletzte Crew kann nicht zugewiesen werden.'};
      if (this.state.moles.some((m)=>m.memberId===memberId)) return {ok:false,reason:'Maulwurf ist nicht für Betriebseinsatz verfügbar.'};
      this.state.assets.forEach((a)=>a.assignedCrewIds=(a.assignedCrewIds||[]).filter((id)=>id!==memberId)); member.assignment=null;
      if (!asset.assignedCrewIds.includes(memberId)) { if (asset.assignedCrewIds.length>=2) return {ok:false,reason:'Maximal zwei Crewmitglieder pro Betrieb.'}; asset.assignedCrewIds.push(memberId); }
      this.log('crew',`${member.name} arbeitet dauerhaft im Betrieb.`); return {ok:true};
    }

    unassignCrewFromAsset(memberId) { this.state.assets.forEach((a)=>a.assignedCrewIds=(a.assignedCrewIds||[]).filter((id)=>id!==memberId)); return {ok:true}; }

    getPortfolioSummary() {
      let gross=0,upkeep=0,net=0,value=0,joinBoost=0;
      this.state.assets.forEach((asset)=>{ const p=this.getAssetProjection(asset); gross+=p.gross;upkeep+=p.upkeep;net+=p.net;value+=asset.invested; const def=this.getAssetDefinition(asset.propertyId); joinBoost+=(def?.joinBoost||0)*(asset.level||1); });
      return {count:this.state.assets.length,gross,upkeep,net,value,joinBoost,hotels:this.state.assets.filter((a)=>a.propertyId==='hotel').length};
    }

    resolvePassiveIncome() {
      let districtIncome=0;
      this.data.world.locations.forEach((location)=>{ const d=this.getDistrict(location.id); if (d.owner==='player'||d.control>=55) districtIncome+=Math.max(0,Math.round(location.income*(d.control/100)*(1-d.unrest/180))); });
      const portfolio=this.getPortfolioSummary(); const street=this.resolveStreetOperationIncome();
      const total=districtIncome+portfolio.net+street;
      if (total!==0) { this.state.resources.money+=total; this.state.stats.totalIncome+=total; this.state.stats.propertyIncome+=portfolio.net; this.log('income',`Einnahmen: Bezirke ${districtIncome} €, Betriebe ${portfolio.net} €, Straßenoperationen ${street} €.`); }
      if (this.state.flags.propertyBoost) this.state.flags.propertyBoost=0;
    }

    applyLocalCompanyMomentum(action) {
      const local=this.data.companies.filter((c)=>c.locationId===this.state.selectedLocationId);
      const business=action.category==='business'?5:action.category==='influence'?2:-1;
      local.forEach((c)=>{ const s=this.state.market.companies[c.id]; s.momentum=clamp(s.momentum+business,-20,20); });
    }

    resolveMarket() {
      this.data.companies.forEach((def)=>{
        const c=this.state.market.companies[def.id], d=this.getDistrict(def.locationId);
        const assetBoost=this.state.assets.filter((a)=>a.locationId===def.locationId).reduce((s,a)=>s+(a.level||1)*1.5,0);
        const ownerBoost=d.owner==='player'?5:(d.owner==='neutral'?0:-5);
        const randomDrift=(this.random()-.5)*def.volatility*12;
        const development=clamp(42+d.control*.28-d.unrest*.16-d.police*.06+assetBoost+ownerBoost+c.momentum+randomDrift,8,96);
        const revenue=Math.max(20,Math.round(def.baseRevenue*(.58+development/78)));
        const profit=Math.round(revenue*(.08+development/450));
        const fundamental=def.basePrice*(.62+development/82)*(.9+revenue/def.baseRevenue*.14);
        c.lastPrice=c.price;
        const smoothing=.30+(def.volatility*.35);
        c.price=Math.max(5,Math.round((c.price*(1-smoothing)+fundamental*smoothing+(this.random()-.5)*def.basePrice*def.volatility)*100)/100);
        c.revenue=revenue;c.profit=profit;c.development=development;c.momentum=Math.round(c.momentum*.55);c.history.push(c.price);c.history=c.history.slice(-30);
      });
      if (this.state.turn%5===0) this.payDividends();
      if (this.state.turn%5===0 && this.state.bank.balance>0) { const interest=Math.max(1,Math.round(this.state.bank.balance*.002)); this.state.bank.balance+=interest; this.state.bank.totalInterest+=interest; this.log('bank',`Bankzins: +${interest} €.`); }
    }

    depositToBank(amount) { amount=Math.floor(amount); if (amount<=0||this.state.resources.money<amount) return {ok:false,reason:'Ungültiger Betrag oder zu wenig Bargeld.'}; this.state.resources.money-=amount;this.state.bank.balance+=amount;return {ok:true}; }
    withdrawFromBank(amount) { amount=Math.floor(amount); if (amount<=0||this.state.bank.balance<amount) return {ok:false,reason:'Ungültiger Betrag oder zu wenig Bankguthaben.'}; this.state.bank.balance-=amount;this.state.resources.money+=amount;return {ok:true}; }

    getTradeFee() { return this.state.moles.some((m)=>m.institutionId==='institution.bank') ? .005 : .012; }
    buyShares(companyId,shares) {
      shares=Math.floor(shares); const c=this.state.market.companies[companyId]; if (!c||shares<=0) return {ok:false,reason:'Unternehmen oder Stückzahl ungültig.'};
      const subtotal=Math.round(c.price*shares*100)/100, fee=Math.max(1,Math.round(subtotal*this.getTradeFee()*100)/100), total=subtotal+fee;
      if (this.state.bank.balance<total) return {ok:false,reason:'Bankguthaben reicht für den Kauf nicht.'};
      this.state.bank.balance-=total; const h=this.state.bank.holdings[companyId]||{shares:0,avgCost:0};
      h.avgCost=(h.avgCost*h.shares+subtotal)/(h.shares+shares);h.shares+=shares;this.state.bank.holdings[companyId]=h;this.state.stats.sharesBought+=shares;
      this.awardBossSkillXp('business',Math.min(20,4+shares));this.awardBossSkillXp('analysis',4);this.log('bank',`${shares} Anteile ${this.getCompanyDefinition(companyId).symbol} gekauft.`);return {ok:true,total,fee};
    }

    sellShares(companyId,shares) {
      shares=Math.floor(shares); const c=this.state.market.companies[companyId],h=this.state.bank.holdings[companyId]; if (!c||!h||shares<=0||h.shares<shares) return {ok:false,reason:'Nicht genügend Anteile vorhanden.'};
      const subtotal=Math.round(c.price*shares*100)/100,fee=Math.max(1,Math.round(subtotal*this.getTradeFee()*100)/100),net=subtotal-fee;this.state.bank.balance+=net;h.shares-=shares;if (!h.shares) delete this.state.bank.holdings[companyId];this.state.stats.sharesSold+=shares;this.awardBossSkillXp('business',Math.min(16,3+shares));this.log('bank',`${shares} Anteile ${this.getCompanyDefinition(companyId).symbol} verkauft.`);return {ok:true,net,fee};
    }

    payDividends() {
      let total=0;
      Object.entries(this.state.bank.holdings).forEach(([companyId,h])=>{ const def=this.getCompanyDefinition(companyId),c=this.state.market.companies[companyId]; if (!def||!c||!h.shares) return; const perShare=Math.max(0,Math.round(c.price*def.dividendRate*(.55+c.development/140)*100)/100); total+=Math.round(perShare*h.shares*100)/100; });
      if (total>0) { this.state.bank.balance=Math.round((this.state.bank.balance+total)*100)/100;this.state.bank.totalDividends=Math.round((this.state.bank.totalDividends+total)*100)/100;this.state.stats.dividends=Math.round((this.state.stats.dividends+total)*100)/100;this.log('bank',`Dividenden gutgeschrieben: +${total.toFixed(2)} €.`); }
      return total;
    }

    getInvestmentPortfolio() {
      let value=0,cost=0;
      const positions=Object.entries(this.state.bank.holdings).map(([id,h])=>{ const c=this.state.market.companies[id],def=this.getCompanyDefinition(id); const current=Math.round(c.price*h.shares*100)/100; const basis=Math.round(h.avgCost*h.shares*100)/100; value+=current;cost+=basis;return {companyId:id,symbol:def.symbol,name:def.name,shares:h.shares,avgCost:h.avgCost,price:c.price,value:current,gain:Math.round((current-basis)*100)/100}; });
      return {positions,value:Math.round(value*100)/100,cost:Math.round(cost*100)/100,gain:Math.round((value-cost)*100)/100};
    }

    plantMole(memberId,institutionId) {
      const member=this.getMember(memberId),inst=this.getInstitution(institutionId); if (!member||!inst) return {ok:false,reason:'Crew oder Institution unbekannt.'};
      if (!this.getFreeCrew().some((m)=>m.id===memberId)) return {ok:false,reason:'Nur freie Crew kann als Maulwurf eingesetzt werden.'};
      if (this.state.moles.some((m)=>m.institutionId===institutionId)) return {ok:false,reason:'In dieser Institution ist bereits ein Maulwurf aktiv.'};
      const cost=180+inst.difficulty*3;if (this.state.resources.money<cost) return {ok:false,reason:`Es fehlen ${cost-this.state.resources.money} €.`};
      this.state.resources.money-=cost; const score=member.skills.stealth*5+member.skills.social*3+member.skills.analysis*4+this.state.boss.skills.stealth*2; const probability=Math.max(.16,Math.min(.88,score/(score+inst.difficulty*2.2))); const success=this.random()<probability;
      this.awardMemberSkillXp(memberId,'stealth',16,'Maulwurf-Einsatz');this.awardMemberSkillXp(memberId,'social',8,'Maulwurf-Einsatz');this.awardBossSkillXp('stealth',8);
      if (!success) { member.loyalty=clamp(member.loyalty-2);this.state.boss.heat=clamp(this.state.boss.heat+4);this.log('mole',`Maulwurfversuch bei ${inst.title} scheitert. Aufmerksamkeit steigt.`);this.advanceTurn();return {ok:false,attempted:true,probability:Math.round(probability*100),reason:'Einschleusung im Spiel gescheitert.'}; }
      const mole={id:`mole-${this.state.turn}-${this.state.moles.length+1}`,memberId,institutionId,level:1,cover:80,support:0,startedTurn:this.state.turn,lastReport:'Position aufgebaut.'};this.state.moles.push(mole);this.state.stats.molesPlaced+=1;this.log('mole',`${member.name} ist nun als Maulwurf bei ${inst.title} aktiv.`);this.advanceTurn();return {ok:true,mole:deepClone(mole),probability:Math.round(probability*100)};
    }

    removeMole(moleId) { const mole=this.state.moles.find((m)=>m.id===moleId); if (!mole) return {ok:false,reason:'Maulwurf nicht gefunden.'}; this.state.moles=this.state.moles.filter((m)=>m.id!==moleId);this.log('mole',`Maulwurf aus ${this.getInstitution(mole.institutionId)?.title||'Institution'} abgezogen.`);return {ok:true}; }

    resolveMoles() {
      [...this.state.moles].forEach((mole)=>{ const member=this.getMember(mole.memberId),inst=this.getInstitution(mole.institutionId); if (!member||!inst) {this.state.moles=this.state.moles.filter((m)=>m.id!==mole.id);return;} mole.cover=clamp(mole.cover+(mole.support||0)*2-member.skills.stealth/5,1,100);mole.level=clamp(mole.level+(this.state.turn-mole.startedTurn>8&&this.random()<.18?1:0),1,5);
        if (inst.effect==='police') { this.state.boss.heat=clamp(this.state.boss.heat-1); this.getDistrict().police=clamp(this.getDistrict().police-1); }
        else if (inst.effect==='influence') this.state.boss.influence=clamp(this.state.boss.influence+1);
        else if (inst.effect==='market') this.data.companies.forEach((c)=>this.state.market.companies[c.id].marketIntel=clamp(this.state.market.companies[c.id].marketIntel+1,0,5));
        else if (inst.effect==='travel') this.state.flags.travelDiscount=Math.max(this.state.flags.travelDiscount,.18);
        else if (inst.effect==='recovery') this.state.gang.forEach((g)=>{if(g.injuredUntil)g.injuredUntil=Math.max(this.state.turn,g.injuredUntil-1);});
        else if (inst.effect==='logistics') this.state.resources.supplies+=this.random()<.25?1:0;
        const detection=Math.max(.01,.11-member.skills.stealth*.008-(mole.support||0)*.006+mole.level*.002);
        if (this.random()<detection) { this.state.moles=this.state.moles.filter((m)=>m.id!==mole.id);this.state.stats.molesLost+=1;this.state.boss.heat=clamp(this.state.boss.heat+6);member.loyalty=clamp(member.loyalty-3);this.log('mole',`${member.name}s Maulwurfposition bei ${inst.title} ist aufgeflogen.`); }
      });
    }

    getTravelOptions() {
      const from=this.state.currentLocationId; const options=[];
      this.data.world.connections.forEach(([a,b])=>{ if (a===from) options.push({to:b,mode:'street',title:`Direkt nach ${this.getLocation(b).title}`,cost:15,duration:1}); else if (b===from) options.push({to:a,mode:'street',title:`Direkt nach ${this.getLocation(a).title}`,cost:15,duration:1}); });
      if (from==='location.station.ghost') this.data.world.trainRoutes.forEach((r)=>options.push({to:r.to,mode:'train',title:r.title,cost:r.cost,duration:r.duration}));
      return options;
    }

    travelTo(destinationId,mode='street') {
      const option=this.getTravelOptions().find((o)=>o.to===destinationId&&o.mode===mode); if (!option) return {ok:false,reason:'Dieses Reiseziel ist von hier aktuell nicht erreichbar.'};
      const discount=Math.min(.45,(this.state.flags.travelDiscount||0)+this.state.boss.skills.driving*.01); const cost=Math.max(0,Math.round(option.cost*(1-discount)));
      if (this.state.resources.money<cost) return {ok:false,reason:'Zu wenig Geld für die Fahrt.'};
      this.state.resources.money-=cost;this.state.currentLocationId=destinationId;this.state.selectedLocationId=destinationId;this.state.stats.travels+=1;this.awardBossSkillXp('driving',mode==='train'?3:6);const driver=this.getFreeCrew().sort((a,b)=>b.skills.driving-a.skills.driving)[0];if(driver)this.awardMemberSkillXp(driver.id,'driving',5,'Stadtfahrt');this.log('travel',`${option.title}: -${cost} €.`);this.advanceTurn();return {ok:true,cost,destination:this.getLocation(destinationId)};
    }

    buyGear(gearId) { if(this.getCurrentLocation().kind!=='market')return{ok:false,reason:'Ausrüstung wird im Eisenladen am Schwarzmarkt verkauft.'};const def=this.data.gear.find((g)=>g.id===gearId);if(!def)return{ok:false,reason:'Ausrüstung unbekannt.'};if(this.state.resources.money<def.cost)return{ok:false,reason:'Zu wenig Geld.'};this.state.resources.money-=def.cost;const item={id:`item-${this.state.turn}-${this.state.inventory.length+1}`,gearId,boughtTurn:this.state.turn,equippedBy:null};this.state.inventory.push(item);this.state.stats.gearBought+=1;this.log('gear',`${def.title} gekauft.`);return{ok:true,item:deepClone(item)}; }
    equipGear(itemId,memberId) { const item=this.state.inventory.find((i)=>i.id===itemId),member=this.getMember(memberId);if(!item||!member)return{ok:false,reason:'Ausrüstung oder Crew unbekannt.'};if(item.equippedBy){const old=this.getMember(item.equippedBy);if(old)old.equippedGearIds=old.equippedGearIds.filter((id)=>id!==itemId);}item.equippedBy=memberId;if(!member.equippedGearIds.includes(itemId))member.equippedGearIds.push(itemId);return{ok:true}; }
    getMemberGearBonuses(memberId) { const member=this.getMember(memberId);const out={combat:0,defense:0,analysis:0};if(!member)return out;member.equippedGearIds.forEach((id)=>{const item=this.state.inventory.find((i)=>i.id===id),def=item?this.data.gear.find((g)=>g.id===item.gearId):null;if(def){out.combat+=def.combatBonus||0;out.defense+=def.defenseBonus||0;out.analysis+=def.analysisBonus||0;}});return out; }

    trainMartialArt(memberId,artId) { if(this.getCurrentLocation().kind!=='residential')return{ok:false,reason:'Kampfsporttraining ist im Dojo der Ostblöcke verfügbar.'};const member=this.getMember(memberId),art=this.data.martialArts.find((a)=>a.id===artId);if(!member||!art)return{ok:false,reason:'Crew oder Kampfsport unbekannt.'};if(this.state.resources.money<art.cost)return{ok:false,reason:'Zu wenig Geld.'};this.state.resources.money-=art.cost;let learned=member.martialArts.find((x)=>x.artId===artId);if(!learned){learned={artId,rank:1};member.martialArts.push(learned);}else learned.rank=Math.min(5,learned.rank+1);Object.entries(art.skillXp).forEach(([s,xp])=>this.awardMemberSkillXp(memberId,s,xp,art.title));member.power=clamp(member.power+(art.powerBonus||0),1,20);this.state.stats.martialArtsLearned+=1;this.log('training',`${member.name} trainiert ${art.title}, Rang ${learned.rank}.`);this.advanceTurn();return{ok:true,rank:learned.rank}; }

    startStreetOperation(operationId,targetId=this.state.selectedLocationId) { const def=this.data.streetOperations.find((o)=>o.id===operationId);if(!def)return{ok:false,reason:'Operation unbekannt.'};if(this.state.resources.money<def.cost)return{ok:false,reason:'Zu wenig Geld.'};this.state.resources.money-=def.cost;this.state.boss.heat=clamp(this.state.boss.heat+def.heat);this.state.stats.streetOpsStarted+=1;
      if(def.kind==='recurring'){const op={id:`street-${this.state.turn}-${this.state.streetOperations.length+1}`,operationId,locationId:targetId,startedTurn:this.state.turn,active:true};this.state.streetOperations.push(op);this.awardBossSkillXp('business',10);this.awardBossSkillXp('stealth',6);this.log('street',`${def.title} in ${this.getLocation(targetId).title} als fiktive Spieloperation gestartet.`);this.advanceTurn();return{ok:true,operation:deepClone(op)};}
      const rival=this.getRivalState(targetId)||this.state.rivals[0];const probability=Math.max(.18,Math.min(.82,(this.state.boss.skills.stealth*5+this.state.boss.skills.analysis*4+this.getGangPower()*1.2)/(90+(rival?.power||50))));const success=this.random()<probability;if(success&&rival){rival.power=clamp(rival.power-9,10,100);rival.wealth=Math.max(0,rival.wealth-180);this.state.boss.fear=clamp(this.state.boss.fear+5);}else this.state.boss.heat=clamp(this.state.boss.heat+7);this.awardBossSkillXp('stealth',12);this.awardBossSkillXp('analysis',8);this.log('street',`${def.title}: ${success?'fiktiver Auftrag erfolgreich':'fiktiver Auftrag gescheitert'} (${Math.round(probability*100)}% Prognose).`);this.advanceTurn();return{ok:true,success,probability:Math.round(probability*100)};
    }

    stopStreetOperation(id) { const op=this.state.streetOperations.find((o)=>o.id===id);if(!op)return{ok:false,reason:'Operation unbekannt.'};op.active=false;return{ok:true}; }
    resolveStreetOperationIncome() { let total=0;this.state.streetOperations.filter((o)=>o.active).forEach((op)=>{const def=this.data.streetOperations.find((x)=>x.id===op.operationId);if(!def||def.kind!=='recurring')return;let income=Math.round(def.income*(.75+this.getDistrict(op.locationId).control/180));if(this.random()<def.risk){income=Math.max(0,Math.round(income*.2));this.state.boss.heat=clamp(this.state.boss.heat+3);this.log('street',`${def.title} in ${this.getLocation(op.locationId).title}: Störung reduziert den Ertrag.`);}total+=income;});return total; }

    makeDeck() { const suits=['♠','♥','♦','♣'],ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'],deck=[];suits.forEach((s)=>ranks.forEach((r)=>deck.push({r,s})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck; }
    startPoker(bet) { bet=Math.floor(bet);if(this.getCurrentLocation().kind!=='casino')return{ok:false,reason:'Poker ist nur im Casino 9909 verfügbar.'};if(bet<10||bet>500||this.state.resources.money<bet)return{ok:false,reason:'Einsatz muss 10–500 € betragen und verfügbar sein.'};this.state.resources.money-=bet;const deck=this.makeDeck();this.state.casino.poker={bet,deck,player:deck.splice(0,5),dealer:deck.splice(0,5),holds:[false,false,false,false,false],draws:0,status:'playing',result:null};this.state.casino.totalLost+=bet;this.state.stats.casinoHands+=1;return{ok:true,poker:deepClone(this.state.casino.poker)}; }
    togglePokerHold(index) { const p=this.state.casino.poker;if(!p||p.status!=='playing'||index<0||index>4)return{ok:false};p.holds[index]=!p.holds[index];return{ok:true,holds:[...p.holds]}; }
    drawPoker() { const p=this.state.casino.poker;if(!p||p.status!=='playing')return{ok:false,reason:'Kein aktives Pokerblatt.'};if(p.draws>=2)return{ok:false,reason:'Keine Ziehrunde mehr verfügbar.'};for(let i=0;i<5;i++){if(!p.holds[i])p.player[i]=p.deck.shift();}p.draws+=1;this.awardBossSkillXp('analysis',4);return{ok:true,poker:deepClone(p)}; }
    finishPoker() { const p=this.state.casino.poker;if(!p||p.status!=='playing')return{ok:false,reason:'Kein aktives Pokerblatt.'};this.dealerDraw(p);const a=this.evaluatePokerHand(p.player),b=this.evaluatePokerHand(p.dealer);const cmp=this.comparePoker(a,b);let payout=0,result='Niederlage';if(cmp>0){payout=p.bet*2;result='Sieg';}else if(cmp===0){payout=p.bet;result='Unentschieden';}this.state.resources.money+=payout;if(payout>p.bet)this.state.casino.totalWon+=payout-p.bet;p.status='finished';p.result={result,payout,playerRank:a.name,dealerRank:b.name};this.awardBossSkillXp('analysis',cmp>0?8:3);this.log('casino',`Poker: ${result} · ${a.name} gegen ${b.name} · Auszahlung ${payout} €.`);return{ok:true,...deepClone(p.result)}; }
    dealerDraw(p) { const eval0=this.evaluatePokerHand(p.dealer);if(eval0.category>=1)return;for(let i=0;i<3;i++)p.dealer[i]=p.deck.shift(); }
    evaluatePokerHand(hand) { const values={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};const nums=hand.map((c)=>values[c.r]).sort((a,b)=>b-a);const counts={};nums.forEach((n)=>counts[n]=(counts[n]||0)+1);const groups=Object.entries(counts).map(([v,c])=>({v:+v,c})).sort((a,b)=>b.c-a.c||b.v-a.v);const flush=hand.every((c)=>c.s===hand[0].s);const unique=[...new Set(nums)].sort((a,b)=>b-a);let straight=false,high=unique[0];if(unique.length===5&&unique[0]-unique[4]===4)straight=true;if(JSON.stringify(unique)==='[14,5,4,3,2]'){straight=true;high=5;}let category=0,name='Hohe Karte',tie=nums;if(straight&&flush){category=8;name='Straight Flush';tie=[high];}else if(groups[0].c===4){category=7;name='Vierling';tie=[groups[0].v,groups[1].v];}else if(groups[0].c===3&&groups[1].c===2){category=6;name='Full House';tie=[groups[0].v,groups[1].v];}else if(flush){category=5;name='Flush';tie=nums;}else if(straight){category=4;name='Straight';tie=[high];}else if(groups[0].c===3){category=3;name='Drilling';tie=[groups[0].v,...groups.slice(1).map((g)=>g.v).sort((a,b)=>b-a)];}else if(groups[0].c===2&&groups[1].c===2){category=2;name='Zwei Paare';tie=[Math.max(groups[0].v,groups[1].v),Math.min(groups[0].v,groups[1].v),groups[2].v];}else if(groups[0].c===2){category=1;name='Paar';tie=[groups[0].v,...groups.slice(1).map((g)=>g.v).sort((a,b)=>b-a)];}return{category,name,tie}; }
    comparePoker(a,b){if(a.category!==b.category)return a.category>b.category?1:-1;for(let i=0;i<Math.max(a.tie.length,b.tie.length);i++){const av=a.tie[i]||0,bv=b.tie[i]||0;if(av!==bv)return av>bv?1:-1;}return 0;}
    spinSlot(machineId,bet) { const m=this.data.casino.slotMachines.find((x)=>x.id===machineId);bet=Math.floor(bet);if(this.getCurrentLocation().kind!=='casino')return{ok:false,reason:'Spielautomaten stehen im Casino 9909.'};if(!m||bet<m.minBet||bet>m.maxBet||this.state.resources.money<bet)return{ok:false,reason:'Einsatz außerhalb des Automatenlimits oder nicht verfügbar.'};this.state.resources.money-=bet;const reels=[0,1,2].map(()=>m.symbols[Math.floor(this.random()*m.symbols.length)]);let mult=0;if(reels[0]===reels[1]&&reels[1]===reels[2])mult=reels[0]==='7'||reels[0]==='€'?12:7;else if(reels[0]===reels[1]||reels[1]===reels[2]||reels[0]===reels[2])mult=2;const payout=bet*mult;this.state.resources.money+=payout;this.state.casino.lastSlot={machineId,reels,bet,payout,mult};this.state.casino.totalLost+=bet;if(payout>bet)this.state.casino.totalWon+=payout-bet;this.state.stats.casinoSpins+=1;this.log('casino',`${m.title}: ${reels.join(' | ')} · ${payout?`+${payout} €`:'kein Gewinn'}.`);return{ok:true,reels,payout,mult}; }

    getCombatCrewScore(member) { const g=this.getMemberGearBonuses(member.id);return member.power*2+member.skills.combat*3+member.skills.analysis*1.2+member.skills.endurance*.8+g.combat*3+g.analysis*1.5; }
    getCombatPreview(actionId='raid',crewIds=[]) { const action=this.getAction(actionId);if(!action?.combat)return null;const district=this.getDistrict(),location=this.getLocation(),rival=this.getRivalState(district.rivalGangId)||this.state.rivals.sort((a,b)=>b.power-a.power)[0];const crew=(crewIds.length?crewIds.map((id)=>this.getMember(id)).filter(Boolean):this.getFreeCrew().slice(0,action.combat.maxCrew));const contributions=crew.map((m)=>({id:m.id,name:m.name,score:Math.round(this.getCombatCrewScore(m)),combat:m.skills.combat,analysis:m.skills.analysis,gear:this.getMemberGearBonuses(m.id)}));const crewScore=contributions.reduce((s,c)=>s+c.score,0);const terrain={base:6,station:-2,industrial:-4,harbor:-5,lookout:8,residential:2,casino:0,market:1,club:1,commercial:2,archive:5,transit:0}[location.kind]||0;const intel=district.intel*7+this.state.boss.skills.analysis*2;const attacker=crewScore+this.state.boss.fear*.18+this.state.boss.respect*.1+intel+terrain;const defender=district.rival*.72+district.police*.1+location.risk*.24+(rival?.power||50)*.55+18;const probability=Math.max(.18,Math.min(.88,attacker/(attacker+defender)));return{percent:Math.round(probability*100),attackerPower:Math.round(attacker),defenderPower:Math.round(defender),terrain,terrainLabel:terrain>=5?'Vorteil':terrain<=-4?'Nachteil':'Neutral',rivalId:rival?.id||null,rivalName:this.getRivalDefinition(rival?.id)?.name||'Rivalen',crew:contributions,intel,districtOwner:district.owner,injuryRisk:clamp(30+location.risk*.25-district.intel*3,8,62)}; }

    startCombat(actionId='raid',crewIds=[]) { const action=this.getAction(actionId);if(!action?.combat)return{ok:false,reason:'Keine Kampfaktion.'};if(this.state.selectedLocationId!==this.state.currentLocationId)return{ok:false,reason:'Erst in den ausgewählten Bezirk reisen.'};if(this.state.combatSession)return{ok:false,reason:'Es läuft bereits ein Kampf.'};const freeIds=new Set(this.getFreeCrew().map((m)=>m.id));const selected=[...new Set(crewIds)].filter((id)=>freeIds.has(id)).slice(0,action.combat.maxCrew);if(!selected.length)return{ok:false,reason:'Mindestens ein freies Crewmitglied auswählen.'};if(!this.canAfford(action.cost))return{ok:false,reason:'Zu wenig Vorräte oder Geld.'};this.state.resources.money-=action.cost.money||0;this.state.resources.supplies-=action.cost.supplies||0;this.applyEffects(action.effects||{},this.getDistrict());const preview=this.getCombatPreview(actionId,selected);this.state.combatSession={id:`combat-${this.state.turn}`,actionId,locationId:this.state.selectedLocationId,crewIds:selected,rivalId:preview.rivalId,round:1,maxRounds:4,playerMorale:100,enemyMorale:100,advantage:clamp(preview.percent-50,-25,25),cover:0,log:[`Kontakt in ${this.getLocation().title}. ${preview.rivalName} stellt sich entgegen.`],preview,finished:false};selected.forEach((id)=>{const m=this.getMember(id);m.missions+=1;});return{ok:true,session:deepClone(this.state.combatSession)}; }

    combatDecision(decision) { const s=this.state.combatSession;if(!s||s.finished)return{ok:false,reason:'Kein aktiver Kampf.'};if(!['attack','cover','retreat'].includes(decision))return{ok:false,reason:'Unbekannte Taktik.'};if(decision==='retreat'){s.playerMorale=clamp(s.playerMorale-8);s.log.push('Geordneter Rückzug: Crew löst sich aus dem Konflikt.');return this.finishCombat('retreat');}
      const crew=s.crewIds.map((id)=>this.getMember(id)).filter(Boolean);const avgCombat=crew.reduce((v,m)=>v+m.skills.combat,0)/crew.length,avgAnalysis=crew.reduce((v,m)=>v+m.skills.analysis,0)/crew.length;const rival=this.getRivalState(s.rivalId);const district=this.getDistrict(s.locationId);const baseChance=Math.max(.12,Math.min(.90,(s.preview.percent+s.advantage+avgAnalysis*.8)/100));
      if(decision==='cover'){const gain=6+Math.round(avgAnalysis*.8);s.advantage=clamp(s.advantage+gain,-25,35);s.cover=clamp(s.cover+10+avgCombat,0,60);s.playerMorale=clamp(s.playerMorale+4);s.enemyMorale=clamp(s.enemyMorale-(2+Math.round(avgAnalysis/3)));s.log.push(`Runde ${s.round}: Deckung aufgebaut. Taktischer Vorteil +${gain}.`);crew.forEach((m)=>{this.awardMemberSkillXp(m.id,'analysis',5,'Deckung');this.awardMemberSkillXp(m.id,'endurance',3,'Deckung');});this.awardBossSkillXp('analysis',4);
      } else {const hit=this.random()<baseChance;const damage=hit?12+Math.round(avgCombat*1.8)+Math.round(Math.max(0,s.advantage)/5):3+Math.round(avgCombat/3);s.enemyMorale=clamp(s.enemyMorale-damage);const counterChance=Math.max(.08,Math.min(.55,.36+s.preview.injuryRisk/200-s.cover/160-avgCombat*.015));if(this.random()<counterChance){const moraleLoss=6+Math.floor(this.random()*9);s.playerMorale=clamp(s.playerMorale-moraleLoss);this.resolveCombatInjury(s.crewIds,Math.max(.05,counterChance-.12));}s.advantage=clamp(s.advantage+(hit?4:-3),-25,35);s.cover=clamp(s.cover-8,0,60);s.log.push(`Runde ${s.round}: Angriff ${hit?'trifft':'stockt'} · Rivalenmoral -${damage}.`);crew.forEach((m)=>{this.awardMemberSkillXp(m.id,'combat',7,'Kampfentscheidung');this.awardMemberSkillXp(m.id,'analysis',2,'Kampfentscheidung');});this.awardBossSkillXp('combat',5);}
      s.round+=1;if(s.enemyMorale<=18)return this.finishCombat('win');if(s.playerMorale<=18)return this.finishCombat('loss');if(s.round>s.maxRounds){return this.finishCombat(s.enemyMorale<s.playerMorale?'win':'loss');}return{ok:true,finished:false,session:deepClone(s)};
    }

    resolveCombatInjury(crewIds,risk) { if(this.random()>=risk)return null;const pool=crewIds.map((id)=>this.getMember(id)).filter(Boolean);if(!pool.length)return null;const target=pool[Math.floor(this.random()*pool.length)];const gear=this.getMemberGearBonuses(target.id);const duration=Math.max(1,3-Math.floor(gear.defense/2));target.injuredUntil=this.state.turn+duration;target.loyalty=clamp(target.loyalty-2);return target.name; }

    finishCombat(outcome) { const s=this.state.combatSession,d=this.getDistrict(s.locationId),rival=this.getRivalState(s.rivalId),action=this.getAction(s.actionId);let reward=0,takeover=false;if(outcome==='win'){reward=action.combat.baseReward+Math.round(d.rival*2.4);this.state.resources.money+=reward;d.control=clamp(d.control+18);d.rival=clamp(d.rival-20);d.unrest=clamp(d.unrest+4);this.state.stats.combatWins+=1;if(rival){rival.power=clamp(rival.power-5,10,100);rival.wealth=Math.max(0,rival.wealth-80);}s.crewIds.forEach((id)=>{const m=this.getMember(id);m.wins+=1;m.loyalty=clamp(m.loyalty+2);});takeover=this.evaluateTerritoryOwnership(s.locationId,'player');}else if(outcome==='loss'){d.control=clamp(d.control-10);d.rival=clamp(d.rival+9);d.unrest=clamp(d.unrest+7);this.state.boss.loyalty=clamp(this.state.boss.loyalty-3);this.evaluateTerritoryOwnership(s.locationId,s.rivalId);}else{d.control=clamp(d.control-3);this.state.boss.heat=clamp(this.state.boss.heat-2);}this.state.stats.combats+=1;const result={turn:this.state.turn,locationId:s.locationId,locationTitle:this.getLocation(s.locationId).title,outcome,reward,rounds:s.round-1,playerMorale:s.playerMorale,enemyMorale:s.enemyMorale,advantage:s.advantage,crew:s.crewIds.map((id)=>this.getMember(id)?.name).filter(Boolean),rivalName:this.getRivalDefinition(s.rivalId)?.name||'Rivalen',takeover,log:[...s.log]};this.state.lastCombat=result;this.state.combatSession=null;this.log(outcome==='win'?'combat-win':outcome==='loss'?'combat-loss':'combat',`Kampf in ${result.locationTitle}: ${outcome==='win'?'SIEG':outcome==='loss'?'NIEDERLAGE':'RÜCKZUG'}${reward?` · +${reward} €`:''}.`);this.advanceTurn();return{ok:true,finished:true,result:deepClone(result)}; }

    evaluateTerritoryOwnership(locationId,preferredRivalId=null) { const d=this.getDistrict(locationId);const before=d.owner;if(d.control>=56&&d.rival<=48)d.owner='player';else if(d.rival>=62&&d.control<=42)d.owner=preferredRivalId&&preferredRivalId!=='player'?preferredRivalId:(d.rivalGangId||this.strongestRivalId());else if(d.control<45&&d.rival<55&&d.owner==='player')d.owner='neutral';if(d.owner!==before){if(d.owner==='player')this.state.stats.territoriesTaken+=1;else if(before==='player')this.state.stats.territoriesLost+=1;this.log('territory',`${this.getLocation(locationId).title}: Besitzer wechselt zu ${this.ownerLabel(d.owner)}.`);return true;}return false; }
    strongestRivalId(){return [...this.state.rivals].sort((a,b)=>b.power-a.power)[0]?.id||this.data.rivalGangs[0].id;}
    ownerLabel(owner){if(owner==='player')return'Deine Gang';if(owner==='neutral')return'Neutral';return this.getRivalDefinition(owner)?.name||'Rivalen';}

    resolveRivalGangs() { this.state.rivals.forEach((rival)=>{const def=this.getRivalDefinition(rival.id);if(!def||this.random()>.58)return;const candidates=this.data.world.locations.filter((l)=>l.id!==this.data.world.startLocationId).map((l)=>({l,d:this.getDistrict(l.id)}));if(def.strategy==='aggressive')candidates.sort((a,b)=>(a.d.control-a.d.rival)-(b.d.control-b.d.rival));else if(def.strategy==='economic')candidates.sort((a,b)=>b.l.income-a.l.income);else candidates.sort((a,b)=>(a.d.intel-b.d.intel)+(b.d.unrest-a.d.unrest));const pick=candidates[Math.floor(this.random()*Math.min(4,candidates.length))];const push=def.strategy==='aggressive'?7+Math.floor(this.random()*5):4+Math.floor(this.random()*5);pick.d.rival=clamp(pick.d.rival+push);pick.d.rivalGangId=rival.id;if(def.strategy==='aggressive'){pick.d.control=clamp(pick.d.control-Math.ceil(push*.55));pick.d.unrest=clamp(pick.d.unrest+4);rival.power=clamp(rival.power+1,15,100);rival.lastMove=`Drückt offen in ${pick.l.title}.`;}else if(def.strategy==='economic'){const spend=Math.min(rival.wealth,80);rival.wealth-=spend;pick.d.control=clamp(pick.d.control-3);rival.wealth+=45;rival.lastMove=`Kauft Einfluss in ${pick.l.title}.`;}else{pick.d.intel=Math.max(0,pick.d.intel-1);pick.d.unrest=clamp(pick.d.unrest+5);pick.d.police=clamp(pick.d.police+2);rival.lastMove=`Unterwandert ${pick.l.title}.`;}this.evaluateTerritoryOwnership(pick.l.id,rival.id);this.state.stats.rivalMoves+=1;this.log('rival',`${def.name}: ${rival.lastMove}`);}); }

    getRaidRisk(locationId=this.state.currentLocationId){const d=this.getDistrict(locationId);const localSecurity=this.state.assets.filter((a)=>a.locationId===locationId).reduce((s,a)=>s+this.getAssetProjection(a).security,0);const mole=this.state.moles.some((m)=>m.institutionId==='institution.police')?-.08:0;return Math.max(0,Math.min(.72,(this.state.boss.heat-28)/145+d.police/620-localSecurity*.008+mole));}
    resolvePolicePressure(){const d=this.getDistrict(this.state.currentLocationId);if(this.random()<this.getRaidRisk()){const loss=Math.min(this.state.resources.money,65+Math.floor(this.random()*100));this.state.resources.money-=loss;if(this.state.resources.supplies>0&&this.random()<.5)this.state.resources.supplies-=1;d.control=clamp(d.control-4);d.police=clamp(d.police+5);this.state.boss.heat=clamp(this.state.boss.heat+2);this.state.stats.policeRaids+=1;this.log('police',`Polizeizugriff in ${this.getCurrentLocation().title}: -${loss} €.`);}else if(this.state.boss.heat>34)this.state.boss.heat=clamp(this.state.boss.heat-1);}

    getRecruitChance(joinBoost=0){if(this.state.gang.length>=18)return 0;const b=this.state.boss,d=this.getDistrict(this.state.currentLocationId),portfolio=this.getPortfolioSummary();let chance=.02+b.respect*.001+b.influence*.00075+b.loyalty*.0003+d.control*.00035+joinBoost+portfolio.joinBoost+(this.state.flags.recruitBoost||0);chance-=Math.max(0,b.heat-70)*.0014;return Math.min(.44,Math.max(.01,chance));}
    resolveRecruitment(joinBoost=0){const chance=this.getRecruitChance(joinBoost);if(!chance||this.random()>=chance)return;const pool=this.data.recruits.filter((c)=>!this.state.usedRecruitNames.includes(c.name));if(!pool.length)return;const boss=this.state.boss;const scored=pool.map((c)=>{const affinity=c.affinity==='money'?Math.min(100,this.state.resources.money/18):c.affinity==='heat'?100-boss.heat:(boss[c.affinity]||50);return{c,score:affinity+this.random()*35};}).sort((a,b)=>b.score-a.score);const selected=this.normalizeMember(scored[0].c);selected.id=`recruit-${this.state.turn}-${this.state.gang.length+1}`;selected.origin=this.getCurrentLocation().title;selected.loyalty=clamp(selected.loyalty+Math.round((boss.respect+boss.loyalty-100)/8),30,94);this.state.gang.push(selected);this.state.usedRecruitNames.push(selected.name);this.state.stats.recruitsJoined+=1;boss.influence=clamp(boss.influence+2);this.log('recruit',`${selected.name} (${selected.role}) schließt sich der Gang an.`);}

    resolveGangLoyalty(){const b=this.state.boss;this.state.gang.forEach((m)=>{let delta=0;if(b.loyalty>70)delta++;if(b.heat>80)delta--;if(b.fear>78&&b.respect<35)delta--;m.loyalty=clamp(m.loyalty+delta,1,100);if(m.injuredUntil&&this.state.turn>=m.injuredUntil)delete m.injuredUntil;});if(this.state.gang.length>3){const deserter=this.state.gang.find((m)=>m.loyalty<22&&this.random()<.12);if(deserter){this.state.gang=this.state.gang.filter((m)=>m.id!==deserter.id);this.state.assets.forEach((a)=>a.assignedCrewIds=(a.assignedCrewIds||[]).filter((id)=>id!==deserter.id));this.state.moles=this.state.moles.filter((m)=>m.memberId!==deserter.id);this.state.boss.loyalty=clamp(this.state.boss.loyalty-4);this.log('warning',`${deserter.name} steigt aus.`);}}}

    getGangPower(){return this.state.gang.reduce((s,m)=>s+(m.injuredUntil?Math.ceil(m.power/2):m.power),0);}
    getOwnedDistrictCount(){return Object.values(this.state.districts).filter((d)=>d.owner==='player').length;}
    getBossRank(){const score=this.state.boss.respect+this.state.boss.influence+this.state.assets.length*8+this.getOwnedDistrictCount()*12+this.getInvestmentPortfolio().value/300;if(score>=275)return'Stadtlegende';if(score>=220)return'Ringherr';if(score>=170)return'Bezirksboss';if(score>=120)return'Straßenboss';return'Aufsteiger';}
    getBossProfile(){const b=this.state.boss;if(b.heat>=80)return{title:'Gejagter Boss',note:'Hohe Aufmerksamkeit. Lautes Vorgehen wird teuer.'};if(b.respect>=70&&b.loyalty>=68)return{title:'Straßenpatron',note:'Schutz, Rückhalt und Nutzen tragen deine Macht.'};if(b.fear>=70&&b.respect<55)return{title:'Eiserne Hand',note:'Furcht funktioniert schnell, aber Loyalität wird entscheidend.'};if(b.influence>=70)return{title:'Netzwerker',note:'Kontakte, Besitz und Zugang sind deine stärksten Hebel.'};if(this.state.assets.length>=5||this.getInvestmentPortfolio().value>2000)return{title:'Stadtunternehmer',note:'Betriebe und Beteiligungen formen eine zweite Machtbasis.'};return{title:'Aufsteigender Boss',note:'Taten, Besitz, Skills und Beziehungen formen deinen Stil.'};}
    getCitySummary(){const ds=Object.values(this.state.districts);return{avgControl:Math.round(ds.reduce((s,d)=>s+d.control,0)/ds.length),avgRival:Math.round(ds.reduce((s,d)=>s+d.rival,0)/ds.length),controlled:this.getOwnedDistrictCount(),total:ds.length};}
    getRivalOverview(){return this.state.rivals.map((r)=>{const d=this.getRivalDefinition(r.id);const territories=this.data.world.locations.filter((l)=>this.getDistrict(l.id).owner===r.id);return{...deepClone(r),name:d.name,short:d.short,strategy:d.strategy,description:d.description,color:d.color,territories:territories.map((l)=>l.title)};});}
    getDecisionSupport(){const portfolio=this.getPortfolioSummary(),invest=this.getInvestmentPortfolio(),free=this.getFreeCrew(),avgLoyalty=Math.round(this.state.gang.reduce((s,m)=>s+m.loyalty,0)/Math.max(1,this.state.gang.length)),warnings=[],raid=Math.round(this.getRaidRisk()*100);if(raid>=35)warnings.push(`Razzia-Risiko ${raid}%: Fahndung oder Polizei senken.`);if(avgLoyalty<48)warnings.push('Crewtreue ist instabil.');if(free.length<2)warnings.push('Wenig freie Crew: Daueraufträge und Betriebe prüfen.');if(this.state.bank.balance<200)warnings.push('Bankreserve niedrig: Beteiligungen sind schwer nachzukaufen.');const hot=this.data.world.locations.map((l)=>({l,d:this.getDistrict(l.id)})).sort((a,b)=>(b.d.rival-b.d.control)-(a.d.rival-a.d.control))[0];if(hot&&hot.d.rival-hot.d.control>22)warnings.push(`${hot.l.title} droht zu kippen.`);if(!warnings.length)warnings.push('Lage stabil: Expansion, Anlage oder Skillaufbau möglich.');return{rank:this.getBossRank(),netWorth:Math.round(this.state.resources.money+this.state.bank.balance+portfolio.value+invest.value),cashflow:portfolio.net,investmentValue:invest.value,raidRisk:raid,recruitChance:Math.round(this.getRecruitChance()*100),readyCrew:free.length,totalCrew:this.state.gang.length,avgLoyalty,warnings};}

    advanceTurn(joinBoost=0){this.state.turn+=1;this.resolveAutonomousTasks();this.resolvePassiveIncome();this.resolveMarket();this.resolveMoles();this.resolveRivalGangs();this.resolvePolicePressure();this.resolveRecruitment(joinBoost);this.resolveGangLoyalty();}

    log(type,text){this.state.history.unshift({turn:this.state.turn,type,text});this.state.history=this.state.history.slice(0,160);}
    exportState(){return JSON.stringify(this.state);}
    getSnapshot(){return deepClone(this.state);}
  }

  return {GameEngine,seededRandom,clamp,SKILLS,SKILL_LABELS};
});
