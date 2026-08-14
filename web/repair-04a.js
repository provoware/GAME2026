(function(root){
  'use strict';
  const engine=root.REVIVAL_GAME_ENGINE;
  const DATA=root.GAME_DATA||root.window?.GAME_DATA;
  if(!engine||!DATA)return;
  const $=(s)=>document.querySelector(s);
  const $$=(s)=>Array.from(document.querySelectorAll(s));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=(v)=>`${Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:0})} €`;
  const zooms=[1,1.28,1.62];let zoomIndex=0;
  const map=Object.fromEntries(DATA.world.locations.map((l)=>[l.id,l]));
  const kindIcon=(kind)=>({base:'⌂',transit:'↔',market:'€',station:'▤',archive:'◫',club:'♪',industrial:'▦',residential:'▧',lookout:'◉',casino:'◈',harbor:'≋',commercial:'▤'}[kind]||'◇');
  const ownerClass=(o)=>o==='player'?'owner-player':o==='neutral'?'owner-neutral':'owner-rival';
  const zoneClass=(o)=>o==='player'?'zone-player':o==='neutral'?'zone-neutral':'zone-rival';
  const hexPoints=(cx,cy,r)=>Array.from({length:6},(_,i)=>{const a=Math.PI/3*i+Math.PI/6;return`${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;}).join(' ');
  function graphPath(from,to){
    if(from===to)return[];const g={};const add=(a,b,mode)=>{(g[a]||=[]).push({to:b,mode});};
    DATA.world.connections.forEach(([a,b])=>{add(a,b,'street');add(b,a,'street');});
    (DATA.world.trainRoutes||[]).forEach((r)=>add(r.from,r.to,'train'));
    const q=[from],seen=new Set([from]),prev={};
    while(q.length){const at=q.shift();for(const edge of g[at]||[]){if(seen.has(edge.to))continue;seen.add(edge.to);prev[edge.to]={from:at,mode:edge.mode};if(edge.to===to){q.length=0;break;}q.push(edge.to);}}
    if(!prev[to])return[];const path=[];let cur=to;while(cur!==from){const step=prev[cur];path.unshift({from:step.from,to:cur,mode:step.mode});cur=step.from;}return path;
  }
  function applyViewBox(){const svg=$('#cityMap');if(!svg)return;const zoom=zooms[zoomIndex]||1;if(zoom<=1){svg.setAttribute('viewBox','0 0 1000 700');return;}const l=engine.getLocation(),w=1000/zoom,h=700/zoom,x=Math.max(0,Math.min(1000-w,l.x-w/2)),y=Math.max(0,Math.min(700-h,l.y-h/2));svg.setAttribute('viewBox',`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);}
  function renderMap04A(){
    const svg=$('#cityMap');if(!svg)return;
    const selected=engine.state.selectedLocationId,current=engine.state.currentLocationId;
    const options=engine.getTravelOptions(),street=new Set(options.filter((o)=>o.mode==='street').map((o)=>o.to)),train=new Set(options.filter((o)=>o.mode==='train').map((o)=>o.to));
    const planned=graphPath(current,selected),plannedKeys=new Set(planned.map((e)=>`${e.mode}:${e.from}>${e.to}`));
    const fields=DATA.world.locations.map((l)=>{const d=engine.getDistrict(l.id);return`<circle class="district-field ${zoneClass(d.owner)}" cx="${l.x}" cy="${l.y}" r="82"></circle>`;}).join('');
    const roads=DATA.world.connections.map(([a,b])=>{const p1=map[a],p2=map[b],reachable=(a===current&&street.has(b))||(b===current&&street.has(a)),chosen=(a===current&&b===selected)||(b===current&&a===selected),plannedRoute=plannedKeys.has(`street:${a}>${b}`)||plannedKeys.has(`street:${b}>${a}`);return`<line class="route ${reachable?'reachable':''} ${plannedRoute?'planned':''} ${chosen?'chosen':''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>`;}).join('');
    const trains=(DATA.world.trainRoutes||[]).map((r)=>{const p1=map[r.from],p2=map[r.to],reachable=r.from===current&&train.has(r.to),chosen=r.from===current&&r.to===selected,plannedRoute=plannedKeys.has(`train:${r.from}>${r.to}`);return`<line class="train-route ${reachable?'reachable':''} ${plannedRoute?'planned':''} ${chosen?'chosen':''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>`;}).join('');
    const nodes=DATA.world.locations.map((l)=>{const d=engine.getDistrict(l.id),assets=engine.state.assets.filter((a)=>a.locationId===l.id).length,r=l.id===selected?54:48;return`<g class="district-node ${l.id===selected?'selected':''} ${l.id===current?'current':''}" data-location="${l.id}" tabindex="0" role="button" aria-label="${esc(l.title)}"><polygon class="zone ${zoneClass(d.owner)}" points="${hexPoints(l.x,l.y,r+10)}"></polygon><circle class="owner-ring ${ownerClass(d.owner)}" cx="${l.x}" cy="${l.y}" r="37"></circle><circle class="control-ring" cx="${l.x}" cy="${l.y}" r="31" pathLength="100" style="stroke-dasharray:${d.control} ${100-d.control}"></circle><circle class="node-core" cx="${l.x}" cy="${l.y}" r="25"></circle><text class="node-kind" x="${l.x}" y="${l.y-5}" text-anchor="middle">${kindIcon(l.kind)}</text><text class="node-control" x="${l.x}" y="${l.y+14}" text-anchor="middle">${d.control}%</text><text class="node-label" x="${l.x}" y="${l.y+59}" text-anchor="middle">${esc(l.short)}</text><text class="node-pressure" x="${l.x}" y="${l.y+73}" text-anchor="middle">R${d.rival} · P${d.police}</text>${assets?`<text class="asset-count" x="${l.x-34}" y="${l.y-34}">${assets}</text>`:''}${d.intel?`<circle class="intel-pin" cx="${l.x+32}" cy="${l.y-32}" r="${4+d.intel}"></circle>`:''}${l.kind==='station'?`<rect class="train-pin" x="${l.x-5}" y="${l.y+29}" width="10" height="10" rx="2"></rect>`:''}</g>`;}).join('');
    svg.innerHTML=`<g class="map-04a-marker"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="grid-line" fill="none"></path></pattern></defs><rect class="map-bg" width="1000" height="700"></rect><rect width="1000" height="700" fill="url(#grid)"></rect>${fields}${roads}${trains}${nodes}</g>`;
    applyViewBox();renderMapInfo(selected,current,options,planned);
  }
  function renderMapInfo(selected,current,options,planned){
    const l=engine.getLocation(selected),d=engine.getDistrict(selected),here=selected===current,event=typeof engine.getCityEventsAt==='function'?engine.getCityEventsAt(selected)[0]:null;
    const call=$('#mapCallout');if(call)call.innerHTML=`<strong>${esc(l.title)} · ${esc(engine.ownerLabel(d.owner))}</strong><span>${esc(l.kind)} · Kontrolle ${d.control}% · Rivalen ${d.rival}% · Polizei ${d.police}% · Unruhe ${d.unrest}% · Intel ${d.intel}/5${event?` · ${esc(event.title)}`:''}</span>`;
    const quick=$('#mapQuickbar');if(!quick)return;if(here){quick.innerHTML='<span class="route-state current">Du bist hier</span><span>Wähle einen Bezirk. Leuchtende Linien sind sofort erreichbar.</span>';return;}
    const direct=options.filter((o)=>o.to===selected);if(direct.length){quick.innerHTML=`<span class="route-state ready">Direkt erreichbar</span>${direct.map((o)=>`<button class="mini-btn good" data-travel-to="${o.to}" data-travel-mode="${o.mode}">${o.mode==='train'?'Bahn':'Straße'} · ${money(o.cost)}</button>`).join('')}`;return;}
    if(planned.length){const next=planned[0],dest=engine.getLocation(next.to),nextOption=options.find((o)=>o.to===next.to&&o.mode===next.mode);quick.innerHTML=`<span class="route-state planned">Route · ${planned.length} Etappe${planned.length===1?'':'n'}</span><span>Nächster Halt: <b>${esc(dest.title)}</b></span>${nextOption?`<button class="mini-btn" data-travel-to="${next.to}" data-travel-mode="${next.mode}">Nächste Etappe · ${money(nextOption.cost)}</button>`:''}`;return;}
    quick.innerHTML='<span class="route-state blocked">Keine Route berechenbar</span>';
  }
  function renderRivals(){const panel=$('#rivalsPanel');if(!panel||typeof engine.getRivalOverview!=='function')return;const relations=typeof engine.getRivalRelationsOverview==='function'?engine.getRivalRelationsOverview():[];panel.innerHTML=`<div class="section-head"><div><span class="eyebrow">RIVALENLAGE</span><h3>Drei eigenständige Gangs</h3></div></div><div class="rival-list">${engine.getRivalOverview().map((r)=>{const rel=relations.filter((x)=>x.a===r.id||x.b===r.id);return`<article class="rival-card"><div class="row-between"><div><b>${esc(r.name)}</b><p class="muted">${esc(r.strategy)} · ${esc(r.description)}</p></div><span class="status-pill">Macht ${r.power}</span></div><div class="summary-grid"><div><span>Kasse</span><strong>${money(r.wealth)}</strong></div><div><span>Gebiete</span><strong>${r.territories.length}</strong></div><div><span>Aggression</span><strong>${r.aggression}</strong></div><div><span>Tarnung</span><strong>${r.stealth}</strong></div></div><p class="muted">${esc(r.lastMove||'Noch kein sichtbarer Zug.')}</p><div class="relation-row">${rel.map((x)=>`<span class="tag ${x.status==='war'?'danger':''}">${esc(x.label||x.status)}</span>`).join('')}</div></article>`;}).join('')}</div>`;}
  function persist(){try{const raw=engine.exportState();localStorage.setItem('pppoppi-bunkerwahrheit-html-v090',raw);localStorage.setItem('pppoppi-bunkerwahrheit-html-v0100',raw);}catch(_){}}
  function finishTurn(){const r=engine.endTurn();if(!r.ok){const ticker=$('#tickerText');if(ticker)ticker.textContent=r.reason;return;}persist();location.reload();}
  const end=$('#endTurnButton');if(end)end.addEventListener('click',finishTurn);
  $('#mapZoomIn')?.addEventListener('click',()=>{zoomIndex=Math.min(zooms.length-1,zoomIndex+1);applyViewBox();});
  $('#mapZoomOut')?.addEventListener('click',()=>{zoomIndex=Math.max(0,zoomIndex-1);applyViewBox();});
  $('#mapZoomReset')?.addEventListener('click',()=>{zoomIndex=0;applyViewBox();});
  document.addEventListener('keydown',(event)=>{const tag=event.target?.tagName;if(event.key.toLowerCase()==='e'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag)&&!document.querySelector('dialog[open]')){event.preventDefault();finishTurn();}});
  renderMap04A();renderRivals();persist();
  root.LIVING_CITY_04A={renderMap:renderMap04A,renderRivals,finishTurn};
})(typeof globalThis!=='undefined'?globalThis:this);
