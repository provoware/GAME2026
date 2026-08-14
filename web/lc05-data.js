(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./revival-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const interiorScenes={
    'location.bunker.main':{title:'Kommandozentrale',subtitle:'Beton, Funklicht und die große Lagewand.',theme:'bunker',hotspots:[['Lagewand','◫','Gebiete, Missionen und Rivalenlage bündeln.'],['Besprechungstisch','◇','Crewgespräche und Briefings vorbereiten.'],['Funkplatz','⌁','Meldungen aus dem Stadtring laufen hier zusammen.']]},
    'location.market.black':{title:'Markthalle',subtitle:'Neon, Händlerstände und ständig wechselnde Preise.',theme:'market',hotspots:[['Handelszeile','€','Beteiligungen und Warenströme prägen den Bezirk.'],['Eisenladen','▦','Schutz- und Taktikausrüstung ansehen.'],['Hinterzimmer','◉','Gerüchte und Aufklärung treffen aufeinander.']]},
    'location.station.ghost':{title:'Geisterbahnhof',subtitle:'Alte Anzeigen, Hall und vier Fernverbindungen.',theme:'station',hotspots:[['Anzeigetafel','⇢','Fernziele und nächste Etappen prüfen.'],['Bahnsteig','▤','Direkte Stadtverbindungen nutzen.'],['Wartesaal','○','Kurze Ruhe vor dem nächsten Zug.']]},
    'location.neon.cellar_club':{title:'Neon-Kellerclub',subtitle:'Basslicht, Menschenströme und lokale Szeneökonomie.',theme:'club',hotspots:[['Tanzfläche','♪','Soziale Dynamik und Nachtökonomie.'],['Büro','€','Betrieb, Beteiligungen und Ertrag im Blick.'],['Backstage','◇','Crewkontakte und Ereignisse verdichten sich.']]},
    'location.blocks.east':{title:'Dojo Ostblock',subtitle:'Mattenboden, Sandsäcke und nüchterne Trainingsdisziplin.',theme:'dojo',hotspots:[['Mattenfläche','◇','Kampfsportarten trainieren.'],['Trainingswand','+','Skillfortschritt und Ausdauer sichtbar machen.'],['Ruhebank','○','Stress senken und Entwicklung planen.']]},
    'location.casino.9909':{title:'Casino 9909',subtitle:'Goldlicht, Kartentische und drei Maschinenreihen.',theme:'casino',hotspots:[['Pokertisch','♠','5-Card-Draw selbst spielen.'],['Automatenreihe','7','Drei unterschiedliche Spielmaschinen.'],['Galerie','◈','Stadtstatus und Nachtstimmung beobachten.']]},
    'location.oldtown.central':{title:'Altstadt-Passage',subtitle:'Hotels, Läden und ein dichter Strom aus Geld und Gästen.',theme:'oldtown',hotspots:[['Hotellobby','▤','Lokale Unternehmen und Immobilien.'],['Passage','€','Wirtschaftslage des Bezirks.'],['Dachterrasse','◉','Blick auf angrenzende Gebiete.']]},
    'location.harbor.south':{title:'Südhafen-Terminal',subtitle:'Containerlicht, Kräne und ein stetiger Logistikpuls.',theme:'harbor',hotspots:[['Leitstand','▦','Fracht- und Unternehmensentwicklung.'],['Kai','≋','Hafenlage und Bezirksdruck.'],['Schichtbüro','◇','Crewaufträge und lokale Kontakte.']]}
  };
  const fallbackInteriors={
    base:{title:'Stützpunkt',theme:'bunker'},transit:{title:'Tunnelknoten',theme:'station'},market:{title:'Marktpassage',theme:'market'},station:{title:'Bahnhofshalle',theme:'station'},archive:{title:'Archivraum',theme:'archive'},club:{title:'Clubraum',theme:'club'},industrial:{title:'Werkhalle',theme:'industrial'},residential:{title:'Quartierzentrum',theme:'oldtown'},lookout:{title:'Aussichtsposten',theme:'lookout'},casino:{title:'Spielhalle',theme:'casino'},harbor:{title:'Hafenterminal',theme:'harbor'},commercial:{title:'Geschäftspassage',theme:'oldtown'}
  };
  const briefingChoices=[
    {id:'careful',title:'Sicher planen',icon:'◇',description:'Mehr Zeit und weniger Stadtdruck, dafür etwas geringere Geldbelohnung.'},
    {id:'bold',title:'Tempo erhöhen',icon:'⚡',description:'Höhere Belohnung und mehr Respekt, aber weniger Zeit und höhere Spannung.'},
    {id:'team',title:'Crew einbinden',icon:'◎',description:'Advisor und Partner sammeln Praxis; Crewbindung und Chancen steigen.'}
  ];
  const ambientProfiles={
    bunker:{label:'Tiefer Bunkerbrumm',tone:72,pulse:0.11},market:{label:'Marktneon',tone:112,pulse:0.18},station:{label:'Bahnhofhall',tone:88,pulse:0.14},club:{label:'Kellerpuls',tone:132,pulse:0.22},dojo:{label:'Ruhiger Trainingsraum',tone:96,pulse:0.1},casino:{label:'Casino-Schimmer',tone:124,pulse:0.16},oldtown:{label:'Altstadtstrom',tone:104,pulse:0.12},harbor:{label:'Hafenresonanz',tone:80,pulse:0.14},archive:{label:'Archivstille',tone:68,pulse:0.08},industrial:{label:'Werkhallenpuls',tone:84,pulse:0.16},lookout:{label:'Wind über den Dächern',tone:76,pulse:0.09}
  };
  return Object.freeze({...BASE,version:'0.11.0-living-city-05',schema:6,interiorScenes,fallbackInteriors,briefingChoices,ambientProfiles});
});
