(function(root){
  'use strict';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=(v)=>`${Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:0})} €`;
  function interactiveTarget(event){return event.target?.closest?.('button,[data-open-interior]');}
  function renderInteriorDelta(){
    const receipt=root.LIVING_CITY_06_ENGINE?.getLastInteriorActionReceipt?.(),outcome=document.querySelector('#coachRail[data-tone="success"] .coach-outcome');
    if(!receipt?.keys?.length||!outcome||outcome.querySelector('.coach-deltas'))return;
    const meta={money:['Bargeld','money'],supplies:['Vorrat','count'],tension:['Spannung','score'],opportunity:['Chancen','score'],districtControl:['Kontrolle','percent'],districtPolice:['Polizeidruck','percent'],districtRival:['Rivalendruck','percent'],crewStress:['Ø Stress','percent'],crewMorale:['Ø Moral','percent']};
    const format=(value,unit)=>unit==='money'?money(value):unit==='percent'?`${value}%`:String(value);
    const deltas=receipt.keys.map((key)=>{const [label,unit]=meta[key]||[key,'score'];return`<span class="coach-delta" data-metric="${esc(key)}"><b>${esc(label)}</b> <span data-before>${esc(format(receipt.before[key],unit))}</span><i aria-hidden="true">→</i><span data-after>${esc(format(receipt.after[key],unit))}</span></span>`;}).join(' · ');
    outcome.insertAdjacentHTML('beforeend',` <span class="coach-deltas" aria-label="Vorher-Nachher-Veränderung">${deltas}</span>`);
  }
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
    if(target.dataset.lc06InteriorAction!==undefined){renderInteriorDelta();}
  });
  root.LIVING_CITY_11_BROWSER_HARDENING=Object.freeze({version:'1.1',mode:'post-bubble-atomic-ui'});
})(typeof globalThis!=='undefined'?globalThis:this);
