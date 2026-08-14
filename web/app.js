(function () {
  'use strict';

  const STORAGE_KEY='pppoppi-bunkerwahrheit-html-v080';
  const MIGRATION_KEYS=['pppoppi-bunkerwahrheit-html-v070','pppoppi-bunkerwahrheit-html-v060'];
  const DATA=window.GAME_DATA;
  const {GameEngine}=window.GAME_ENGINE;
  const $=(s)=>document.querySelector(s);
  const $$=(s)=>Array.from(document.querySelectorAll(s));
  const refs={
    turnValue:$('#turnValue'),moneyValue:$('#moneyValue'),cashflowValue:$('#cashflowValue'),districtValue:$('#districtValue'),gangValue:$('#gangValue'),
    bossTitle:$('#bossTitle'),bossRank:$('#bossRank'),bossNote:$('#bossNote'),decisionGrid:$('#decisionGrid'),bossWarnings:$('#bossWarnings'),bossMetrics:$('#bossMetrics'),
    cityControl:$('#cityControl'),avgControl:$('#avgControl'),avgRival:$('#avgRival'),gangPower:$('#gangPower'),heatText:$('#heatText'),
    cityMap:$('#cityMap'),mapCallout:$('#mapCallout'),tickerText:$('#tickerText'),
    districtKind:$('#districtKind'),districtTitle:$('#districtTitle'),districtOwner:$('#districtOwner'),controlBadge:$('#controlBadge'),districtDescription:$('#districtDescription'),
    districtBars:$('#districtBars'),combatPreview:$('#combatPreview'),actionGrid:$('#actionGrid'),
    assetCountPill:$('#assetCountPill'),portfolioSummary:$('#portfolioSummary'),assetList:$('#assetList'),propertyMarket:$('#propertyMarket'),
    gangCountPill:$('#gangCountPill'),gangRoster:$('#gangRoster'),rivalList:$('#rivalList'),eventLog:$('#eventLog'),saveStatus:$('#saveStatus'),
    crewDialog:$('#crewDialog'),crewDialogTitle:$('#crewDialogTitle'),crewAssignmentList:$('#crewAssignmentList'),crewAssetId:$('#crewAssetId'),
    combatDialog:$('#combatDialog'),combatSetup:$('#combatSetup'),combatLive:$('#combatLive'),combatMatchup:$('#combatMatchup'),combatCrewList:$('#combatCrewList'),
    playerMorale:$('#playerMorale'),enemyMorale:$('#enemyMorale'),playerMoraleBar:$('#playerMoraleBar'),enemyMoraleBar:$('#enemyMoraleBar'),enemyName:$('#enemyName'),
    combatRound:$('#combatRound'),combatLog:$('#combatLog'),battleImpact:$('#battleImpact'),tacticButtons:$('#tacticButtons'),closeCombatResult:$('#closeCombatResult'),
    helpDialog:$('#helpDialog')
  };

  let actionCategory='all';
  let engine=new GameEngine({state:loadState() || undefined});

  const metricMeta={
    respect:['Respekt','freiwilliger Rückhalt'],fear:['Furcht','Abschreckung'],loyalty:['Loyalität','Zusammenhalt'],
    influence:['Einfluss','Kontakte & Zugang'],heat:['Fahndung','behördlicher Druck'],notoriety:['Bekanntheit','Reichweite des Namens']
  };
  const kindNames={base:'Basis',transit:'Verbindung',market:'Markt',archive:'Archiv',club:'Nachtleben',industrial:'Industrie',residential:'Wohngebiet',lookout:'Aufklärung'};
  const ownerNames={player:'DEIN GEBIET',neutral:'UMKÄMPFT','rival.red_knives':'ROTE KLINGEN','rival.grey_union':'GRAUE UNION','rival.neon_ghosts':'NEON-GEISTER'};

  function loadState(){
    const keys=[STORAGE_KEY,...MIGRATION_KEYS];
    for(const key of keys){
      try{const raw=localStorage.getItem(key);if(raw)return JSON.parse(raw);}catch(error){console.warn('Spielstand konnte nicht gelesen werden.',error);}
    }
    return null;
  }
  function saveState(manual=false){
    try{
      localStorage.setItem(STORAGE_KEY,engine.exportState());
      refs.saveStatus.textContent=manual?'Spielstand gespeichert':'Automatisch lokal gespeichert';
      if(manual)setTimeout(()=>refs.saveStatus.textContent='Automatisch lokal gespeichert',1600);
    }catch(error){refs.saveStatus.textContent='Speichern nicht möglich';console.warn(error);}
  }

  function renderAll(){
    const s=engine.state,portfolio=engine.getPortfolioSummary(),city=engine.getCitySummary();
    refs.turnValue.textContent=s.turn;refs.moneyValue.textContent=euro(s.resources.money);refs.cashflowValue.textContent=`${portfolio.net>=0?'+':''}${euro(portfolio.net)}`;
    refs.districtValue.textContent=`${city.controlled}/${city.total}`;refs.gangValue.textContent=s.gang.length;
    renderBoss();renderMap();renderDistrict();renderAssets();renderGang();renderRivals();renderLog();saveState();
  }

  function renderBoss(){
    const b=engine.state.boss,profile=engine.getBossProfile(),support=engine.getDecisionSupport(),city=engine.getCitySummary();
    refs.bossTitle.textContent=profile.title;refs.bossRank.textContent=support.rank;refs.bossNote.textContent=profile.note;
    const items=[['Vermögen',euro(support.netWorth),'Geld + investierter Besitz'],['Besitz-Cashflow',`${support.cashflow>=0?'+':''}${euro(support.cashflow)}/Z`,'aktueller Nettoertrag'],['Razzia-Risiko',`${support.raidRisk}%`,'am gewählten Ort'],['Beitrittschance',`${support.recruitChance}%`,'pro nächstem Zug'],['Freie Einsatzcrew',`${support.readyCrew}/${support.totalCrew}`,'nicht verletzt / nicht gebunden'],['Ø Crewtreue',`${support.avgLoyalty}%`,'Stabilität der Gang']];
    refs.decisionGrid.innerHTML=items.map(([label,value,note])=>`<div class="decision-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
    refs.bossWarnings.innerHTML=support.warnings.map((warning,i)=>`<p class="${i===0?'primary-warning':''}"><b>${i===0?'Priorität':'Hinweis'}:</b> ${escapeHtml(warning)}</p>`).join('');
    refs.bossMetrics.innerHTML=Object.entries(metricMeta).map(([key,[label,note]])=>{const value=b[key];return `<div class="metric ${key==='heat'?'danger-metric':''}"><div class="metric-head"><span><strong>${label}</strong><small>${note}</small></span><b>${value}</b></div><div class="meter"><i style="width:${value}%"></i></div></div>`;}).join('');
    refs.cityControl.textContent=`${city.controlled} / ${city.total}`;refs.avgControl.textContent=`${city.avgControl}%`;refs.avgRival.textContent=`${city.avgRival}%`;refs.gangPower.textContent=engine.getGangPower();
    refs.heatText.textContent=b.heat>=75?'Kritisch':b.heat>=50?'Heiß':b.heat>=28?'Beobachtet':'Ruhig';
  }

  function renderMap(){
    const selected=engine.state.selectedLocationId,lm=Object.fromEntries(DATA.world.locations.map(l=>[l.id,l]));
    const routes=DATA.world.connections.map(([a,b])=>{const p1=lm[a],p2=lm[b],active=a===selected||b===selected;return `<line class="route ${active?'active':''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>`;}).join('');
    const nodes=DATA.world.locations.map(location=>{
      const d=engine.getDistrict(location.id),isSelected=location.id===selected,assetCount=engine.state.assets.filter(a=>a.locationId===location.id).length;
      const ownerClass=d.owner==='player'?'owner-player':d.owner==='rival.red_knives'?'owner-red':d.owner==='rival.grey_union'?'owner-grey':d.owner==='rival.neon_ghosts'?'owner-cyan':'owner-neutral';
      const radius=location.kind==='base'?62:52;
      return `<g class="district-node ${ownerClass} ${isSelected?'selected':''}" tabindex="0" role="button" aria-label="${location.title}, ${ownerNames[d.owner]||'umkämpft'}, Kontrolle ${d.control} Prozent" data-location="${location.id}"><polygon class="zone" points="${hexPoints(location.x,location.y,radius)}"></polygon><circle class="owner-halo" cx="${location.x}" cy="${location.y}" r="43"></circle><circle class="node-ring base" cx="${location.x}" cy="${location.y}" r="36"></circle><circle class="node-ring control" cx="${location.x}" cy="${location.y}" r="36" pathLength="100" stroke-dasharray="${d.control} ${100-d.control}" transform="rotate(-90 ${location.x} ${location.y})"></circle><circle class="node-core" cx="${location.x}" cy="${location.y}" r="27"></circle><text class="node-value" x="${location.x}" y="${location.y+5}" text-anchor="middle">${d.control}</text><text class="node-label" x="${location.x}" y="${location.y+66}" text-anchor="middle">${location.short}</text>${assetCount?`<g class="asset-marker" transform="translate(${location.x+27} ${location.y-38})"><circle r="13"></circle><text text-anchor="middle" y="4">${assetCount}</text></g>`:''}${d.intel?`<text class="intel-marker" x="${location.x-43}" y="${location.y-38}">◉${d.intel}</text>`:''}<g transform="translate(${location.x-34} ${location.y-53})"><rect class="pip" width="31" height="7" rx="3.5"></rect><rect class="pip-fill rival" width="${31*d.rival/100}" height="7" rx="3.5"></rect><rect class="pip" x="37" width="31" height="7" rx="3.5"></rect><rect class="pip-fill police" x="37" width="${31*d.police/100}" height="7" rx="3.5"></rect></g></g>`;
    }).join('');
    refs.cityMap.innerHTML=`<defs><pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" class="grid-line"></path></pattern></defs><rect class="map-bg" width="1000" height="700"></rect><rect class="map-grid" width="1000" height="700"></rect><g>${routes}</g><g>${nodes}</g>`;
    $$('.district-node').forEach(node=>{const activate=()=>{engine.selectLocation(node.dataset.location);renderBoss();renderMap();renderDistrict();renderAssets();};node.addEventListener('click',activate);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
    const loc=engine.getLocation(),d=engine.getDistrict();refs.mapCallout.innerHTML=`<strong>${loc.title}</strong><span>${ownerNames[d.owner]||'UMKÄMPFT'} · Kontrolle ${d.control}% · Rivalen ${d.rival}% · Polizei ${d.police}%</span>`;
  }

  function renderDistrict(){
    const loc=engine.getLocation(),d=engine.getDistrict();refs.districtKind.textContent=kindNames[loc.kind]||loc.kind;refs.districtTitle.textContent=loc.title;refs.districtOwner.textContent=ownerNames[d.owner]||'UMKÄMPFT';
    refs.controlBadge.textContent=`${d.control}%`;refs.controlBadge.className=`control-badge ${d.owner==='player'?'good':d.rival>d.control?'bad':''}`;refs.districtDescription.textContent=loc.description;
    refs.districtBars.innerHTML=[['Kontrolle',d.control,'control'],['Rivalen',d.rival,'rival'],['Polizei',d.police,'police'],['Unruhe',d.unrest,'unrest'],['Aufklärung',d.intel*20,'intel']].map(([label,value,cls])=>`<div class="district-bar"><div><span>${label}</span><strong>${cls==='intel'?d.intel+'/5':value+'%'}</strong></div><div class="thin-meter ${cls}"><i style="width:${value}%"></i></div></div>`).join('');
    const preview=engine.getCombatPreview('raid');refs.combatPreview.innerHTML=`<div><span class="eyebrow">KAMPFLAGE</span><strong>${preview.rivalName}</strong><small>${preview.percent}% Basischance mit automatisch verfügbaren Top-Leuten</small></div><div class="odds ${preview.percent>=60?'good':preview.percent<40?'bad':''}">${preview.percent}%</div>`;
    const actions=DATA.actions.filter(action=>actionCategory==='all'||action.category===actionCategory);
    refs.actionGrid.innerHTML=actions.map(action=>{const availability=engine.getActionAvailability(action),combat=action.combat;return `<button class="action-card tone-${action.tone}" data-action="${action.id}" ${!availability.ok?'disabled':''}><span class="action-icon">${action.icon}</span><span class="action-copy"><strong>${action.title}</strong><small>${action.description}</small>${!availability.ok?`<em>${availability.reason}</em>`:''}</span><span class="action-cost">${formatCost(action.cost)}${combat?' · Taktik':''}</span></button>`;}).join('');
    $$('.action-card').forEach(button=>button.addEventListener('click',()=>{const action=DATA.actions.find(a=>a.id===button.dataset.action);if(action.combat){openCombatSetup();return;}const result=engine.applyAction(action.id);if(!result.ok){refs.tickerText.textContent=result.reason;return;}renderAll();}));
  }

  function renderAssets(){
    const portfolio=engine.getPortfolioSummary();refs.assetCountPill.textContent=`${portfolio.count} ${portfolio.count===1?'Objekt':'Objekte'}`;
    refs.portfolioSummary.innerHTML=[['Investiert',euro(portfolio.value)],['Brutto',euro(portfolio.gross)+'/Z'],['Unterhalt',euro(portfolio.upkeep)+'/Z'],['Netto',`${portfolio.net>=0?'+':''}${euro(portfolio.net)}/Z`]].map(([l,v])=>`<div><span>${l}</span><strong>${v}</strong></div>`).join('');
    refs.assetList.innerHTML=engine.state.assets.length?engine.state.assets.map(asset=>{const def=engine.getAssetDefinition(asset.propertyId),loc=engine.getLocation(asset.locationId),p=engine.getAssetProjection(asset),upgrade=engine.getAssetUpgradeCost(asset.id),staff=(asset.assignedCrewIds||[]).map(id=>engine.state.gang.find(m=>m.id===id)?.name).filter(Boolean);return `<article class="asset-card"><div class="asset-icon">${def.icon}</div><div class="asset-main"><div class="asset-title"><strong>${def.title}</strong><span>Stufe ${asset.level}/${def.maxLevel}</span></div><small>${loc.title} · ${p.net>=0?'+':''}${euro(p.net)}/Z · Personalbonus ${p.staffBonus}%</small><p>${staff.length?'Crew: '+staff.join(', '):'Keine Crew zugewiesen'}</p><div class="asset-actions"><button data-asset-crew="${asset.id}">Crew</button><button data-asset-upgrade="${asset.id}" ${upgrade===null?'disabled':''}>${upgrade===null?'Maximal':'Ausbauen '+euro(upgrade)}</button><button class="danger" data-asset-sell="${asset.id}">Verkaufen</button></div></div></article>`;}).join(''):'<div class="empty-state">Noch kein Besitz. Wähle unten ein Objekt im aktuellen Bezirk.</div>';
    $$('[data-asset-crew]').forEach(b=>b.addEventListener('click',()=>openCrewAssignment(b.dataset.assetCrew)));$$('[data-asset-upgrade]').forEach(b=>b.addEventListener('click',()=>{const r=engine.upgradeProperty(b.dataset.assetUpgrade);if(!r.ok)refs.tickerText.textContent=r.reason;renderAll();}));$$('[data-asset-sell]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Diesen Besitz wirklich verkaufen?'))return;const r=engine.sellProperty(b.dataset.assetSell);if(!r.ok)refs.tickerText.textContent=r.reason;renderAll();}));
    const offers=engine.getAvailableProperties();refs.propertyMarket.innerHTML=offers.length?offers.map(o=>`<article class="market-card"><span class="asset-icon">${o.icon}</span><div><strong>${o.title}</strong><small>${o.description}</small><b>${euro(o.cost)} · ca. ${euro(o.projectedNet)}/Z</b></div><button data-buy="${o.id}" ${engine.state.resources.money<o.cost?'disabled':''}>Kaufen</button></article>`).join(''):'<div class="empty-state">In diesem Bezirk aktuell keine weiteren Objektarten verfügbar.</div>';
    $$('[data-buy]').forEach(b=>b.addEventListener('click',()=>{const r=engine.buyProperty(b.dataset.buy);if(!r.ok)refs.tickerText.textContent=r.reason;renderAll();}));
  }

  function renderGang(){
    const assigned=engine.getAssignedCrewIds();refs.gangCountPill.textContent=`${engine.state.gang.length} Leute`;refs.gangRoster.innerHTML=engine.state.gang.map(member=>{const asset=engine.state.assets.find(a=>(a.assignedCrewIds||[]).includes(member.id));const duty=asset?`Betrieb: ${engine.getAssetDefinition(asset.propertyId).title}`:member.injuredUntil?'Verletzt':'Einsatzbereit';return `<article class="member-card ${member.injuredUntil?'injured':''} ${assigned.has(member.id)?'assigned':''}"><div class="avatar">${initials(member.name)}</div><div class="member-main"><strong>${member.name}</strong><span>${member.role} · ${member.trait}</span><small>${duty}</small></div><div class="member-stats"><span>Macht <b>${member.power}</b></span><span>Treue <b>${member.loyalty}</b></span></div></article>`;}).join('');
  }

  function renderRivals(){
    refs.rivalList.innerHTML=engine.getRivalOverview().map(r=>`<article class="rival-card" style="--rival-color:${r.color}"><div class="rival-head"><div><span class="rival-dot"></span><strong>${r.name}</strong></div><span>${strategyLabel(r.strategy)}</span></div><p>${r.description}</p><div class="rival-stats"><span>Macht <b>${r.power}</b></span><span>Kasse <b>${euro(r.wealth)}</b></span><span>Gebiete <b>${r.territories.length}</b></span></div><small>Letzter Zug: ${escapeHtml(r.lastMove)}</small>${r.territories.length?`<em>${r.territories.join(' · ')}</em>`:'<em>Kein festes Gebiet</em>'}</article>`).join('');
  }

  function renderLog(){refs.eventLog.innerHTML=engine.state.history.map(event=>`<article class="event ${event.type}"><span class="event-turn">Z${event.turn}</span><p>${escapeHtml(event.text)}</p></article>`).join('');refs.tickerText.textContent=engine.state.history[0]?.text||'Keine Meldungen.';}

  function openCrewAssignment(assetId){
    const asset=engine.state.assets.find(a=>a.id===assetId),def=asset&&engine.getAssetDefinition(asset.propertyId);if(!asset)return;refs.crewAssetId.value=assetId;refs.crewDialogTitle.textContent=`Crew · ${def.title}`;const current=new Set(asset.assignedCrewIds||[]);
    refs.crewAssignmentList.innerHTML=engine.state.gang.map(member=>{const other=engine.state.assets.find(a=>a.id!==assetId&&(a.assignedCrewIds||[]).includes(member.id)),disabled=Boolean(member.injuredUntil);return `<label class="check-row ${disabled?'disabled':''}"><input type="checkbox" name="crewAssign" value="${member.id}" ${current.has(member.id)?'checked':''} ${disabled?'disabled':''}><span><strong>${member.name}</strong><small>Macht ${member.power} · Treue ${member.loyalty}${other?' · aktuell '+engine.getAssetDefinition(other.propertyId).title:''}${member.injuredUntil?' · verletzt':''}</small></span></label>`;}).join('');refs.crewDialog.showModal();
  }

  function openCombatSetup(){
    refs.combatSetup.hidden=false;refs.combatLive.hidden=true;refs.closeCombatResult.hidden=true;refs.tacticButtons.hidden=false;const crew=engine.getAvailableCombatCrew(),preview=engine.getCombatPreview('raid');refs.combatMatchup.innerHTML=`<div><span>Deine Basischance</span><strong>${preview.percent}%</strong></div><div><span>Gegner</span><strong>${preview.rivalName}</strong></div><div><span>Gebiet</span><strong>${engine.getLocation().title}</strong></div>`;
    refs.combatCrewList.innerHTML=crew.length?crew.map((member,i)=>`<label class="check-row"><input type="checkbox" name="combatCrew" value="${member.id}" ${i<Math.min(4,crew.length)?'checked':''}><span><strong>${member.name}</strong><small>${member.role} · Macht ${member.power} · Treue ${member.loyalty}</small></span></label>`).join(''):'<div class="empty-state">Keine freie Einsatzcrew. Löse Personal aus Betrieben oder warte auf Genesung.</div>';refs.combatDialog.showModal();updateCombatSetupPreview();$$('input[name="combatCrew"]').forEach(c=>c.addEventListener('change',()=>{const selected=$$('input[name="combatCrew"]:checked');if(selected.length>4)c.checked=false;updateCombatSetupPreview();}));
  }
  function updateCombatSetupPreview(){const ids=$$('input[name="combatCrew"]:checked').map(i=>i.value),p=engine.getCombatPreview('raid',engine.state.selectedLocationId,ids);refs.combatMatchup.querySelector('div:first-child strong').textContent=`${p.percent}%`;}
  function renderCombatLive(combat,result=null){
    refs.combatSetup.hidden=true;refs.combatLive.hidden=false;const c=combat||result;refs.playerMorale.textContent=c.playerMorale;refs.enemyMorale.textContent=c.enemyMorale;refs.playerMoraleBar.style.width=`${c.playerMorale}%`;refs.enemyMoraleBar.style.width=`${c.enemyMorale}%`;refs.enemyName.textContent=(result?.rivalName||engine.getRivalDefinition(c.rivalGangId)?.name||'RIVALEN').toUpperCase();refs.combatRound.textContent=result?`${result.outcome==='win'?'SIEG':result.outcome==='retreat'?'RÜCKZUG':'NIEDERLAGE'} · ${result.moneyDelta>=0?'+':''}${euro(result.moneyDelta)}`:`Runde ${c.round}/${c.maxRounds} · Vorteil ${Math.round(c.advantage*100)} Punkte`;refs.combatLog.innerHTML=c.log.slice(-6).map(line=>`<p>${escapeHtml(line)}</p>`).join('');refs.battleImpact.classList.remove('flash');void refs.battleImpact.offsetWidth;refs.battleImpact.classList.add('flash');if(result){refs.tacticButtons.hidden=true;refs.closeCombatResult.hidden=false;}
  }

  function switchTab(name){$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));$$('.tab-content').forEach(p=>{const active=p.dataset.panel===name;p.classList.toggle('active',active);p.hidden=!active;});}
  function euro(value){return `${Math.round(value).toLocaleString('de-DE')} €`;}
  function formatCost(cost){const p=[];if(cost.money)p.push(euro(cost.money));if(cost.supplies)p.push(`${cost.supplies} Vorrat`);return p.length?p.join(' · '):'kein Einsatz';}
  function initials(name){return name.replace(/[„“"']/g,'').split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();}
  function hexPoints(cx,cy,r){return Array.from({length:6},(_,i)=>{const a=Math.PI/3*i+Math.PI/6;return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;}).join(' ');}
  function strategyLabel(s){return s==='aggressive'?'Aggressiv':s==='economic'?'Wirtschaftlich':'Verdeckt';}
  function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));$$('.chip').forEach(c=>c.addEventListener('click',()=>{actionCategory=c.dataset.cat;$$('.chip').forEach(x=>x.classList.toggle('active',x===c));renderDistrict();}));
  $('#saveButton').addEventListener('click',()=>saveState(true));$('#helpButton').addEventListener('click',()=>refs.helpDialog.showModal());$('#resetButton').addEventListener('click',()=>{if(!confirm('Neues Spiel starten? Der lokale Spielstand wird ersetzt.'))return;localStorage.removeItem(STORAGE_KEY);engine=new GameEngine();renderAll();});
  $('#saveCrewAssignment').addEventListener('click',e=>{e.preventDefault();const ids=$$('input[name="crewAssign"]:checked').map(i=>i.value);if(ids.length>2){refs.tickerText.textContent='Maximal zwei Crewmitglieder pro Betrieb.';return;}const result=engine.assignCrew(refs.crewAssetId.value,ids);if(!result.ok){refs.tickerText.textContent=result.reason;return;}refs.crewDialog.close();renderAll();});
  $('#combatClose').addEventListener('click',()=>{if(!engine.state.pendingCombat)refs.combatDialog.close();});$('#cancelCombat').addEventListener('click',()=>refs.combatDialog.close());$('#startCombatButton').addEventListener('click',()=>{const ids=$$('input[name="combatCrew"]:checked').map(i=>i.value);const result=engine.startCombat('raid',ids);if(!result.ok){refs.tickerText.textContent=result.reason;return;}renderCombatLive(result.combat);});
  $$('.tactic').forEach(button=>button.addEventListener('click',()=>{const result=engine.combatDecision(button.dataset.decision);if(!result.ok){refs.tickerText.textContent=result.reason;return;}if(result.finished){renderCombatLive(result.result,result.result);renderAll();}else renderCombatLive(result.combat);}));$('#closeCombatResult').addEventListener('click',()=>{refs.combatDialog.close();renderAll();switchTab('district');});
  renderAll();
})();
