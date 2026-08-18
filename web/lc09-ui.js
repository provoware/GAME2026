(function(root){
  'use strict';
  const engine=root.LIVING_CITY_09_ENGINE||root.LIVING_CITY_08_ENGINE;
  const storage=root.LIVING_CITY_09_STORAGE;
  if(!engine||!storage)return;
  const $=(s)=>document.querySelector(s);
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const readSnapshots=()=>{try{return JSON.parse(localStorage.getItem(storage.recoveryKey)||'[]');}catch{return[];}};
  const writeSnapshots=(items)=>localStorage.setItem(storage.recoveryKey,JSON.stringify(items.slice(0,5)));
  function persistGame(){
    try{
      const raw=engine.exportState();
      [storage.newKey,storage.previousKey,...storage.olderKeys].forEach((k)=>localStorage.setItem(k,raw));
      $('#saveStatus')?.replaceChildren(document.createTextNode('LC09 lokal gespeichert'));
    }catch(error){console.warn('LC09 konnte den Spielstand nicht spiegeln.',error);}
  }
  function applyAccessibility(){
    const p=engine.getAccessibilityPreferences();
    document.documentElement.style.setProperty('--lc09-font-scale',String(p.fontScale));
    document.body.classList.toggle('lc09-high-contrast',p.highContrast);
    document.body.classList.toggle('lc09-reduced-motion',p.reducedMotion);
    document.body.dataset.lc09Font=String(p.fontScale);
  }
  function snapshot(){
    try{
      const state=JSON.parse(engine.exportState());
      const item={id:`r-${Date.now()}`,createdAt:new Date().toISOString(),turn:Number(state.turn||0),locationId:state.currentLocationId||'',locationTitle:engine.getLocation?.(state.currentLocationId)?.title||state.currentLocationId||'Unbekannt',raw:JSON.stringify(state)};
      writeSnapshots([item,...readSnapshots().filter((x)=>x.id!==item.id)]);
      renderDialog();
      $('#tickerText').textContent='Wiederherstellungspunkt erstellt.';
    }catch(error){console.warn(error);$('#tickerText').textContent='Wiederherstellungspunkt konnte nicht erstellt werden.';}
  }
  function restore(id){
    const item=readSnapshots().find((x)=>x.id===id);if(!item)return;
    try{
      [storage.newKey,storage.previousKey,...storage.olderKeys].forEach((k)=>localStorage.setItem(k,item.raw));
      location.reload();
    }catch(error){console.warn(error);$('#tickerText').textContent='Wiederherstellung nicht möglich.';}
  }
  function removeSnapshot(id){writeSnapshots(readSnapshots().filter((x)=>x.id!==id));renderDialog();}
  function pulseMarkup(){
    const p=engine.getCityPulse();
    const pressure=p.pressure>=70?'hoch':p.pressure>=40?'mittel':'ruhig';
    return `<section class="lc09-pulse"><div class="lc09-pulse-head"><span>STADT-PULS</span><b>${esc(pressure)} · ${p.pressure}/100</b></div><div class="lc09-meter"><i style="width:${p.pressure}%"></i></div><div class="lc09-pulse-grid"><span>Spannung <b>${p.tension}</b></span><span>Chancen <b>${p.opportunity}</b></span><span>Spätfolgen <b>${p.pendingConsequences}</b></span><span>Bögen <b>${p.arcsComplete}/${p.arcsTotal}</b></span><span>Crew-Stress <b>${p.avgStress}</b></span><span>Moral <b>${p.avgMorale}</b></span></div><ul>${p.signals.map((s)=>`<li>${esc(s)}</li>`).join('')}</ul></section>`;
  }
  function snapshotsMarkup(){
    const list=readSnapshots();
    return `<section class="lc09-recovery"><div class="lc09-section-head"><div><span>WIEDERHERSTELLUNG</span><b>Sichere Zwischenstände</b></div><button class="mini-btn good" data-lc09-snapshot>Jetzt sichern</button></div>${list.length?list.map((x)=>`<article><div><b>Zug ${x.turn} · ${esc(x.locationTitle)}</b><small>${new Date(x.createdAt).toLocaleString('de-DE')}</small></div><div><button class="mini-btn" data-lc09-restore="${esc(x.id)}">Wiederherstellen</button><button class="mini-btn" data-lc09-remove="${esc(x.id)}">Löschen</button></div></article>`).join(''):'<p class="muted">Noch kein manueller Wiederherstellungspunkt. Automatische Spielstände bleiben davon unabhängig.</p>'}</section>`;
  }
  function accessibilityMarkup(){
    const p=engine.getAccessibilityPreferences();
    return `<section class="lc09-access"><div class="lc09-section-head"><div><span>LESEN & BEDIENEN</span><b>Anzeige anpassen</b></div></div><div class="lc09-presets">${(engine.data.accessibilityPresets||[]).map((x)=>`<button class="mini-btn" data-lc09-preset="${x.id}">${esc(x.title)}</button>`).join('')}</div><label>Schriftgröße <select data-lc09-font><option value="1" ${p.fontScale===1?'selected':''}>100 %</option><option value="1.1" ${p.fontScale===1.1?'selected':''}>110 %</option><option value="1.2" ${p.fontScale===1.2?'selected':''}>120 %</option></select></label><label><input type="checkbox" data-lc09-contrast ${p.highContrast?'checked':''}> Hoher Kontrast</label><label><input type="checkbox" data-lc09-motion ${p.reducedMotion?'checked':''}> Bewegungen reduzieren</label><p class="muted">Die Einstellungen werden im Spielstand gespeichert und wirken sofort.</p></section>`;
  }
  function renderDialog(){const body=$('#lc09HubBody');if(body)body.innerHTML=pulseMarkup()+accessibilityMarkup()+snapshotsMarkup();}
  function ensureUI(){
    if(!$('#lc09HubButton')){
      const button=document.createElement('button');button.className='btn ghost';button.id='lc09HubButton';button.textContent='Stadt & Komfort';button.title='Stadt-Puls, Lesemodus und Wiederherstellung';
      $('#lc06AudioButton')?.insertAdjacentElement('afterend',button);
    }
    if(!$('#lc09HubDialog')){
      const dialog=document.createElement('dialog');dialog.id='lc09HubDialog';dialog.className='modal lc09-hub-modal';dialog.innerHTML='<div class="modal-card wide lc09-hub-card"><button class="modal-close" data-lc09-close aria-label="Stadt- und Komfortzentrale schließen">×</button><span class="eyebrow">LIVING-CITY-09</span><h2>Stadt & Komfort</h2><div id="lc09HubBody"></div></div>';
      document.body.appendChild(dialog);
    }
  }
  document.addEventListener('click',(e)=>{
    const t=e.target.closest?.('#lc09HubButton,[data-lc09-close],[data-lc09-snapshot],[data-lc09-restore],[data-lc09-remove],[data-lc09-preset]');if(!t)return;
    if(t.id==='lc09HubButton'){renderDialog();$('#lc09HubDialog').showModal();return;}
    if(t.hasAttribute('data-lc09-close')){$('#lc09HubDialog').close();return;}
    if(t.hasAttribute('data-lc09-snapshot')){snapshot();return;}
    if(t.dataset.lc09Restore){restore(t.dataset.lc09Restore);return;}
    if(t.dataset.lc09Remove){removeSnapshot(t.dataset.lc09Remove);return;}
    if(t.dataset.lc09Preset){engine.applyAccessibilityPreset(t.dataset.lc09Preset);applyAccessibility();persistGame();renderDialog();}
  });
  document.addEventListener('change',(e)=>{
    if(e.target.matches('[data-lc09-font]'))engine.setAccessibilityPreferences({fontScale:Number(e.target.value)});
    else if(e.target.matches('[data-lc09-contrast]'))engine.setAccessibilityPreferences({highContrast:e.target.checked});
    else if(e.target.matches('[data-lc09-motion]'))engine.setAccessibilityPreferences({reducedMotion:e.target.checked});
    else return;
    applyAccessibility();persistGame();renderDialog();
  });
  document.addEventListener('keydown',(e)=>{if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;if(e.key.toLowerCase()==='u'&&!document.querySelector('dialog[open]')){e.preventDefault();renderDialog();$('#lc09HubDialog').showModal();}});
  ensureUI();applyAccessibility();document.body.dataset.livingCity='09';
  root.LIVING_CITY_09_UI=Object.freeze({render:renderDialog,applyAccessibility,snapshot});
})(typeof globalThis!=='undefined'?globalThis:this);
