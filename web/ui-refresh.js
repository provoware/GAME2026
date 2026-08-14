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
    root.LIVING_CITY_07_UI?.render?.();
    root.LIVING_CITY_08_UI?.render?.();
    root.LIVING_CITY_09_UI?.render?.();
    root.LIVING_CITY_10_UI?.render?.();
  }
  function schedule(){
    if(pending)return;
    pending=true;
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }
  document.addEventListener('click',(event)=>{
    const zoom=event.target.closest?.('#mapZoomOut,#mapZoomReset,#mapZoomIn');
    if(zoom){
      if(zoom.id==='mapZoomReset')root.LIVING_CITY_05B_UI?.fitMap?.();
      else if(zoom.id==='mapZoomIn')root.LIVING_CITY_05B_UI?.zoomIn?.();
      else root.LIVING_CITY_05B_UI?.zoomOut?.();
      return;
    }
    schedule();
  });
  document.addEventListener('keydown',(event)=>{
    const mapViewport=event.target?.closest?.('#cityMap')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','+','=','-','_','Home','0'].includes(event.key.length===1?event.key.toLowerCase():event.key);
    if(mapViewport)return;
    if(['Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape'].includes(event.key)||event.key.toLowerCase()==='e')schedule();
  });
  root.GAME_UI_REFRESH=Object.freeze({schedule});
})(typeof globalThis!=='undefined'?globalThis:this);
