(function(root){
  'use strict';
  const engine=root.LIVING_CITY_06_ENGINE||root.LIVING_CITY_05_ENGINE||root.REVIVAL_GAME_ENGINE;
  const DATA=root.GAME_DATA;if(!engine||!DATA)return;
  const $=(s)=>document.querySelector(s),$$=(s)=>Array.from(document.querySelectorAll(s));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=(v)=>`${Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:0})} €`;
  let activeInteriorId=engine.state.currentLocationId,audioCtx=null,musicOsc=null,ambientOsc=null,masterGain=null,musicGain=null,ambientGain=null,lastCoachKey='';
  function persist(){try{const raw=engine.exportState();['pppoppi-bunkerwahrheit-html-v0120','pppoppi-bunkerwahrheit-html-v0110','pppoppi-bunkerwahrheit-html-v0100'].forEach((k)=>localStorage.setItem(k,raw));}catch(_){}}
  function ensureShell(){
    const topActions=$('.top-actions');
    if(topActions&&!$('#lc06AudioButton')){const b=document.createElement('button');b.id='lc06AudioButton';b.className='btn ghost';b.textContent='Klang';b.title='Sound- und Musikmixer (Taste K)';topActions.insertBefore(b,$('#helpButton'));}
    const header=$('.topbar'),dashboard=$('#focusDashboard');
    if(header&&dashboard&&!$('#coachRail')){const rail=document.createElement('section');rail.id='coachRail';rail.className='coach-rail';rail.hidden=true;rail.setAttribute('aria-live','polite');dashboard.after(rail);}
    const action=$('.action-panel'),tabs=$('#tabs');
    if(action&&tabs&&!$('#lc06AudioDock')){const dock=document.createElement('section');dock.id='lc06AudioDock';dock.className='audio-dock';dock.hidden=true;tabs.before(dock);}
    document.body.dataset.livingCity='06';
  }
  function switchTab(name){const btn=$(`[data-tab="${name}"]`);if(btn)btn.click();}
  function showCoach(title,text,tone='info',outcome=null){
    const rail=$('#coachRail');if(!rail)return;rail.hidden=false;rail.dataset.tone=tone;
    const outcomeHtml=outcome?` <span class="coach-outcome" aria-label="Aktionsbilanz"><span data-kind="benefit"><b>ERGEBNIS</b> ${esc(outcome.result||'situativer Effekt')}</span><span class="coach-outcome-sep" aria-hidden="true"> · </span><span data-kind="cost"><b>KOSTEN</b> ${esc(outcome.cost||'keine')}</span></span>`:'';
    rail.innerHTML=`<div class="coach-orb">?</div><div class="coach-copy"><span>SPIELFÜHRUNG</span><strong>${esc(title)}</strong><small>${esc(text)}${outcomeHtml}</small></div><button class="mini-btn" data-coach-close>Ausblenden</button>`;
  }
  function renderGuide(){
    const box=$('#focusDashboard');if(!box)return;const g=engine.getGuidance(),p=g.priority;
    const active=document.activeElement,restoreGuideFocus=!!active&&box.contains(active)&&!!active.closest?.('.lc06-guide-card');
    const existing=box.querySelectorAll('.lc06-guide-card');existing.forEach((n)=>n.remove());
    const card=document.createElement('article');card.className='focus-card priority lc06-guide-card';
    card.innerHTML=`<div class="focus-icon">${esc(p.icon)}</div><div class="focus-copy"><span>NÄCHSTER SCHRITT</span><b>${esc(p.title)}</b><small>${esc(p.detail)}</small></div><button class="mini-btn good" data-guide-kind="${esc(p.kind)}">${esc(p.action)}</button>`;
    box.prepend(card);
    if(restoreGuideFocus)card.querySelector('button')?.focus();
    const key=`${engine.state.turn}|${p.kind}|${p.title}`;
    if(engine.state.preferences.guidance&&key!==lastCoachKey){lastCoachKey=key;showCoach('Nächster sinnvoller Schritt',`${p.title} — ${p.detail}`,'guide');}
  }
  function executeGuide(kind){
    if(kind==='director'){switchTab('director');return;}
    if(kind==='casino'){switchTab('casino');return;}
    if(kind==='crew'){switchTab('crew');return;}
    if(kind==='economy'){switchTab('bank');return;}
    if(kind==='map'){root.LIVING_CITY_05B_UI?.render?.();$('#cityMap')?.focus();return;}
    if(kind==='interior'){root.LIVING_CITY_05_UI?.renderScene?.(engine.state.currentLocationId);activeInteriorId=engine.state.currentLocationId;setTimeout(renderInteriorEnhancement,0);return;}
    if(kind==='combat'){const trigger=$('[data-game-action="raid"]');if(trigger)trigger.click();else if($('#combatDialog')&&!$('#combatDialog').open)$('#combatDialog').showModal();setTimeout(renderCombatEnhancement,0);}
  }
  function effectSummary(effects={}){const out=[];if(effects.opportunity)out.push(`Chancen ${effects.opportunity>0?'+':''}${effects.opportunity}`);if(effects.tension)out.push(`Spannung ${effects.tension>0?'+':''}${effects.tension}`);if(effects.crewStress)out.push(`Stress ${effects.crewStress>0?'+':''}${effects.crewStress}`);if(effects.crewMorale)out.push(`Moral ${effects.crewMorale>0?'+':''}${effects.crewMorale}`);if(effects.districtControl)out.push(`Kontrolle ${effects.districtControl>0?'+':''}${effects.districtControl}`);if(effects.supplies)out.push(`Vorrat +${effects.supplies}`);if(effects.relation)out.push(`Bindung +${effects.relation}`);return out.join(' · ')||'situativer Effekt';}
  function renderInteriorEnhancement(){
    const dialog=$('#sceneDialog'),content=$('#sceneDialogContent');if(!dialog?.open||!content)return;
    const locationId=activeInteriorId||engine.state.currentLocationId,here=locationId===engine.state.currentLocationId;
    let panel=content.querySelector('.lc06-interactive-panel');if(!panel){panel=document.createElement('section');panel.className='lc06-interactive-panel';content.appendChild(panel);}
    const actions=engine.getInteriorActions(locationId),dialogue=engine.getDialogueForLocation(locationId);
    const actionHtml=actions.map((a)=>`<button class="interior-action ${a.available?'':'disabled'}" data-lc06-interior-action="${esc(a.id)}" data-location-id="${esc(locationId)}" ${a.available?'':'disabled'}><i>${esc(a.icon)}</i><span><b>${esc(a.title)}</b><small>${esc(a.description)}</small><em>${a.cost?money(a.cost)+' · ':''}${esc(effectSummary(a.effects))}</em>${a.reason?`<u>${esc(a.reason)}</u>`:''}</span></button>`).join('');
    panel.innerHTML=`<div class="lc06-section-head"><div><span class="eyebrow">INTERAKTIVER ORT</span><h3>${here?'Was willst du hier tun?':'Vorschau dieses Ortes'}</h3></div><span class="status-pill">${here?'Du bist hier':'Reise erforderlich'}</span></div><div class="interior-action-grid">${actionHtml}</div><div class="lc06-dialogue" id="lc06Dialogue"></div>`;
    renderDialogue(locationId,dialogue);
  }
  function renderDialogue(locationId,dialogue=engine.getDialogueForLocation(locationId)){
    const box=$('#lc06Dialogue');if(!box)return;
    if(!dialogue){box.innerHTML='<div class="dialogue-empty"><span>ORTSKONTAKT</span><b>Hier gibt es aktuell kein besonderes Gespräch.</b></div>';return;}
    if(dialogue.status==='new'){box.innerHTML=`<div class="dialogue-head"><div><span>ORTSKONTAKT</span><b>${esc(dialogue.speaker)}</b></div><button class="mini-btn good" data-dialogue-start="${esc(dialogue.dialogueId)}">Gespräch beginnen</button></div><p>Ein kurzes Gespräch kann die Lage oder Crew beeinflussen.</p>`;return;}
    if(dialogue.status==='completed'){
      const wait=Math.max(0,5-(engine.state.turn-(dialogue.completedTurn||0)));
      box.innerHTML=`<div class="dialogue-head"><div><span>GESPRÄCH BEENDET</span><b>${esc(dialogue.speaker)}</b></div><span class="status-pill">${wait?`${wait} Züge Pause`:'wieder möglich'}</span></div><p>${esc(engine.state.dialogues[dialogue.dialogueId]?.ending||'Das Gespräch wirkt nach.')}</p>${wait?'':`<button class="mini-btn" data-dialogue-start="${esc(dialogue.dialogueId)}">Noch einmal sprechen</button>`}`;return;
    }
    box.innerHTML=`<div class="dialogue-head"><div><span>GESPRÄCH</span><b>${esc(dialogue.speaker)}</b></div><span class="status-pill">${dialogue.history.length+1}. Schritt</span></div><p class="dialogue-line">${esc(dialogue.node.text)}</p><div class="dialogue-options">${dialogue.node.options.map((o)=>`<button data-dialogue-choice="${esc(o.id)}" data-dialogue-id="${esc(dialogue.dialogueId)}"><b>${esc(o.label)}</b><small>${esc(effectSummary(o.effects))}</small></button>`).join('')}</div>`;
  }
  function createAudio(){
    if(audioCtx)return true;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return false;
      audioCtx=new Ctx();masterGain=audioCtx.createGain();musicGain=audioCtx.createGain();ambientGain=audioCtx.createGain();
      musicOsc=audioCtx.createOscillator();ambientOsc=audioCtx.createOscillator();musicOsc.type='sine';ambientOsc.type='triangle';
      musicOsc.connect(musicGain);ambientOsc.connect(ambientGain);musicGain.connect(masterGain);ambientGain.connect(masterGain);masterGain.connect(audioCtx.destination);musicOsc.start();ambientOsc.start();return true;
    }catch(_){audioCtx=null;return false;}
  }
  function stopAudio(){try{musicOsc?.stop();ambientOsc?.stop();audioCtx?.close();}catch(_){}audioCtx=musicOsc=ambientOsc=masterGain=musicGain=ambientGain=null;}
  function syncAudio(){
    const mix=engine.getAudioMixer(),preset=DATA.audioPresets[mix.preset]||DATA.audioPresets.city;
    if(!mix.enabled){stopAudio();return;}
    if(!createAudio()){engine.setAudioMixer({enabled:false});return;}
    const now=audioCtx.currentTime;masterGain.gain.setTargetAtTime(mix.master,.01,.05);musicGain.gain.setTargetAtTime(mix.music*.045,.01,.06);ambientGain.gain.setTargetAtTime(mix.ambient*.028,.01,.06);musicOsc.frequency.setTargetAtTime(preset.musicHz,now,.08);ambientOsc.frequency.setTargetAtTime(preset.ambientHz,now,.08);
  }
  function renderAudioDock(){
    const dock=$('#lc06AudioDock');if(!dock)return;const m=engine.getAudioMixer();
    dock.innerHTML=`<div class="audio-head"><div><span class="eyebrow">KLANGMISCHER</span><h3>Musik & Atmosphäre</h3></div><button class="mini-btn" data-audio-close>Schließen</button></div><div class="audio-presets">${Object.entries(DATA.audioPresets).map(([id,p])=>`<button data-audio-preset="${id}" class="${m.preset===id?'active':''}">${esc(p.label)}</button>`).join('')}</div><label><span>Gesamt</span><input type="range" min="0" max="100" value="${Math.round(m.master*100)}" data-audio-range="master"><b>${Math.round(m.master*100)}%</b></label><label><span>Musik</span><input type="range" min="0" max="100" value="${Math.round(m.music*100)}" data-audio-range="music"><b>${Math.round(m.music*100)}%</b></label><label><span>Atmosphäre</span><input type="range" min="0" max="100" value="${Math.round(m.ambient*100)}" data-audio-range="ambient"><b>${Math.round(m.ambient*100)}%</b></label><button class="btn ${m.enabled?'danger':'primary'} audio-master-toggle" data-audio-enabled="${m.enabled?'0':'1'}">${m.enabled?'Klang ausschalten':'Klang einschalten'}</button><small>Alle Klänge werden lokal im Browser erzeugt. Keine Audiodateien und kein Internetzugriff.</small>`;
  }
  function toggleAudioDock(force){const dock=$('#lc06AudioDock');if(!dock)return;dock.hidden=typeof force==='boolean'?!force:!dock.hidden;renderAudioDock();if(!dock.hidden)dock.querySelector('button,input')?.focus();}
  function augmentHelp(){const body=$('#helpDockBody');if(!body||body.querySelector('.lc06-help-extra'))return;const extra=document.createElement('article');extra.className='help-step lc06-help-extra';extra.innerHTML='<strong>LC06 · schneller führen</strong><div class="key-grid"><span><kbd>G</kbd>nächster Schritt</span><span><kbd>I</kbd>Innenraum</span><span><kbd>K</kbd>Klangmixer</span><span><kbd>Alt+1–9</kbd>Spielbereich</span></div>';body.appendChild(extra);}
  function renderCombatEnhancement(){
    const dialog=$('#combatDialog'),content=$('#combatDialogContent');if(!dialog?.open||!content)return;
    content.querySelector('.lc06-combat-coach')?.remove();const h2=content.querySelector('h2');if(!h2)return;
    const guide=engine.getCombatDecisionGuide();const box=document.createElement('section');box.className='lc06-combat-coach';
    if(!guide){box.innerHTML='<div class="combat-guide-head"><span>KAMPFVORBEREITUNG</span><b>1. Crew wählen · 2. Prognose prüfen · 3. Kampf starten</b></div><p>Die wichtigsten Werte stehen oben. Crewbeiträge bleiben direkt darunter vergleichbar.</p>';}else{
      box.innerHTML=`<div class="combat-guide-head"><span>RUNDE ${guide.round} · ENTSCHEIDUNGSHILFE</span><b>Empfehlung: ${esc(guide.options.find((o)=>o.id===guide.recommended)?.label||'Deckung')}</b></div><div class="combat-choice-preview">${guide.options.map((o)=>`<article class="${o.id===guide.recommended?'recommended':''}"><strong>${esc(o.label)}</strong><small>${esc(o.note)}</small></article>`).join('')}</div>`;
      $$('.combat-modal [data-combat-decision]').forEach((b)=>b.classList.toggle('lc06-recommended',b.dataset.combatDecision===guide.recommended));
    }
    h2.after(box);dialog.classList.add('lc06-combat');
  }
  function render(){ensureShell();renderGuide();renderAudioDock();renderInteriorEnhancement();renderCombatEnhancement();augmentHelp();}
  document.addEventListener('click',(event)=>{const t=event.target.closest?.('[data-crew-interaction]');if(!t)return;event.preventDefault();event.stopImmediatePropagation();const r=engine.runCrewInteraction(t.dataset.a,t.dataset.b,t.dataset.crewInteraction);$('#tickerText').textContent=r.ok?'Crew-Beziehung entwickelt.':r.reason;if(r.ok){persist();showCoach('Crew-Aktion abgeschlossen','Die Oberfläche wurde ohne Vollseiten-Neuladen aktualisiert.','success');root.GAME_UI_REFRESH?.schedule?.();}else root.LIVING_CITY_05_UI?.render?.();},true);
  document.addEventListener('click',(event)=>{
    const t=event.target.closest?.('button,[data-open-interior]');if(!t)return;
    if(t.dataset.openInterior){activeInteriorId=t.dataset.openInterior;setTimeout(renderInteriorEnhancement,0);return;}
    if(t.id==='helpButton'||t.id==='helpDockClose'){setTimeout(augmentHelp,0);return;}
    if(t.dataset.coachClose!==undefined){$('#coachRail').hidden=true;return;}
    if(t.dataset.guideKind){executeGuide(t.dataset.guideKind);return;}
    if(t.id==='lc06AudioButton'){toggleAudioDock();return;}
    if(t.dataset.audioClose!==undefined){toggleAudioDock(false);return;}
    if(t.dataset.audioPreset){engine.setAudioMixer({preset:t.dataset.audioPreset});persist();syncAudio();renderAudioDock();showCoach('Klangprofil geändert',`Profil „${DATA.audioPresets[t.dataset.audioPreset].label}“ ist aktiv.`);return;}
    if(t.dataset.audioEnabled!==undefined){engine.setAudioMixer({enabled:t.dataset.audioEnabled==='1'});persist();syncAudio();renderAudioDock();return;}
    if(t.dataset.lc06InteriorAction){const r=engine.performInteriorAction(t.dataset.locationId,t.dataset.lc06InteriorAction);$('#tickerText').textContent=r.ok?`Ort: ${r.action.title}`:r.reason;if(r.ok){persist();showCoach('Ort genutzt',`${r.action.title} abgeschlossen.`,'success',{result:effectSummary(r.action.effects),cost:r.action.cost?money(r.action.cost):'keine'});root.GAME_UI_REFRESH?.schedule?.();}else renderInteriorEnhancement();return;}
    if(t.dataset.dialogueStart){const r=engine.startDialogue(t.dataset.dialogueStart);if(!r.ok){showCoach('Gespräch noch nicht möglich',r.reason,'warn');return;}renderDialogue(engine.state.currentLocationId,r.dialogue);persist();return;}
    if(t.dataset.dialogueChoice){const r=engine.chooseDialogue(t.dataset.dialogueId,t.dataset.dialogueChoice);if(!r.ok){showCoach('Dialogaktion nicht möglich',r.reason,'warn');return;}persist();renderDialogue(engine.state.currentLocationId,r.dialogue);showCoach(r.done?'Entscheidung wirkt nach':'Gespräch geht weiter',r.done?r.ending:'Wähle den nächsten Gesprächsschritt.','success');root.GAME_UI_REFRESH?.schedule?.();return;}
    if(t.dataset.combatDecision||'combatStart' in t.dataset)setTimeout(renderCombatEnhancement,0);
  });
  document.addEventListener('input',(event)=>{const t=event.target;if(!t.matches?.('[data-audio-range]'))return;const key=t.dataset.audioRange,value=Number(t.value)/100;engine.setAudioMixer({[key]:value});persist();syncAudio();const label=t.parentElement?.querySelector('b');if(label)label.textContent=`${t.value}%`;});
  document.addEventListener('keydown',(event)=>{
    const tag=event.target?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag)||event.ctrlKey||event.metaKey)return;
    const k=event.key.toLowerCase();
    if(k==='h'){setTimeout(augmentHelp,0);}
    if(k==='g'){event.preventDefault();$('#focusDashboard .lc06-guide-card button')?.focus();}
    else if(k==='i'&&!document.querySelector('dialog[open]')){event.preventDefault();activeInteriorId=engine.state.currentLocationId;root.LIVING_CITY_05_UI?.renderScene?.(activeInteriorId);setTimeout(renderInteriorEnhancement,0);}
    else if(k==='k'&&!event.altKey){event.preventDefault();toggleAudioDock();}
    else if(event.altKey&&/^[1-9]$/.test(k)){const tabs=$$('#tabs .tab');const tab=tabs[Number(k)-1];if(tab){event.preventDefault();tab.click();tab.focus();}}
    else if(k==='escape'&&!$('#lc06AudioDock')?.hidden){toggleAudioDock(false);}
  });
  root.LIVING_CITY_06_UI=Object.freeze({render,renderGuide,renderInteriorEnhancement,renderCombatEnhancement,toggleAudioDock,showCoach});
  render();
})(typeof globalThis!=='undefined'?globalThis:this);
