(function(root){
  'use strict';
  const engine=root.LIVING_CITY_07_ENGINE||root.LIVING_CITY_06_ENGINE||root.LIVING_CITY_05_ENGINE||root.REVIVAL_GAME_ENGINE;
  const DATA=root.GAME_DATA;if(!engine||!DATA)return;
  const $=(s)=>document.querySelector(s),$$=(s)=>Array.from(document.querySelectorAll(s));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let fxCtx=null,fxGain=null,lastFxAt=0;
  function persist(){try{const raw=engine.exportState();['pppoppi-bunkerwahrheit-html-v0130','pppoppi-bunkerwahrheit-html-v0120','pppoppi-bunkerwahrheit-html-v0110','pppoppi-bunkerwahrheit-html-v0100'].forEach((k)=>localStorage.setItem(k,raw));}catch(_){}}
  function ensureShell(){
    document.body.dataset.livingCity='07';
    const footer=$('.footerbar');if(footer&&!$('#lc07AcceptanceBadge')){const badge=document.createElement('span');badge.id='lc07AcceptanceBadge';badge.className='lc07-acceptance-badge';badge.innerHTML='<b>Chrome-E2E</b><small>CI-qualifiziert</small>';footer.insertBefore(badge,footer.lastElementChild);}
    const action=$('.action-panel'),tabs=$('#tabs');if(action&&tabs&&!$('#lc07StoryStrip')){const strip=document.createElement('section');strip.id='lc07StoryStrip';strip.className='story-strip';strip.hidden=true;tabs.before(strip);}
  }
  function storyStrip(){
    const el=$('#lc07StoryStrip');if(!el)return;const summary=engine.getStorySummary();
    if(!summary.consequences.length){el.hidden=true;return;}
    el.hidden=false;const last=summary.consequences[0];el.innerHTML=`<div><span>FOLGEKETTE</span><b>${esc(last.title)}</b><small>${esc(last.detail)}</small></div><button class="mini-btn" data-story-toggle>Folgen ${summary.count}</button>`;
  }
  function showStoryCoach(){
    const s=engine.getStorySummary(),ui=root.LIVING_CITY_06_UI;if(!ui?.showCoach)return;
    if(!s.consequences.length){ui.showCoach('Noch keine Folgekette','Entscheidungen in Ortsgesprächen können später neue Optionen an anderen Orten freischalten.');return;}
    const last=s.consequences[0];ui.showCoach(`Letzte Folge: ${last.title}`,`${last.detail} · ${s.count} gespeicherte Markierungen.`,'success');
  }
  function enhanceAudioDock(){
    const dock=$('#lc06AudioDock');if(!dock||dock.querySelector('[data-audio-range="effects"]'))return;
    const mix=engine.getAudioMixer();const master=dock.querySelector('.audio-master-toggle');if(!master)return;
    const effects=document.createElement('label');effects.className='lc07-effects-range';effects.innerHTML=`<span>Effekte</span><input type="range" min="0" max="100" value="${Math.round((mix.effects??.32)*100)}" data-audio-range="effects"><b>${Math.round((mix.effects??.32)*100)}%</b>`;master.before(effects);
    const duck=document.createElement('label');duck.className='audio-ducking';duck.innerHTML=`<input type="checkbox" data-audio-ducking ${mix.ducking!==false?'checked':''}><span>Musik bei Dialog/Kampf automatisch absenken</span>`;master.before(duck);
  }
  function audioContext(){
    if(fxCtx&&fxCtx.state!=='closed')return fxCtx;
    try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;fxCtx=new Ctx();fxGain=fxCtx.createGain();fxGain.gain.value=0;fxGain.connect(fxCtx.destination);return fxCtx;}catch(_){return null;}
  }
  function playUiTone(kind='ok'){
    const mix=engine.getAudioMixer();if(!mix.enabled||mix.effects<=0)return;
    const nowMs=Date.now();if(nowMs-lastFxAt<90)return;lastFxAt=nowMs;
    const ctx=audioContext();if(!ctx)return;
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
    const freq={ok:440,choice:520,warn:180,travel:330}[kind]||400;
    osc.type=kind==='warn'?'triangle':'sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(Math.max(90,freq*.72),now+.08);
    gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,(mix.master||0)*(mix.effects||0)*.045),now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.11);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.12);
  }
  function applyDucking(){
    const mix=engine.getAudioMixer(),dialogOpen=!!document.querySelector('#combatDialog[open], .scene-modal[open], #personDialog[open]');
    document.body.classList.toggle('lc07-audio-duck',!!(mix.enabled&&mix.ducking&&dialogOpen));
  }
  function augmentHelp(){
    const body=$('#helpDockBody');if(!body||body.querySelector('.lc07-help-extra'))return;
    const extra=document.createElement('article');extra.className='help-step lc07-help-extra';extra.innerHTML='<strong>LC07 · Folgen & Chrome-Abnahme</strong><p>Ortsgespräche können spätere Optionen freischalten. Der Release wird in echtem Google Chrome bei mehreren Desktopgrößen automatisiert geprüft.</p><div class="key-grid"><span><kbd>G</kbd>nächster Schritt</span><span><kbd>I</kbd>Innenraum</span><span><kbd>K</kbd>Klang</span><span><kbd>Alt+1–8</kbd>Bereich</span></div>';body.appendChild(extra);
  }
  function polishDialogue(){
    const scene=document.querySelector('.scene-modal[open]');if(!scene)return;const d=engine.getDialogueForLocation(engine.state.currentLocationId);if(!d)return;
    const box=scene.querySelector('.lc06-dialogue');if(!box||box.querySelector('.lc07-consequence-note'))return;
    const summary=engine.getStorySummary(),note=document.createElement('div');note.className='lc07-consequence-note';
    note.innerHTML=`<span>FOLGEKETTE</span><b>${summary.count?`${summary.count} frühere Entscheidungen wirken weiter`:'Noch keine ortsübergreifende Folge gespeichert'}</b><small>${d.ending?esc(d.ending):'Freigeschaltete Optionen erscheinen automatisch im Gespräch.'}</small>`;box.prepend(note);
  }
  function polishCombat(){
    const dialog=$('#combatDialog');if(!dialog?.open)return;dialog.setAttribute('aria-label','Kampfentscheidung');applyDucking();
    const content=$('#combatDialogContent');if(content&&!content.querySelector('.lc07-combat-shortcuts')){const row=content.querySelector('.button-row');if(row){const hint=document.createElement('div');hint.className='lc07-combat-shortcuts';hint.textContent='Tastatur im Kampf: 1 Angriff · 2 Deckung · 3 Rückzug';row.before(hint);}}
  }
  function render(){ensureShell();storyStrip();enhanceAudioDock();augmentHelp();polishDialogue();polishCombat();applyDucking();}
  document.addEventListener('click',(event)=>{
    const t=event.target.closest?.('button,[data-dialogue-choice],[data-lc06-interior-action],[data-travel-to]');if(!t)return;
    if(t.dataset.storyToggle!==undefined){showStoryCoach();return;}
    if(t.dataset.dialogueChoice){setTimeout(()=>{playUiTone('choice');storyStrip();polishDialogue();},0);}
    else if(t.dataset.lc06InteriorAction){setTimeout(()=>{playUiTone('ok');storyStrip();},0);}
    else if(t.dataset.travelTo){playUiTone('travel');}
    else if(t.dataset.combatDecision){playUiTone(t.dataset.combatDecision==='retreat'?'warn':'choice');}
    setTimeout(()=>{enhanceAudioDock();applyDucking();},0);
  },true);
  document.addEventListener('change',(event)=>{const t=event.target;if(t.matches?.('[data-audio-ducking]')){engine.setAudioMixer({ducking:t.checked});persist();applyDucking();}});
  document.addEventListener('keydown',(event)=>{
    if(!$('#combatDialog')?.open||event.ctrlKey||event.metaKey||event.altKey)return;
    if(['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName))return;
    const map={'1':'attack','2':'cover','3':'retreat'},decision=map[event.key];if(!decision)return;
    const btn=$(`#combatDialog [data-combat-decision="${decision}"]`);if(btn){event.preventDefault();btn.click();}
  });
  window.addEventListener('pagehide',()=>{try{fxCtx?.close();}catch(_){}});
  root.LIVING_CITY_07_UI=Object.freeze({render,storyStrip,showStoryCoach,playUiTone});
  render();
})(typeof globalThis!=='undefined'?globalThis:this);
