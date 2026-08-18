(function () {
  'use strict';
  const engine=window.REVIVAL_GAME_ENGINE;
  if(!engine)return;
  const $=(s)=>document.querySelector(s);
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const money=(v)=>`${Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:0})} €`;
  const STORAGE_KEY='pppoppi-bunkerwahrheit-html-v090';

  function injectShell(){
    const tabs=$('#tabs'),panels=document.querySelector('.tab-panels');
    if(tabs&&!tabs.querySelector('[data-tab="director"]')){
      const button=document.createElement('button');button.className='tab director-tab';button.dataset.tab='director';button.textContent='Direktor';
      const log=tabs.querySelector('[data-tab="log"]');tabs.insertBefore(button,log||null);
    }
    if(panels&&!panels.querySelector('[data-panel="director"]')){
      const section=document.createElement('section');section.className='tab-panel revival-panel';section.dataset.panel='director';section.hidden=true;section.innerHTML='<div id="revivalDirectorPanel"></div>';panels.appendChild(section);
    }
    const map=document.querySelector('.map-panel'),stage=map?.querySelector('.map-stage');
    if(map&&stage&&!$('#revivalDirectorStrip')){
      const strip=document.createElement('button');strip.type='button';strip.className='director-strip';strip.id='revivalDirectorStrip';strip.dataset.openTab='director';strip.setAttribute('aria-label','Revival Director öffnen');stage.before(strip);
    }
    document.body.dataset.revival='living-city-04';
  }

  function missionCard(mission,active=false){
    const p=mission.progress||engine.getMissionProgress(mission),reward=mission.reward||{};
    return `<article class="mission-card ${active?'active':''}"><div class="mission-icon">${esc(mission.icon||'◆')}</div><div class="mission-copy"><div class="mission-top"><span>${esc(mission.category||'Auftrag')}</span><b>${active?`${p.remaining} Züge`:'Gelegenheit'}</b></div><h3>${esc(mission.title)}</h3><p>${esc(mission.description)}</p><div class="mission-target"><span>${esc(mission.targetLabel)}</span><strong>${p.current} / ${p.target}</strong></div><div class="revival-progress"><i style="width:${p.pct}%"></i></div><small>Belohnung ${reward.money?money(reward.money):'Ruf / Skills'}</small>${active?'':`<div class="mission-actions"><button class="mini-btn good" data-revival-accept="${esc(mission.id)}">Annehmen</button><button class="mini-btn" data-revival-decline="${esc(mission.id)}">Weiterziehen</button></div>`}</div></article>`;
  }

  function renderStrip(summary){
    const strip=$('#revivalDirectorStrip');if(!strip)return;
    strip.innerHTML=`<span class="phase-orb ${summary.phase.key}"></span><span class="director-headline"><small>${esc(summary.phase.label)} · STADTPULS</small><strong>${esc(summary.headline)}</strong></span><span class="pulse"><small>Spannung</small><b>${summary.tension}</b><i><em style="width:${summary.tension}%"></em></i></span><span class="pulse opportunity"><small>Chancen</small><b>${summary.opportunity}</b><i><em style="width:${summary.opportunity}%"></em></i></span><span class="director-chevron">›</span>`;
  }

  function renderDirector(summary){
    const panel=$('#revivalDirectorPanel');if(!panel)return;
    const active=summary.missions.active.length?summary.missions.active.map((m)=>missionCard(m,true)).join(''):'<div class="revival-empty">Keine aktiven Aufträge. Wähle eine Gelegenheit, die zu deiner aktuellen Strategie passt.</div>';
    const offers=summary.missions.offers.length?summary.missions.offers.map((m)=>missionCard(m,false)).join(''):'<div class="revival-empty">Die Stadt formt gerade neue Gelegenheiten.</div>';
    const events=summary.events.length?summary.events.map((e)=>`<article class="event-card tone-${esc(e.definition?.tone||'warning')}"><span class="event-symbol">${esc(e.definition?.icon||'○')}</span><div><b>${esc(e.definition?.title||'Stadtereignis')}</b><p>${esc(e.locationTitle)} · noch ${e.remaining} Züge</p><small>${esc(e.definition?.description||'')}</small></div></article>`).join(''):'<div class="revival-empty compact">Keine außergewöhnlichen Stadtereignisse.</div>';
    const relations=summary.relations.map((r)=>`<article class="relation-card"><div><b>${esc(r.aName)}</b><span>↔</span><b>${esc(r.bName)}</b></div><strong class="relation-state ${r.value<=-60?'war':r.value>=55?'pact':''}">${esc(r.label)}</strong><div class="relation-track"><i style="width:${Math.max(0,Math.min(100,(r.value+100)/2))}%"></i></div><small>${r.value>0?'+':''}${r.value}</small></article>`).join('');
    const milestones=summary.milestones.map((m)=>`<article class="milestone-card ${m.done?'done':''}"><span>${m.done?'✓':'◇'}</span><div><b>${esc(m.title)}</b><small>${m.value} / ${m.target}</small><div class="revival-progress"><i style="width:${m.pct}%"></i></div></div></article>`).join('');
    panel.innerHTML=`<section class="director-hero"><div><span class="eyebrow">REVIVAL DIRECTOR</span><h2>Die Stadt reagiert auf dich</h2><p>${esc(summary.phase.note)}</p></div><div class="prestige-medal"><span>PRESTIGE</span><strong>${summary.prestige}</strong><small>${summary.missions.active.length} aktive Aufträge</small></div></section><div class="director-meters"><div><span>Spannung</span><b>${summary.tension}/100</b><div class="revival-progress danger"><i style="width:${summary.tension}%"></i></div></div><div><span>Chancen</span><b>${summary.opportunity}/100</b><div class="revival-progress"><i style="width:${summary.opportunity}%"></i></div></div></div><div class="revival-section"><div class="section-title"><span class="eyebrow">AKTIV</span><h3>Deine aktuellen Ziele</h3></div><div class="mission-list">${active}</div></div><div class="revival-section"><div class="section-title"><span class="eyebrow">GELEGENHEITEN</span><h3>Was die Stadt gerade anbietet</h3></div><div class="mission-list">${offers}</div></div><div class="revival-grid"><div class="revival-section"><div class="section-title"><span class="eyebrow">LIVE</span><h3>Stadtereignisse</h3></div><div class="event-list">${events}</div></div><div class="revival-section"><div class="section-title"><span class="eyebrow">MACHTPOLITIK</span><h3>Rivalenbeziehungen</h3></div><div class="relation-list">${relations}</div></div></div><div class="revival-section"><div class="section-title"><span class="eyebrow">KARRIERE</span><h3>Meilensteine</h3></div><div class="milestone-grid">${milestones}</div></div>`;
  }

  function decorateMap(summary){
    const svg=$('#cityMap');if(!svg||!svg.querySelectorAll)return;
    svg.querySelectorAll('.revival-event-marker').forEach((node)=>node.remove());
    summary.events.forEach((event)=>{
      const node=svg.querySelector(`[data-location="${event.locationId}"]`);if(!node)return;
      const location=engine.getLocation(event.locationId),ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g');group.setAttribute('class',`revival-event-marker tone-${event.definition?.tone||'warning'}`);group.setAttribute('aria-label',`${event.definition?.title||'Ereignis'} in ${location.title}`);
      const ring=document.createElementNS(ns,'circle');ring.setAttribute('cx',location.x);ring.setAttribute('cy',location.y);ring.setAttribute('r','46');ring.setAttribute('class','event-halo');
      const badge=document.createElementNS(ns,'circle');badge.setAttribute('cx',location.x+37);badge.setAttribute('cy',location.y-36);badge.setAttribute('r','13');badge.setAttribute('class','event-badge');
      const text=document.createElementNS(ns,'text');text.setAttribute('x',location.x+37);text.setAttribute('y',location.y-31);text.setAttribute('text-anchor','middle');text.setAttribute('class','event-glyph');text.textContent=event.definition?.icon||'!';
      group.append(ring,badge,text);svg.appendChild(group);
    });
  }

  function render(){injectShell();const summary=engine.getDirectorSummary();document.body.dataset.cityPhase=summary.phase.key;renderStrip(summary);renderDirector(summary);decorateMap(summary);}

  document.addEventListener('click',(event)=>{
    const accept=event.target.closest?.('[data-revival-accept]');
    const decline=event.target.closest?.('[data-revival-decline]');
    if(accept){const result=engine.acceptMission(accept.dataset.revivalAccept);if(!result.ok)$('#tickerText').textContent=result.reason;else $('#tickerText').textContent=`Auftrag angenommen: ${result.mission.title}`;localStorage.setItem(STORAGE_KEY,engine.exportState());render();return;}
    if(decline){engine.declineMission(decline.dataset.revivalDecline);localStorage.setItem(STORAGE_KEY,engine.exportState());render();return;}
  });
  window.addEventListener?.('revival-render',render);
  render();
})();
