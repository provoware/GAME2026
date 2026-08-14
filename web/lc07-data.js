(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc06-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const clone=(v)=>JSON.parse(JSON.stringify(v));
  const interiorActions=clone(BASE.interiorActions||{});
  interiorActions['location.tunnel.west']=[
    {id:'orientation',icon:'⇢',title:'Etappe sortieren',description:'Den nächsten Weg und die Priorität der Reise festlegen.',cooldown:2,effects:{opportunity:3,tension:-1,bossSkill:['driving',5]}},
    {id:'breather',icon:'○',title:'Zwischenstopp',description:'Die Crew sammelt sich, bevor es weitergeht.',cooldown:3,effects:{crewStress:-5,crewMorale:2}}
  ];
  interiorActions['location.archive.sublevel']=[
    {id:'records',icon:'▤',title:'Unterlagen ordnen',description:'Verstreute Hinweise werden zu einem klareren Lagebild.',cooldown:2,effects:{opportunity:4,tension:-2,bossSkill:['analysis',7]}},
    {id:'history',icon:'◇',title:'Alte Entscheidungen prüfen',description:'Vergangene Folgen werden mit der aktuellen Lage abgeglichen.',cooldown:3,effects:{opportunity:2,crewMorale:2,relation:1}}
  ];
  interiorActions['location.yard.freight']=[
    {id:'inventory',icon:'▦',title:'Bestand zählen',description:'Versorgung und laufende Belastung werden kompakt geprüft.',cooldown:2,effects:{supplies:2,opportunity:2}},
    {id:'shiftplan',icon:'◇',title:'Schichtplan glätten',description:'Die Aufgaben werden klarer verteilt und Stress sinkt.',cost:30,cooldown:3,effects:{crewStress:-4,crewMorale:3,relation:1}}
  ];
  interiorActions['location.rooftops.north']=[
    {id:'overview',icon:'◉',title:'Stadtbild lesen',description:'Die Stadt aus Distanz betrachten und Druckpunkte priorisieren.',cooldown:2,effects:{opportunity:4,tension:-1,bossSkill:['analysis',6]}},
    {id:'quiet',icon:'○',title:'Ruhe über der Stadt',description:'Ein kurzer Abstand senkt die Belastung.',cooldown:3,effects:{crewStress:-6,crewMorale:2}}
  ];
  // Existing places receive one additional high-value contextual option without increasing permanent UI density.
  Object.assign(interiorActions['location.bunker.main'][0],{effects:{...interiorActions['location.bunker.main'][0].effects,flag:'planning.reviewed'}});
  interiorActions['location.oldtown.central'].push({id:'contacts',icon:'◎',title:'Kontakte abgleichen',description:'Frühere Entscheidungen mit den aktuellen Beziehungen spiegeln.',cooldown:4,effects:{opportunity:3,bossSkill:['social',5],flag:'oldtown.contacts'}});
  interiorActions['location.casino.9909'].push({id:'limits',icon:'○',title:'Budgetgrenze setzen',description:'Spiel und Ressourcen bewusst voneinander trennen.',cooldown:4,effects:{tension:-2,bossSkill:['analysis',4],flag:'casino.limit'}});

  const dialogues=clone(BASE.dialogues||{});
  // Cross-location consequences are stored as flags and can unlock later options.
  const bunker=dialogues['dlg.bunker.advisor'];
  const guided=bunker?.nodes?.method?.options?.find((o)=>o.id==='guided');if(guided)guided.setFlag='guidance.focused';
  const flex=bunker?.nodes?.method?.options?.find((o)=>o.id==='flex');if(flex)flex.setFlag='guidance.flexible';
  const market=dialogues['dlg.market.analyst'];
  market.nodes.start.options.push({id:'planlink',label:'Lageplan aus dem Bunker abgleichen',next:'linked',requiresFlag:'guidance.focused',effects:{opportunity:2}});
  market.nodes.linked={text:'Mit einem klaren Plan können wir Signale gegen feste Prioritäten prüfen.',options:[
    {id:'holdline',label:'Prioritäten halten',end:'Die Marktbeobachtung bleibt eng am Plan.',effects:{tension:-2,opportunity:2},setFlag:'market.disciplined'},
    {id:'exception',label:'Ausnahme zulassen',end:'Ein begründeter Spielraum bleibt offen.',effects:{opportunity:4,tension:1},setFlag:'market.adaptive'}
  ]};
  const deep=market?.nodes?.chance2?.options?.find((o)=>o.id==='deep');if(deep)deep.setFlag='market.deep';
  const fast=market?.nodes?.chance2?.options?.find((o)=>o.id==='fast');if(fast)fast.setFlag='market.fast';

  dialogues['dlg.station.dispatch']={locationId:'location.station.ghost',speaker:'Ilya · Fahrplan',start:'start',nodes:{
    start:{text:'Die Linien sind klar, aber nicht jede Etappe ist gleich wichtig. Was soll der Fahrplan bevorzugen?',options:[
      {id:'safe',label:'Übersichtliche Etappen',next:'detail',effects:{tension:-2,opportunity:1},setFlag:'route.steady'},
      {id:'fast',label:'Kurze Wege priorisieren',next:'detail',effects:{opportunity:3,tension:1},setFlag:'route.fast'}
    ]},
    detail:{text:'Soll ich bei der nächsten Planung stärker auf den bestehenden Boss-Plan achten?',options:[
      {id:'yes',label:'Mit dem Plan verzahnen',end:'Reise und Aufgabenführung werden gedanklich enger gekoppelt.',effects:{opportunity:2},requiresFlag:'guidance.focused',setFlag:'route.linked'},
      {id:'open',label:'Routen offen lassen',end:'Die Karte bleibt der flexible Ausgangspunkt.',effects:{opportunity:2},setFlag:'route.open'}
    ]}
  }};
  dialogues['dlg.archive.keeper']={locationId:'location.archive.sublevel',speaker:'Sera · Archiv',start:'start',nodes:{
    start:{text:'Alte Entscheidungen sind nur nützlich, wenn wir ihre Folgen erkennen. Was soll ich herausarbeiten?',options:[
      {id:'patterns',label:'Wiederkehrende Muster',next:'patterns2',effects:{opportunity:2,bossSkill:['analysis',5]}},
      {id:'people',label:'Folgen für die Crew',end:'Die menschlichen Folgen stehen im Vordergrund.',effects:{crewMorale:3,relation:2},setFlag:'archive.people'}
    ]},
    patterns2:{text:'Ein Teil der Marktentscheidungen taucht hier wieder auf.',options:[
      {id:'deep',label:'Gründlichkeit bestätigen',end:'Die gründliche Linie wird als verlässliches Muster festgehalten.',requiresFlag:'market.deep',effects:{tension:-2,opportunity:3},setFlag:'archive.methodical'},
      {id:'adaptive',label:'Anpassungsfähigkeit festhalten',end:'Flexible Reaktionen werden als Stärke markiert.',requiresFlag:'market.adaptive',effects:{opportunity:4},setFlag:'archive.adaptive'},
      {id:'neutral',label:'Ohne Wertung archivieren',end:'Die Entscheidung bleibt dokumentiert, ohne neue Festlegung.',effects:{opportunity:1}}
    ]}
  }};
  dialogues['dlg.casino.host']={locationId:'location.casino.9909',speaker:'Vale · Saalleitung',start:'start',nodes:{
    start:{text:'Im Casino ist Übersicht wichtiger als Tempo. Womit sollen wir anfangen?',options:[
      {id:'limits',label:'Klare Grenze setzen',end:'Ressourcen und Spiel bleiben sauber getrennt.',effects:{tension:-2},setFlag:'casino.limit'},
      {id:'observe',label:'Nur beobachten',next:'observe2',effects:{opportunity:2}}
    ]},
    observe2:{text:'Die Stimmung verändert sich. Soll ich eher Disziplin oder Chancen spiegeln?',options:[
      {id:'discipline',label:'Disziplin',end:'Die Linie bleibt kontrolliert.',requiresFlag:'market.disciplined',effects:{tension:-2,opportunity:2},setFlag:'casino.disciplined'},
      {id:'chance',label:'Chancen',end:'Die Lage wird offener gelesen.',effects:{opportunity:3,tension:1},setFlag:'casino.observer'}
    ]}
  }};
  dialogues['dlg.oldtown.connector']={locationId:'location.oldtown.central',speaker:'Lea · Passage',start:'start',nodes:{
    start:{text:'In der Passage treffen viele frühere Entscheidungen zusammen. Welche Linie soll sichtbar werden?',options:[
      {id:'steady',label:'Stabilität zeigen',end:'Die Passage reagiert auf die konstante Linie.',requiresFlag:'route.steady',effects:{districtControl:2,tension:-1},setFlag:'oldtown.steady'},
      {id:'adaptive',label:'Flexibel bleiben',end:'Die Passage bleibt offen für neue Chancen.',requiresFlag:'archive.adaptive',effects:{opportunity:4},setFlag:'oldtown.adaptive'},
      {id:'people',label:'Menschen zuerst',end:'Zusammenhalt wird zum sichtbaren Schwerpunkt.',requiresFlag:'archive.people',effects:{crewMorale:3,relation:2},setFlag:'oldtown.people'},
      {id:'neutral',label:'Lage nur beobachten',end:'Die Passage bleibt ein neutraler Orientierungspunkt.',effects:{opportunity:1}}
    ]}
  }};

  const locationDialogues={...BASE.locationDialogues,
    'location.station.ghost':'dlg.station.dispatch',
    'location.archive.sublevel':'dlg.archive.keeper',
    'location.casino.9909':'dlg.casino.host',
    'location.oldtown.central':'dlg.oldtown.connector'
  };
  const audioPresets={...BASE.audioPresets,
    focus:{label:'Fokus',musicHz:66,ambientHz:98,pulse:.06},
    combat:{label:'Kampf',musicHz:116,ambientHz:164,pulse:.28}
  };
  return Object.freeze({...BASE,version:'0.13.0-living-city-07',schema:8,interiorActions,dialogues,locationDialogues,audioPresets});
});
