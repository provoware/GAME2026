(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./engine.js'):root.GAME_ENGINE;
  const DATA=typeof module==='object'&&module.exports?require('./revival-data.js'):root.GAME_DATA;
  const MISSIONS=typeof module==='object'&&module.exports?require('./revival-missions.js'):root.REVIVAL_MISSION_METHODS;
  const WORLD=typeof module==='object'&&module.exports?require('./revival-world.js'):root.REVIVAL_WORLD_METHODS;
  const api=factory(BASE,DATA,MISSIONS,WORLD,root);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GAME_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE,DATA,MISSIONS,WORLD,ROOT){
  'use strict';
  const {GameEngine:BaseGameEngine}=BASE;
  class RevivalGameEngine extends BaseGameEngine{
    constructor(options={}){super({...options,data:options.data||DATA});if(ROOT&&typeof ROOT==='object')ROOT.REVIVAL_GAME_ENGINE=this;if(!this.state.missions.offers.length&&!this.state.missions.active.length&&this.state.turn<=1)this.generateMissionOffers(true);this.updateDirector();}
    createInitialState(){const state=super.createInitialState();state.missions={offers:[],active:[],completed:[],failed:[],lastGeneratedTurn:0};state.cityEvents=[];state.rivalRelations=this.createInitialRivalRelations();state.milestones=[];state.director={tension:34,opportunity:48,headline:'Der Stadtsektor beobachtet deine nächsten Schritte.'};Object.assign(state.stats,{missionsCompleted:0,missionsFailed:0,cityEvents:0,rivalWars:0});return state;}
    ensureStateShape(){super.ensureStateShape();if(!this.state.missions)this.state.missions={offers:[],active:[],completed:[],failed:[],lastGeneratedTurn:0};['offers','active','completed','failed'].forEach((key)=>{if(!Array.isArray(this.state.missions[key]))this.state.missions[key]=[];});if(!Number.isFinite(this.state.missions.lastGeneratedTurn))this.state.missions.lastGeneratedTurn=0;if(!Array.isArray(this.state.cityEvents))this.state.cityEvents=[];if(!this.state.rivalRelations)this.state.rivalRelations=this.createInitialRivalRelations();if(!Array.isArray(this.state.milestones))this.state.milestones=[];if(!this.state.director)this.state.director={tension:34,opportunity:48,headline:'Stadtlage wird berechnet.'};['missionsCompleted','missionsFailed','cityEvents','rivalWars'].forEach((key)=>{if(!Number.isFinite(this.state.stats[key]))this.state.stats[key]=0;});this.state.schema=this.data.schema;this.state.version=this.data.version;}
    getTravelOptions(){return super.getTravelOptions().map((option)=>option.mode==='train'?{...option,cost:option.cost+this.getTravelEventSurcharge()}:option);}
    getDecisionSupport(){const base=super.getDecisionSupport(),director=this.getDirectorSummary();return{...base,prestige:director.prestige,tension:director.tension,opportunity:director.opportunity,activeMissions:director.missions.active.length};}
    advanceTurn(joinBoost=0){super.advanceTurn(joinBoost);this.resolveCityEvents();this.resolveRivalRelations();this.resolveMissions();this.evaluateMilestones();this.updateDirector();}
  }
  Object.assign(RevivalGameEngine.prototype,MISSIONS,WORLD);
  return{...BASE,GameEngine:RevivalGameEngine,RevivalGameEngine};
});
