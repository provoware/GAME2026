(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GAME_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const locations = [
    { id:'location.bunker.main', title:'Hauptbunker', short:'Bunker', kind:'base', x:500, y:365, risk:12, income:22, police:8, rival:4, description:'Kommandozentrale, Lager und Rückzugsraum. Hier ist deine Macht am stabilsten.' },
    { id:'location.tunnel.west', title:'Westtunnel', short:'Westtunnel', kind:'transit', x:275, y:360, risk:28, income:15, police:16, rival:30, description:'Verdeckte Wege für Leute und Ware. Kontrolle bringt Bewegungsfreiheit.' },
    { id:'location.market.black', title:'Schwarzmarkt', short:'Markt', kind:'market', x:165, y:175, risk:43, income:58, police:32, rival:48, description:'Hoher Umsatz, viele Kontakte, Bankterminal und der Eisenladen.' },
    { id:'location.station.ghost', title:'Geisterbahnhof', short:'Bahnhof', kind:'station', x:430, y:100, risk:52, income:27, police:39, rival:56, description:'Knotenpunkt für Reisen in entfernte Stadtteile und verdeckte Routen.' },
    { id:'location.archive.sublevel', title:'Unterarchiv', short:'Archiv', kind:'archive', x:725, y:145, risk:36, income:30, police:47, rival:26, description:'Information wird hier zur härtesten Währung.' },
    { id:'location.neon.cellar_club', title:'Neon-Kellerclub', short:'Neonclub', kind:'club', x:790, y:385, risk:46, income:52, police:29, rival:39, description:'Nachtleben, Kontakte, Gerüchte und spontane Rekrutierung.' },
    { id:'location.yard.freight', title:'Frachtbahnhof', short:'Frachthof', kind:'industrial', x:625, y:605, risk:58, income:67, police:44, rival:62, description:'Logistik, Container und große Margen. Entsprechend hart umkämpft.' },
    { id:'location.blocks.east', title:'Ostblöcke', short:'Ostblöcke', kind:'residential', x:885, y:580, risk:41, income:38, police:35, rival:49, description:'Einwohner reagieren stärker auf Schutz und Loyalität als auf rohe Furcht. Hier trainieren mehrere Kampfsportschulen.' },
    { id:'location.rooftops.north', title:'Norddächer', short:'Norddächer', kind:'lookout', x:650, y:35, risk:32, income:18, police:24, rival:22, description:'Aufklärung, Funklinien und Übersicht über den ganzen Ring.' },
    { id:'location.casino.9909', title:'Casino 9909', short:'Casino', kind:'casino', x:930, y:260, risk:38, income:64, police:30, rival:35, description:'Pokerraum, mehrere Automaten und ein stark schwankender Geldstrom.' },
    { id:'location.harbor.south', title:'Südhafen', short:'Südhafen', kind:'harbor', x:330, y:630, risk:61, income:74, police:48, rival:60, description:'Entfernter Hafenbezirk. Per Bahn schnell erreichbar und wirtschaftlich wertvoll.' },
    { id:'location.oldtown.central', title:'Altstadt', short:'Altstadt', kind:'commercial', x:80, y:465, risk:34, income:61, police:52, rival:33, description:'Banken, Hotels, lokale Unternehmen und hoher ziviler Verkehr.' }
  ];

  return Object.freeze({
    version:'0.9.0-living-city-03',
    schema:4,
    world:{
      id:'world.berlin_bunker_ring.living_city_03',
      title:'Bunker-Ring / Stadtsektor 9909',
      startLocationId:'location.bunker.main',
      locations,
      connections:[
        ['location.bunker.main','location.tunnel.west'],['location.tunnel.west','location.market.black'],['location.market.black','location.station.ghost'],
        ['location.station.ghost','location.archive.sublevel'],['location.archive.sublevel','location.neon.cellar_club'],['location.neon.cellar_club','location.bunker.main'],
        ['location.bunker.main','location.yard.freight'],['location.yard.freight','location.neon.cellar_club'],['location.yard.freight','location.blocks.east'],
        ['location.blocks.east','location.neon.cellar_club'],['location.station.ghost','location.rooftops.north'],['location.rooftops.north','location.archive.sublevel'],
        ['location.neon.cellar_club','location.casino.9909'],['location.market.black','location.oldtown.central'],['location.tunnel.west','location.oldtown.central'],
        ['location.yard.freight','location.harbor.south']
      ],
      trainRoutes:[
        { from:'location.station.ghost', to:'location.harbor.south', title:'Linie S – Südhafen', cost:45, duration:1 },
        { from:'location.station.ghost', to:'location.oldtown.central', title:'Linie A – Altstadt', cost:35, duration:1 },
        { from:'location.station.ghost', to:'location.casino.9909', title:'Nachtlinie 9 – Casino', cost:55, duration:1 },
        { from:'location.station.ghost', to:'location.yard.freight', title:'Güterlinie – Frachthof', cost:30, duration:1 }
      ]
    },
    actions:[
      { id:'deal', category:'business', title:'Geschäft drehen', icon:'€', tone:'money', description:'Schneller lokaler Umsatz. Solide Marge, etwas mehr Aufmerksamkeit.', cost:{}, effects:{money:175,respect:2,influence:3,heat:4,control:2,rival:2}, skillXp:{business:12,social:5} },
      { id:'protection_contract', category:'business', title:'Schutzvertrag', icon:'▣', tone:'money', description:'Regelmäßige Absprachen mit lokalen Läden. Baut Kontrolle und Ertrag auf.', cost:{money:55}, effects:{money:135,respect:4,loyalty:2,influence:2,heat:2,control:4,rival:-2}, skillXp:{business:9,social:8} },
      { id:'redirect_delivery', category:'business', title:'Lieferung umleiten', icon:'⇢', tone:'money', description:'Abstrakte Logistikaktion im Spiel. Hoher Ertrag, höheres Risiko.', cost:{supplies:1}, effects:{money:245,influence:3,heat:7,unrest:3,rival:4}, skillXp:{driving:12,business:8,stealth:5} },
      { id:'city_event', category:'business', title:'Großes Event', icon:'✦', tone:'social', description:'Publikum, Kontakte und Umsatz. Besonders stark im Nachtleben.', cost:{money:150}, effects:{money:90,respect:6,loyalty:4,influence:5,heat:3,control:3,joinBoost:.16}, skillXp:{social:14,business:6} },
      { id:'asset_push', category:'business', title:'Betriebe pushen', icon:'↗', tone:'money', description:'Eigene Objekte für einen Zug maximal auslasten.', requiresProperty:true, cost:{money:90}, effects:{influence:2,heat:2,propertyBoost:.25}, skillXp:{business:15,analysis:5} },
      { id:'protect', category:'influence', title:'Viertel schützen', icon:'◆', tone:'social', description:'Schutz statt Druck. Steigert Respekt, Loyalität und Stabilität.', cost:{money:85}, effects:{respect:7,fear:-2,loyalty:5,influence:3,heat:-1,control:6,police:-3,rival:-3,unrest:-5}, skillXp:{social:10,combat:5} },
      { id:'party', category:'influence', title:'Straßenabend', icon:'♫', tone:'social', description:'Präsenz zeigen und neue Leute anziehen.', cost:{money:120}, effects:{respect:5,loyalty:4,influence:4,heat:2,joinBoost:.20,control:3}, skillXp:{social:15} },
      { id:'intel', category:'influence', title:'Gerüchte kaufen', icon:'◉', tone:'stealth', description:'Aufklärung verbessert Kämpfe und zeigt Rivalenbewegungen früher.', cost:{money:95}, effects:{influence:3,heat:-1,intel:2}, skillXp:{analysis:14,stealth:6} },
      { id:'bribe', category:'influence', title:'Druck rausnehmen', icon:'◇', tone:'stealth', description:'Abstrakte Kontaktaktion: lokale Polizei- und Fahndungswerte sinken.', cost:{money:155}, effects:{influence:4,heat:-10,police:-12,respect:-1}, skillXp:{social:8,stealth:7} },
      { id:'lay_low', category:'influence', title:'Untertauchen', icon:'○', tone:'stealth', description:'Fahndung fällt stark, aber Rivalen bekommen Raum.', cost:{money:45}, effects:{heat:-14,police:-5,rival:5,loyalty:-1,control:-1}, skillXp:{stealth:12} },
      { id:'show_force', category:'conflict', title:'Stärke zeigen', icon:'▲', tone:'force', description:'Druck ohne offenen Kampf.', cost:{supplies:1}, effects:{fear:8,respect:1,influence:3,heat:7,control:7,police:4,rival:-5}, skillXp:{combat:10,social:4} },
      { id:'sabotage', category:'conflict', title:'Rivalen sabotieren', icon:'⚙', tone:'force', description:'Abstrakte Spielaktion: Rivalen werden geschwächt, Unruhe steigt.', cost:{money:90,supplies:1}, effects:{fear:4,influence:3,heat:7,rival:-10,unrest:5,intel:1}, skillXp:{stealth:12,analysis:8} },
      { id:'raid', category:'conflict', title:'Gebiet angreifen', icon:'⚡', tone:'force', description:'Startet einen taktischen Kampf um Einfluss oder Bezirksübernahme.', cost:{supplies:2}, effects:{fear:5,respect:1,heat:10}, combat:{baseReward:180,maxCrew:4}, skillXp:{combat:15,analysis:6} }
    ],
    properties:[
      { id:'hotel', title:'Hotel', icon:'H', kinds:['market','club','residential','commercial','casino'], baseCost:1150, baseIncome:115, upkeep:28, maxLevel:3, influence:4, security:2, description:'Teuer, aber starkes Prestige und stabiler Cashflow.' },
      { id:'warehouse', title:'Lagerhaus', icon:'L', kinds:['industrial','station','market','harbor'], baseCost:760, baseIncome:88, upkeep:20, maxLevel:3, supplyChance:.22, security:3, description:'Logistik, Vorräte und gute Skalierung.' },
      { id:'club_share', title:'Clubbeteiligung', icon:'C', kinds:['club','market','casino'], baseCost:880, baseIncome:102, upkeep:25, maxLevel:3, joinBoost:.05, influence:3, description:'Cashflow plus höhere Rekrutierungschance.' },
      { id:'workshop', title:'Werkstatt', icon:'W', kinds:['industrial','station','harbor'], baseCost:680, baseIncome:72, upkeep:18, maxLevel:3, recoveryBonus:1, security:4, description:'Mäßiger Ertrag, starke operative Vorteile.' },
      { id:'late_shop', title:'Spätkauf', icon:'S', kinds:['residential','market','club','commercial'], baseCost:440, baseIncome:52, upkeep:12, maxLevel:3, respect:2, description:'Günstiger Einstieg mit verlässlichem Klein-Cashflow.' },
      { id:'radio_hub', title:'Funkzentrale', icon:'F', kinds:['lookout','archive','base'], baseCost:720, baseIncome:55, upkeep:16, maxLevel:3, intel:1, influence:4, description:'Weniger Geld, dafür starke Aufklärung und Einfluss.' },
      { id:'block_share', title:'Wohnblock-Anteil', icon:'B', kinds:['residential'], baseCost:980, baseIncome:96, upkeep:22, maxLevel:3, loyalty:4, respect:3, security:2, description:'Stabiler Ertrag und sozialer Rückhalt.' }
    ],
    rivalGangs:[
      { id:'rival.red_knives', name:'Rote Klingen', short:'Klingen', color:'#ff5964', strategy:'aggressive', aggression:82, economy:44, stealth:36, power:68, wealth:620, home:'location.yard.freight', description:'Drückt früh in schwache Bezirke und sucht direkte Übernahmen.' },
      { id:'rival.grey_union', name:'Graue Union', short:'Union', color:'#a4adb8', strategy:'economic', aggression:46, economy:86, stealth:58, power:58, wealth:980, home:'location.market.black', description:'Baut Geld und Einfluss auf und greift profitable Bezirke gezielt an.' },
      { id:'rival.neon_ghosts', name:'Neon-Geister', short:'Geister', color:'#6ee7ff', strategy:'stealth', aggression:55, economy:52, stealth:90, power:54, wealth:720, home:'location.station.ghost', description:'Arbeitet verdeckt, erhöht Unruhe und schwächt Aufklärung.' }
    ],
    institutions:[
      { id:'institution.police', title:'Polizeidienststelle', icon:'P', difficulty:74, benefit:'Senkt lokalen Polizeidruck und meldet Zugriffe früher.', effect:'police' },
      { id:'institution.city', title:'Bezirksverwaltung', icon:'V', difficulty:62, benefit:'Erhöht Einfluss und hilft bei Bezirkskontrolle.', effect:'influence' },
      { id:'institution.bank', title:'Lokale Bank', icon:'€', difficulty:70, benefit:'Verbessert Marktinformationen und reduziert Handelsgebühren.', effect:'market' },
      { id:'institution.station', title:'Bahnverwaltung', icon:'B', difficulty:52, benefit:'Vergünstigt Fahrten und liefert Routeninformationen.', effect:'travel' },
      { id:'institution.clinic', title:'Klinikverbund', icon:'+', difficulty:58, benefit:'Beschleunigt die Erholung verletzter Crew.', effect:'recovery' },
      { id:'institution.port', title:'Hafenlogistik', icon:'H', difficulty:66, benefit:'Verbessert Einnahmen im Südhafen und Frachtbezirk.', effect:'logistics' }
    ],
    companies:[
      { id:'company.neonworks', symbol:'NEON', name:'Neonwerk Events', sector:'Nachtleben', locationId:'location.neon.cellar_club', basePrice:42, baseRevenue:110, volatility:.14, dividendRate:.035 },
      { id:'company.freight9', symbol:'F9', name:'Fracht 9 Logistik', sector:'Logistik', locationId:'location.yard.freight', basePrice:58, baseRevenue:145, volatility:.11, dividendRate:.045 },
      { id:'company.altstadt', symbol:'ALT', name:'Altstadt Hotels', sector:'Hotels', locationId:'location.oldtown.central', basePrice:76, baseRevenue:165, volatility:.08, dividendRate:.05 },
      { id:'company.bunkertech', symbol:'BTECH', name:'Bunker Technik', sector:'Technik', locationId:'location.bunker.main', basePrice:34, baseRevenue:90, volatility:.12, dividendRate:.025 },
      { id:'company.hafenring', symbol:'HRG', name:'Hafenring Handel', sector:'Handel', locationId:'location.harbor.south', basePrice:64, baseRevenue:155, volatility:.16, dividendRate:.04 },
      { id:'company.casino9', symbol:'C9', name:'Casino 9909 AG', sector:'Freizeit', locationId:'location.casino.9909', basePrice:51, baseRevenue:130, volatility:.20, dividendRate:.03 },
      { id:'company.ostblock', symbol:'OST', name:'Ostblock Wohnen', sector:'Immobilien', locationId:'location.blocks.east', basePrice:69, baseRevenue:150, volatility:.07, dividendRate:.055 }
    ],
    autonomousTasks:[
      { id:'task.manage_asset', title:'Betrieb führen', icon:'▦', skill:'business', targetType:'asset', description:'Verwaltet dauerhaft einen eigenen Betrieb und verbessert dessen Ertrag.' },
      { id:'task.scout', title:'Bezirk auskundschaften', icon:'◉', skill:'analysis', targetType:'location', description:'Baut dauerhaft Aufklärung im Zielbezirk auf.' },
      { id:'task.recruit', title:'Leute anwerben', icon:'+', skill:'social', targetType:'location', description:'Pflegt Kontakte und erhöht die Chance auf neue Crew.' },
      { id:'task.security', title:'Gebiet sichern', icon:'◆', skill:'combat', targetType:'location', description:'Stabilisiert Kontrolle und senkt Unruhe.' },
      { id:'task.market', title:'Markt beobachten', icon:'↗', skill:'analysis', targetType:'company', description:'Sammelt Kurswissen und verbessert Bank-/Marktinformationen.' },
      { id:'task.mole_handler', title:'Maulwurf führen', icon:'M', skill:'stealth', targetType:'institution', description:'Stützt einen vorhandenen Maulwurf und reduziert sein Entdeckungsrisiko.' },
      { id:'task.driver', title:'Fahrdienst', icon:'⇢', skill:'driving', targetType:'location', description:'Hält Routen offen und verbessert Reiseoptionen.' },
      { id:'task.rest', title:'Erholen', icon:'○', skill:'endurance', targetType:'none', description:'Senkt Stress und unterstützt Erholung.' }
    ],
    gear:[
      { id:'gear.vest', title:'Schutzweste', type:'protection', cost:260, combatBonus:1, defenseBonus:3, description:'Spielausrüstung mit zusätzlichem Schutzwert.' },
      { id:'gear.helmet', title:'Einsatzhelm', type:'protection', cost:180, combatBonus:0, defenseBonus:2, description:'Reduziert im Spiel das Verletzungsrisiko.' },
      { id:'gear.gloves', title:'Schutzhandschuhe', type:'protection', cost:90, combatBonus:0, defenseBonus:1, description:'Kleine defensive Verstärkung.' },
      { id:'gear.radio', title:'Taktikfunk', type:'utility', cost:210, analysisBonus:2, description:'Verbessert Koordination und Analyse im Kampf.' },
      { id:'gear.training_kit', title:'Trainingsset', type:'training', cost:150, combatBonus:1, description:'Spielgegenstand für effizienteres Training.' }
    ],
    martialArts:[
      { id:'art.boxing', title:'Boxen', cost:180, skillXp:{combat:35,endurance:18}, powerBonus:1 },
      { id:'art.judo', title:'Judo', cost:210, skillXp:{combat:28,analysis:18,endurance:12}, powerBonus:1 },
      { id:'art.muaythai', title:'Muay Thai', cost:240, skillXp:{combat:40,endurance:20}, powerBonus:1 },
      { id:'art.bjj', title:'BJJ', cost:230, skillXp:{combat:32,analysis:22}, powerBonus:1 },
      { id:'art.krav', title:'Krav Maga', cost:270, skillXp:{combat:38,analysis:16,stealth:8}, powerBonus:1 }
    ],
    casino:{
      slotMachines:[
        { id:'slot.neon7', title:'Neon 7', minBet:5, maxBet:50, symbols:['7','★','BAR','◇','●'], volatility:'mittel' },
        { id:'slot.bunker', title:'Bunker Bell', minBet:10, maxBet:100, symbols:['B','⚡','9','K','●'], volatility:'hoch' },
        { id:'slot.gold', title:'Goldgrube', minBet:20, maxBet:200, symbols:['€','7','★','G','◇'], volatility:'sehr hoch' }
      ]
    },
    streetOperations:[
      { id:'street.night_staff', title:'Nachtpersonal-Netz', kind:'recurring', cost:220, income:52, heat:3, risk:.10, description:'Abstrakte Stadtspiel-Operation mit laufendem Einkommen und hohem sozialen Risiko.' },
      { id:'street.herbal_market', title:'Kräutermarkt-Netz', kind:'recurring', cost:260, income:70, heat:7, risk:.16, description:'Fiktive Spieloperation: höhere Einnahmen, deutlich höherer Fahndungsdruck.' },
      { id:'street.rival_contract', title:'Rivalen-Spezialauftrag', kind:'mission', cost:480, income:0, heat:14, risk:.28, description:'Rein fiktiver Auftrag gegen eine Rivalenfigur im Spiel; keine reale Handlungsanleitung.' }
    ],
    recruits:[
      { name:'Mika „Kabel“', role:'Aufklärer', trait:'Beobachter', power:3, loyalty:62, affinity:'influence', age:29, bio:'Ruhiger Beobachter mit Hang zu Technik und langen Nächten.', skills:{combat:3,stealth:6,business:3,social:4,analysis:7,driving:3,endurance:4} },
      { name:'Raya „Null“', role:'Fahrerin', trait:'Nervenstark', power:4, loyalty:58, affinity:'respect', age:31, bio:'Schnelle Entscheidungen, gute Routenkenntnis, wenig Geduld für Chaos.', skills:{combat:4,stealth:5,business:3,social:3,analysis:5,driving:8,endurance:5} },
      { name:'Tarek „Brett“', role:'Vollstrecker', trait:'Einschüchternd', power:6, loyalty:48, affinity:'fear', age:34, bio:'Direkter Problemlöser mit hoher physischer Präsenz.', skills:{combat:8,stealth:2,business:2,social:4,analysis:3,driving:3,endurance:7} },
      { name:'Lio „Echo“', role:'Vermittler', trait:'Gerüchteküche', power:3, loyalty:66, affinity:'respect', age:27, bio:'Kennt Menschen, Geschichten und die halbe Nachtökonomie.', skills:{combat:2,stealth:4,business:5,social:8,analysis:6,driving:2,endurance:4} },
      { name:'Nika „Raster“', role:'Planerin', trait:'Kalt gerechnet', power:5, loyalty:55, affinity:'influence', age:32, bio:'Zerlegt Probleme in Zahlen und lässt sich selten überraschen.', skills:{combat:4,stealth:5,business:7,social:4,analysis:9,driving:3,endurance:4} },
      { name:'Sam „Kasse“', role:'Geschäftsmann', trait:'Ertragreich', power:2, loyalty:60, affinity:'money', age:38, bio:'Denkt in Margen, Beteiligungen und wiederkehrenden Einnahmen.', skills:{combat:2,stealth:3,business:9,social:6,analysis:7,driving:2,endurance:3} },
      { name:'Yun „Flimmer“', role:'Scout', trait:'Unsichtbar', power:3, loyalty:63, affinity:'heat', age:25, bio:'Bewegt sich unauffällig und merkt sich Details, die andere übersehen.', skills:{combat:3,stealth:9,business:2,social:4,analysis:7,driving:4,endurance:5} },
      { name:'Ari „Mauer“', role:'Beschützer', trait:'Standhaft', power:5, loyalty:72, affinity:'loyalty', age:36, bio:'Bleibt, wenn andere gehen. Stark in Schutz und Ausdauer.', skills:{combat:7,stealth:2,business:3,social:6,analysis:4,driving:2,endurance:9} },
      { name:'Cem „Zünder“', role:'Vollstrecker', trait:'Explosiv', power:7, loyalty:42, affinity:'fear', age:28, bio:'Impulsiv, kampfstark und schwer zu bremsen.', skills:{combat:9,stealth:3,business:2,social:3,analysis:3,driving:4,endurance:7} },
      { name:'Jona „Funk“', role:'Netzwerker', trait:'Verbindungen', power:3, loyalty:64, affinity:'influence', age:30, bio:'Verbindet Informationen, Menschen und Gelegenheiten.', skills:{combat:2,stealth:5,business:6,social:8,analysis:8,driving:3,endurance:4} }
    ],
    starterGang:[
      { id:'starter-1', name:'Kasi', role:'Rechte Hand', trait:'Loyal', power:6, loyalty:78, origin:'Hauptbunker', age:35, bio:'Strategischer Ruhepol der Crew und engster Vertrauter des Bosses.', skills:{combat:7,stealth:5,business:6,social:7,analysis:7,driving:4,endurance:7} },
      { id:'starter-2', name:'Vex', role:'Scout', trait:'Wachsam', power:4, loyalty:70, origin:'Westtunnel', age:28, bio:'Kennt Wege, Geräusche und Bewegungsmuster im Ring.', skills:{combat:4,stealth:8,business:3,social:4,analysis:7,driving:5,endurance:5} },
      { id:'starter-3', name:'Mara', role:'Organisator', trait:'Pragmatisch', power:4, loyalty:74, origin:'Schwarzmarkt', age:33, bio:'Hält Termine, Geldströme und Menschen gleichzeitig zusammen.', skills:{combat:3,stealth:4,business:8,social:7,analysis:7,driving:3,endurance:5} }
    ]
  });
});
