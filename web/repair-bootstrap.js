(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0100';
  const OLD_KEY='pppoppi-bunkerwahrheit-html-v090';
  root.LIVING_CITY_04A_STORAGE={newKey:NEW_KEY,legacyKey:OLD_KEY};
  try{
    if(typeof localStorage!=='undefined'){
      const current=localStorage.getItem(NEW_KEY),legacy=localStorage.getItem(OLD_KEY);
      if(current&&!legacy)localStorage.setItem(OLD_KEY,current);
    }
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity04aPatched){
      const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype,'__livingCity04aPatched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){nativeSet.call(this,key,value);if(key===OLD_KEY)nativeSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){nativeRemove.call(this,key);if(key===OLD_KEY)nativeRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('04A-Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
