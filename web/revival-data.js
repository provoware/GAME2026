(function (root, factory) {
  const base = typeof module === 'object' && module.exports ? require('./data.js') : root.GAME_DATA;
  const data = factory(base);
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GAME_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (BASE) {
  'use strict';

  const missionTemplates = [
    { id:'mission.territory.push', category:'territory', title:'Der Ring kippt', icon:'◆', duration:8, targetKind:'owned_districts', increment:1, reward:{money:420,respect:5,influence:4}, description:'Sichere einen weiteren Bezirk dauerhaft für deine Gang.', chainTo:'mission.rival.break' },
    { id:'mission.rival.break', category:'conflict', title:'Druckpunkt', icon:'⚡', duration:7, targetKind:'combat_wins', increment:1, reward:{money:360,fear:4,respect:3}, description:'Gewinne einen taktischen Kampf gegen eine Rivalengruppe.' },
    { id:'mission.company.growth', category:'business', title:'Wachstumsschub', icon:'↗', duration:10, targetKind:'company_development', increment:8, reward:{money:500,influence:5,businessXp:30}, description:'Entwickle ein lokales Unternehmen sichtbar weiter.', chainTo:'mission.portfolio.value' },
    { id:'mission.portfolio.value', category:'business', title:'Kapital im Viertel', icon:'€', duration:12, targetKind:'portfolio_value', increment:600, reward:{money:300,influence:4,businessXp:35}, description:'Steigere den Wert deiner lokalen Beteiligungen.' },
    { id:'mission.crew.skill', category:'crew', title:'Eine Person wächst', icon:'+', duration:9, targetKind:'member_skill', increment:1, reward:{money:220,loyalty:4,respect:2}, description:'Bringe einen Crew-Skill durch reale Praxis auf die nächste Stufe.', chainTo:'mission.crew.autonomy' },
    { id:'mission.crew.autonomy', category:'crew', title:'Verantwortung abgeben', icon:'▦', duration:8, targetKind:'autonomous_cycles', increment:5, reward:{money:260,loyalty:5,influence:2}, description:'Lass Daueraufträge mehrere Zyklen selbstständig arbeiten.' },
    { id:'mission.network.cover', category:'network', title:'Tiefe Verbindungen', icon:'M', duration:10, targetKind:'moles', increment:1, reward:{money:280,influence:5,stealthXp:30}, description:'Baue das institutionelle Informationsnetz aus.' },
    { id:'mission.travel.web', category:'city', title:'Stadt in Bewegung', icon:'⇢', duration:8, targetKind:'travels', increment:2, reward:{money:180,respect:2,drivingXp:30}, description:'Nutze die Stadtverbindungen und reise mehrfach zwischen Bezirken.' }
  ];

  const cityEvents = [
    { id:'event.market.boom', title:'Marktboom', icon:'↗', duration:3, tone:'positive', description:'Lokale Unternehmen profitieren kurzfristig von hoher Nachfrage.', effects:{marketMomentum:2,opportunity:12} },
    { id:'event.police.sweep', title:'Großkontrolle', icon:'◇', duration:3, tone:'danger', description:'Die Polizeipräsenz steigt in einem Bezirk deutlich.', effects:{police:9,tension:12} },
    { id:'event.blackout', title:'Stromausfall', icon:'◐', duration:2, tone:'warning', description:'Unruhe steigt, Aufklärung fällt und verdeckte Aktionen werden leichter.', effects:{unrest:10,intel:-1,tension:9} },
    { id:'event.neon.festival', title:'Neonfestival', icon:'✦', duration:3, tone:'positive', description:'Nachtleben, Rekrutierung und lokaler Umsatz ziehen an.', effects:{control:3,recruitBoost:.05,opportunity:10} },
    { id:'event.transit.strike', title:'Bahnstreik', icon:'⇥', duration:2, tone:'warning', description:'Fernreisen werden vorübergehend teurer.', effects:{travelCost:25,tension:5} },
    { id:'event.rival.feud', title:'Rivalenfehde', icon:'⚡', duration:4, tone:'danger', description:'Zwei Rivalengruppen geraten offen aneinander.', effects:{relation:-18,tension:16} },
    { id:'event.calm.window', title:'Ruhiges Fenster', icon:'○', duration:2, tone:'positive', description:'Fahndungsdruck sinkt und Expansion wird kurzfristig einfacher.', effects:{heat:-4,opportunity:8} }
  ];

  const milestones = [
    { id:'milestone.first_ring', title:'Erster Ring', targetKind:'owned_districts', target:3, reward:{money:500,respect:4} },
    { id:'milestone.city_network', title:'Stadtnetz', targetKind:'autonomous_cycles', target:20, reward:{money:450,loyalty:4} },
    { id:'milestone.investor', title:'Lokaler Investor', targetKind:'portfolio_value', target:2500, reward:{money:600,influence:5} },
    { id:'milestone.director', title:'Auftragsdirektor', targetKind:'missions_completed', target:8, reward:{money:800,respect:5,influence:5} },
    { id:'milestone.legend', title:'Stadtlegende', targetKind:'prestige', target:520, reward:{money:1200,respect:8,influence:8} }
  ];

  return Object.freeze({
    ...BASE,
    version:'0.10.1-living-city-04a',
    schema:5,
    world:{...BASE.world,id:'world.berlin_bunker_ring.living_city_04'},
    missionTemplates,
    cityEvents,
    milestones
  });
});
