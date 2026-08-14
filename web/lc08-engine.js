(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc07-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc08-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent}=BASE;
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  class LivingCity08Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_08_ENGINE=this;
        ROOT.LIVING_CITY_07_ENGINE=this;
        ROOT.LIVING_CITY_06_ENGINE=this;
        ROOT.LIVING_CITY_05_ENGINE=this;
        ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.decisionJournal=[];
      state.pendingConsequences=[];
      state.storyArcState={};
      state.preferences.storyJournal=true;
      Object.assign(state.stats,{journalEntries:0,storyEchoes:0,storyArcsCompleted:0});
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!Array.isArray(this.state.decisionJournal))this.state.decisionJournal=[];
      if(!Array.isArray(this.state.pendingConsequences))this.state.pendingConsequences=[];
      if(!this.state.storyArcState)this.state.storyArcState={};
      if(!this.state.preferences)this.state.preferences={};
      if(!('storyJournal' in this.state.preferences))this.state.preferences.storyJournal=true;
      ['journalEntries','storyEchoes','storyArcsCompleted'].forEach((k)=>{if(!Number.isFinite(this.state.stats[k]))this.state.stats[k]=0;});
      this.state.schema=this.data.schema;
      this.state.version=this.data.version;
    }
    journal(kind,title,detail,meta={}){
      const entry={id:`j-${this.state.turn}-${this.state.stats.journalEntries+1}`,turn:this.state.turn,kind,title,detail,...clone(meta)};
      this.state.decisionJournal.unshift(entry);
      this.state.decisionJournal=this.state.decisionJournal.slice(0,48);
      this.state.stats.journalEntries+=1;
      return clone(entry);
    }
    getDecisionJournal(limit=12,kind='all'){
      const list=kind==='all'?this.state.decisionJournal:this.state.decisionJournal.filter((x)=>x.kind===kind);
      return clone(list.slice(0,Math.max(1,Math.min(48,limit))));
    }
    scheduleConsequence(flag){
      const def=this.data.consequenceEchoes?.[flag];
      if(!def||this.state.pendingConsequences.some((x)=>x.flag===flag))return null;
      const item={id:`echo-${flag}`,flag,dueTurn:this.state.turn+(def.delay||2),title:def.title,detail:def.detail,effects:clone(def.effects||{})};
      this.state.pendingConsequences.push(item);
      this.state.pendingConsequences.sort((a,b)=>a.dueTurn-b.dueTurn);
      return clone(item);
    }
    setStoryFlag(flag,source='Entscheidung'){
      const first=!!flag&&!this.hasStoryFlag(flag);
      const result=super.setStoryFlag(flag,source);
      if(first&&result){
        this.journal('flag',source,`Neue Linie gespeichert: ${flag}.`,{flag});
        this.scheduleConsequence(flag);
        this.evaluateStoryArcs();
      }
      return result;
    }
    stageMet(stage){
      if(stage.anyOf&&!stage.anyOf.some((f)=>this.hasStoryFlag(f)))return false;
      if(stage.allOf&&!stage.allOf.every((f)=>this.hasStoryFlag(f)))return false;
      if(stage.stat&&Number(this.state.stats?.[stage.stat.key]||0)<Number(stage.stat.min||0))return false;
      return true;
    }
    getStoryArcs(){
      return (this.data.storyArcs||[]).map((arc)=>{
        const stages=arc.stages.map((stage)=>({...clone(stage),done:this.stageMet(stage)}));
        const done=stages.filter((s)=>s.done).length,current=stages.find((s)=>!s.done)||null,state=this.state.storyArcState[arc.id]||{};
        return{...clone(arc),stages,done,total:stages.length,progress:Math.round(done/Math.max(1,stages.length)*100),complete:done===stages.length,currentStage:current,completedTurn:state.completedTurn??null};
      });
    }
    evaluateStoryArcs(){
      for(const arc of this.getStoryArcs()){
        const state=this.state.storyArcState[arc.id]||(this.state.storyArcState[arc.id]={lastDone:0,completedTurn:null,rewarded:false});
        if(arc.done>state.lastDone){
          const newest=arc.stages.filter((s)=>s.done).slice(-1)[0];
          this.journal('arc',arc.title,newest?`Etappe abgeschlossen: ${newest.title}.`:`Fortschritt ${arc.done}/${arc.total}.`,{arcId:arc.id,progress:arc.progress});
          state.lastDone=arc.done;
        }
        if(arc.complete&&!state.rewarded){
          state.rewarded=true;state.completedTurn=this.state.turn;this.state.stats.storyArcsCompleted+=1;
          this.applyLivingCity06Effects(arc.reward||{});
          this.recordStoryConsequence('arc',arc.title,'Der Entwicklungsbogen ist vollständig und wirkt als Gesamtbonus weiter.',null);
          this.journal('arc',arc.title,'Entwicklungsbogen vollständig abgeschlossen.',{arcId:arc.id,complete:true});
        }
      }
    }
    resolvePendingConsequences(){
      const due=this.state.pendingConsequences.filter((x)=>x.dueTurn<=this.state.turn),future=this.state.pendingConsequences.filter((x)=>x.dueTurn>this.state.turn);
      this.state.pendingConsequences=future;
      for(const item of due){
        this.applyLivingCity06Effects(item.effects||{});
        this.recordStoryConsequence('echo',item.title,item.detail,item.flag);
        this.journal('echo',item.title,item.detail,{flag:item.flag});
        this.state.stats.storyEchoes+=1;
        this.log('story',`${item.title}: ${item.detail}`);
      }
      return clone(due);
    }
    chooseDialogue(dialogueId,optionId){
      const def=this.data.dialogues?.[dialogueId],session=this.state.dialogues?.[dialogueId],node=session?def?.nodes?.[session.nodeId]:null,option=node?.options?.find((x)=>x.id===optionId),label=option?.label||optionId;
      const result=super.chooseDialogue(dialogueId,optionId);
      if(result?.ok){
        this.journal('dialogue',def?.speaker||'Gespräch',label,{dialogueId,optionId,done:!!result.done});
        this.evaluateStoryArcs();
      }
      return result;
    }
    performInteriorAction(locationId,actionId){
      const result=super.performInteriorAction(locationId,actionId);
      if(result?.ok){
        this.journal('interior',result.action.title,`Innenraumaktion in ${this.getLocation(locationId).title}.`,{locationId,actionId});
        this.evaluateStoryArcs();
      }
      return result;
    }
    travelTo(destinationId,mode='street'){
      const from=this.state.currentLocationId,result=super.travelTo(destinationId,mode);
      if(result?.ok){
        this.journal('travel',result.destination.title,`${this.getLocation(from).title} → ${result.destination.title} · ${mode==='train'?'Bahn':'Straße'}.`,{from,to:destinationId,mode});
        this.evaluateStoryArcs();
      }
      return result;
    }
    finishCombat(outcome){
      const result=super.finishCombat(outcome);
      if(result?.ok&&result.result){
        const r=result.result,label=outcome==='win'?'Sieg':outcome==='loss'?'Niederlage':'Rückzug';
        this.journal('combat',`${label} · ${r.locationTitle}`,`${r.rounds} Runde(n) · Crew: ${r.crew.join(', ')||'keine'}.`,{outcome,locationId:r.locationId,reward:r.reward});
      }
      return result;
    }
    advanceTurn(joinBoost=0){
      super.advanceTurn(joinBoost);
      this.resolvePendingConsequences();
      this.evaluateStoryArcs();
    }
    getStorySummary(){
      const base=super.getStorySummary();
      return{...base,arcs:this.getStoryArcs(),pending:clone(this.state.pendingConsequences),journalCount:this.state.decisionJournal.length,echoes:this.state.stats.storyEchoes};
    }
    getGuidance(){
      const base=super.getGuidance(),arcs=this.getStoryArcs(),active=arcs.find((a)=>!a.complete&&a.currentStage),pending=[...this.state.pendingConsequences].sort((a,b)=>a.dueTurn-b.dueTurn)[0];
      const extra=[];
      if(active)extra.push({kind:'story',icon:active.icon||'◇',title:active.currentStage.title,detail:`${active.title}: ${active.currentStage.hint}`,action:'Journal öffnen'});
      if(pending&&pending.dueTurn-this.state.turn<=1)extra.push({kind:'story',icon:'↺',title:'Eine frühere Entscheidung wirkt nach',detail:`${pending.title} im nächsten Zug.`,action:'Journal öffnen'});
      const generic=base.priority?.title==='Aktuellen Ort nutzen'||base.priority?.title==='Ortsgespräch prüfen';
      const priority=generic&&extra.length?extra[0]:base.priority;
      return{...base,priority,steps:[priority,...base.steps.filter((x)=>x.title!==priority.title),...extra.filter((x)=>x.title!==priority.title)].slice(0,3),storyArc:active||null,pendingEcho:pending||null};
    }
  }
  return{...BASE,GameEngine:LivingCity08Engine,LivingCity08Engine};
});
