(function(root){
  'use strict';
  let pending=false;
  function run(){
    pending=false;
    root.LIVING_CITY_04A?.renderMap?.();
    root.LIVING_CITY_04A?.renderRivals?.();
    root.dispatchEvent?.(new Event('revival-render'));
    root.LIVING_CITY_05_UI?.render?.();
    root.LIVING_CITY_05B_UI?.render?.();
    root.LIVING_CITY_06_UI?.render?.();
  }
  function schedule(){
    if(pending)return;
    pending=true;
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }
  document.addEventListener('click',schedule);
  document.addEventListener('keydown',(event)=>{
    if(['Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape'].includes(event.key)||event.key.toLowerCase()==='e')schedule();
  });
  root.GAME_UI_REFRESH=Object.freeze({schedule});
})(typeof globalThis!=='undefined'?globalThis:this);
