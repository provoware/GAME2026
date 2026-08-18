(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc05-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc06-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent,clamp}=BASE;
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  const clamp01=(v)=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
  class LivingCity06Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_06_ENGINE=this;
        ROOT.LIVING_CITY_05_ENGINE=this;
        ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.interiorActionTurns={};
      state.dialogues={};
      state.preferences.audioMixer={enabled:false,master:.55,music:.28,ambient:.4,preset:'city'};
      state.preferences.guidance=true;
      Object.assign(state.stats,{interiorActions:0,dialogueChoices:0,dialoguesCompleted:0});
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!this.state.interiorActionTurns)this.state.interiorActionTurns={};
      if(!this.state.dialogues)this.state.dialogues={};
      if(!this.state.preferences)this.state.preferences={};
      if(!this.state.preferences.audioMixer)this.state.preferences.audioMixer={enabled:false,master:.55,music:.28,ambient:.4,preset:'city'};
      if(!('guidance' in this.state.preferences))this.state.preferences.guidance=true;
      const mix=this.state.preferences.audioMixer;
      mix.enabled=!!mix.enabled;
      mix.master=clamp01(mix.master);
      mix.music=clamp01(mix.music);
      mix.ambient=clamp01(mix.ambient);
      if(!this.data.audioPresets?.[mix.preset])mix.preset='city';
      ['interiorActions','dialogueChoices','dialoguesCompleted'].forEach((k)=>{if(!Number.isFinite(this.state.stats[k]))this.state.stats[k]=0;});
      this.state.schema=this.data.schema;
      this.state.version=this.data.version;
    }
    applyLivingCity06Effects(effects={}){
      const d=this.getDistrict(this.state.currentLocationId);
      if(Number.isFinite(effects.money))this.state.resources.money=Math.max(0,this.state.resources.money+effects.money);
      if(Number.isFinite(effects.supplies))this.state.resources.supplies=Math.max(0,this.state.resources.supplies+effects.supplies);
      if(Number.isFinite(effects.tension))this.state.directorModifiers.tension=clamp((this.state.directorModifiers.tension||0)+effects.tension,-30,30);
      if(Number.isFinite(effects.opportunity))this.state.directorModifiers.opportunity=clamp((this.state.directorModifiers.opportunity||0)+effects.opportunity,-30,30);
      if(Number.isFinite(effects.districtControl))d.control=clamp(d.control+effects.districtControl,0,100);
      if(Number.isFinite(effects.districtPolice))d.police=clamp(d.police+effects.districtPolice,0,100);
      if(Number.isFinite(effects.districtRival))d.rival=clamp(d.rival+effects.districtRival,0,100);
      if(Number.isFinite(effects.crewStress))this.state.gang.forEach((m)=>{m.stress=clamp(m.stress+effects.crewStress,0,100);});
      if(Number.isFinite(effects.crewMorale))this.state.gang.forEach((m)=>{m.morale=clamp(m.morale+effects.crewMorale,0,100);});
      if(Number.isFinite(effects.relation)&&this.state.gang.length>1){for(let i=0;i<this.state.gang.length-1;i+=1)this.adjustCrewRelation(this.state.gang[i].id,this.state.gang[i+1].id,effects.relation,'Gemeinsame Ortserfahrung');}
      if(Array.isArray(effects.bossSkill))this.awardBossSkillXp(effects.bossSkill[0],effects.bossSkill[1]||4);
      if(Array.isArray(effects.crewSkill))this.state.gang.slice(0,2).forEach((m)=>this.awardMemberSkillXp(m.id,effects.crewSkill[0],effects.crewSkill[1]||5,'Ortstraining'));
      this.updateDirector();
    }
    getInteriorActions(locationId=this.state.currentLocationId){
      const defs=this.data.interiorActions?.[locationId]||this.data.fallbackInteriorActions||[];
      const here=locationId===this.state.currentLocationId;
      return defs.map((def)=>{
        const key=`${locationId}|${def.id}`,last=this.state.interiorActionTurns[key];
        const remaining=Number.isFinite(last)?Math.max(0,(def.cooldown||0)-(this.state.turn-last)):0;
        let reason='';
        if(!here)reason='Du musst zuerst zu diesem Ort reisen.';
        else if(this.state.combatSession)reason='Während eines laufenden Kampfes nicht verfügbar.';
        else if(this.state.casino?.poker?.status==='playing')reason='Das offene Pokerblatt zuerst abschließen.';
        else if(remaining>0)reason=`Wieder verfügbar in ${remaining} Zug/Zügen.`;
        else if((def.cost||0)>this.state.resources.money)reason='Zu wenig Bargeld.';
        return{...clone(def),available:!reason,reason,remaining};
      });
    }
    captureInteriorActionMetrics(locationId=this.state.currentLocationId){
      const district=this.getDistrict(locationId),crew=this.state.gang.filter((m)=>m.status!=='left');
      const average=(key)=>crew.length?Math.round(crew.reduce((sum,m)=>sum+Number(m[key]||0),0)/crew.length):0;
      return{
        money:Number(this.state.resources.money||0),supplies:Number(this.state.resources.supplies||0),
        tension:Number(this.state.directorModifiers?.tension||0),opportunity:Number(this.state.directorModifiers?.opportunity||0),
        districtControl:Number(district?.control||0),districtPolice:Number(district?.police||0),districtRival:Number(district?.rival||0),
        crewStress:average('stress'),crewMorale:average('morale')
      };
    }
    performInteriorAction(locationId,actionId){
      const action=this.getInteriorActions(locationId).find((x)=>x.id===actionId);
      if(!action)return{ok:false,reason:'Innenraumaktion unbekannt.'};
      if(!action.available)return{ok:false,reason:action.reason};
      const before=this.captureInteriorActionMetrics(locationId);
      if(action.cost)this.state.resources.money-=action.cost;
      this.applyLivingCity06Effects(action.effects);
      const after=this.captureInteriorActionMetrics(locationId),keys=[];
      const effectKeys={money:'money',supplies:'supplies',tension:'tension',opportunity:'opportunity',districtControl:'districtControl',districtPolice:'districtPolice',districtRival:'districtRival',crewStress:'crewStress',crewMorale:'crewMorale'};
      if(action.cost||Number.isFinite(action.effects?.money))keys.push('money');
      Object.keys(action.effects||{}).forEach((key)=>{const metric=effectKeys[key];if(metric&&!keys.includes(metric))keys.push(metric);});
      const receipt={before,after,keys:keys.filter((key)=>before[key]!==after[key])};
      this.lastInteriorActionReceipt=receipt;
      this.state.interiorActionTurns[`${locationId}|${action.id}`]=this.state.turn;
      this.state.stats.interiorActions+=1;
      this.log('scene',`${this.getLocation(locationId).title}: ${action.title}.`);
      if(action.consumeTurn!==false)this.advanceTurn();
      return{ok:true,action:clone(action),turn:this.state.turn,receipt};
    }
    getLastInteriorActionReceipt(){return this.lastInteriorActionReceipt?clone(this.lastInteriorActionReceipt):null;}
    getDialogueForLocation(locationId=this.state.currentLocationId){
      const dialogueId=this.data.locationDialogues?.[locationId];
      if(!dialogueId)return null;
      const def=this.data.dialogues?.[dialogueId];if(!def)return null;
      const session=this.state.dialogues[dialogueId]||null;
      const nodeId=session?.status==='active'?session.nodeId:def.start;
      return{dialogueId,speaker:def.speaker,locationId,nodeId,node:clone(def.nodes[nodeId]),status:session?.status||'new',history:clone(session?.history||[]),completedTurn:session?.completedTurn??null};
    }
    startDialogue(dialogueId){
      const def=this.data.dialogues?.[dialogueId];if(!def)return{ok:false,reason:'Dialog nicht gefunden.'};
      if(def.locationId!==this.state.currentLocationId)return{ok:false,reason:'Dieser Dialog ist nur am zugehörigen Ort verfügbar.'};
      const old=this.state.dialogues[dialogueId];
      if(old?.status==='active')return{ok:true,dialogue:this.getDialogueForLocation(def.locationId)};
      if(old?.status==='completed'&&this.state.turn-(old.completedTurn||0)<5)return{ok:false,reason:`Dieses Gespräch kann in ${5-(this.state.turn-(old.completedTurn||0))} Zug/Zügen erneut geführt werden.`};
      this.state.dialogues[dialogueId]={status:'active',nodeId:def.start,history:[],startedTurn:this.state.turn};
      return{ok:true,dialogue:this.getDialogueForLocation(def.locationId)};
    }
    chooseDialogue(dialogueId,optionId){
      const def=this.data.dialogues?.[dialogueId],session=this.state.dialogues[dialogueId];
      if(!def||!session||session.status!=='active')return{ok:false,reason:'Kein aktiver Dialog.'};
      const node=def.nodes[session.nodeId],option=node?.options?.find((x)=>x.id===optionId);
      if(!option)return{ok:false,reason:'Dialogoption unbekannt.'};
      this.applyLivingCity06Effects(option.effects||{});
      session.history.push({turn:this.state.turn,nodeId:session.nodeId,optionId,label:option.label});
      this.state.stats.dialogueChoices+=1;
      if(option.next){session.nodeId=option.next;this.log('dialog',`${def.speaker}: Gespräch fortgesetzt.`);return{ok:true,done:false,dialogue:this.getDialogueForLocation(def.locationId)};}
      session.status='completed';session.completedTurn=this.state.turn;session.ending=option.end||'Gespräch beendet.';this.state.stats.dialoguesCompleted+=1;
      this.log('dialog',`${def.speaker}: ${session.ending}`);
      return{ok:true,done:true,ending:session.ending,dialogue:this.getDialogueForLocation(def.locationId)};
    }
    setAudioMixer(patch={}){
      const mix=this.state.preferences.audioMixer;
      if('enabled' in patch)mix.enabled=!!patch.enabled;
      ['master','music','ambient'].forEach((k)=>{if(k in patch)mix[k]=clamp01(patch[k]);});
      if(patch.preset&&this.data.audioPresets?.[patch.preset])mix.preset=patch.preset;
      return{ok:true,mixer:clone(mix)};
    }
    getAudioMixer(){return clone(this.state.preferences.audioMixer);}
    getGuidance(){
      const s=this.state,steps=[];let priority;
      if(s.combatSession)priority={kind:'combat',icon:'⚔',title:'Kampfentscheidung treffen',detail:`Runde ${s.combatSession.round}/${s.combatSession.maxRounds} abschließen.`,action:'Kampf öffnen'};
      else if(s.casino?.poker?.status==='playing')priority={kind:'casino',icon:'♠',title:'Pokerblatt abschließen',detail:'Das offene Blatt blockiert den normalen Zugabschluss.',action:'Casino öffnen'};
      else{
        const pending=s.missions.active.find((m)=>m.briefingPending&&!s.missionBriefings[m.id]);
        if(pending)priority={kind:'director',icon:'◇',title:'Missionsbriefing entscheiden',detail:pending.title,action:'Direktor öffnen'};
        else if(s.selectedLocationId!==s.currentLocationId){
          const direct=this.getTravelOptions().find((x)=>x.to===s.selectedLocationId);
          priority={kind:'map',icon:'⇢',title:direct?'Zum gewählten Ort reisen':'Route zum gewählten Ort prüfen',detail:this.getLocation(s.selectedLocationId).title,action:direct?'Reisen':'Karte nutzen'};
        }else if(s.missions.active.length)priority={kind:'director',icon:'◆',title:'Aktiven Auftrag voranbringen',detail:s.missions.active[0].title,action:'Ziele prüfen'};
        else if(s.missions.offers.length)priority={kind:'director',icon:'+',title:'Neue Gelegenheit auswählen',detail:`${s.missions.offers.length} Angebote verfügbar.`,action:'Direktor öffnen'};
        else priority={kind:'interior',icon:'◫',title:'Aktuellen Ort nutzen',detail:'Innenraum öffnen und lokale Möglichkeiten prüfen.',action:'Innenansicht'};
      }
      steps.push(priority);
      const avgStress=Math.round(s.gang.reduce((n,m)=>n+(m.stress||0),0)/Math.max(1,s.gang.length));
      if(avgStress>=60)steps.push({kind:'crew',icon:'○',title:'Crew entlasten',detail:`Durchschnittlicher Stress ${avgStress}/100.`,action:'Crew / Innenraum'});
      if(s.resources.money<150)steps.push({kind:'economy',icon:'€',title:'Finanzen beobachten',detail:'Bargeld ist knapp. Kosten vor Aktionen prüfen.',action:'Bank / Besitz'});
      return{priority,steps:steps.slice(0,3),avgStress};
    }
    getCombatDecisionGuide(){
      const c=this.state.combatSession;if(!c)return null;
      const attackGood=c.advantage>=2&&c.playerMorale>=32;
      const retreatGood=c.playerMorale<=22||c.enemyMorale-c.playerMorale>=35;
      const recommended=retreatGood?'retreat':attackGood?'attack':'cover';
      return{recommended,round:c.round,options:[
        {id:'attack',label:'Angriff',tone:attackGood?'good':'normal',note:attackGood?'Vorteil und Moral sprechen für Druck.':'Kann Wirkung bringen, kostet aber Sicherheit.'},
        {id:'cover',label:'Deckung',tone:recommended==='cover'?'good':'normal',note:'Stabilisiert die Runde und baut Schutz auf.'},
        {id:'retreat',label:'Rückzug',tone:retreatGood?'good':'normal',note:retreatGood?'Moral-/Lagewert spricht für Abbruch.':'Beendet den Kampf ohne weiteren Druck.'}
      ]};
    }
  }
  return{...BASE,GameEngine:LivingCity06Engine,LivingCity06Engine};
});
