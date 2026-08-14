'use strict';
const assert = require('node:assert/strict');
const { GameEngine, seededRandom } = require('../engine.js');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function engineWith(random = () => 0.99) { return new GameEngine({ random }); }
function go(engine, id) { engine.state.currentLocationId = id; engine.state.selectedLocationId = id; }

test('Startzustand Schema 4 und 12 Bezirke', () => {
  const e = engineWith(seededRandom(1));
  assert.equal(e.state.schema, 4);
  assert.equal(e.state.version, '0.9.0-living-city-03');
  assert.equal(Object.keys(e.state.districts).length, 12);
  assert.equal(e.state.gang.length, 3);
  assert.equal(e.state.currentLocationId, 'location.bunker.main');
});

test('Crew besitzt detaillierte Skills und Biografie', () => {
  const e = engineWith();
  const m = e.state.gang[0];
  assert.ok(m.bio.length > 10);
  assert.ok(m.age >= 18);
  assert.equal(Object.keys(m.skills).length, 7);
  assert.ok(Array.isArray(m.career));
});

test('Normierung alter Crew ergänzt Skills', () => {
  const e = new GameEngine({ state:{ gang:[{id:'x',name:'Alt',power:2,loyalty:50}], districts:{}, resources:{money:1,supplies:1}, boss:{} }, random:()=>.5 });
  assert.equal(e.getMember('x').skills.combat, 4);
  assert.ok(e.getMember('x').bio);
});

test('Handlung verändert Boss und vergibt Praxis-XP', () => {
  const e = engineWith();
  const xpBefore = e.state.boss.skillXp.business;
  const result = e.applyAction('deal');
  assert.equal(result.ok, true);
  assert.ok(e.state.boss.influence > 35);
  assert.ok(e.state.boss.skillXp.business > xpBefore || e.state.boss.skills.business > 5);
});

test('Skill steigt durch genügend Praxis-XP', () => {
  const e = engineWith();
  const before = e.state.gang[0].skills.analysis;
  e.awardMemberSkillXp('starter-1', 'analysis', 500, 'Test');
  assert.ok(e.state.gang[0].skills.analysis > before);
  assert.ok(e.state.gang[0].career.length > 0);
});

test('Boss-Skill steigt durch Entscheidungen', () => {
  const e = engineWith();
  const before = e.state.boss.skills.analysis;
  e.awardBossSkillXp('analysis', 600);
  assert.ok(e.state.boss.skills.analysis > before);
});

test('Dauerauftrag kann vergeben werden', () => {
  const e = engineWith();
  const r = e.assignCrewTask('starter-2', 'task.scout', 'location.market.black');
  assert.equal(r.ok, true);
  assert.equal(e.getMember('starter-2').assignment.taskId, 'task.scout');
});

test('Dauerauftrag arbeitet autonom und baut Skill auf', () => {
  const e = engineWith();
  e.assignCrewTask('starter-2', 'task.scout', 'location.market.black');
  const beforeIntel = e.getDistrict('location.market.black').intel;
  const beforeXp = e.getMember('starter-2').skillXp.analysis;
  for (let i = 0; i < 3; i += 1) e.resolveAutonomousTasks();
  assert.ok(e.getDistrict('location.market.black').intel >= beforeIntel);
  assert.ok(e.getMember('starter-2').skillXp.analysis > beforeXp || e.getMember('starter-2').skills.analysis > 7);
});

test('Dauerauftrag kann beendet werden', () => {
  const e = engineWith();
  e.assignCrewTask('starter-2', 'task.rest');
  assert.equal(e.clearCrewTask('starter-2').ok, true);
  assert.equal(e.getMember('starter-2').assignment, null);
});

test('Betrieb kann gekauft werden', () => {
  const e = engineWith();
  e.state.resources.money = 5000;
  go(e, 'location.market.black');
  const offer = e.getAvailableProperties()[0];
  const r = e.buyProperty(offer.id);
  assert.equal(r.ok, true);
  assert.equal(e.state.assets.length, 1);
});

test('Betrieb kann ausgebaut werden', () => {
  const e = engineWith();
  e.state.resources.money = 10000;
  go(e, 'location.market.black');
  const asset = e.buyProperty(e.getAvailableProperties()[0].id).asset;
  const r = e.upgradeProperty(asset.id);
  assert.equal(r.ok, true);
  assert.equal(e.state.assets[0].level, 2);
});

test('Crew kann dauerhaft Betrieb zugewiesen werden', () => {
  const e = engineWith();
  e.state.resources.money = 10000;
  go(e, 'location.market.black');
  const asset = e.buyProperty(e.getAvailableProperties()[0].id).asset;
  const r = e.assignCrewToAsset(asset.id, 'starter-3');
  assert.equal(r.ok, true);
  assert.ok(e.state.assets[0].assignedCrewIds.includes('starter-3'));
  assert.ok(!e.getFreeCrew().some((m) => m.id === 'starter-3'));
});

test('Betrieb kann verkauft werden', () => {
  const e = engineWith();
  e.state.resources.money = 10000;
  go(e, 'location.market.black');
  const asset = e.buyProperty(e.getAvailableProperties()[0].id).asset;
  const r = e.sellProperty(asset.id);
  assert.equal(r.ok, true);
  assert.equal(e.state.assets.length, 0);
  assert.ok(r.price > 0);
});

test('Marktunternehmen besitzen dynamische reale Spielwerte', () => {
  const e = engineWith(seededRandom(5));
  e.resolveMarket();
  const c = e.state.market.companies['company.neonworks'];
  assert.ok(Number.isFinite(c.price));
  assert.ok(Number.isFinite(c.revenue));
  assert.ok(c.development >= 0 && c.development <= 100);
  assert.ok(c.history.length >= 2);
});

test('Unternehmenskurs reagiert auf Bezirksentwicklung', () => {
  const hi = engineWith(() => .5);
  const lo = engineWith(() => .5);
  hi.getDistrict('location.neon.cellar_club').control = 95;
  hi.getDistrict('location.neon.cellar_club').unrest = 5;
  lo.getDistrict('location.neon.cellar_club').control = 5;
  lo.getDistrict('location.neon.cellar_club').unrest = 95;
  for (let i=0;i<4;i++){hi.resolveMarket();lo.resolveMarket();}
  assert.ok(hi.state.market.companies['company.neonworks'].price > lo.state.market.companies['company.neonworks'].price);
});

test('Bank Ein- und Auszahlung funktioniert', () => {
  const e = engineWith();
  const cash = e.state.resources.money;
  assert.equal(e.depositToBank(200).ok, true);
  assert.equal(e.state.resources.money, cash - 200);
  assert.equal(e.withdrawFromBank(100).ok, true);
  assert.ok(e.state.bank.balance >= 600);
});

test('Anteile können direkt gekauft werden', () => {
  const e = engineWith();
  e.state.bank.balance = 5000;
  const r = e.buyShares('company.neonworks', 10);
  assert.equal(r.ok, true);
  assert.equal(e.state.bank.holdings['company.neonworks'].shares, 10);
});

test('Anteile können verkauft werden', () => {
  const e = engineWith();
  e.state.bank.balance = 5000;
  e.buyShares('company.neonworks', 10);
  const r = e.sellShares('company.neonworks', 4);
  assert.equal(r.ok, true);
  assert.equal(e.state.bank.holdings['company.neonworks'].shares, 6);
});

test('Dividenden werden anhand Kurs und Entwicklung berechnet', () => {
  const e = engineWith();
  e.state.bank.balance = 5000;
  e.buyShares('company.altstadt', 10);
  const before = e.state.bank.balance;
  const dividend = e.payDividends();
  assert.ok(dividend > 0);
  assert.ok(e.state.bank.balance > before);
});

test('Investmentportfolio berechnet Gewinn/Verlust', () => {
  const e = engineWith();
  e.state.bank.balance = 5000;
  e.buyShares('company.freight9', 5);
  e.state.market.companies['company.freight9'].price += 10;
  const p = e.getInvestmentPortfolio();
  assert.equal(p.positions.length, 1);
  assert.ok(p.gain > 0);
});

test('Maulwurf kann bei hoher Eignung gesetzt werden', () => {
  let calls=0; const e = engineWith(() => calls++ === 0 ? 0 : .99);
  e.state.resources.money = 5000;
  e.getMember('starter-2').skills.stealth = 10;
  e.getMember('starter-2').skills.analysis = 10;
  const r = e.plantMole('starter-2', 'institution.station');
  assert.equal(r.ok, true);
  assert.equal(e.state.moles.length, 1);
});

test('Maulwurfversuch kann scheitern', () => {
  const e = engineWith(() => .999);
  e.state.resources.money = 5000;
  const r = e.plantMole('starter-3', 'institution.police');
  assert.equal(r.ok, false);
  assert.equal(r.attempted, true);
});

test('Maulwurf beeinflusst Institution abstrakt pro Zug', () => {
  let calls=0; const e = engineWith(() => calls++ === 0 ? 0 : .99);
  e.state.resources.money = 5000;
  e.getMember('starter-2').skills.stealth = 10;
  e.plantMole('starter-2', 'institution.bank');
  const before = e.state.market.companies['company.neonworks'].marketIntel;
  e.resolveMoles();
  assert.ok(e.state.market.companies['company.neonworks'].marketIntel >= before);
});

test('Bahnhof bietet Zugfahrten in entfernte Stadtteile', () => {
  const e = engineWith();
  go(e, 'location.station.ghost');
  const opts = e.getTravelOptions().filter((o)=>o.mode==='train');
  assert.ok(opts.length >= 4);
  assert.ok(opts.some((o)=>o.to==='location.harbor.south'));
});

test('Bahnfahrt wechselt aktuellen Stadtteil', () => {
  const e = engineWith();
  go(e, 'location.station.ghost');
  e.state.resources.money = 1000;
  const r = e.travelTo('location.harbor.south', 'train');
  assert.equal(r.ok, true);
  assert.equal(e.state.currentLocationId, 'location.harbor.south');
});

test('Schutzausrüstung kann gekauft und ausgerüstet werden', () => {
  const e = engineWith();
  e.state.resources.money = 1000;
  go(e, 'location.market.black');
  const item = e.buyGear('gear.vest').item;
  assert.equal(e.equipGear(item.id, 'starter-1').ok, true);
  assert.ok(e.getMemberGearBonuses('starter-1').defense >= 3);
});

test('Kampfsport steigert Skills und wird dauerhaft gelernt', () => {
  const e = engineWith();
  e.state.resources.money = 3000;
  go(e, 'location.blocks.east');
  const before = e.getMember('starter-1').skillXp.combat;
  const r = e.trainMartialArt('starter-1', 'art.boxing');
  assert.equal(r.ok, true);
  assert.ok(e.getMember('starter-1').martialArts.some((a)=>a.artId==='art.boxing'));
  assert.ok(e.getMember('starter-1').skillXp.combat > before || e.getMember('starter-1').skills.combat > 7);
});

test('Nachtpersonal-Netz als abstrakte Daueroperation', () => {
  const e = engineWith();
  e.state.resources.money = 5000;
  const r = e.startStreetOperation('street.night_staff', 'location.oldtown.central');
  assert.equal(r.ok, true);
  assert.equal(e.state.streetOperations.length, 1);
});

test('Kräutermarkt-Netz erzeugt simulierten laufenden Ertrag', () => {
  const e = engineWith(() => .99);
  e.state.resources.money = 5000;
  e.startStreetOperation('street.herbal_market', 'location.market.black');
  const value = e.resolveStreetOperationIncome();
  assert.ok(value > 0);
});

test('Fiktiver Rivalen-Spezialauftrag wirkt nur auf Rivalenwerte', () => {
  const e = engineWith(() => 0);
  e.state.resources.money = 5000;
  const rival = e.state.rivals[0];
  const before = rival.power;
  const r = e.startStreetOperation('street.rival_contract', rival.id);
  assert.equal(r.ok, true);
  assert.equal(r.success, true);
  assert.ok(rival.power < before);
});

test('Automatenspiel ist nur im Casino möglich', () => {
  const e = engineWith(() => 0);
  const r = e.spinSlot('slot.neon7', 10);
  assert.equal(r.ok, false);
});

test('Mehrere Spielautomaten sind spielbar', () => {
  const e = engineWith(() => 0);
  go(e, 'location.casino.9909');
  e.state.resources.money = 1000;
  for (const machine of e.data.casino.slotMachines) {
    const r = e.spinSlot(machine.id, machine.minBet);
    assert.equal(r.ok, true);
    assert.equal(r.reels.length, 3);
  }
});

test('Dreifachsymbol zahlt am Automaten aus', () => {
  const e = engineWith(() => 0);
  go(e, 'location.casino.9909');
  e.state.resources.money = 1000;
  const r = e.spinSlot('slot.neon7', 10);
  assert.ok(r.payout > 0);
});

test('Poker kann mit eigenem Blatt gestartet werden', () => {
  const e = engineWith(seededRandom(2));
  go(e, 'location.casino.9909');
  const r = e.startPoker(50);
  assert.equal(r.ok, true);
  assert.equal(e.state.casino.poker.player.length, 5);
  assert.equal(e.state.casino.poker.dealer.length, 5);
});

test('Poker erlaubt Halten und Ziehen', () => {
  const e = engineWith(seededRandom(3));
  go(e, 'location.casino.9909');
  e.startPoker(50);
  const first = JSON.stringify(e.state.casino.poker.player[0]);
  e.togglePokerHold(0);
  const r = e.drawPoker();
  assert.equal(r.ok, true);
  assert.equal(JSON.stringify(e.state.casino.poker.player[0]), first);
  assert.equal(e.state.casino.poker.draws, 1);
});

test('Poker Showdown liefert Rang und Auszahlung', () => {
  const e = engineWith(seededRandom(4));
  go(e, 'location.casino.9909');
  e.startPoker(50);
  const r = e.finishPoker();
  assert.equal(r.ok, true);
  assert.ok(['Sieg','Niederlage','Unentschieden'].includes(r.result));
  assert.ok(r.playerRank);
});

test('Kampfprognose enthält detaillierte Crewbeiträge', () => {
  const e = engineWith();
  go(e, 'location.market.black');
  const preview = e.getCombatPreview('raid', ['starter-1','starter-2']);
  assert.equal(preview.crew.length, 2);
  assert.ok(Number.isFinite(preview.attackerPower));
  assert.ok(preview.terrainLabel);
  assert.ok(Number.isFinite(preview.injuryRisk));
});

test('Taktischer Kampf startet nur mit freier Crew', () => {
  const e = engineWith();
  e.state.resources.supplies = 10;
  go(e, 'location.market.black');
  const r = e.startCombat('raid', ['starter-1','starter-2']);
  assert.equal(r.ok, true);
  assert.equal(e.state.combatSession.crewIds.length, 2);
});

test('Deckung erhöht taktischen Vorteil', () => {
  const e = engineWith(() => .99);
  e.state.resources.supplies = 10;
  go(e, 'location.market.black');
  e.startCombat('raid', ['starter-1','starter-2']);
  const before = e.state.combatSession.advantage;
  const r = e.combatDecision('cover');
  assert.equal(r.ok, true);
  assert.ok(e.state.combatSession.advantage > before);
});

test('Angriffsentscheidung baut Kampfmoral ab', () => {
  const e = engineWith(() => 0);
  e.state.resources.supplies = 10;
  go(e, 'location.market.black');
  e.startCombat('raid', ['starter-1','starter-2']);
  const before = e.state.combatSession.enemyMorale;
  e.combatDecision('attack');
  if (e.state.combatSession) assert.ok(e.state.combatSession.enemyMorale < before);
  else assert.ok(e.state.lastCombat);
});

test('Rückzug beendet Kampf kontrolliert', () => {
  const e = engineWith();
  e.state.resources.supplies = 10;
  go(e, 'location.market.black');
  e.startCombat('raid', ['starter-1']);
  const r = e.combatDecision('retreat');
  assert.equal(r.finished, true);
  assert.equal(r.result.outcome, 'retreat');
});

test('Sieg kann echten Bezirksbesitz erzeugen', () => {
  const e = engineWith(() => 0);
  e.state.resources.supplies = 20;
  go(e, 'location.oldtown.central');
  e.getDistrict().control = 50;
  e.getDistrict().rival = 40;
  e.startCombat('raid', ['starter-1','starter-2','starter-3']);
  let guard = 0;
  while (e.state.combatSession && guard++ < 10) e.combatDecision('attack');
  assert.ok(e.state.lastCombat);
  if (e.state.lastCombat.outcome === 'win') assert.equal(e.getDistrict('location.oldtown.central').owner, 'player');
});

test('Rivalengangs besitzen drei unterschiedliche Strategien', () => {
  const e = engineWith();
  const overview = e.getRivalOverview();
  assert.equal(overview.length, 3);
  assert.deepEqual(new Set(overview.map((r)=>r.strategy)).size, 3);
});

test('Rivalen-KI verändert Stadtwerte', () => {
  const e = engineWith(() => 0);
  const before = JSON.stringify(e.state.districts);
  e.resolveRivalGangs();
  assert.notEqual(JSON.stringify(e.state.districts), before);
});

test('Gebietsbesitz wird anhand Kontrolle bewertet', () => {
  const e = engineWith();
  const d = e.getDistrict('location.oldtown.central');
  d.control = 80; d.rival = 20;
  e.evaluateTerritoryOwnership('location.oldtown.central');
  assert.equal(d.owner, 'player');
});

test('Rekrutierung bleibt deterministisch testbar', () => {
  const e = engineWith(() => 0);
  const before = e.state.gang.length;
  e.resolveRecruitment(.3);
  assert.equal(e.state.gang.length, before + 1);
});

test('Boss-Entscheidungshilfe enthält Bank und freie Crew', () => {
  const e = engineWith();
  const d = e.getDecisionSupport();
  assert.ok(Number.isFinite(d.netWorth));
  assert.ok(Number.isFinite(d.investmentValue));
  assert.ok(Number.isFinite(d.readyCrew));
  assert.ok(Array.isArray(d.warnings));
});

test('Razzia-Risiko bleibt gültig', () => {
  const e = engineWith();
  const r = e.getRaidRisk();
  assert.ok(r >= 0 && r <= 1);
});

test('Marktbeobachtung-Dauerauftrag erhöht Marktintel', () => {
  const e = engineWith();
  e.assignCrewTask('starter-3','task.market','company.neonworks');
  const before=e.state.market.companies['company.neonworks'].marketIntel;
  e.resolveAutonomousTasks();
  assert.ok(e.state.market.companies['company.neonworks'].marketIntel >= before);
});

test('Betriebsführung durch Skill erhöht Projektion', () => {
  const e = engineWith();
  e.state.resources.money=10000; go(e,'location.market.black');
  const asset=e.buyProperty(e.getAvailableProperties()[0].id).asset;
  const before=e.getAssetProjection(e.state.assets[0]).net;
  e.assignCrewTask('starter-3','task.manage_asset',asset.id);
  for(let i=0;i<4;i++)e.resolveAutonomousTasks();
  const after=e.getAssetProjection(e.state.assets[0]).net;
  assert.ok(after>=before);
});

test('Alter v0.8-Zustand wird migrationsfest ergänzt', () => {
  const old={schema:3,version:'0.8.0-living-city-02',turn:8,selectedLocationId:'location.bunker.main',resources:{money:500,supplies:3},boss:{respect:50,fear:30,loyalty:60,influence:40,heat:20,notoriety:30},districts:{},gang:[{id:'old',name:'Altcrew',role:'Scout',power:3,loyalty:60}],assets:[],history:[]};
  const e=new GameEngine({state:old,random:()=>.5});
  assert.equal(e.state.schema,4);
  assert.equal(e.state.version,'0.9.0-living-city-03');
  assert.ok(e.state.bank);
  assert.ok(e.state.market.companies['company.neonworks']);
  assert.ok(e.getMember('old').skills.analysis);
});

test('500-Zug-Stresstest bleibt endlich und innerhalb Wertebereiche', () => {
  const e = engineWith(seededRandom(9909));
  e.state.resources.money=100000;e.state.resources.supplies=10000;e.state.bank.balance=50000;
  for(let i=0;i<500;i++){
    const action=e.data.actions[i%e.data.actions.length];
    if(action.combat){const free=e.getFreeCrew().slice(0,3).map((m)=>m.id);if(free.length){const start=e.startCombat('raid',free);if(start.ok){let guard=0;while(e.state.combatSession&&guard++<8)e.combatDecision(guard%3===0?'cover':'attack');}}}
    else e.applyAction(action.id);
    if(i%25===0){e.resolveMarket();const company=e.data.companies[i%e.data.companies.length];if(e.state.bank.balance>company.basePrice*2)e.buyShares(company.id,1);}
    Object.values(e.state.districts).forEach((d)=>{['control','police','rival','unrest','intel'].forEach((k)=>assert.ok(Number.isFinite(d[k])));assert.ok(d.control>=0&&d.control<=100);assert.ok(d.rival>=0&&d.rival<=100);});
    assert.ok(Number.isFinite(e.state.resources.money));assert.ok(Number.isFinite(e.state.bank.balance));
  }
});

let passed = 0;
for (const {name, fn} of tests) {
  try { fn(); passed += 1; }
  catch (error) { console.error(`FAIL: ${name}`); throw error; }
}
console.log(`PASS: HTML-Gangspiel Engine – ${passed}/${tests.length} Tests erfolgreich.`);
