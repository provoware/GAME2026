(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GAME_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return Object.freeze({
    version: '0.7.0-html-city-economy-combat',
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
      { id: 'protect', category: 'einfluss', title: 'Viertel schützen', icon: '◆', tone: 'social', description: 'Läden und Leute schützen. Baut Respekt, Treue und stabile Kontrolle auf.', cost: { money: 80 }, effects: { respect: 7, fear: -2, loyalty: 5, influence: 3, heat: -1, control: 5, police: -3, rival: -2 } },
      { id: 'party', category: 'einfluss', title: 'Straßenabend', icon: '✦', tone: 'social', description: 'Präsenz zeigen, Kontakte knüpfen und neue Leute anziehen.', cost: { money: 120 }, effects: { respect: 6, loyalty: 4, influence: 4, heat: 3, joinBoost: 0.19, control: 3 } },
      { id: 'intel', category: 'einfluss', title: 'Gerüchte kaufen', icon: '⌁', tone: 'stealth', description: 'Aufklärung senkt Rivalendruck und verbessert die Kampfvorbereitung.', cost: { money: 95 }, effects: { influence: 6, heat: -2, rival: -5, unrest: -3, intel: 1 } },
      { id: 'bribe', category: 'einfluss', title: 'Druck rausnehmen', icon: '◇', tone: 'stealth', description: 'Kontakte bezahlen und lokalen Polizeidruck reduzieren.', cost: { money: 145 }, effects: { influence: 4, heat: -9, police: -12, respect: -1 } },

      { id: 'deal', category: 'geschaeft', title: 'Geschäft drehen', icon: '€', tone: 'money', description: 'Schneller lokaler Deal. Sofortiger Ertrag, aber mehr Aufmerksamkeit.', cost: {}, effects: { money: 165, respect: 2, fear: 1, influence: 3, heat: 4, control: 2, rival: 3 } },
      { id: 'protection_contract', category: 'geschaeft', title: 'Schutzvertrag', icon: '▣', tone: 'money', description: 'Lokale Betriebe zahlen für verlässlichen Schutz. Kleiner Ertrag, starke Bindung.', cost: { money: 40 }, effects: { money: 115, respect: 4, loyalty: 2, influence: 2, heat: 2, control: 4, unrest: -4 } },
      { id: 'smuggle', category: 'geschaeft', title: 'Lieferung umleiten', icon: '⇄', tone: 'money', description: 'Riskante Warenroute durchziehen. Hoher Ertrag bei wachsendem Polizeidruck.', cost: { supplies: 1 }, effects: { money: 255, influence: 4, heat: 8, police: 5, rival: 2 } },
      { id: 'host_event', category: 'geschaeft', title: 'Großes Event', icon: '★', tone: 'money', description: 'Ein öffentliches Ereignis monetarisieren. Profit und Bekanntheit steigen deutlich.', cost: { money: 180 }, effects: { money: 310, respect: 4, influence: 6, notoriety: 5, heat: 6, joinBoost: 0.08, unrest: 3 } },
      { id: 'launder', category: 'geschaeft', title: 'Kasse beruhigen', icon: '◎', tone: 'stealth', description: 'Über eigene Betriebe Geldflüsse glätten. Funktioniert besser mit Besitz.', cost: { money: 90 }, requiresProperty: true, effects: { influence: 5, heat: -7, money: 75 } },

      { id: 'show_force', category: 'konflikt', title: 'Stärke zeigen', icon: '▲', tone: 'force', description: 'Sichtbare Machtdemonstration. Schnell wirksam, aber laut.', cost: { supplies: 1 }, effects: { respect: 1, fear: 8, loyalty: 1, influence: 4, heat: 7, control: 8, police: 4, rival: -6 } },
      { id: 'raid', category: 'konflikt', title: 'Rivalen angreifen', icon: '⚡', tone: 'force', description: 'Direkter Kampf um Geld und Gebiet. Ausgang hängt von Crew, Rivalen und Vorbereitung ab.', cost: { supplies: 2 }, effects: { fear: 7, respect: 2, influence: 4, heat: 10 }, combat: { type: 'raid', reward: 235, controlWin: 13, rivalWin: -16, controlLoss: -7, rivalLoss: 5, injuryRisk: 0.24 } },
      { id: 'sabotage', category: 'konflikt', title: 'Rivalen sabotieren', icon: '✕', tone: 'force', description: 'Kleinerer verdeckter Kampf. Weniger Beute, dafür geringerer Fahndungsanstieg.', cost: { money: 70, supplies: 1 }, effects: { fear: 4, influence: 4, heat: 5 }, combat: { type: 'sabotage', reward: 120, controlWin: 7, rivalWin: -11, controlLoss: -3, rivalLoss: 2, injuryRisk: 0.12, stealthBonus: 0.08 } },
      { id: 'lay_low', category: 'konflikt', title: 'Untertauchen', icon: '○', tone: 'stealth', description: 'Einen Zug ruhig halten. Fahndung sinkt, Rivalen erhalten etwas Raum.', cost: { money: 45 }, effects: { heat: -13, police: -5, rival: 5, loyalty: -1, control: -1 } }
    ],

    properties: [
      { id: 'hotel', title: 'Hotel', icon: 'H', description: 'Teure Prestige-Immobilie mit starkem Cashflow und Einfluss.', kinds: ['market', 'club', 'residential'], baseCost: 1450, income: 185, upkeep: 35, influence: 5, heat: 2, risk: 0.08 },
      { id: 'warehouse', title: 'Lagerhaus', icon: 'L', description: 'Logistikstandort. Verstärkt Einnahmen und Vorratswirtschaft.', kinds: ['industrial', 'transit', 'base'], baseCost: 820, income: 112, upkeep: 22, influence: 2, supplies: 1, heat: 1, risk: 0.05 },
      { id: 'club_share', title: 'Clubbeteiligung', icon: 'C', description: 'Nachtgeschäft mit guter Rendite und zusätzlicher Rekrutierungskraft.', kinds: ['club', 'market'], baseCost: 690, income: 96, upkeep: 18, influence: 4, joinBoost: 0.03, heat: 3, risk: 0.09 },
      { id: 'workshop', title: 'Werkstatt', icon: 'W', description: 'Versorgt die Crew, senkt Verletzungsfolgen und bringt soliden Ertrag.', kinds: ['industrial', 'residential', 'base'], baseCost: 560, income: 72, upkeep: 15, influence: 1, recoveryBonus: 1, risk: 0.03 },
      { id: 'corner_shop', title: 'Spätkauf', icon: 'S', description: 'Günstiger Einstieg in lokale Einnahmen und Kontakte.', kinds: ['residential', 'market'], baseCost: 340, income: 48, upkeep: 8, influence: 2, respect: 2, risk: 0.025 },
      { id: 'lookout_hub', title: 'Funkzentrale', icon: 'F', description: 'Informationsknoten. Kaum Ertrag, aber bessere Kampf- und Polizeiprognosen.', kinds: ['lookout', 'archive', 'base'], baseCost: 610, income: 38, upkeep: 12, influence: 6, intel: 1, risk: 0.02 },
      { id: 'apartment_block', title: 'Wohnblock-Anteil', icon: 'A', description: 'Langsamer, stabiler Ertrag mit positiver Wirkung auf Loyalität.', kinds: ['residential'], baseCost: 980, income: 126, upkeep: 25, loyalty: 3, respect: 2, risk: 0.035 }
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
