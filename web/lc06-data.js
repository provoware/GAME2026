(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc05-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const interiorActions={
    'location.bunker.main':[
      {id:'situation',icon:'◫',title:'Lagebesprechung',description:'Ziele ordnen und den nächsten sinnvollen Schritt festlegen.',cooldown:2,effects:{opportunity:4,tension:-3,crewStress:-2}},
      {id:'team',icon:'◇',title:'Crew-Runde',description:'Belastung ansprechen und die Gruppe stabilisieren.',cooldown:3,effects:{crewStress:-7,crewMorale:4,relation:2}}
    ],
    'location.market.black':[
      {id:'scan',icon:'€',title:'Marktlage prüfen',description:'Preise und Chancen im Bezirk auswerten.',cost:35,cooldown:2,effects:{opportunity:5,bossSkill:['business',7]}},
      {id:'rumors',icon:'◉',title:'Gerüchte sortieren',description:'Lokale Hinweise zu einem klaren Lagebild verdichten.',cooldown:3,effects:{tension:-2,opportunity:3,bossSkill:['analysis',6]}}
    ],
    'location.station.ghost':[
      {id:'routes',icon:'⇢',title:'Routen prüfen',description:'Reisewege und nächste Etappen für die Crew vorbereiten.',cooldown:2,effects:{opportunity:4,bossSkill:['driving',5]}},
      {id:'pause',icon:'○',title:'Kurz sammeln',description:'Vor der nächsten Etappe Stress senken.',cooldown:3,effects:{crewStress:-5,crewMorale:2}}
    ],
    'location.neon.cellar_club':[
      {id:'scene',icon:'♠',title:'Szene beobachten',description:'Stimmung und lokale Dynamik einschätzen.',cooldown:2,effects:{opportunity:4,tension:1,bossSkill:['social',6]}},
      {id:'crew',icon:'◇',title:'Crew zusammenbringen',description:'Gemeinsame Zeit stärkt Moral und Bindung.',cost:45,cooldown:3,effects:{crewStress:-4,crewMorale:5,relation:3}}
    ],
    'location.blocks.east':[
      {id:'drill',icon:'+',title:'Teamtraining',description:'Kontrolliertes Training verbessert Praxis und Zusammenhalt.',cost:55,cooldown:2,effects:{crewStress:3,crewMorale:3,relation:2,crewSkill:['combat',8]}},
      {id:'recovery',icon:'○',title:'Regeneration',description:'Belastung gezielt herunterfahren.',cost:25,cooldown:2,effects:{crewStress:-9,crewMorale:2}}
    ],
    'location.casino.9909':[
      {id:'observe',icon:'7',title:'Spielbetrieb beobachten',description:'Abläufe und Stimmung analytisch erfassen.',cooldown:2,effects:{opportunity:3,bossSkill:['analysis',5]}},
      {id:'break',icon:'○',title:'Pause einlegen',description:'Abstand gewinnen und Stress senken.',cost:20,cooldown:2,effects:{crewStress:-4}}
    ],
    'location.oldtown.central':[
      {id:'survey',icon:'▤',title:'Passage prüfen',description:'Wirtschaft und Bezirkslage kompakt erfassen.',cooldown:2,effects:{opportunity:4,bossSkill:['business',5]}},
      {id:'presence',icon:'◇',title:'Präsenz zeigen',description:'Den eigenen Einfluss sichtbar stabilisieren.',cost:40,cooldown:3,effects:{districtControl:3,tension:2}}
    ],
    'location.harbor.south':[
      {id:'logistics',icon:'▦',title:'Logistik prüfen',description:'Versorgung und lokale Abläufe besser koordinieren.',cooldown:2,effects:{supplies:2,opportunity:3,bossSkill:['analysis',5]}},
      {id:'shift',icon:'◇',title:'Schichtgespräch',description:'Crew und lokale Kontakte auf einen Stand bringen.',cooldown:3,effects:{crewMorale:3,relation:2}}
    ]
  };
  const fallbackInteriorActions=[
    {id:'observe',icon:'◉',title:'Ort beobachten',description:'Die aktuelle Lage in Ruhe einschätzen.',cooldown:2,effects:{opportunity:2}},
    {id:'recover',icon:'○',title:'Kurz erholen',description:'Belastung der Crew etwas senken.',cooldown:3,effects:{crewStress:-3}}
  ];
  const dialogues={
    'dlg.bunker.advisor':{locationId:'location.bunker.main',speaker:'Mira · Lageanalyse',start:'start',nodes:{
      start:{text:'Die Lage ist voll, aber nicht alles ist gleich wichtig. Womit sollen wir anfangen?',options:[{id:'mission',label:'Aktive Aufgabe ordnen',next:'method',effects:{opportunity:2}},{id:'crew',label:'Erst die Crew stabilisieren',next:'crew',effects:{crewMorale:2,crewStress:-2}}]},
      method:{text:'Wir können den nächsten Schritt enger führen oder mehr Spielraum lassen.',options:[{id:'guided',label:'Klare Schrittfolge',end:'Die nächsten Schritte werden stärker priorisiert.',effects:{tension:-2,opportunity:2}},{id:'flex',label:'Mehr Freiraum',end:'Die Stadt bleibt offener, aber weniger vorhersehbar.',effects:{opportunity:3,tension:1}}]},
      crew:{text:'Die Crew wirkt belastet. Geht es zuerst um Ruhe oder um Zusammenhalt?',options:[{id:'rest',label:'Belastung senken',end:'Die Crew bekommt Luft.',effects:{crewStress:-6}},{id:'bond',label:'Zusammenhalt stärken',end:'Die Gruppe rückt enger zusammen.',effects:{crewMorale:4,relation:3}}]}
    }},
    'dlg.market.analyst':{locationId:'location.market.black',speaker:'Tarek · Marktbeobachtung',start:'start',nodes:{
      start:{text:'Der Markt verändert sich. Soll ich Chancen oder Stabilität priorisieren?',options:[{id:'chance',label:'Chancen suchen',next:'chance2',effects:{opportunity:3}},{id:'stable',label:'Risiko dämpfen',end:'Der Fokus liegt auf Übersicht und Stabilität.',effects:{tension:-3,bossSkill:['analysis',5]}}]},
      chance2:{text:'Dann sollten wir gezielt auf Signale achten. Schnell oder gründlich?',options:[{id:'fast',label:'Schnell reagieren',end:'Mehr Chancen, aber etwas mehr Spannung.',effects:{opportunity:4,tension:2}},{id:'deep',label:'Gründlich prüfen',end:'Weniger Tempo, dafür ein klareres Bild.',effects:{opportunity:2,tension:-1,bossSkill:['business',6]}}]}
    }},
    'dlg.club.host':{locationId:'location.neon.cellar_club',speaker:'Nova · Gastgeberin',start:'start',nodes:{
      start:{text:'Heute ist viel Energie im Raum. Soll die Crew Kontakte pflegen oder einfach runterkommen?',options:[{id:'contacts',label:'Kontakte pflegen',end:'Die soziale Lage wird klarer.',effects:{opportunity:3,bossSkill:['social',6]}},{id:'calm',label:'Crew runterfahren',end:'Die Stimmung wird ruhiger.',effects:{crewStress:-5,crewMorale:3}}]}
    }},
    'dlg.harbor.foreman':{locationId:'location.harbor.south',speaker:'Keno · Schichtleitung',start:'start',nodes:{
      start:{text:'Die Abläufe laufen, aber die Prioritäten sind unscharf. Was soll zuerst sauber werden?',options:[{id:'supply',label:'Versorgung ordnen',end:'Die Versorgung wird stabiler.',effects:{supplies:2,opportunity:2}},{id:'people',label:'Menschen koordinieren',end:'Die Gruppe arbeitet geordneter.',effects:{crewMorale:3,relation:2}}]}
    }}
  };
  const locationDialogues={
    'location.bunker.main':'dlg.bunker.advisor',
    'location.market.black':'dlg.market.analyst',
    'location.neon.cellar_club':'dlg.club.host',
    'location.harbor.south':'dlg.harbor.foreman'
  };
  const audioPresets={
    calm:{label:'Ruhig',musicHz:58,ambientHz:86,pulse:.08},
    city:{label:'Stadt',musicHz:72,ambientHz:112,pulse:.13},
    night:{label:'Nacht',musicHz:84,ambientHz:132,pulse:.18},
    tension:{label:'Spannung',musicHz:104,ambientHz:148,pulse:.24}
  };
  return Object.freeze({...BASE,version:'0.12.0-living-city-06',schema:7,interiorActions,fallbackInteriorActions,dialogues,locationDialogues,audioPresets});
});
