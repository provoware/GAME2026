(function(root){
  'use strict';
  const engine=root.LIVING_CITY_06_ENGINE||root.LIVING_CITY_05_ENGINE,DATA=root.GAME_DATA;if(!engine||!DATA)return;
  const $=(s)=>document.querySelector(s),$$=(s)=>Array.from(document.querySelectorAll(s)),esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=(v)=>`${Number(v||0).toLocaleString('de-DE')} €`;
  let activeInteriorId=null,audioCtx=null,masterGain=null,musicGain=null,sfxGain=null,musicOsc=null,ambientOsc=null;
  function persist(){try{const raw=engine.exportState();localStorage.setItem('pppoppi-bunkerwahrheit-html-v0120',raw);localStorage.setItem('pppoppi-bunkerwahrheit-html-v0110',raw);}catch(_){}}
  function ensureShell(){
    if(!$('#lc06AudioDock')){const dock=document.createElement('aside');dock.id='lc06AudioDock';dock.className='audio-dock glass';dock.hidden=true;dock.innerHTML='<div class="audio-dock-head"><div><span class="eyebrow">KLANG</span><h3>Lokaler Mixer</h3></div><button class="mini-btn" data-audio-close>Schließen</button></div><div id="lc06AudioContent"></div>';document.body.appendChild(dock);}
    if(!$('#lc06CoachLive')){const live=document.createElement('div');live.id='lc06CoachLive';live.className='sr-only';live.setAttribute('aria-live','polite');document.body.appendChild(live);}
    document.body.dataset.livingCity='06';
  }
  function showCoach(title,text,tone='info'){const rail=$('#coachRail');if(!rail)return;rail.hidden=false;rail.dataset.tone=tone;rail.innerHTML=`<div class="coach-orb">◇</div><div class="coach-copy"><span>AUFGABEN-KOMPASS</span><strong>${esc(title)}</strong><small>${esc(text)}</small></div><button class="mini-btn" data-coach-close>Ausblenden</button>`;const live=$('#lc06CoachLive');if(live)live.textContent=`${title}. ${text}`;}
  function renderGuide(){const guide=engine.getGuidance(),dash=$('#focusDashboard');if(!dash||!guide)return;const old=dash.querySelector('.lc06-guide-card');old?.remove();const card=document.createElement('article');card.className='focus-card priority lc06-guide-card';card.innerHTML=`<div class="focus-icon">${esc(guide.icon)}</div><div class="focus-copy"><span>NÄCHSTER SCHRITT</span><b>${esc(guide.title)}</b><small>${esc(guide.hint)}</small></div><button class="mini-btn good" data-guide-kind="${esc(guide.kind)}">${esc(guide.actionLabel||'Öffnen')}</button>`;dash.prepend(card);}
  function switchTab(tab){const b=$(`#tabs [data-tab="${tab}"]`);if(b){b.click();b.focus();}}
  function executeGuide(kind){
    if(kind==='director'){switchTab('director');return;}
    if(kind==='casino'){switchTab('casino');return;}
    if(kind==='crew'){switchTab('crew');return;}
    if(kind==='economy'){switchTab('bank');return;}
    if(kind==='map'){root.LIVING_CITY_05B_UI?.render?.();$('#cityMap')?.focus();return;}
    if(kind==='interior'){root.LIVING_CITY_05_UI?.renderScene?.(engine.state.currentLocationId);activeInteriorId=engine.state.currentLocationId;renderInteriorEnhancement();return;}
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
      const done=engine.state.dialogueState?.[dialogue.dialogueId];box.innerHTML=`<div class="dialogue-empty"><span>GESPRÄCH ABGESCHLOSSEN</span><b>${esc(dialogue.speaker)}</b><p>${esc(done?.ending||'Die Entscheidung wirkt im weiteren Verlauf nach.')}</p></div>`;return;
    }
    const node=dialogue.node;box.innerHTML=`<div class="dialogue-line"><span>${esc(dialogue.speaker)}</span><p>${esc(node.text)}</p></div><div class="dialogue-options">${node.options.map((o)=>`<button data-dialogue-choice="${esc(o.id)}" data-dialogue-id="${esc(dialogue.dialogueId)}"><b>${esc(o.label)}</b><small>${esc(o.consequence||'')}</small></button>`).join('')}</div>`;
  }
  function initAudio(){if(audioCtx)return true;try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();masterGain=audioCtx.createGain();musicGain=audioCtx.createGain();sfxGain=audioCtx.createGain();musicGain.connect(masterGain);sfxGain.connect(masterGain);masterGain.connect(audioCtx.destination);musicOsc=audioCtx.createOscillator();ambientOsc=audioCtx.createOscillator();musicOsc.type='triangle';ambientOsc.type='sine';musicOsc.frequency.value=57;ambientOsc.frequency.value=89;musicOsc.connect(musicGain);ambientOsc.connect(musicGain);musicOsc.start();ambientOsc.start();return true;}catch(_){return false;}}
  function syncAudio(){const mix=engine.state.audioMixer;if(!mix||!mix.enabled){if(masterGain)masterGain.gain.value=0;return;}if(!initAudio())return;masterGain.gain.value=(mix.master||0)*.08;musicGain.gain.value=(mix.music||0)*.7;sfxGain.gain.value=(mix.effects||0)*.7;const profile=DATA.audioPresets?.[mix.preset];if(profile&&musicOsc){musicOsc.frequency.value=profile.musicHz;ambientOsc.frequency.value=profile.ambientHz;}}
  function renderAudioDock(){const content=$('#lc06AudioContent');if(!content)return;const m=engine.state.audioMixer;content.innerHTML=`<div class="audio-presets">${Object.entries(DATA.audioPresets||{}).map(([id,p])=>`<button class="${m.preset===id?'active':''}" data-audio-preset="${id}"><b>${esc(p.label)}</b><small>${esc(p.description)}</small></button>`).join('')}</div><label class="audio-toggle"><input type="checkbox" data-audio-enabled="${m.enabled?'0':'1'}" ${m.enabled?'checked':''}> Klang aktiv</label>${[['master','Gesamt'],['music','Musik'],['effects','Effekte']].map(([k,l])=>`<label class="audio-range"><span>${l}</span><input type="range" min="0" max="100" value="${Math.round((m[k]||0)*100)}" data-audio-range="${k}"><b>${Math.round((m[k]||0)*100)}%</b></label>`).join('')}`;}
  function toggleAudioDock(force){const dock=$('#lc06AudioDock');if(!dock)return;dock.hidden=typeof force==='boolean'?!force:!dock.hidden;if(!dock.hidden){renderAudioDock();syncAudio();}}
  function augmentHelp(){const body=$('#helpDockBody');if(!body||body.querySelector('.lc06-help-extra'))return;const extra=document.createElement('article');extra.className='help-step lc06-help-extra';extra.innerHTML='<strong>LC06 · Führung</strong><p>G öffnet den Aufgaben-Kompass, I den Innenraum, K den lokalen Klangmixer. Alt+1…8 wechselt Haupttabs.</p><div class="key-grid"><span><kbd>G</kbd>Nächster Schritt</span><span><kbd>I</kbd>Innenraum</span><span><kbd>K</kbd>Klang</span><span><kbd>Alt+1…8</kbd>Tabs</span></div>';body.appendChild(extra);}
  function renderCombatEnhancement(){
    const dialog=$('#combatDialog'),content=$('#combatDialogContent');if(!dialog?.open||!content)return;let box=content.querySelector('.lc06-combat-coach');if(!box){box=document.createElement('section');box.className='lc06-combat-coach';const h2=content.querySelector('h2');(h2||content.firstElementChild)?.after?.(box);}
    const session=engine.state.combatSession,guide=session?engine.getCombatDecisionGuide():null;
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
    if(t.dataset.openInterior){activeInteriorId=t.dataset.openInterior;renderInteriorEnhancement();setTimeout(renderInteriorEnhancement,0);return;}
    if(t.id==='helpButton'||t.id==='helpDockClose'){setTimeout(augmentHelp,0);return;}
    if(t.dataset.coachClose!==undefined){$('#coachRail').hidden=true;return;}
    if(t.dataset.guideKind){executeGuide(t.dataset.guideKind);return;}
    if(t.id==='lc06AudioButton'){toggleAudioDock();return;}
    if(t.dataset.audioClose!==undefined){toggleAudioDock(false);return;}
    if(t.dataset.audioPreset){engine.setAudioMixer({preset:t.dataset.audioPreset});persist();syncAudio();renderAudioDock();showCoach('Klangprofil geändert',`Profil „${DATA.audioPresets[t.dataset.audioPreset].label}“ ist aktiv.`);return;}
    if(t.dataset.audioEnabled!==undefined){engine.setAudioMixer({enabled:t.dataset.audioEnabled==='1'});persist();syncAudio();renderAudioDock();return;}
    if(t.dataset.lc06InteriorAction){const r=engine.performInteriorAction(t.dataset.locationId,t.dataset.lc06InteriorAction);$('#tickerText').textContent=r.ok?`Ort: ${r.action.title}`:r.reason;if(r.ok){persist();showCoach('Ort genutzt',`${r.action.title} abgeschlossen. Der Aufgaben-Kompass wurde aktualisiert.`,'success');root.GAME_UI_REFRESH?.schedule?.();}else renderInteriorEnhancement();return;}
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
    else if(k==='i'&&!document.querySelector('dialog[open]')){event.preventDefault();activeInteriorId=engine.state.currentLocationId;root.LIVING_CITY_05_UI?.renderScene?.(activeInteriorId);renderInteriorEnhancement();}
    else if(k==='k'&&!event.altKey){event.preventDefault();toggleAudioDock();}
    else if(event.altKey&&/^[1-9]$/.test(k)){const tabs=$$('#tabs .tab');const tab=tabs[Number(k)-1];if(tab){event.preventDefault();tab.click();tab.focus();}}
    else if(k==='escape'&&!$('#lc06AudioDock')?.hidden){toggleAudioDock(false);}
  });
  root.LIVING_CITY_06_UI=Object.freeze({render,renderGuide,renderInteriorEnhancement,renderCombatEnhancement,toggleAudioDock,showCoach});
  render();
})(typeof globalThis!=='undefined'?globalThis:this);
