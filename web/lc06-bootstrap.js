(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0120',PREV_KEY='pppoppi-bunkerwahrheit-html-v0110',OLDER='pppoppi-bunkerwahrheit-html-v0100',LEGACY='pppoppi-bunkerwahrheit-html-v090';
  root.LIVING_CITY_06_STORAGE={newKey:NEW_KEY,previousKey:PREV_KEY,olderKey:OLDER,legacyKey:LEGACY};
  try{
    if(typeof localStorage!=='undefined'){
      const source=localStorage.getItem(NEW_KEY)||localStorage.getItem(PREV_KEY)||localStorage.getItem(OLDER)||localStorage.getItem(LEGACY);
      if(source){[NEW_KEY,PREV_KEY,OLDER,LEGACY].forEach((key)=>{if(!localStorage.getItem(key))localStorage.setItem(key,source);});}
    }
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity06Patched){
      const priorSet=Storage.prototype.setItem,priorRemove=Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype,'__livingCity06Patched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){priorSet.call(this,key,value);if([LEGACY,OLDER,PREV_KEY].includes(key))priorSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){priorRemove.call(this,key);if([LEGACY,OLDER,PREV_KEY].includes(key))priorRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('LIVING-CITY-06 Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
