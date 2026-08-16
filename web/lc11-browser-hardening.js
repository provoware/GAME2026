(function(root){
  'use strict';
  function interactiveTarget(event){return event.target?.closest?.('button,[data-open-interior]');}
  window.addEventListener('keydown',(event)=>{
    if(event.defaultPrevented&&event.key?.toLowerCase()==='i'){
      root.LIVING_CITY_06_UI?.renderInteriorEnhancement?.();
    }
  });
  window.addEventListener('click',(event)=>{
    const target=interactiveTarget(event);if(!target)return;
    if(target.id==='lc06AudioButton'||target.dataset.audioPreset!==undefined||target.dataset.audioEnabled!==undefined){
      root.LIVING_CITY_07_UI?.render?.();
    }
    if(target.dataset.openInterior!==undefined){
      root.LIVING_CITY_06_UI?.renderInteriorEnhancement?.();
    }
  });
  root.LIVING_CITY_11_BROWSER_HARDENING=Object.freeze({version:'1.0',mode:'post-bubble-atomic-ui'});
})(typeof globalThis!=='undefined'?globalThis:this);
