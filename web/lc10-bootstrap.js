(function(root){
  'use strict';
  const NEW_KEY='pppoppi-bunkerwahrheit-html-v0160',PREV='pppoppi-bunkerwahrheit-html-v0150',OLDER=['pppoppi-bunkerwahrheit-html-v0140','pppoppi-bunkerwahrheit-html-v0130','pppoppi-bunkerwahrheit-html-v0120','pppoppi-bunkerwahrheit-html-v0110','pppoppi-bunkerwahrheit-html-v0100','pppoppi-bunkerwahrheit-html-v090'];
  const keys=[NEW_KEY,PREV,...OLDER],RECOVERY_KEY='pppoppi-bunkerwahrheit-recovery-v0160';
  root.LIVING_CITY_10_STORAGE={newKey:NEW_KEY,previousKey:PREV,olderKeys:[...OLDER],recoveryKey:RECOVERY_KEY};
  try{
    if(typeof localStorage!=='undefined'){const source=keys.map((k)=>localStorage.getItem(k)).find(Boolean);if(source)keys.forEach((key)=>{if(!localStorage.getItem(key))localStorage.setItem(key,source);});}
    if(typeof Storage!=='undefined'&&Storage.prototype&&!Storage.prototype.__livingCity10Patched){
      const priorSet=Storage.prototype.setItem,priorRemove=Storage.prototype.removeItem;Object.defineProperty(Storage.prototype,'__livingCity10Patched',{value:true,configurable:true});
      Storage.prototype.setItem=function(key,value){priorSet.call(this,key,value);if(keys.slice(1).includes(key))priorSet.call(this,NEW_KEY,value);};
      Storage.prototype.removeItem=function(key){priorRemove.call(this,key);if(keys.slice(1).includes(key))priorRemove.call(this,NEW_KEY);};
    }
  }catch(error){console.warn('LIVING-CITY-10 Speichermigration konnte nicht aktiviert werden.',error);}
})(typeof globalThis!=='undefined'?globalThis:this);
