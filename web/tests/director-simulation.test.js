'use strict';
const assert=require('node:assert/strict');
const {GameEngine,seededRandom}=require('../revival-engine.js');
const e=new GameEngine({random:seededRandom(20261004)});
e.state.resources.money=250000;e.state.resources.supplies=25000;e.state.bank.balance=100000;
e.assignCrewTask('starter-2','task.scout','location.market.black');
for(let i=0;i<1000;i+=1){
  while(e.state.missions.active.length<3&&e.state.missions.offers.length){const result=e.acceptMission(e.state.missions.offers[0].id);if(!result.ok)break;}
  if(i%19===0)e.spawnCityEvent(true);
  if(i%11===0){const relation=e.getRivalRelationsOverview()[i%3];e.adjustRivalRelation(relation.a,relation.b,i%22===0?-5:3,'Massensimulation');}
  e.advanceTurn();
  const director=e.getDirectorSummary();
  assert.ok(Number.isFinite(director.tension));assert.ok(Number.isFinite(director.opportunity));assert.ok(Number.isFinite(director.prestige));
  assert.ok(director.tension>=0&&director.tension<=100);assert.ok(director.opportunity>=0&&director.opportunity<=100);
  assert.ok(e.state.cityEvents.length<=2);assert.ok(e.state.missions.active.length<=3);assert.ok(e.state.missions.offers.length<=4);
  e.getRivalRelationsOverview().forEach((r)=>assert.ok(r.value>=-100&&r.value<=100));
  Object.values(e.state.districts).forEach((d)=>{['control','police','rival','unrest','intel'].forEach((k)=>assert.ok(Number.isFinite(d[k])));assert.ok(d.control>=0&&d.control<=100);assert.ok(d.rival>=0&&d.rival<=100);});
}
assert.ok(e.state.stats.cityEvents>0);assert.ok(e.state.stats.missionsFailed+e.state.stats.missionsCompleted>0);assert.ok(e.state.history.length<=160);
console.log(`PASS: Revival-Director – 1000 Züge stabil · Events ${e.state.stats.cityEvents} · Missionen ${e.state.stats.missionsCompleted}/${e.state.stats.missionsFailed}.`);
