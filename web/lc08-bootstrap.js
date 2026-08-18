(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0140',PREV='pppoppi-bunkerwahrheit-html-v0130',OLDER=['pppoppi-bunkerwahrheit-html-v0120','pppoppi-bunkerwahrheit-html-v0110','pppoppi-bunkerwahrheit-html-v0100','pppoppi-bunkerwahrheit-html-v090'];
  const keys=[NEW_KEY,PREV,...OLDER];
  root.LIVING_CITY_08_STORAGE={newKey:NEW_KEY,previousKey:PREV,olderKeys:[...OLDER]};
  try{
    if(typeof localStorage!=='undefined'){
      const source=keys.map((k)=>localStorage.getItem(k)).find(Boolean);
      if(source)keys.forEach((key)=>{if(!localStorage.getItem(key))localStorage.setItem(key,source);});
    }
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity08Patched){
      const priorSet=Storage.prototype.setItem,priorRemove=Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype,'__livingCity08Patched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){priorSet.call(this,key,value);if(keys.slice(1).includes(key))priorSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){priorRemove.call(this,key);if(keys.slice(1).includes(key))priorRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('LIVING-CITY-08 Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
