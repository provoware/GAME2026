(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GAME_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return Object.freeze({
    version: '0.6.0-html-city-dynamics',
    world: {
      id: 'world.berlin_bunker_ring.expanded',
      title: 'Bunker-Ring / Stadtsektor 9909',
      startLocationId: 'location.bunker.main',
      locations: [
        { id: 'location.bunker.main', title: 'Hauptbunker', short: 'Bunker', kind: 'base', x: 505, y: 370, risk: 12, income: 20, police: 8, rival: 4, description: 'Kommandozentrale, Lager, Rückzugsraum und Herz der Gang.' },
        { id: 'location.tunnel.west', title: 'Westtunnel', short: 'Westtunnel', kind: 'transit', x: 285, y: 350, risk: 28, income: 12, police: 16, rival: 28, description: 'Feuchte Verbindungsadern. Wer sie hält, bewegt Leute und Ware ungesehen.' },
        { id: 'location.market.black', title: 'Schwarzmarkt', short: 'Markt', kind: 'market', x: 175, y: 175, risk: 42, income: 55, police: 32, rival: 45, description: 'Geld, Gerüchte und Hehlerware. Viel Ertrag, viele Augen.' },
        { id: 'location.station.ghost', title: 'Geisterbahnhof', short: 'Bahnhof', kind: 'transit', x: 430, y: 105, risk: 48, income: 22, police: 38, rival: 52, description: 'Stillgelegte Bahnsteige, tote Kamerawinkel und unerwartete Besucher.' },
        { id: 'location.archive.sublevel', title: 'Unterarchiv', short: 'Archiv', kind: 'archive', x: 735, y: 145, risk: 36, income: 26, police: 46, rival: 24, description: 'Akten, alte Zugänge und Wissen, das Einfluss wertvoller als Geld macht.' },
        { id: 'location.neon.cellar_club', title: 'Neon-Kellerclub', short: 'Neonclub', kind: 'club', x: 790, y: 390, risk: 45, income: 48, police: 28, rival: 36, description: 'Nachtleben, Gerüchtebörse und Rekrutierungsbecken des Neonrings.' },
        { id: 'location.yard.freight', title: 'Frachtbahnhof', short: 'Frachthof', kind: 'industrial', x: 640, y: 610, risk: 56, income: 62, police: 42, rival: 58, description: 'Container, Lieferketten und rohe Logistik. Reich, laut und umkämpft.' },
        { id: 'location.blocks.east', title: 'Ostblöcke', short: 'Ostblöcke', kind: 'residential', x: 890, y: 585, risk: 40, income: 34, police: 34, rival: 46, description: 'Dichte Wohnblöcke. Loyalität entsteht hier eher durch Schutz als durch Drohung.' },
        { id: 'location.rooftops.north', title: 'Norddächer', short: 'Norddächer', kind: 'lookout', x: 650, y: 35, risk: 32, income: 15, police: 24, rival: 20, description: 'Aussichtspunkte und Funklinien über dem Ring. Ideal für Aufklärung.' }
      ],
      connections: [
        ['location.bunker.main', 'location.tunnel.west'],
        ['location.tunnel.west', 'location.market.black'],
        ['location.market.black', 'location.station.ghost'],
        ['location.station.ghost', 'location.archive.sublevel'],
        ['location.archive.sublevel', 'location.neon.cellar_club'],
        ['location.neon.cellar_club', 'location.bunker.main'],
        ['location.bunker.main', 'location.yard.freight'],
        ['location.yard.freight', 'location.neon.cellar_club'],
        ['location.yard.freight', 'location.blocks.east'],
        ['location.blocks.east', 'location.neon.cellar_club'],
        ['location.station.ghost', 'location.rooftops.north'],
        ['location.rooftops.north', 'location.archive.sublevel']
      ]
    },
    actions: [
      { id: 'protect', title: 'Viertel schützen', icon: '◆', tone: 'social', description: 'Leute und Läden schützen. Kostet Geld, baut Respekt und Loyalität auf.', cost: { money: 80 }, effects: { respect: 7, fear: -2, loyalty: 5, influence: 3, heat: -1, control: 5, police: -3, rival: -2 } },
      { id: 'show_force', title: 'Stärke zeigen', icon: '▲', tone: 'force', description: 'Sichtbare Machtdemonstration. Schnell wirksam, aber die Polizei merkt es.', cost: { supplies: 1 }, effects: { respect: 1, fear: 8, loyalty: 1, influence: 4, heat: 7, control: 8, police: 4, rival: -6 } },
      { id: 'deal', title: 'Geschäft drehen', icon: '€', tone: 'money', description: 'Lokale Einnahmen hochziehen. Bringt Geld, erzeugt aber Reibung.', cost: {}, effects: { money: 165, respect: 2, fear: 1, influence: 3, heat: 4, control: 2, rival: 3 } },
      { id: 'party', title: 'Straßenabend', icon: '✦', tone: 'social', description: 'Präsenz zeigen, Leute kennenlernen, Rekrutierungschance deutlich erhöhen.', cost: { money: 120 }, effects: { respect: 6, loyalty: 4, influence: 4, heat: 3, joinBoost: 0.19, control: 3 } },
      { id: 'bribe', title: 'Druck rausnehmen', icon: '◇', tone: 'stealth', description: 'Kontakte bezahlen und lokalen Polizeidruck reduzieren.', cost: { money: 145 }, effects: { influence: 4, heat: -9, police: -12, respect: -1 } },
      { id: 'raid', title: 'Rivalen angreifen', icon: '⚡', tone: 'force', description: 'Riskanter Schlag gegen Rivalen. Hoher Gewinn möglich, hoher Fahndungsdruck sicher.', cost: { supplies: 2 }, effects: { money: 110, fear: 9, respect: 2, influence: 5, heat: 11, control: 11, rival: -14, injuryRisk: 0.23 } },
      { id: 'lay_low', title: 'Untertauchen', icon: '○', tone: 'stealth', description: 'Einen Zug ruhig halten. Fahndungsdruck sinkt, Rivalen erhalten Raum.', cost: { money: 45 }, effects: { heat: -13, police: -5, rival: 5, loyalty: -1, control: -1 } }
    ],
    recruits: [
      { name: 'Mika „Kabel“', role: 'Aufklärer', trait: 'Beobachter', power: 3, loyalty: 62, affinity: 'influence' },
      { name: 'Raya „Null“', role: 'Fahrerin', trait: 'Nervenstark', power: 4, loyalty: 58, affinity: 'respect' },
      { name: 'Tarek „Brett“', role: 'Vollstrecker', trait: 'Einschüchternd', power: 6, loyalty: 48, affinity: 'fear' },
      { name: 'Lio „Echo“', role: 'Vermittler', trait: 'Gerüchteküche', power: 3, loyalty: 66, affinity: 'respect' },
      { name: 'Nika „Raster“', role: 'Planerin', trait: 'Kalt gerechnet', power: 5, loyalty: 55, affinity: 'influence' },
      { name: 'Sam „Kasse“', role: 'Geschäftsmann', trait: 'Ertragreich', power: 2, loyalty: 60, affinity: 'money' },
      { name: 'Yun „Flimmer“', role: 'Scout', trait: 'Unsichtbar', power: 3, loyalty: 63, affinity: 'heat' },
      { name: 'Ari „Mauer“', role: 'Beschützer', trait: 'Standhaft', power: 5, loyalty: 72, affinity: 'loyalty' },
      { name: 'Cem „Zünder“', role: 'Vollstrecker', trait: 'Explosiv', power: 7, loyalty: 42, affinity: 'fear' },
      { name: 'Jona „Funk“', role: 'Netzwerker', trait: 'Verbindungen', power: 3, loyalty: 64, affinity: 'influence' }
    ],
    starterGang: [
      { id: 'starter-1', name: 'Kasi', role: 'Rechte Hand', trait: 'Loyal', power: 6, loyalty: 78, origin: 'Hauptbunker' },
      { id: 'starter-2', name: 'Vex', role: 'Scout', trait: 'Wachsam', power: 4, loyalty: 70, origin: 'Westtunnel' },
      { id: 'starter-3', name: 'Mara', role: 'Organisator', trait: 'Pragmatisch', power: 4, loyalty: 74, origin: 'Schwarzmarkt' }
    ]
  });
});
