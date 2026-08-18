(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0130',PREV_KEY='pppoppi-bunkerwahrheit-html-v0120',OLDER='pppoppi-bunkerwahrheit-html-v0110',OLD2='pppoppi-bunkerwahrheit-html-v0100',LEGACY='pppoppi-bunkerwahrheit-html-v090';
  root.LIVING_CITY_07_STORAGE={newKey:NEW_KEY,previousKey:PREV_KEY,olderKey:OLDER,old2Key:OLD2,legacyKey:LEGACY};
  try{
    if(typeof localStorage!=='undefined'){
      const keys=[NEW_KEY,PREV_KEY,OLDER,OLD2,LEGACY],source=keys.map((k)=>localStorage.getItem(k)).find(Boolean);
      if(source)keys.forEach((key)=>{if(!localStorage.getItem(key))localStorage.setItem(key,source);});
    }
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity07Patched){
      const priorSet=Storage.prototype.setItem,priorRemove=Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype,'__livingCity07Patched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){priorSet.call(this,key,value);if([LEGACY,OLD2,OLDER,PREV_KEY].includes(key))priorSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){priorRemove.call(this,key);if([LEGACY,OLD2,OLDER,PREV_KEY].includes(key))priorRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('LIVING-CITY-07 Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
