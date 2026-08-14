(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc09-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc10-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent}=BASE;
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
  const round=(v)=>Math.round(Number(v)||0);
  class LivingCity10Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_10_ENGINE=this;ROOT.LIVING_CITY_09_ENGINE=this;ROOT.LIVING_CITY_08_ENGINE=this;
        ROOT.LIVING_CITY_07_ENGINE=this;ROOT.LIVING_CITY_06_ENGINE=this;ROOT.LIVING_CITY_05_ENGINE=this;ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.districtDynamics={};state.districtTrendHistory=[];state.crewInitiatives=[];state.crewInitiativeHistory=[];
      Object.assign(state.stats,{districtTrendTicks:0,crewInitiativesCreated:0,crewInitiativesResolved:0});
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!this.state.districtDynamics)this.state.districtDynamics={};
      if(!Array.isArray(this.state.districtTrendHistory))this.state.districtTrendHistory=[];
      if(!Array.isArray(this.state.crewInitiatives))this.state.crewInitiatives=[];
      if(!Array.isArray(this.state.crewInitiativeHistory))this.state.crewInitiativeHistory=[];
      ['districtTrendTicks','crewInitiativesCreated','crewInitiativesResolved'].forEach((k)=>{if(!Number.isFinite(this.state.stats[k]))this.state.stats[k]=0;});
      this.data.world.locations.forEach((loc)=>{if(!this.state.districtDynamics[loc.id])this.state.districtDynamics[loc.id]=this.deriveDistrictDynamics(loc.id,null);});
      this.state.schema=this.data.schema;this.state.version=this.data.version;
    }
    deriveDistrictDynamics(locationId,previous=null){
      const loc=this.getLocation(locationId),d=this.getDistrict(locationId);
      const rawPressure=clamp(round(d.rival*.42+d.police*.34+d.unrest*.24));
      const rawStability=clamp(round(72-d.unrest*.42-d.rival*.16+d.control*.28));
      const rawOpportunity=clamp(round(24+loc.income*.48+d.control*.26-d.police*.08-d.unrest*.08));
      if(!previous)return{locationId,pressure:rawPressure,stability:rawStability,opportunity:rawOpportunity,momentum:0,lastTurn:Number(this.state.turn||0),lastReason:'Ausgangslage'};
      const pressure=clamp(round(previous.pressure*.68+rawPressure*.32));
      const stability=clamp(round(previous.stability*.68+rawStability*.32));
      const opportunity=clamp(round(previous.opportunity*.68+rawOpportunity*.32));
      const momentum=clamp(round((opportunity-previous.opportunity)-(pressure-previous.pressure)+(stability-previous.stability)*.45),-15,15);
      return{locationId,pressure,stability,opportunity,momentum,lastTurn:Number(this.state.turn||0),lastReason:previous.lastReason||'Stadtentwicklung'};
    }
    updateDistrictDynamics(reason='Zugentwicklung'){
      const changed=[];
      this.data.world.locations.forEach((loc)=>{
        const prev=this.state.districtDynamics[loc.id]||null,next=this.deriveDistrictDynamics(loc.id,prev);
        next.lastReason=reason;this.state.districtDynamics[loc.id]=next;
        if(prev&&(Math.abs(next.momentum)>=2||Math.abs(next.pressure-prev.pressure)>=3))changed.push({locationId:loc.id,pressure:next.pressure,stability:next.stability,opportunity:next.opportunity,momentum:next.momentum});
      });
      this.state.stats.districtTrendTicks+=1;
      if(changed.length){this.state.districtTrendHistory.unshift({turn:this.state.turn,reason,changes:changed.slice(0,6)});this.state.districtTrendHistory=this.state.districtTrendHistory.slice(0,16);}
      return clone(changed);
    }
    markDistrictReason(locationId,reason){const item=this.state.districtDynamics[locationId];if(item)item.lastReason=reason;}
    getDistrictDynamics(locationId=this.state.selectedLocationId){this.ensureStateShape();return clone(this.state.districtDynamics[locationId]);}
    districtBand(pressure){return (this.data.districtBands||[]).find((x)=>pressure<=x.max)||{id:'kritisch',label:'Kritisch'};}
    getCityTrends(){
      this.ensureStateShape();
      const districts=this.data.world.locations.map((loc)=>{const x=this.state.districtDynamics[loc.id];return{...clone(x),title:loc.title,short:loc.short,band:this.districtBand(x.pressure),owner:this.ownerLabel(this.getDistrict(loc.id).owner)};});
      const improving=[...districts].sort((a,b)=>b.momentum-a.momentum)[0],pressure=[...districts].sort((a,b)=>b.pressure-a.pressure)[0];
      return{turn:this.state.turn,districts,improving,pressure,history:clone(this.state.districtTrendHistory.slice(0,6))};
    }
    initiativeType(member){
      const skills=member?.skills||{},entries=[['social','Zusammenhalt stärken'],['analysis','Lagebild ordnen'],['business','Chance entwickeln'],['combat','Crew-Routine festigen']];
      entries.sort((a,b)=>(skills[b[0]]||0)-(skills[a[0]]||0));return{skill:entries[0][0],title:entries[0][1]};
    }
    maybeCreateCrewInitiative(){
      if(this.state.turn<4||this.state.turn%4!==0||this.state.crewInitiatives.length>=3||!this.state.gang.length)return null;
      const member=this.state.gang[(Math.floor(this.state.turn/4)-1)%this.state.gang.length];if(!member||member.status==='left')return null;
      const existing=this.state.crewInitiatives.some((x)=>x.memberId===member.id&&!x.resolved);if(existing)return null;
      const locationId=member.assignment?.targetId&&this.state.districts[member.assignment.targetId]?member.assignment.targetId:this.state.currentLocationId;
      const type=this.initiativeType(member),dyn=this.getDistrictDynamics(locationId);
      const item={id:`initiative-${this.state.turn}-${member.id}`,createdTurn:this.state.turn,memberId:member.id,memberName:member.name,locationId,locationTitle:this.getLocation(locationId).title,skill:type.skill,title:type.title,detail:`${member.name} reagiert auf die Lage in ${this.getLocation(locationId).title}. Druck ${dyn.pressure}/100, Stabilität ${dyn.stability}/100.`,choices:clone(this.data.initiativeChoices||[]),resolved:false};
      this.state.crewInitiatives.push(item);this.state.stats.crewInitiativesCreated+=1;
      if(typeof this.journal==='function')this.journal('initiative',type.title,item.detail,{initiativeId:item.id,locationId,memberId:member.id});
      return clone(item);
    }
    getCrewInitiatives(){return clone(this.state.crewInitiatives.filter((x)=>!x.resolved));}
    resolveCrewInitiative(id,choiceId){
      const item=this.state.crewInitiatives.find((x)=>x.id===id&&!x.resolved);if(!item)return{ok:false,reason:'Initiative nicht mehr offen.'};
      const choice=(this.data.initiativeChoices||[]).find((x)=>x.id===choiceId);if(!choice)return{ok:false,reason:'Entscheidung unbekannt.'};
      const member=this.getMember(item.memberId),d=this.getDistrict(item.locationId),dyn=this.state.districtDynamics[item.locationId];
      if(choiceId==='support'){if(member){member.morale=clamp((member.morale||50)+3);member.loyalty=clamp(member.loyalty+1);}d.control=clamp(d.control+2);d.unrest=clamp(d.unrest-2);}
      else if(choiceId==='observe'){d.intel=clamp(d.intel+1,0,5);if(member)member.stress=clamp((member.stress||0)-2);}
      else{d.unrest=clamp(d.unrest-3);d.police=clamp(d.police-1);if(member)member.stress=clamp((member.stress||0)-1);}
      item.resolved=true;item.choiceId=choiceId;item.resolvedTurn=this.state.turn;this.state.crewInitiativeHistory.unshift(clone(item));this.state.crewInitiativeHistory=this.state.crewInitiativeHistory.slice(0,24);this.state.stats.crewInitiativesResolved+=1;
      if(dyn)dyn.lastReason=`Crew-Initiative: ${choice.title}`;
      if(typeof this.journal==='function')this.journal('initiative',`${item.memberName}: ${choice.title}`,`${item.locationTitle} · ${choice.description}`,{initiativeId:item.id,choiceId,locationId:item.locationId,memberId:item.memberId});
      this.updateDistrictDynamics(`Crew-Initiative: ${choice.title}`);
      return{ok:true,initiative:clone(item),choice:clone(choice),dynamics:this.getDistrictDynamics(item.locationId)};
    }
    getCityPulse(){
      const base=super.getCityPulse(),crew=Array.isArray(this.state.gang)?this.state.gang:[],active=crew.filter((x)=>x&&x.status!=='left');
      const avgStress=active.length?round(active.reduce((s,x)=>s+Number(x.stress||0),0)/active.length):0,avgMorale=active.length?round(active.reduce((s,x)=>s+Number(x.morale||0),0)/active.length):0;
      const trends=this.getCityTrends(),signals=[...base.signals];if(this.getCrewInitiatives().length)signals.unshift(`${this.getCrewInitiatives().length} Crew-Initiative${this.getCrewInitiatives().length===1?'':'n'} offen`);if(trends.pressure?.pressure>=70)signals.unshift(`${trends.pressure.title}: hoher Bezirksdruck`);
      return{...base,avgStress,avgMorale,signals:signals.slice(0,5),trendPressure:trends.pressure?.pressure||0,trendMomentum:trends.improving?.momentum||0};
    }
    travelTo(destinationId,mode='street'){const r=super.travelTo(destinationId,mode);if(r?.ok){this.markDistrictReason(destinationId,'Ankunft und neue Aktivität');this.updateDistrictDynamics('Reisebewegung');}return r;}
    performInteriorAction(locationId,actionId){const r=super.performInteriorAction(locationId,actionId);if(r?.ok){this.markDistrictReason(locationId,`Innenraum: ${r.action?.title||actionId}`);this.updateDistrictDynamics('Lokale Entscheidung');}return r;}
    finishCombat(outcome){const locationId=this.state.combatSession?.locationId,r=super.finishCombat(outcome);if(r?.ok&&locationId){this.markDistrictReason(locationId,`Konfliktfolge: ${outcome}`);this.updateDistrictDynamics('Konfliktfolge');}return r;}
    advanceTurn(joinBoost=0){super.advanceTurn(joinBoost);this.updateDistrictDynamics('Zugentwicklung');this.maybeCreateCrewInitiative();}
    getGuidance(){
      const base=super.getGuidance(),open=this.getCrewInitiatives()[0];if(!open)return base;
      const extra={kind:'crew',icon:'◎',title:`${open.memberName}: ${open.title}`,detail:`${open.locationTitle}: Crew-Initiative wartet auf deine Entscheidung.`,action:'Stadtlage öffnen'};
      const steps=[base.priority,...(base.steps||[]).filter((x)=>x.title!==base.priority?.title),extra].slice(0,3);
      return{...base,steps,crewInitiative:open};
    }
  }
  return Object.freeze({...BASE,GameEngine:LivingCity10Engine,LivingCity10Engine,VERSION:DATA.version,SCHEMA:DATA.schema});
});
