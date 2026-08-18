(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc08-engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./lc09-data.js'):root.GAME_DATA;
  const api=factory(BASE,DATA,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,ROOT){
  'use strict';
  const {GameEngine:Parent}=BASE;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  class LivingCity09Engine extends Parent{
    constructor(options={}){
      super({...options,data:options.data||DATA});
      if(ROOT&&typeof ROOT==='object'){
        ROOT.LIVING_CITY_09_ENGINE=this;
        ROOT.LIVING_CITY_08_ENGINE=this;
        ROOT.LIVING_CITY_07_ENGINE=this;
        ROOT.LIVING_CITY_06_ENGINE=this;
        ROOT.LIVING_CITY_05_ENGINE=this;
        ROOT.REVIVAL_GAME_ENGINE=this;
      }
    }
    createInitialState(){
      const state=super.createInitialState();
      state.preferences.accessibility={fontScale:1,highContrast:false,reducedMotion:false};
      return state;
    }
    ensureStateShape(){
      super.ensureStateShape();
      if(!this.state.preferences)this.state.preferences={};
      const a=this.state.preferences.accessibility||{};
      this.state.preferences.accessibility={
        fontScale:[1,1.1,1.2].includes(Number(a.fontScale))?Number(a.fontScale):1,
        highContrast:!!a.highContrast,
        reducedMotion:!!a.reducedMotion
      };
      this.state.schema=this.data.schema;
      this.state.version=this.data.version;
    }
    getAccessibilityPreferences(){return {...this.state.preferences.accessibility};}
    setAccessibilityPreferences(next={}){
      const current=this.state.preferences.accessibility||{};
      const scale=Number(next.fontScale??current.fontScale??1);
      this.state.preferences.accessibility={
        fontScale:[1,1.1,1.2].includes(scale)?scale:1,
        highContrast:next.highContrast===undefined?!!current.highContrast:!!next.highContrast,
        reducedMotion:next.reducedMotion===undefined?!!current.reducedMotion:!!next.reducedMotion
      };
      return this.getAccessibilityPreferences();
    }
    applyAccessibilityPreset(id){
      const preset=(this.data.accessibilityPresets||[]).find((x)=>x.id===id);
      if(!preset)return{ok:false,reason:'Unbekanntes Bedienprofil.'};
      this.setAccessibilityPreferences(preset);
      return{ok:true,preset:id,preferences:this.getAccessibilityPreferences()};
    }
    getCityPulse(){
      const director=typeof this.getDirectorSummary==='function'?this.getDirectorSummary():{};
      const arcs=typeof this.getStoryArcs==='function'?this.getStoryArcs():[];
      const crew=Array.isArray(this.state.crew)?this.state.crew:[];
      const activeCrew=crew.filter((x)=>x&&x.status!=='left');
      const avgStress=activeCrew.length?activeCrew.reduce((s,x)=>s+Number(x.stress||0),0)/activeCrew.length:0;
      const avgMorale=activeCrew.length?activeCrew.reduce((s,x)=>s+Number(x.morale||0),0)/activeCrew.length:0;
      const pending=Array.isArray(this.state.pendingConsequences)?this.state.pendingConsequences:[];
      const tension=Number(director?.tension??this.state.director?.tension??0);
      const opportunity=Number(director?.opportunity??this.state.director?.opportunity??0);
      const pressure=clamp(Math.round(tension+avgStress*.35-opportunity*.2),0,100);
      const signals=[];
      if(pending.length)signals.push(`${pending.length} spätere Folge${pending.length===1?'':'n'} vorgemerkt`);
      const openArcs=arcs.filter((x)=>!x.complete);
      if(openArcs.length)signals.push(`${openArcs.length} Entwicklungsbogen/-bögen offen`);
      if(avgStress>=55)signals.push('Crewbelastung erhöht');
      if(avgMorale>=70)signals.push('Crew-Moral stabil');
      if(!signals.length)signals.push('Keine akute Folge offen');
      return{
        turn:Number(this.state.turn||0),pressure,tension,opportunity,
        pendingConsequences:pending.length,
        arcsComplete:arcs.filter((x)=>x.complete).length,
        arcsTotal:arcs.length,
        avgStress:Math.round(avgStress),avgMorale:Math.round(avgMorale),
        signals
      };
    }
  }
  return Object.freeze({...BASE,GameEngine:LivingCity09Engine,VERSION:DATA.version,SCHEMA:DATA.schema});
});
