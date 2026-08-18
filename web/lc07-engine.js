(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc06-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc07-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent}=BASE;
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  const clamp01=(v)=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
  class LivingCity07Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_07_ENGINE=this;
        ROOT.LIVING_CITY_06_ENGINE=this;
        ROOT.LIVING_CITY_05_ENGINE=this;
        ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.storyFlags={};
      state.storyConsequences=[];
      state.preferences.audioMixer.effects=.32;
      state.preferences.audioMixer.ducking=true;
      Object.assign(state.stats,{storyFlags:0,storyConsequences:0});
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!this.state.storyFlags)this.state.storyFlags={};
      if(!Array.isArray(this.state.storyConsequences))this.state.storyConsequences=[];
      if(!this.state.preferences)this.state.preferences={};
      if(!this.state.preferences.audioMixer)this.state.preferences.audioMixer={enabled:false,master:.55,music:.28,ambient:.4,preset:'city'};
      const mix=this.state.preferences.audioMixer;
      if(!Number.isFinite(Number(mix.effects)))mix.effects=.32;
      mix.effects=clamp01(mix.effects);
      if(!('ducking' in mix))mix.ducking=true;
      mix.ducking=!!mix.ducking;
      ['storyFlags','storyConsequences'].forEach((k)=>{if(!Number.isFinite(this.state.stats[k]))this.state.stats[k]=0;});
      this.state.schema=this.data.schema;
      this.state.version=this.data.version;
    }
    hasStoryFlag(flag){return !!(flag&&this.state.storyFlags?.[flag]);}
    setStoryFlag(flag,source='Entscheidung'){
      if(!flag)return false;
      if(!this.state.storyFlags[flag])this.state.stats.storyFlags+=1;
      this.state.storyFlags[flag]={turn:this.state.turn,source};
      return true;
    }
    recordStoryConsequence(kind,title,detail,flag=null){
      const entry={turn:this.state.turn,kind,title,detail,flag};
      this.state.storyConsequences.unshift(entry);
      this.state.storyConsequences=this.state.storyConsequences.slice(0,24);
      this.state.stats.storyConsequences+=1;
      return clone(entry);
    }
    applyLivingCity06Effects(effects={}){
      super.applyLivingCity06Effects(effects);
      if(Number.isFinite(effects.respect))this.state.boss.respect=Math.max(0,Math.min(100,this.state.boss.respect+effects.respect));
      if(Number.isFinite(effects.influence))this.state.boss.influence=Math.max(0,Math.min(100,this.state.boss.influence+effects.influence));
      if(Number.isFinite(effects.heat))this.state.boss.heat=Math.max(0,Math.min(100,this.state.boss.heat+effects.heat));
      if(effects.flag)this.setStoryFlag(effects.flag,'Ort');
      if(Array.isArray(effects.flags))effects.flags.forEach((f)=>this.setStoryFlag(f,'Ort'));
    }
    optionAllowed(option){
      if(option.requiresFlag&&!this.hasStoryFlag(option.requiresFlag))return false;
      if(option.forbidsFlag&&this.hasStoryFlag(option.forbidsFlag))return false;
      return true;
    }
    getDialogueForLocation(locationId=this.state.currentLocationId){
      const dialogueId=this.data.locationDialogues?.[locationId];if(!dialogueId)return null;
      const def=this.data.dialogues?.[dialogueId];if(!def)return null;
      const session=this.state.dialogues[dialogueId]||null;
      const nodeId=session?.status==='active'?session.nodeId:def.start;
      const node=clone(def.nodes[nodeId]);
      if(node?.options)node.options=node.options.filter((o)=>this.optionAllowed(o));
      return{dialogueId,speaker:def.speaker,locationId,nodeId,node,status:session?.status||'new',history:clone(session?.history||[]),completedTurn:session?.completedTurn??null,ending:session?.ending||null};
    }
    chooseDialogue(dialogueId,optionId){
      const def=this.data.dialogues?.[dialogueId],session=this.state.dialogues[dialogueId];
      if(!def||!session||session.status!=='active')return{ok:false,reason:'Kein aktiver Dialog.'};
      const node=def.nodes[session.nodeId],option=node?.options?.find((x)=>x.id===optionId);
      if(!option)return{ok:false,reason:'Dialogoption unbekannt.'};
      if(!this.optionAllowed(option))return{ok:false,reason:'Diese Gesprächsoption ist durch frühere Entscheidungen nicht freigeschaltet.'};
      this.applyLivingCity06Effects(option.effects||{});
      if(option.setFlag)this.setStoryFlag(option.setFlag,def.speaker);
      if(Array.isArray(option.setFlags))option.setFlags.forEach((f)=>this.setStoryFlag(f,def.speaker));
      session.history.push({turn:this.state.turn,nodeId:session.nodeId,optionId,label:option.label,flag:option.setFlag||null});
      this.state.stats.dialogueChoices+=1;
      if(option.next){session.nodeId=option.next;this.log('dialog',`${def.speaker}: Gespräch fortgesetzt.`);return{ok:true,done:false,dialogue:this.getDialogueForLocation(def.locationId)};}
      session.status='completed';session.completedTurn=this.state.turn;session.ending=option.end||'Gespräch beendet.';this.state.stats.dialoguesCompleted+=1;
      const consequence=this.recordStoryConsequence('dialogue',def.speaker,session.ending,option.setFlag||null);
      this.log('dialog',`${def.speaker}: ${session.ending}`);
      return{ok:true,done:true,ending:session.ending,consequence,dialogue:this.getDialogueForLocation(def.locationId)};
    }
    performInteriorAction(locationId,actionId){
      const result=super.performInteriorAction(locationId,actionId);
      if(result?.ok&&result.action?.effects?.flag){
        this.recordStoryConsequence('interior',result.action.title,`Ortserfahrung in ${this.getLocation(locationId).title}.`,result.action.effects.flag);
      }
      return result;
    }
    setAudioMixer(patch={}){
      const result=super.setAudioMixer(patch),mix=this.state.preferences.audioMixer;
      if('effects' in patch)mix.effects=clamp01(patch.effects);
      if('ducking' in patch)mix.ducking=!!patch.ducking;
      return{ok:true,mixer:clone(mix)};
    }
    getStorySummary(){
      const flags=Object.entries(this.state.storyFlags).map(([id,meta])=>({id,...clone(meta)})).sort((a,b)=>b.turn-a.turn);
      return{flags,consequences:clone(this.state.storyConsequences),count:flags.length};
    }
    getGuidance(){
      const base=super.getGuidance(),s=this.state;
      if(!s.combatSession&&s.casino?.poker?.status!=='playing'&&s.selectedLocationId===s.currentLocationId){
        const dialogue=this.getDialogueForLocation(s.currentLocationId);
        const canStart=dialogue&&(dialogue.status==='new'||(dialogue.status==='completed'&&s.turn-(dialogue.completedTurn||0)>=5));
        if(canStart){
          const step={kind:'interior',icon:'◫',title:'Ortsgespräch prüfen',detail:`${dialogue.speaker} hat eine Gesprächslinie.`,action:'Innenansicht'};
          if(!s.missions.active.length&&!s.missions.offers.length)return{...base,priority:step,steps:[step,...base.steps].slice(0,3)};
          if(!base.steps.some((x)=>x.title===step.title))base.steps.push(step);
        }
      }
      return base;
    }
  }
  return{...BASE,GameEngine:LivingCity07Engine,LivingCity07Engine};
});
