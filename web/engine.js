(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./data.js') : root.GAME_DATA);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GAME_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  function seededRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  class GameEngine {
    constructor(options = {}) {
      this.random = options.random || Math.random;
      this.data = options.data || DATA;
      this.state = options.state ? deepClone(options.state) : this.createInitialState();
      this.ensureStateShape();
    }

    createInitialState() {
      const districtState = {};
      this.data.world.locations.forEach((location) => {
        districtState[location.id] = {
          control: location.id === this.data.world.startLocationId ? 72 : clamp(18 + (55 - location.rival) * 0.34),
          police: location.police,
          rival: location.rival,
          unrest: clamp((location.risk + location.rival) / 2)
        };
      });
      return {
        schema: 1,
        version: this.data.version,
        turn: 1,
        selectedLocationId: this.data.world.startLocationId,
        resources: { money: 760, supplies: 8 },
        boss: { respect: 46, fear: 32, loyalty: 64, influence: 35, heat: 16, notoriety: 24 },
        districts: districtState,
        gang: deepClone(this.data.starterGang),
        usedRecruitNames: [],
        history: [{ turn: 1, type: 'system', text: 'Die Crew sammelt sich im Hauptbunker. Der Bunker-Ring ist offen.' }],
        actionCounts: {},
        stats: { recruitsJoined: 0, policeRaids: 0, rivalMoves: 0, totalIncome: 0 }
      };
    }

    ensureStateShape() {
      if (!this.state.resources) this.state.resources = { money: 0, supplies: 0 };
      if (!this.state.boss) this.state.boss = { respect: 40, fear: 30, loyalty: 50, influence: 30, heat: 10, notoriety: 10 };
      if (!this.state.districts) this.state.districts = {};
      this.data.world.locations.forEach((location) => {
        if (!this.state.districts[location.id]) this.state.districts[location.id] = { control: 20, police: location.police, rival: location.rival, unrest: location.risk };
      });
      if (!Array.isArray(this.state.gang)) this.state.gang = deepClone(this.data.starterGang);
      if (!Array.isArray(this.state.history)) this.state.history = [];
      if (!Array.isArray(this.state.usedRecruitNames)) this.state.usedRecruitNames = [];
      if (!this.state.actionCounts) this.state.actionCounts = {};
      if (!this.state.stats) this.state.stats = { recruitsJoined: 0, policeRaids: 0, rivalMoves: 0, totalIncome: 0 };
    }

    getLocation(id = this.state.selectedLocationId) {
      return this.data.world.locations.find((location) => location.id === id) || this.data.world.locations[0];
    }
    getDistrict(id = this.state.selectedLocationId) { return this.state.districts[id]; }
    selectLocation(id) { if (this.state.districts[id]) this.state.selectedLocationId = id; return this.getSnapshot(); }
    canAfford(action) { return this.state.resources.money >= (action.cost.money || 0) && this.state.resources.supplies >= (action.cost.supplies || 0); }

    applyAction(actionId) {
      const action = this.data.actions.find((item) => item.id === actionId);
      if (!action) return { ok: false, reason: 'Unbekannte Aktion.' };
      if (!this.canAfford(action)) return { ok: false, reason: 'Zu wenig Geld oder Vorräte.' };
      const location = this.getLocation();
      const district = this.getDistrict();
      const effects = action.effects;
      this.state.resources.money -= action.cost.money || 0;
      this.state.resources.supplies -= action.cost.supplies || 0;
      if (effects.money) this.state.resources.money += effects.money;
      ['respect', 'fear', 'loyalty', 'influence', 'heat'].forEach((key) => {
        if (typeof effects[key] === 'number') this.state.boss[key] = clamp(this.state.boss[key] + effects[key]);
      });
      if (typeof effects.control === 'number') district.control = clamp(district.control + effects.control);
      if (typeof effects.police === 'number') district.police = clamp(district.police + effects.police);
      if (typeof effects.rival === 'number') district.rival = clamp(district.rival + effects.rival);
      this.state.actionCounts[actionId] = (this.state.actionCounts[actionId] || 0) + 1;
      const forceWeight = (this.state.actionCounts.show_force || 0) + (this.state.actionCounts.raid || 0) * 1.5;
      const socialWeight = (this.state.actionCounts.protect || 0) + (this.state.actionCounts.party || 0);
      this.state.boss.notoriety = clamp(18 + forceWeight * 4 + socialWeight * 2 + this.state.boss.influence * 0.18);
      this.log('action', `${action.title} in ${location.title}: ${this.describeEffects(effects)}.`);
      this.resolveInjury(effects.injuryRisk || 0, location);
      this.advanceTurn(effects.joinBoost || 0);
      return { ok: true, action, state: this.getSnapshot() };
    }

    describeEffects(effects) {
      const labels = { respect: 'Respekt', fear: 'Furcht', loyalty: 'Loyalität', influence: 'Einfluss', heat: 'Fahndung', control: 'Kontrolle', money: 'Geld' };
      return Object.entries(labels).filter(([key]) => typeof effects[key] === 'number' && effects[key] !== 0).slice(0, 4).map(([key, label]) => `${label} ${effects[key] > 0 ? '+' : ''}${effects[key]}`).join(', ');
    }

    resolveInjury(risk, location) {
      if (!risk || this.state.gang.length === 0) return;
      const mitigation = Math.min(0.12, this.getGangPower() / 500);
      if (this.random() < Math.max(0.03, risk - mitigation)) {
        const target = this.state.gang[Math.floor(this.random() * this.state.gang.length)];
        target.loyalty = clamp(target.loyalty - 5, 1, 100);
        target.injuredUntil = this.state.turn + 2;
        this.log('warning', `${target.name} wird beim Einsatz in ${location.title} verletzt und fällt kurzzeitig aus.`);
      }
    }

    advanceTurn(joinBoost = 0) {
      this.state.turn += 1;
      this.resolvePassiveIncome();
      this.resolveRivalMove();
      this.resolvePolicePressure();
      this.resolveRecruitment(joinBoost);
      this.resolveGangLoyalty();
      this.resolveRecovery();
    }

    resolvePassiveIncome() {
      let income = 0;
      this.data.world.locations.forEach((location) => {
        const district = this.state.districts[location.id];
        if (district.control >= 45) {
          const stability = 1 - district.unrest / 180;
          income += Math.round(location.income * (district.control / 100) * stability);
        }
      });
      if (income > 0) {
        this.state.resources.money += income;
        this.state.stats.totalIncome += income;
        this.log('income', `Gebietseinnahmen: +${income} € aus kontrollierten Bezirken.`);
      }
    }

    resolveRivalMove() {
      const candidates = this.data.world.locations.map((location) => ({ location, district: this.state.districts[location.id] })).filter(({ location }) => location.id !== this.data.world.startLocationId).sort((a, b) => (b.district.rival - b.district.control) - (a.district.rival - a.district.control));
      if (!candidates.length || this.random() > 0.76) return;
      const pick = candidates[Math.min(candidates.length - 1, Math.floor(this.random() * Math.min(3, candidates.length)))];
      const push = 3 + Math.floor(this.random() * 5);
      pick.district.rival = clamp(pick.district.rival + push);
      pick.district.control = clamp(pick.district.control - Math.max(1, Math.floor(push / 2)));
      pick.district.unrest = clamp(pick.district.unrest + 3);
      this.state.stats.rivalMoves += 1;
      this.log('rival', `Rivalen drücken in ${pick.location.title}: Kontrolle -${Math.max(1, Math.floor(push / 2))}.`);
    }

    resolvePolicePressure() {
      const heat = this.state.boss.heat;
      const location = this.getLocation();
      const district = this.getDistrict();
      const raidChance = Math.max(0, (heat - 48) / 150) + district.police / 650;
      if (this.random() < raidChance) {
        const moneyLoss = Math.min(this.state.resources.money, 55 + Math.floor(this.random() * 90));
        this.state.resources.money -= moneyLoss;
        if (this.state.resources.supplies > 0 && this.random() < 0.55) this.state.resources.supplies -= 1;
        district.control = clamp(district.control - 4);
        district.police = clamp(district.police + 5);
        this.state.boss.heat = clamp(this.state.boss.heat + 3);
        this.state.stats.policeRaids += 1;
        this.log('police', `Polizeidruck in ${location.title}: ${moneyLoss} € Verlust und Kontrolle -4.`);
      } else if (heat > 35) this.state.boss.heat = clamp(heat - 1);
    }

    resolveRecruitment(joinBoost) {
      if (this.state.gang.length >= 14) return;
      const boss = this.state.boss;
      const district = this.getDistrict();
      let chance = 0.035 + boss.respect * 0.00115 + boss.influence * 0.00085 + boss.loyalty * 0.00035;
      chance += district.control * 0.00045 + joinBoost;
      chance -= Math.max(0, boss.heat - 70) * 0.0014;
      chance = Math.min(0.42, Math.max(0.02, chance));
      if (this.random() >= chance) return;
      const pool = this.data.recruits.filter((candidate) => !this.state.usedRecruitNames.includes(candidate.name));
      if (!pool.length) return;
      const scored = pool.map((candidate) => {
        const affinityValue = candidate.affinity === 'money' ? Math.min(100, this.state.resources.money / 15) : candidate.affinity === 'heat' ? 100 - boss.heat : (boss[candidate.affinity] || 50);
        return { candidate, score: affinityValue + this.random() * 35 };
      }).sort((a, b) => b.score - a.score);
      const selected = deepClone(scored[0].candidate);
      selected.id = `recruit-${this.state.turn}-${this.state.gang.length + 1}`;
      selected.origin = this.getLocation().title;
      selected.loyalty = clamp(selected.loyalty + Math.round((boss.respect + boss.loyalty - 100) / 8), 30, 92);
      this.state.gang.push(selected);
      this.state.usedRecruitNames.push(selected.name);
      this.state.stats.recruitsJoined += 1;
      this.state.boss.influence = clamp(this.state.boss.influence + 2);
      this.log('recruit', `${selected.name} (${selected.role}) schließt sich der Gang in ${selected.origin} an.`);
    }

    resolveGangLoyalty() {
      const boss = this.state.boss;
      this.state.gang.forEach((member) => {
        let delta = 0;
        if (boss.loyalty > 70) delta += 1;
        if (boss.heat > 78) delta -= 1;
        if (boss.fear > 78 && boss.respect < 35) delta -= 1;
        member.loyalty = clamp(member.loyalty + delta, 1, 100);
      });
      if (this.state.gang.length > 3) {
        const deserter = this.state.gang.find((member) => member.loyalty < 24 && this.random() < 0.18);
        if (deserter) {
          this.state.gang = this.state.gang.filter((member) => member.id !== deserter.id);
          this.state.boss.loyalty = clamp(this.state.boss.loyalty - 4);
          this.log('warning', `${deserter.name} steigt aus. Die Crew registriert den Vertrauensverlust.`);
        }
      }
    }

    resolveRecovery() {
      this.state.gang.forEach((member) => {
        if (member.injuredUntil && this.state.turn >= member.injuredUntil) {
          delete member.injuredUntil;
          this.log('system', `${member.name} ist wieder einsatzbereit.`);
        }
      });
    }

    getGangPower() { return this.state.gang.reduce((sum, member) => sum + (member.injuredUntil ? Math.ceil(member.power / 2) : member.power), 0); }
    getBossProfile() {
      const b = this.state.boss;
      if (b.heat >= 78) return { title: 'Gejagter Boss', note: 'Viel Aufmerksamkeit. Jede laute Aktion kann teuer werden.' };
      if (b.respect >= 68 && b.loyalty >= 66) return { title: 'Straßenpatron', note: 'Die Leute folgen, weil Schutz und Nutzen sichtbar sind.' };
      if (b.fear >= 68 && b.respect < 55) return { title: 'Eiserne Hand', note: 'Kontrolle durch Furcht. Wirksam, aber brüchig.' };
      if (b.influence >= 67) return { title: 'Netzwerker', note: 'Kontakte und Zugang sind deine stärkste Waffe.' };
      if (b.notoriety >= 62) return { title: 'Stadtgespräch', note: 'Dein Name arbeitet inzwischen auch ohne dich.' };
      return { title: 'Aufsteigender Boss', note: 'Dein Stil ist noch nicht festgelegt. Taten formen das Profil.' };
    }
    getDominantStyle() {
      const b = this.state.boss;
      return [['Respekt', b.respect], ['Furcht', b.fear], ['Loyalität', b.loyalty], ['Einfluss', b.influence]].sort((a, b2) => b2[1] - a[1])[0][0];
    }
    getCitySummary() {
      const districts = Object.values(this.state.districts);
      return {
        avgControl: Math.round(districts.reduce((sum, d) => sum + d.control, 0) / districts.length),
        avgRival: Math.round(districts.reduce((sum, d) => sum + d.rival, 0) / districts.length),
        controlled: districts.filter((d) => d.control >= 55).length,
        total: districts.length
      };
    }
    log(type, text) { this.state.history.unshift({ turn: this.state.turn, type, text }); this.state.history = this.state.history.slice(0, 80); }
    exportState() { return JSON.stringify(this.state); }
    getSnapshot() { return deepClone(this.state); }
  }

  return { GameEngine, seededRandom, clamp };
});
