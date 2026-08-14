(function(root,factory){
  const BASE=typeof module==='object'&&module.exports?require('./lc08-data.js'):root.GAME_DATA;
  const data=factory(BASE);
  if(typeof module==='object'&&module.exports)module.exports=data;else root.GAME_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(BASE){
  'use strict';
  const accessibilityPresets=[
    {id:'standard',title:'Standard',fontScale:1,highContrast:false,reducedMotion:false},
    {id:'lesbar',title:'Besser lesbar',fontScale:1.1,highContrast:true,reducedMotion:false},
    {id:'ruhig',title:'Ruhig & groß',fontScale:1.2,highContrast:true,reducedMotion:true}
  ];
  return Object.freeze({...BASE,version:'0.15.0-living-city-09',schema:10,accessibilityPresets});
});
