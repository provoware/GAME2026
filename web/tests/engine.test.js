'use strict';
const assert = require('node:assert/strict');
const { GameEngine, seededRandom } = require('../engine.js');

function testInitialState() {
  const engine = new GameEngine({ random: seededRandom(1) });
  assert.equal(engine.state.turn, 1);
  assert.equal(engine.state.gang.length, 3);
  assert.equal(Object.keys(engine.state.districts).length, 9);
  assert.equal(engine.state.selectedLocationId, 'location.bunker.main');
  assert.deepEqual(engine.state.assets, []);
  assert.equal(engine.state.schema, 2);
}

function testBossChangesFromActions() {
  const engine = new GameEngine({ random: () => 0.99 });
  const before = { ...engine.state.boss };
  const result = engine.applyAction('protect');
  assert.equal(result.ok, true);
  assert.equal(engine.state.boss.respect, before.respect + 7);
  assert.equal(engine.state.boss.loyalty, before.loyalty + 5);
  assert.equal(engine.state.turn, 2);
}

function testAffordabilityGate() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.state.resources.money = 0;
  const result = engine.applyAction('protect');
  assert.equal(result.ok, false);
  assert.equal(engine.state.turn, 1);
}

function testRecruitmentDeterministic() {
  const engine = new GameEngine({ random: () => 0 });
  const before = engine.state.gang.length;
  engine.applyAction('party');
  assert.equal(engine.state.gang.length, before + 1);
  assert.equal(engine.state.stats.recruitsJoined, 1);
}

function testClamping() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.state.boss.heat = 98;
  engine.state.resources.supplies = 20;
  for (let i = 0; i < 3; i += 1) engine.applyAction('show_force');
  assert.ok(engine.state.boss.heat <= 100);
  assert.ok(engine.getDistrict().control <= 100);
  assert.ok(engine.getDistrict().rival >= 0);
}

function testProfileChanges() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.state.boss.respect = 80;
  engine.state.boss.loyalty = 75;
  engine.state.boss.heat = 20;
  assert.equal(engine.getBossProfile().title, 'Straßenpatron');
}

function testPropertyPurchaseAndProjection() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.selectLocation('location.market.black');
  engine.state.resources.money = 5000;
  const offer = engine.getAvailableProperties().find((item) => item.id === 'hotel');
  assert.ok(offer);
  assert.ok(offer.cost > 1000);
  const result = engine.buyProperty('hotel');
  assert.equal(result.ok, true);
  assert.equal(engine.state.assets.length, 1);
  assert.equal(engine.state.stats.propertiesBought, 1);
  assert.equal(engine.state.turn, 2);
  const portfolio = engine.getPortfolioSummary();
  assert.equal(portfolio.hotelCount, 1);
  assert.ok(portfolio.projectedNet > 0);
  assert.ok(portfolio.bookValue >= offer.cost);
}

function testDuplicatePropertyBlocked() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.selectLocation('location.market.black');
  engine.state.resources.money = 5000;
  assert.equal(engine.buyProperty('hotel').ok, true);
  engine.selectLocation('location.market.black');
  assert.equal(engine.getAvailableProperties().some((item) => item.id === 'hotel'), false);
  assert.equal(engine.buyProperty('hotel').ok, false);
}

function testPropertyRequirement() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.state.resources.money = 5000;
  const blocked = engine.applyAction('launder');
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /Betrieb/);
  assert.equal(engine.buyProperty('warehouse').ok, true);
  const allowed = engine.applyAction('launder');
  assert.equal(allowed.ok, true);
}

function testCombatWin() {
  const engine = new GameEngine({ random: () => 0 });
  engine.state.resources.supplies = 20;
  const preview = engine.getActionPreview('raid');
  assert.ok(preview.combat.percent >= 18);
  const beforeRival = engine.getDistrict().rival;
  const result = engine.applyAction('raid');
  assert.equal(result.ok, true);
  assert.equal(result.combat.win, true);
  assert.equal(engine.state.stats.combats, 1);
  assert.equal(engine.state.stats.combatWins, 1);
  assert.ok(engine.getDistrict().rival < beforeRival);
  assert.equal(result.combat.phases.length, 3);
}

function testCombatLoss() {
  const engine = new GameEngine({ random: () => 0.99 });
  engine.selectLocation('location.yard.freight');
  engine.state.resources.supplies = 20;
  const beforeControl = engine.getDistrict().control;
  const result = engine.applyAction('raid');
  assert.equal(result.combat.win, false);
  assert.equal(engine.state.stats.combats, 1);
  assert.equal(engine.state.stats.combatWins, 0);
  assert.ok(engine.getDistrict().control <= beforeControl);
}

function testBossDashboardUsefulSignals() {
  const engine = new GameEngine({ random: () => 0.99 });
  const dashboard = engine.getBossDashboard();
  assert.ok(dashboard.rank.title);
  assert.ok(Number.isFinite(dashboard.netWorth));
  assert.ok(Number.isFinite(dashboard.raidRisk));
  assert.ok(Number.isFinite(dashboard.recruitChance));
  assert.equal(dashboard.readiness.total, 3);
  assert.ok(Array.isArray(dashboard.alerts));
  assert.ok(dashboard.alerts.length > 0);
}

function testLegacyStateMigration() {
  const legacy = {
    turn: 5,
    selectedLocationId: 'location.bunker.main',
    resources: { money: 200, supplies: 2 },
    boss: { respect: 50, fear: 30, loyalty: 60, influence: 40, heat: 20, notoriety: 20 },
    districts: {},
    gang: [],
    history: [],
    usedRecruitNames: [],
    actionCounts: {},
    stats: {}
  };
  const engine = new GameEngine({ state: legacy, random: () => 0.99 });
  assert.equal(engine.state.schema, 2);
  assert.deepEqual(engine.state.assets, []);
  assert.equal(typeof engine.getDistrict().intel, 'number');
  assert.equal(engine.state.stats.combats, 0);
}

[
  testInitialState,
  testBossChangesFromActions,
  testAffordabilityGate,
  testRecruitmentDeterministic,
  testClamping,
  testProfileChanges,
  testPropertyPurchaseAndProjection,
  testDuplicatePropertyBlocked,
  testPropertyRequirement,
  testCombatWin,
  testCombatLoss,
  testBossDashboardUsefulSignals,
  testLegacyStateMigration
].forEach((test) => test());

console.log('PASS: HTML-Gangspiel Engine – 13 Tests erfolgreich.');
