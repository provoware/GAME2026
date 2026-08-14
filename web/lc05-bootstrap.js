(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0110',PREV_KEY='pppoppi-bunkerwahrheit-html-v0100',LEGACY='pppoppi-bunkerwahrheit-html-v090';
  root.LIVING_CITY_05_STORAGE={newKey:NEW_KEY,previousKey:PREV_KEY,legacyKey:LEGACY};
  try{
    if(typeof localStorage!=='undefined'){
      const newest=localStorage.getItem(NEW_KEY),previous=localStorage.getItem(PREV_KEY),legacy=localStorage.getItem(LEGACY),source=newest||previous||legacy;
      if(source){if(!legacy)localStorage.setItem(LEGACY,source);if(!previous)localStorage.setItem(PREV_KEY,source);if(!newest)localStorage.setItem(NEW_KEY,source);}
    }
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity05Patched){
      const priorSet=Storage.prototype.setItem,priorRemove=Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype,'__livingCity05Patched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){priorSet.call(this,key,value);if(key===LEGACY||key===PREV_KEY)priorSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){priorRemove.call(this,key);if(key===LEGACY||key===PREV_KEY)priorRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('LIVING-CITY-05 Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
