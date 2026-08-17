(function(root){
  'use strict';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=(v)=>`${Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:0})} €`;
  function interactiveTarget(event){return event.target?.closest?.('button,[data-open-interior]');}
  function renderInteriorDelta(){
    const receipt=root.LIVING_CITY_06_ENGINE?.getLastInteriorActionReceipt?.(),outcome=document.querySelector('#coachRail[data-tone="success"] .coach-outcome');
    if(!receipt?.keys?.length||!outcome||outcome.querySelector('.coach-deltas'))return;
    const meta={money:['Bargeld','money',1],supplies:['Vorrat','count',1],tension:['Spannung','score',-1],opportunity:['Chancen','score',1],districtControl:['Kontrolle','percent',1],districtPolice:['Polizeidruck','percent',-1],districtRival:['Rivalendruck','percent',-1],crewStress:['Ø Stress','percent',-1],crewMorale:['Ø Moral','percent',1]};
    const format=(value,unit)=>unit==='money'?money(value):unit==='percent'?`${value}%`:String(value);
    const impact=(before,after,polarity)=>{const delta=Number(after)-Number(before);if(!Number.isFinite(delta)||delta===0)return'neutral';return delta*polarity>0?'benefit':'risk';};
    const impactLabel={benefit:'vorteilhaft',risk:'nachteilig',neutral:'neutral'};
    const magnitudeThresholds={money:[500,2000],supplies:[2,6],tension:[5,15],opportunity:[5,15],districtControl:[5,15],districtPolice:[5,15],districtRival:[5,15],crewStress:[5,15],crewMorale:[5,15]};
    const magnitude=(key,before,after)=>{const delta=Math.abs(Number(after)-Number(before));if(!Number.isFinite(delta)||delta===0)return'none';const [medium,strong]=magnitudeThresholds[key]||[5,15];return delta>=strong?'strong':delta>=medium?'medium':'small';};
    const magnitudeLabel={none:'keine Veränderung',small:'kleine Veränderung',medium:'mittlere Veränderung',strong:'starke Veränderung'};
    const deltas=receipt.keys.map((key)=>{const [label,unit,polarity=1]=meta[key]||[key,'score',1],before=receipt.before[key],after=receipt.after[key],tone=impact(before,after,polarity),strength=magnitude(key,before,after);return`<span class="coach-delta" data-metric="${esc(key)}" data-impact="${tone}" data-magnitude="${strength}" aria-label="${esc(`${label}: ${format(before,unit)} zu ${format(after,unit)}, ${impactLabel[tone]}, ${magnitudeLabel[strength]}`)}"><b>${esc(label)}</b> <span data-before>${esc(format(before,unit))}</span><i aria-hidden="true">→</i><span data-after>${esc(format(after,unit))}</span></span>`;}).join(' · ');
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
  root.LIVING_CITY_11_BROWSER_HARDENING=Object.freeze({version:'1.2',mode:'post-bubble-atomic-ui'});
})(typeof globalThis!=='undefined'?globalThis:this);