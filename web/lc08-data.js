(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc07-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const clone=(v)=>JSON.parse(JSON.stringify(v));

  const storyArcs=[
    {
      id:'arc.line',icon:'◇',title:'Eine Linie entsteht',description:'Entscheidungen aus Bunker, Markt, Archiv und Altstadt bilden nach und nach einen erkennbaren Stil.',
      stages:[
        {id:'guidance',title:'Grundlinie wählen',hint:'Im Hauptbunker eine Führungsrichtung festlegen.',anyOf:['guidance.focused','guidance.flexible']},
        {id:'market',title:'Linie am Markt erproben',hint:'Am Schwarzmarkt eine erkennbare Entscheidung treffen.',anyOf:['market.deep','market.fast','market.disciplined','market.adaptive']},
        {id:'archive',title:'Folgen einordnen',hint:'Im Unterarchiv ein Muster oder die Crew-Folgen festhalten.',anyOf:['archive.methodical','archive.adaptive','archive.people']},
        {id:'oldtown',title:'Linie sichtbar machen',hint:'In der Altstadt eine Haltung nach außen tragen.',anyOf:['oldtown.steady','oldtown.adaptive','oldtown.people']}
      ],
      reward:{opportunity:4,tension:-2,crewMorale:2}
    },
    {
      id:'arc.routes',icon:'⇢',title:'Die Stadt wird kleiner',description:'Reisen und Routenentscheidungen verwandeln die Karte von einer Übersicht in ein tatsächlich genutztes Netz.',
      stages:[
        {id:'first-trips',title:'Stadtwege nutzen',hint:'Mindestens zwei echte Reisen durchführen.',stat:{key:'travels',min:2}},
        {id:'route-choice',title:'Reiselinie festlegen',hint:'Im Geisterbahnhof eine Routenpräferenz wählen.',anyOf:['route.steady','route.fast','route.linked','route.open']},
        {id:'network',title:'Netz verinnerlichen',hint:'Mindestens fünf Reisen durchführen.',stat:{key:'travels',min:5}}
      ],
      reward:{opportunity:3,bossSkill:['driving',8]}
    },
    {
      id:'arc.crew',icon:'◎',title:'Aus Leuten wird eine Crew',description:'Gespräche und gemeinsame Erfahrungen werden als zusammenhängende Entwicklung sichtbar.',
      stages:[
        {id:'voices',title:'Mehrere Stimmen hören',hint:'Mindestens drei Dialogentscheidungen treffen.',stat:{key:'dialogueChoices',min:3}},
        {id:'bond',title:'Zusammenhalt aktiv pflegen',hint:'Mindestens zwei direkte Crew-Interaktionen durchführen.',stat:{key:'crewInteractions',min:2}},
        {id:'people',title:'Menschen in Entscheidungen berücksichtigen',hint:'Eine Entscheidung mit erkennbarem Crew-Fokus treffen.',anyOf:['archive.people','oldtown.people']}
      ],
      reward:{crewStress:-4,crewMorale:4,relation:2}
    }
  ];

  const consequenceEchoes={
    'guidance.focused':{delay:3,title:'Der Plan greift',detail:'Die früh gewählte klare Linie macht spätere Signale leichter einzuordnen.',effects:{opportunity:2,tension:-1}},
    'guidance.flexible':{delay:3,title:'Spielraum zahlt sich aus',detail:'Die offene Linie schafft Raum für eine neue Gelegenheit.',effects:{opportunity:3,tension:1}},
    'market.disciplined':{delay:2,title:'Disziplin wirkt nach',detail:'Die begrenzte Marktlinie senkt den Druck etwas.',effects:{tension:-2}},
    'market.adaptive':{delay:2,title:'Flexibilität öffnet eine Tür',detail:'Eine frühere Ausnahme erzeugt eine neue Chance.',effects:{opportunity:3,tension:1}},
    'archive.people':{delay:3,title:'Die Crew erinnert sich',detail:'Dass menschliche Folgen berücksichtigt wurden, stärkt später den Zusammenhalt.',effects:{crewMorale:3,relation:1}},
    'route.steady':{delay:2,title:'Routenroutine',detail:'Verlässliche Etappen senken die Belastung auf kommenden Wegen.',effects:{tension:-1,crewStress:-2}},
    'route.fast':{delay:2,title:'Tempo erzeugt Anschluss',detail:'Die schnellere Linie bringt Gelegenheit, aber auch etwas Unruhe.',effects:{opportunity:3,tension:1}},
    'casino.limit':{delay:3,title:'Die Grenze hält',detail:'Die gesetzte Budgetlinie verhindert, dass Spiel und Ressourcen ineinanderlaufen.',effects:{tension:-2,money:40}},
    'oldtown.people':{delay:2,title:'Zusammenhalt wird sichtbar',detail:'Die menschenorientierte Linie stärkt später Moral und lokalen Rückhalt.',effects:{crewMorale:2,districtControl:2}}
  };

  const journalLabels={
    flag:'Entscheidung',dialogue:'Gespräch',interior:'Innenraum',travel:'Reise',combat:'Kampf',echo:'Späte Folge',arc:'Entwicklungsbogen'
  };

  return Object.freeze({...BASE,version:'0.14.0-living-city-08',schema:9,storyArcs:clone(storyArcs),consequenceEchoes:clone(consequenceEchoes),journalLabels:clone(journalLabels)});
});
