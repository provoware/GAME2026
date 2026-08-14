'use strict';
const assert = require('node:assert/strict');
const { GameEngine, seededRandom } = require('../engine.js');

function testInitialState() {
  const engine = new GameEngine({ random: seededRandom(1) });
  assert.equal(engine.state.turn, 1);
  assert.equal(engine.state.gang.length, 3);
  assert.equal(Object.keys(engine.state.districts).length, 9);
  assert.equal(engine.state.selectedLocationId, 'location.bunker.main');
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
  for (let i = 0; i < 3; i += 1) engine.applyAction('raid');
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

[testInitialState, testBossChangesFromActions, testAffordabilityGate, testRecruitmentDeterministic, testClamping, testProfileChanges].forEach((test) => test());
console.log('PASS: HTML-Gangspiel Engine – 6 Tests erfolgreich.');
