(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc09-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const initiativeChoices=[
    {id:'support',title:'Unterstützen',description:'Die Initiative bekommt Rückhalt. Moral und lokaler Zusammenhalt profitieren.'},
    {id:'observe',title:'Beobachten',description:'Erst Informationen sammeln. Geringe Belastung, bessere lokale Übersicht.'},
    {id:'redirect',title:'Umlenken',description:'Die Energie wird auf Stabilität und einen ruhigeren nächsten Schritt gelenkt.'}
  ];
  const districtBands=[
    {id:'ruhig',max:29,label:'Ruhig'},
    {id:'bewegt',max:54,label:'Bewegt'},
    {id:'angespannt',max:74,label:'Angespannt'},
    {id:'kritisch',max:100,label:'Kritisch'}
  ];
  return Object.freeze({...BASE,version:'0.16.0-living-city-10',schema:11,initiativeChoices,districtBands});
});
