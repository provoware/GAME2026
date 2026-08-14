'use strict';
const assert=require('node:assert/strict');
const {GameEngine,seededRandom}=require('../engine.js');

function engineWithRandom(value=.99){return new GameEngine({random:()=>value});}
function findAffordableProperty(engine){
  engine.state.resources.money=100000;
  const locations=engine.data.world.locations;
  for(const location of locations){
    engine.selectLocation(location.id);
    const offers=engine.getAvailableProperties();
    if(offers.length)return offers[0];
  }
  throw new Error('Keine Immobilie verfügbar');
}
function buyOne(engine){
  const offer=findAffordableProperty(engine);
  const result=engine.buyProperty(offer.id);
  assert.equal(result.ok,true);
  return result.asset;
}

const tests=[];
function test(name,fn){tests.push([name,fn]);}

test('Startzustand Schema 3',()=>{
  const e=new GameEngine({random:seededRandom(1)});
  assert.equal(e.state.schema,3);
  assert.equal(e.state.gang.length,3);
  assert.equal(Object.keys(e.state.districts).length,9);
  assert.equal(e.state.rivals.length,3);
  assert.equal(e.getOwnedDistrictCount(),1);
});

test('Migration aus altem Browserzustand ergänzt Rivalen und Assetfelder',()=>{
  const old={turn:4,resources:{money:500,supplies:3},boss:{respect:40,fear:30,loyalty:50,influence:30,heat:10,notoriety:10},districts:{},gang:[],assets:[{id:'a',propertyId:'hotel',locationId:'location.market.black',purchasePrice:900}],history:[],actionCounts:{},stats:{}};
  const e=new GameEngine({state:old,random:()=>.99});
  assert.equal(e.state.schema,3);
  assert.equal(e.state.rivals.length,3);
  assert.deepEqual(e.state.assets[0].assignedCrewIds,[]);
  assert.equal(e.state.assets[0].level,1);
});

test('Normale Aktion verändert Werte und Zug',()=>{
  const e=engineWithRandom();
  const before=e.state.boss.respect;
  const r=e.applyAction('protect');
  assert.equal(r.ok,true);
  assert.equal(e.state.boss.respect,before+7);
  assert.equal(e.state.turn,2);
});

test('Kauf erzeugt Besitz',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  assert.equal(e.state.assets.length,1);
  assert.equal(asset.level,1);
  assert.ok(asset.invested>0);
});

test('Ausbau erhöht Stufe und investierten Wert',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  e.state.resources.money=100000;
  const before=asset.invested;
  const r=e.upgradeProperty(asset.id);
  assert.equal(r.ok,true);
  assert.equal(e.state.assets[0].level,2);
  assert.ok(e.state.assets[0].invested>before);
});

test('Maximalstufe blockiert weiteren Ausbau',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  e.state.resources.money=100000;
  const def=e.getAssetDefinition(asset.propertyId);
  while(e.state.assets[0].level<def.maxLevel)e.upgradeProperty(asset.id);
  const r=e.upgradeProperty(asset.id);
  assert.equal(r.ok,false);
});

test('Verkauf entfernt Besitz und zahlt Geld aus',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  const before=e.state.resources.money;
  const r=e.sellProperty(asset.id);
  assert.equal(r.ok,true);
  assert.equal(e.state.assets.length,0);
  assert.ok(e.state.resources.money>before);
});

test('Crew kann Betrieb zugewiesen werden',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  const id=e.state.gang[0].id;
  const r=e.assignCrew(asset.id,[id]);
  assert.equal(r.ok,true);
  assert.deepEqual(e.state.assets[0].assignedCrewIds,[id]);
});

test('Maximal zwei Crew werden zugewiesen',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  const ids=e.state.gang.map(m=>m.id);
  const r=e.assignCrew(asset.id,ids);
  assert.equal(r.ok,true);
  assert.equal(e.state.assets[0].assignedCrewIds.length,2);
});

test('Betriebspersonal steht nicht im Kampfpool',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  const id=e.state.gang[0].id;
  e.assignCrew(asset.id,[id]);
  assert.equal(e.getAvailableCombatCrew().some(m=>m.id===id),false);
});

test('Personal erhöht Projektion',()=>{
  const e=engineWithRandom();
  const asset=buyOne(e);
  const before=e.getAssetProjection(e.state.assets[0]).net;
  e.assignCrew(asset.id,[e.state.gang[0].id,e.state.gang[1].id]);
  const after=e.getAssetProjection(e.state.assets[0]).net;
  assert.ok(after>=before);
});

test('Drei Rivalengangs besitzen unterschiedliche Strategien',()=>{
  const e=engineWithRandom();
  const strategies=new Set(e.getRivalOverview().map(r=>r.strategy));
  assert.deepEqual([...strategies].sort(),['aggressive','economic','stealth']);
});

test('Rivalen-KI kann Bezirkslage verändern',()=>{
  const e=new GameEngine({random:()=>0});
  const before=Object.values(e.state.districts).reduce((s,d)=>s+d.rival,0);
  e.resolveRivalGangs();
  const after=Object.values(e.state.districts).reduce((s,d)=>s+d.rival,0);
  assert.ok(after>before);
  assert.ok(e.state.stats.rivalMoves>0);
});

test('Kampf braucht freie Crew',()=>{
  const e=engineWithRandom();
  e.state.resources.supplies=20;
  const r=e.startCombat('raid',[]);
  assert.equal(r.ok,true); // leere Auswahl nimmt automatisch verfügbare Top-Crew
  assert.ok(e.state.pendingCombat);
});

test('Explizite Crew-Auswahl wird übernommen',()=>{
  const e=engineWithRandom();
  e.state.resources.supplies=20;
  const ids=[e.state.gang[0].id];
  const r=e.startCombat('raid',ids);
  assert.equal(r.ok,true);
  assert.deepEqual(e.state.pendingCombat.crewIds,ids);
});

test('Deckung erhöht taktischen Vorteil bei erfolgreichem Wurf',()=>{
  const e=new GameEngine({random:()=>0});
  e.state.resources.supplies=20;
  e.startCombat('raid',[e.state.gang[0].id]);
  const before=e.state.pendingCombat.advantage;
  const r=e.combatDecision('cover');
  assert.equal(r.ok,true);
  if(!r.finished)assert.ok(e.state.pendingCombat.advantage>before);
});

test('Rückzug beendet Kampf ohne Sieg',()=>{
  const e=engineWithRandom();
  e.state.resources.supplies=20;
  e.startCombat('raid',[e.state.gang[0].id]);
  const r=e.combatDecision('retreat');
  assert.equal(r.finished,true);
  assert.equal(r.result.outcome,'retreat');
  assert.equal(e.state.pendingCombat,null);
  assert.equal(e.state.stats.retreats,1);
});

test('Erzwungener Sieg kann Bezirk übernehmen',()=>{
  const e=new GameEngine({random:()=>0});
  e.selectLocation('location.market.black');
  const d=e.getDistrict();
  d.control=58;d.rival=32;d.rivalGangId='rival.grey_union';d.owner='rival.grey_union';
  e.state.resources.supplies=20;
  e.startCombat('raid',e.state.gang.map(m=>m.id));
  let r;
  while(e.state.pendingCombat){r=e.combatDecision('attack');}
  assert.equal(r.result.outcome,'win');
  assert.equal(e.getDistrict().owner,'player');
  assert.ok(e.state.stats.districtsTaken>=1);
});

test('Rivalen können schwachen Spielerbezirk übernehmen',()=>{
  const e=engineWithRandom();
  const id='location.market.black',d=e.getDistrict(id);
  d.owner='player';d.control=20;d.rival=80;d.rivalGangId='rival.red_knives';
  const msg=e.evaluateTerritoryOwnership(id,'rival.red_knives');
  assert.equal(d.owner,'rival.red_knives');
  assert.match(msg,/verloren/);
});

test('Boss-Entscheidungshilfe liefert nutzbare Kennzahlen',()=>{
  const e=engineWithRandom();
  const s=e.getDecisionSupport();
  assert.ok(s.rank);
  assert.equal(typeof s.netWorth,'number');
  assert.equal(typeof s.raidRisk,'number');
  assert.ok(Array.isArray(s.warnings)&&s.warnings.length);
});

test('500-Zug-Stresstest bleibt endlich und innerhalb der Wertebereiche',()=>{
  const e=new GameEngine({random:seededRandom(9909)});
  e.state.resources.money=100000;
  e.state.resources.supplies=500;
  for(let i=0;i<500;i++){
    if(i%17===0){
      const offer=e.getAvailableProperties()[0];
      if(offer)e.buyProperty(offer.id); else e.advanceTurn();
    }else{
      const actions=e.data.actions.filter(a=>!a.combat && e.getActionAvailability(a).ok);
      const action=actions[i%actions.length];
      if(action)e.applyAction(action.id);
      else e.advanceTurn();
    }
    if(i%31===0){
      const assets=e.state.assets;
      if(assets.length){
        const a=assets[i%assets.length];
        const cost=e.getAssetUpgradeCost(a.id);
        if(cost!==null){e.state.resources.money+=cost;e.upgradeProperty(a.id);}
      }
    }
    for(const d of Object.values(e.state.districts)){
      for(const key of ['control','rival','police','unrest'])assert.ok(Number.isFinite(d[key])&&d[key]>=0&&d[key]<=100);
    }
    assert.ok(Number.isFinite(e.state.resources.money));
    assert.ok(Number.isFinite(e.state.resources.supplies));
  }
  assert.ok(e.state.turn>500);
});

let passed=0;
for(const [name,fn] of tests){
  try{fn();passed+=1;console.log(`PASS ${String(passed).padStart(2,'0')} · ${name}`);}
  catch(error){console.error(`FAIL · ${name}`);throw error;}
}
console.log(`\nPASS: LIVING-CITY-02 Engine – ${passed}/${tests.length} Tests erfolgreich.`);
