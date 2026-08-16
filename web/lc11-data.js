(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc10-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const trainingPrograms=[
    {id:'focus',title:'Technik',costFactor:.85,xpFactor:.85,stress:3,description:'Kontrollierte Einheit mit geringer Belastung.'},
    {id:'standard',title:'Standard',costFactor:1,xpFactor:1,stress:6,description:'Ausgewogene Einheit für stetigen Fortschritt.'},
    {id:'intense',title:'Intensiv',costFactor:1.35,xpFactor:1.45,stress:11,description:'Teurer und anstrengender, dafür mehr Praxisfortschritt.'}
  ];
  const intercityDestinations=[
    {id:'city.nordhafen',title:'Nordhafen',subtitle:'Küste & Handel',cost:180,duration:2,reward:{money:120,influence:2,analysisXp:8},description:'Kurzer Geschäftsausflug mit Hafenmarkt und neuen Kontakten.'},
    {id:'city.stahlwerk',title:'Stahlwerk-Metropole',subtitle:'Industrie & Training',cost:240,duration:3,reward:{supplies:2,combatXp:10,enduranceXp:8},description:'Industriezentrum mit Trainingshallen und robustem Materialmarkt.'},
    {id:'city.lichtbogen',title:'Lichtbogen',subtitle:'Nachtleben & Netzwerk',cost:210,duration:2,reward:{respect:2,socialXp:10,money:70},description:'Neonstadt mit Veranstaltungen, Kontakten und neuen Gerüchten.'},
    {id:'city.grenzring',title:'Grenzring',subtitle:'Analyse & Routen',cost:260,duration:3,reward:{intel:1,drivingXp:12,analysisXp:10},description:'Weitläufiger Verkehrsknoten für Routenkenntnis und Lagebilder.'}
  ];
  const casinoChallenges=[
    {id:'slots-three',title:'Drei Drehungen',kind:'slots',target:3,reward:35,description:'Drei Automatenrunden in einer Spielsitzung.'},
    {id:'poker-one',title:'Eine Pokerhand',kind:'poker',target:1,reward:45,description:'Eine Pokerhand vollständig bis zum Showdown spielen.'}
  ];
  const interiorScenes={
    casino:{title:'Neon-Foyer',accent:'violet',description:'Leuchtende Automatenreihen, Pokerlicht und animierte Anzeigen.'},
    station:{title:'Nachtbahnhof',accent:'cyan',description:'Abfahrtstafel, Gleislicht und Fernlinien in andere Städte.'},
    residential:{title:'Dojo Ostblock',accent:'lime',description:'Trainingsmatten, Rangfortschritt und Crew-Entwicklung.'},
    market:{title:'Eisenladen',accent:'gold',description:'Schutzkleidung, Ausrüstung und Wartung mit Zustandswert.'}
  };
  return Object.freeze({...BASE,version:'0.17.6-living-city-11-visual-polish-6',schema:12,trainingPrograms,intercityDestinations,casinoChallenges,interiorScenes});
});
