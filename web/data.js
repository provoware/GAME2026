(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GAME_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const locations = [
    { id:'location.bunker.main', title:'Hauptbunker', short:'Bunker', kind:'base', x:500, y:365, risk:12, income:22, police:8, rival:4, description:'Kommandozentrale, Lager und Rückzugsraum. Hier ist deine Macht am stabilsten.' },
    { id:'location.tunnel.west', title:'Westtunnel', short:'Westtunnel', kind:'transit', x:275, y:360, risk:28, income:15, police:16, rival:30, description:'Verdeckte Wege für Leute und Ware. Kontrolle bringt Bewegungsfreiheit.' },
    { id:'location.market.black', title:'Schwarzmarkt', short:'Markt', kind:'market', x:165, y:175, risk:43, income:58, police:32, rival:48, description:'Hoher Umsatz, viele Kontakte und noch mehr Augen.' },
    { id:'location.station.ghost', title:'Geisterbahnhof', short:'Bahnhof', kind:'transit', x:430, y:100, risk:52, income:27, police:39, rival:56, description:'Tote Bahnsteige, verdeckte Zugänge und umkämpfte Routen.' },
    { id:'location.archive.sublevel', title:'Unterarchiv', short:'Archiv', kind:'archive', x:725, y:145, risk:36, income:30, police:47, rival:26, description:'Information wird hier zur härtesten Währung.' },
    { id:'location.neon.cellar_club', title:'Neon-Kellerclub', short:'Neonclub', kind:'club', x:790, y:385, risk:46, income:52, police:29, rival:39, description:'Nachtleben, Kontakte, Gerüchte und spontane Rekrutierung.' },
    { id:'location.yard.freight', title:'Frachtbahnhof', short:'Frachthof', kind:'industrial', x:625, y:605, risk:58, income:67, police:44, rival:62, description:'Logistik, Container und große Margen. Entsprechend hart umkämpft.' },
    { id:'location.blocks.east', title:'Ostblöcke', short:'Ostblöcke', kind:'residential', x:885, y:580, risk:41, income:38, police:35, rival:49, description:'Einwohner reagieren stärker auf Schutz und Loyalität als auf rohe Furcht.' },
    { id:'location.rooftops.north', title:'Norddächer', short:'Norddächer', kind:'lookout', x:650, y:35, risk:32, income:18, police:24, rival:22, description:'Aufklärung, Funklinien und Übersicht über den ganzen Ring.' }
  ];

  return Object.freeze({
    version:'0.8.0-living-city-02',
    schema:3,
    world:{
      id:'world.berlin_bunker_ring.living_city_02',
      title:'Bunker-Ring / Stadtsektor 9909',
      startLocationId:'location.bunker.main',
      locations,
      connections:[
        ['location.bunker.main','location.tunnel.west'],
        ['location.tunnel.west','location.market.black'],
        ['location.market.black','location.station.ghost'],
        ['location.station.ghost','location.archive.sublevel'],
        ['location.archive.sublevel','location.neon.cellar_club'],
        ['location.neon.cellar_club','location.bunker.main'],
        ['location.bunker.main','location.yard.freight'],
        ['location.yard.freight','location.neon.cellar_club'],
        ['location.yard.freight','location.blocks.east'],
        ['location.blocks.east','location.neon.cellar_club'],
        ['location.station.ghost','location.rooftops.north'],
        ['location.rooftops.north','location.archive.sublevel']
      ]
    },
    actions:[
      { id:'deal', category:'business', title:'Geschäft drehen', icon:'€', tone:'money', description:'Schneller lokaler Umsatz. Solide Marge, etwas mehr Aufmerksamkeit.', cost:{}, effects:{money:175,respect:2,influence:3,heat:4,control:2,rival:2} },
      { id:'protection_contract', category:'business', title:'Schutzvertrag', icon:'▣', tone:'money', description:'Regelmäßige Absprachen mit lokalen Läden. Baut Kontrolle und Ertrag auf.', cost:{money:55}, effects:{money:135,respect:4,loyalty:2,influence:2,heat:2,control:4,rival:-2} },
      { id:'redirect_delivery', category:'business', title:'Lieferung umleiten', icon:'⇢', tone:'money', description:'Logistik nutzen. Hoher Ertrag, aber Risiko steigt.', cost:{supplies:1}, effects:{money:245,influence:3,heat:7,unrest:3,rival:4} },
      { id:'city_event', category:'business', title:'Großes Event', icon:'✦', tone:'social', description:'Publikum, Kontakte und Umsatz. Besonders stark im Nachtleben.', cost:{money:150}, effects:{money:90,respect:6,loyalty:4,influence:5,heat:3,control:3,joinBoost:.16} },
      { id:'asset_push', category:'business', title:'Betriebe pushen', icon:'↗', tone:'money', description:'Eigene Objekte für einen Zug maximal auslasten.', requiresProperty:true, cost:{money:90}, effects:{influence:2,heat:2,propertyBoost:.25} },
      { id:'protect', category:'influence', title:'Viertel schützen', icon:'◆', tone:'social', description:'Schutz statt Druck. Steigert Respekt, Loyalität und Stabilität.', cost:{money:85}, effects:{respect:7,fear:-2,loyalty:5,influence:3,heat:-1,control:6,police:-3,rival:-3,unrest:-5} },
      { id:'party', category:'influence', title:'Straßenabend', icon:'♫', tone:'social', description:'Präsenz zeigen und neue Leute anziehen.', cost:{money:120}, effects:{respect:5,loyalty:4,influence:4,heat:2,joinBoost:.20,control:3} },
      { id:'intel', category:'influence', title:'Gerüchte kaufen', icon:'◉', tone:'stealth', description:'Aufklärung verbessert Kämpfe und zeigt Rivalenbewegungen früher.', cost:{money:95}, effects:{influence:3,heat:-1,intel:2} },
      { id:'bribe', category:'influence', title:'Druck rausnehmen', icon:'◇', tone:'stealth', description:'Lokale Kontakte senken Polizei- und Fahndungsdruck.', cost:{money:155}, effects:{influence:4,heat:-10,police:-12,respect:-1} },
      { id:'lay_low', category:'influence', title:'Untertauchen', icon:'○', tone:'stealth', description:'Fahndung fällt stark, aber Rivalen bekommen Raum.', cost:{money:45}, effects:{heat:-14,police:-5,rival:5,loyalty:-1,control:-1} },
      { id:'show_force', category:'conflict', title:'Stärke zeigen', icon:'▲', tone:'force', description:'Druck ohne offenen Kampf.', cost:{supplies:1}, effects:{fear:8,respect:1,influence:3,heat:7,control:7,police:4,rival:-5} },
      { id:'sabotage', category:'conflict', title:'Rivalen sabotieren', icon:'⚙', tone:'force', description:'Schwächt Rivalen vor einer Übernahme.', cost:{money:90,supplies:1}, effects:{fear:4,influence:3,heat:7,rival:-10,unrest:5,intel:1} },
      { id:'raid', category:'conflict', title:'Gebiet angreifen', icon:'⚡', tone:'force', description:'Startet einen taktischen Kampf um Einfluss oder Bezirksübernahme.', cost:{supplies:2}, effects:{fear:5,respect:1,heat:10}, combat:{baseReward:180,maxCrew:4} }
    ],
    properties:[
      { id:'hotel', title:'Hotel', icon:'H', kinds:['market','club','residential'], baseCost:1150, baseIncome:115, upkeep:28, maxLevel:3, influence:4, security:2, description:'Teuer, aber starkes Prestige und stabiler Cashflow.' },
      { id:'warehouse', title:'Lagerhaus', icon:'L', kinds:['industrial','transit','market'], baseCost:760, baseIncome:88, upkeep:20, maxLevel:3, supplyChance:.22, security:3, description:'Logistik, Vorräte und gute Skalierung.' },
      { id:'club_share', title:'Clubbeteiligung', icon:'C', kinds:['club','market'], baseCost:880, baseIncome:102, upkeep:25, maxLevel:3, joinBoost:.05, influence:3, description:'Cashflow plus höhere Rekrutierungschance.' },
      { id:'workshop', title:'Werkstatt', icon:'W', kinds:['industrial','transit'], baseCost:680, baseIncome:72, upkeep:18, maxLevel:3, recoveryBonus:1, security:4, description:'Mäßiger Ertrag, starke operative Vorteile.' },
      { id:'late_shop', title:'Spätkauf', icon:'S', kinds:['residential','market','club'], baseCost:440, baseIncome:52, upkeep:12, maxLevel:3, respect:2, description:'Günstiger Einstieg mit verlässlichem Klein-Cashflow.' },
      { id:'radio_hub', title:'Funkzentrale', icon:'F', kinds:['lookout','archive','base'], baseCost:720, baseIncome:55, upkeep:16, maxLevel:3, intel:1, influence:4, description:'Weniger Geld, dafür starke Aufklärung und Einfluss.' },
      { id:'block_share', title:'Wohnblock-Anteil', icon:'B', kinds:['residential'], baseCost:980, baseIncome:96, upkeep:22, maxLevel:3, loyalty:4, respect:3, security:2, description:'Stabiler Ertrag und sozialer Rückhalt.' }
    ],
    rivalGangs:[
      { id:'rival.red_knives', name:'Rote Klingen', short:'Klingen', color:'#ff5964', strategy:'aggressive', aggression:82, economy:44, stealth:36, power:68, wealth:620, home:'location.yard.freight', description:'Drückt früh in schwache Bezirke und sucht direkte Übernahmen.' },
      { id:'rival.grey_union', name:'Graue Union', short:'Union', color:'#a4adb8', strategy:'economic', aggression:46, economy:86, stealth:58, power:58, wealth:980, home:'location.market.black', description:'Baut Geld und Einfluss auf und greift profitable Bezirke gezielt an.' },
      { id:'rival.neon_ghosts', name:'Neon-Geister', short:'Geister', color:'#6ee7ff', strategy:'stealth', aggression:55, economy:52, stealth:90, power:54, wealth:720, home:'location.station.ghost', description:'Arbeitet verdeckt, erhöht Unruhe und schwächt Aufklärung.' }
    ],
    recruits:[
      { name:'Mika „Kabel“', role:'Aufklärer', trait:'Beobachter', power:3, loyalty:62, affinity:'influence' },
      { name:'Raya „Null“', role:'Fahrerin', trait:'Nervenstark', power:4, loyalty:58, affinity:'respect' },
      { name:'Tarek „Brett“', role:'Vollstrecker', trait:'Einschüchternd', power:6, loyalty:48, affinity:'fear' },
      { name:'Lio „Echo“', role:'Vermittler', trait:'Gerüchteküche', power:3, loyalty:66, affinity:'respect' },
      { name:'Nika „Raster“', role:'Planerin', trait:'Kalt gerechnet', power:5, loyalty:55, affinity:'influence' },
      { name:'Sam „Kasse“', role:'Geschäftsmann', trait:'Ertragreich', power:2, loyalty:60, affinity:'money' },
      { name:'Yun „Flimmer“', role:'Scout', trait:'Unsichtbar', power:3, loyalty:63, affinity:'heat' },
      { name:'Ari „Mauer“', role:'Beschützer', trait:'Standhaft', power:5, loyalty:72, affinity:'loyalty' },
      { name:'Cem „Zünder“', role:'Vollstrecker', trait:'Explosiv', power:7, loyalty:42, affinity:'fear' },
      { name:'Jona „Funk“', role:'Netzwerker', trait:'Verbindungen', power:3, loyalty:64, affinity:'influence' }
    ],
    starterGang:[
      { id:'starter-1', name:'Kasi', role:'Rechte Hand', trait:'Loyal', power:6, loyalty:78, origin:'Hauptbunker' },
      { id:'starter-2', name:'Vex', role:'Scout', trait:'Wachsam', power:4, loyalty:70, origin:'Westtunnel' },
      { id:'starter-3', name:'Mara', role:'Organisator', trait:'Pragmatisch', power:4, loyalty:74, origin:'Schwarzmarkt' }
    ]
  });
});
