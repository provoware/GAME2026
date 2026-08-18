(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc10-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc11-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent}=BASE;
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(Number(v)||0)));
  class LivingCity11Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_11_ENGINE=this;ROOT.LIVING_CITY_10_ENGINE=this;ROOT.LIVING_CITY_09_ENGINE=this;ROOT.LIVING_CITY_08_ENGINE=this;
        ROOT.LIVING_CITY_07_ENGINE=this;ROOT.LIVING_CITY_06_ENGINE=this;ROOT.LIVING_CITY_05_ENGINE=this;ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.casinoFloor={jackpots:{},session:{spins:0,pokerHands:0,net:0},challengeClaims:{},streak:0,lastResult:'Noch keine LC11-Casinoaktion.'};
      state.externalTravelHistory=[];state.trainingHistory=[];state.interiorVisits={};
      Object.assign(state.stats,{intercityTrips:0,gearServices:0,trainingSessions:0,casinoChallenges:0,interiorScenesOpened:0});
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!this.state.casinoFloor)this.state.casinoFloor={jackpots:{},session:{spins:0,pokerHands:0,net:0},challengeClaims:{},streak:0,lastResult:'Migriert'};
      if(!this.state.casinoFloor.jackpots)this.state.casinoFloor.jackpots={};
      (this.data.casino.slotMachines||[]).forEach((m)=>{if(!Number.isFinite(this.state.casinoFloor.jackpots[m.id]))this.state.casinoFloor.jackpots[m.id]=Math.max(75,m.minBet*18);});
      if(!this.state.casinoFloor.session)this.state.casinoFloor.session={spins:0,pokerHands:0,net:0};
      if(!this.state.casinoFloor.challengeClaims)this.state.casinoFloor.challengeClaims={};
      if(!Array.isArray(this.state.externalTravelHistory))this.state.externalTravelHistory=[];
      if(!Array.isArray(this.state.trainingHistory))this.state.trainingHistory=[];
      if(!this.state.interiorVisits)this.state.interiorVisits={};
      this.state.inventory.forEach((item)=>{if(!Number.isFinite(item.condition))item.condition=100;});
      ['intercityTrips','gearServices','trainingSessions','casinoChallenges','interiorScenesOpened'].forEach((k)=>{if(!Number.isFinite(this.state.stats[k]))this.state.stats[k]=0;});
      this.state.schema=this.data.schema;this.state.version=this.data.version;
    }
    getCasinoFloor(){
      this.ensureStateShape();
      const session=clone(this.state.casinoFloor.session),challenges=(this.data.casinoChallenges||[]).map((c)=>{
        const progress=c.kind==='slots'?session.spins:session.pokerHands;
        return {...clone(c),progress,complete:progress>=c.target,claimed:!!this.state.casinoFloor.challengeClaims[c.id]};
      });
      return{jackpots:clone(this.state.casinoFloor.jackpots),session,streak:this.state.casinoFloor.streak,lastResult:this.state.casinoFloor.lastResult,challenges};
    }
    spinSlot(machineId,bet){
      const before=Number(this.state.resources.money||0),r=super.spinSlot(machineId,bet);if(!r?.ok)return r;
      const pool=this.state.casinoFloor.jackpots[machineId]||75;this.state.casinoFloor.jackpots[machineId]=Math.round((pool+Math.max(1,bet*.14))*100)/100;
      let jackpot=0;if(r.mult>=12&&r.reels[0]===r.reels[1]&&r.reels[1]===r.reels[2]){jackpot=Math.round(this.state.casinoFloor.jackpots[machineId]);this.state.resources.money+=jackpot;this.state.casinoFloor.jackpots[machineId]=Math.max(75,bet*12);}
      const net=Number(this.state.resources.money||0)-before;this.state.casinoFloor.session.spins+=1;this.state.casinoFloor.session.net+=net;
      this.state.casinoFloor.streak=net>0?this.state.casinoFloor.streak+1:0;this.state.casinoFloor.lastResult=`${r.reels.join(' · ')} · ${net>=0?'+':''}${net} €${jackpot?` · Jackpot ${jackpot} €`:''}`;
      return{...r,jackpot,session:clone(this.state.casinoFloor.session)};
    }
    startPoker(bet){const r=super.startPoker(bet);if(r?.ok){this.state.casinoFloor.session.net-=Number(bet)||0;this.state.casinoFloor.lastResult=`Pokerhand mit ${bet} € gestartet.`;}return r;}
    finishPoker(){
      const before=Number(this.state.resources.money||0),r=super.finishPoker();if(!r?.ok)return r;
      const payout=Number(this.state.resources.money||0)-before;this.state.casinoFloor.session.pokerHands+=1;this.state.casinoFloor.session.net+=payout;const net=payout-Number(this.state.casino?.poker?.bet||0);
      this.state.casinoFloor.streak=r.result==='Sieg'?this.state.casinoFloor.streak+1:0;this.state.casinoFloor.lastResult=`Poker ${r.result}: ${r.playerRank} · ${net>=0?'+':''}${net} €`;
      return{...r,session:clone(this.state.casinoFloor.session)};
    }
    claimCasinoChallenge(id){
      const challenge=this.getCasinoFloor().challenges.find((c)=>c.id===id);if(!challenge)return{ok:false,reason:'Casino-Aufgabe unbekannt.'};
      if(!challenge.complete)return{ok:false,reason:'Casino-Aufgabe noch nicht erfüllt.'};if(challenge.claimed)return{ok:false,reason:'Belohnung bereits abgeholt.'};
      this.state.casinoFloor.challengeClaims[id]=true;this.state.resources.money+=challenge.reward;this.state.stats.casinoChallenges+=1;this.log('casino',`Casino-Aufgabe „${challenge.title}“: +${challenge.reward} €.`);return{ok:true,reward:challenge.reward};
    }
    resetCasinoSession(){this.state.casinoFloor.session={spins:0,pokerHands:0,net:0};this.state.casinoFloor.challengeClaims={};this.state.casinoFloor.streak=0;return{ok:true};}
    buyGear(gearId){const r=super.buyGear(gearId);if(r?.ok){const item=this.state.inventory.find((x)=>x.id===r.item.id);if(item)item.condition=100;r.item.condition=100;}return r;}
    getMemberGearBonuses(memberId){
      const member=this.getMember(memberId),out={combat:0,defense:0,analysis:0};if(!member)return out;
      member.equippedGearIds.forEach((id)=>{const item=this.state.inventory.find((i)=>i.id===id),def=item?this.data.gear.find((g)=>g.id===item.gearId):null;if(!def)return;const factor=Math.max(.35,Math.min(1,(item.condition??100)/100));out.combat+=(def.combatBonus||0)*factor;out.defense+=(def.defenseBonus||0)*factor;out.analysis+=(def.analysisBonus||0)*factor;});
      Object.keys(out).forEach((k)=>out[k]=Math.round(out[k]*10)/10);return out;
    }
    serviceGear(itemId){
      if(this.getCurrentLocation().kind!=='market')return{ok:false,reason:'Wartung ist im Eisenladen am Schwarzmarkt verfügbar.'};
      const item=this.state.inventory.find((i)=>i.id===itemId);if(!item)return{ok:false,reason:'Ausrüstung nicht gefunden.'};const missing=100-(item.condition??100);if(missing<=0)return{ok:false,reason:'Ausrüstung ist bereits vollständig gewartet.'};
      const cost=Math.max(15,Math.round(missing*.9));if(this.state.resources.money<cost)return{ok:false,reason:'Zu wenig Geld für die Wartung.'};
      this.state.resources.money-=cost;item.condition=100;this.state.stats.gearServices+=1;this.log('gear',`Ausrüstung gewartet: -${cost} €.`);return{ok:true,cost,condition:100};
    }
    trainMemberProgram(memberId,artId,programId='standard'){
      if(this.getCurrentLocation().kind!=='residential')return{ok:false,reason:'Training ist im Dojo der Ostblöcke verfügbar.'};
      const member=this.getMember(memberId),art=this.data.martialArts.find((a)=>a.id===artId),program=(this.data.trainingPrograms||[]).find((p)=>p.id===programId);if(!member||!art||!program)return{ok:false,reason:'Trainingseinstellung unbekannt.'};
      const cost=Math.round(art.cost*program.costFactor);if(this.state.resources.money<cost)return{ok:false,reason:'Zu wenig Geld für diese Einheit.'};
      this.state.resources.money-=cost;let learned=member.martialArts.find((x)=>x.artId===artId);if(!learned){learned={artId,rank:1,progress:0};member.martialArts.push(learned);}if(!Number.isFinite(learned.progress))learned.progress=0;
      const avgXp=Math.round(Object.values(art.skillXp).reduce((a,b)=>a+b,0)/Math.max(1,Object.keys(art.skillXp).length)*program.xpFactor);learned.progress+=avgXp;while(learned.progress>=100&&learned.rank<5){learned.progress-=100;learned.rank+=1;member.power=clamp(member.power+(art.powerBonus||0),1,20);}
      Object.entries(art.skillXp).forEach(([skill,xp])=>this.awardMemberSkillXp(memberId,skill,Math.round(xp*program.xpFactor),`${art.title} · ${program.title}`));member.stress=clamp((member.stress||0)+program.stress);this.state.stats.trainingSessions+=1;this.state.stats.martialArtsLearned+=1;
      const entry={turn:this.state.turn,memberId,memberName:member.name,artId,artTitle:art.title,programId,programTitle:program.title,rank:learned.rank,progress:learned.progress,cost};this.state.trainingHistory.unshift(entry);this.state.trainingHistory=this.state.trainingHistory.slice(0,30);this.log('training',`${member.name}: ${art.title} · ${program.title}, Rang ${learned.rank} (${learned.progress}%).`);this.advanceTurn();return{ok:true,...clone(entry)};
    }
    getTrainingCenter(){
      const crew=this.state.gang.filter((m)=>m.status!=='left').map((m)=>({id:m.id,name:m.name,stress:m.stress||0,power:m.power,arts:(m.martialArts||[]).map((x)=>({...x,title:this.data.martialArts.find((a)=>a.id===x.artId)?.title||x.artId}))}));
      return{available:this.getCurrentLocation().kind==='residential',crew,programs:clone(this.data.trainingPrograms||[]),arts:clone(this.data.martialArts||[]),history:clone(this.state.trainingHistory.slice(0,8))};
    }
    getProtectionCenter(){
      const items=this.state.inventory.map((item)=>{const def=this.data.gear.find((g)=>g.id===item.gearId);return{...clone(item),title:def?.title||'Ausrüstung',type:def?.type||'unknown',defense:def?.defenseBonus||0,combat:def?.combatBonus||0,analysis:def?.analysisBonus||0,wear:100-(item.condition??100)};});
      return{available:this.getCurrentLocation().kind==='market',catalog:clone(this.data.gear||[]),items};
    }
    degradeProtection(amount=4){this.state.inventory.forEach((item)=>{const def=this.data.gear.find((g)=>g.id===item.gearId);if(def?.type==='protection'&&item.equippedBy)item.condition=clamp((item.condition??100)-amount,0,100);});}
    finishCombat(outcome){this.degradeProtection(outcome==='win'?3:outcome==='retreat'?5:8);return super.finishCombat(outcome);}
    takeIntercityTrip(destinationId){
      if(this.getCurrentLocation().kind!=='station')return{ok:false,reason:'Fernreisen starten am Geisterbahnhof.'};const dest=(this.data.intercityDestinations||[]).find((d)=>d.id===destinationId);if(!dest)return{ok:false,reason:'Fernziel unbekannt.'};
      const discount=Math.min(.45,(this.state.flags.travelDiscount||0)+this.state.boss.skills.driving*.01),cost=Math.max(20,Math.round(dest.cost*(1-discount)));if(this.state.resources.money<cost)return{ok:false,reason:'Zu wenig Geld für das Ticket.'};
      this.state.resources.money-=cost;for(let i=0;i<dest.duration;i++)this.advanceTurn();const reward=dest.reward||{};this.state.resources.money+=reward.money||0;this.state.resources.supplies+=reward.supplies||0;this.state.boss.influence=clamp(this.state.boss.influence+(reward.influence||0));this.state.boss.respect=clamp(this.state.boss.respect+(reward.respect||0));
      if(reward.analysisXp)this.awardBossSkillXp('analysis',reward.analysisXp);if(reward.combatXp)this.awardBossSkillXp('combat',reward.combatXp);if(reward.enduranceXp)this.awardBossSkillXp('endurance',reward.enduranceXp);if(reward.socialXp)this.awardBossSkillXp('social',reward.socialXp);if(reward.drivingXp)this.awardBossSkillXp('driving',reward.drivingXp);if(reward.intel)this.getDistrict('location.station.ghost').intel=clamp(this.getDistrict('location.station.ghost').intel+reward.intel,0,5);
      const entry={turn:this.state.turn,destinationId,title:dest.title,cost,duration:dest.duration,reward:clone(reward)};this.state.externalTravelHistory.unshift(entry);this.state.externalTravelHistory=this.state.externalTravelHistory.slice(0,20);this.state.stats.intercityTrips+=1;this.log('travel',`Fernreise nach ${dest.title}: Ticket ${cost} € · ${dest.duration} Züge.`);this.markDistrictReason('location.station.ghost',`Rückkehr aus ${dest.title}`);return{ok:true,...clone(entry)};
    }
    getIntercityBoard(){return{available:this.getCurrentLocation().kind==='station',destinations:clone(this.data.intercityDestinations||[]),history:clone(this.state.externalTravelHistory.slice(0,6)),discount:Math.round(Math.min(.45,(this.state.flags.travelDiscount||0)+this.state.boss.skills.driving*.01)*100)};}
    registerInteriorVisit(){const loc=this.getCurrentLocation(),key=loc.kind;this.state.interiorVisits[key]=(this.state.interiorVisits[key]||0)+1;this.state.stats.interiorScenesOpened+=1;return{locationId:loc.id,kind:key,visits:this.state.interiorVisits[key],scene:clone(this.data.interiorScenes?.[key]||null)};}
    getLivingCity11Summary(){return{casino:this.getCasinoFloor(),training:this.getTrainingCenter(),protection:this.getProtectionCenter(),station:this.getIntercityBoard(),version:this.data.version,schema:this.data.schema};}
  }
  return Object.freeze({...BASE,GameEngine:LivingCity11Engine,LivingCity11Engine,VERSION:DATA.version,SCHEMA:DATA.schema});
});
