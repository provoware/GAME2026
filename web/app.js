(function () {
  'use strict';
  const STORAGE_KEY = 'pppoppi-bunkerwahrheit-html-v060';
  const DATA = window.GAME_DATA;
  const { GameEngine } = window.GAME_ENGINE;
  const saved = loadStoredState();
  const engine = new GameEngine({ state: saved || undefined });
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const refs = {
    turnValue: $('#turnValue'), moneyValue: $('#moneyValue'), suppliesValue: $('#suppliesValue'), gangValue: $('#gangValue'),
    bossTitle: $('#bossTitle'), bossStyle: $('#bossStyle'), bossNote: $('#bossNote'), bossMetrics: $('#bossMetrics'),
    cityControl: $('#cityControl'), avgControl: $('#avgControl'), avgRival: $('#avgRival'), gangPower: $('#gangPower'), heatText: $('#heatText'),
    cityMap: $('#cityMap'), mapCallout: $('#mapCallout'), tickerText: $('#tickerText'), districtKind: $('#districtKind'), districtTitle: $('#districtTitle'),
    controlBadge: $('#controlBadge'), districtDescription: $('#districtDescription'), districtBars: $('#districtBars'), actionGrid: $('#actionGrid'),
    gangRoster: $('#gangRoster'), gangCountPill: $('#gangCountPill'), eventLog: $('#eventLog'), saveStatus: $('#saveStatus'), helpDialog: $('#helpDialog')
  };
  const metricMeta = {
    respect: ['Respekt', 'Folgen dir freiwillig'], fear: ['Furcht', 'Gehen dir aus dem Weg'], loyalty: ['Loyalität', 'Hält die Crew zusammen'],
    influence: ['Einfluss', 'Kontakte und Zugang'], heat: ['Fahndung', 'Polizeiliche Aufmerksamkeit'], notoriety: ['Bekanntheit', 'Wie weit dein Name trägt']
  };

  function loadStoredState() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (error) { console.warn('Speicherstand konnte nicht gelesen werden.', error); return null; }
  }
  function saveState(manual = false) {
    try {
      localStorage.setItem(STORAGE_KEY, engine.exportState());
      refs.saveStatus.textContent = manual ? 'Spielstand jetzt gespeichert' : 'Automatisch lokal gespeichert';
      if (manual) setTimeout(() => { refs.saveStatus.textContent = 'Automatisch lokal gespeichert'; }, 1800);
    } catch (error) { refs.saveStatus.textContent = 'Speichern nicht möglich'; console.warn(error); }
  }
  function renderAll() {
    const state = engine.state;
    refs.turnValue.textContent = state.turn;
    refs.moneyValue.textContent = `${state.resources.money.toLocaleString('de-DE')} €`;
    refs.suppliesValue.textContent = state.resources.supplies;
    refs.gangValue.textContent = state.gang.length;
    renderBoss(); renderMap(); renderDistrict(); renderGang(); renderLog(); saveState(false);
  }
  function renderBoss() {
    const boss = engine.state.boss;
    const profile = engine.getBossProfile();
    const summary = engine.getCitySummary();
    refs.bossTitle.textContent = profile.title; refs.bossNote.textContent = profile.note; refs.bossStyle.textContent = engine.getDominantStyle();
    refs.bossMetrics.innerHTML = Object.entries(metricMeta).map(([key, meta]) => {
      const value = boss[key];
      return `<div class="metric ${key === 'heat' ? 'danger-metric' : ''}"><div class="metric-head"><span><strong>${meta[0]}</strong><small>${meta[1]}</small></span><b>${value}</b></div><div class="meter"><i style="width:${value}%"></i></div></div>`;
    }).join('');
    refs.cityControl.textContent = `${summary.controlled} / ${summary.total}`; refs.avgControl.textContent = `${summary.avgControl}%`; refs.avgRival.textContent = `${summary.avgRival}%`; refs.gangPower.textContent = engine.getGangPower();
    refs.heatText.textContent = boss.heat >= 75 ? 'Kritisch' : boss.heat >= 50 ? 'Heiß' : boss.heat >= 28 ? 'Beobachtet' : 'Ruhig';
  }
  function renderMap() {
    const selectedId = engine.state.selectedLocationId;
    const locationMap = Object.fromEntries(DATA.world.locations.map((location) => [location.id, location]));
    const uniqueConnections = []; const seen = new Set();
    DATA.world.connections.forEach(([a, b]) => { const key = [a, b].sort().join('|'); if (!seen.has(key)) { seen.add(key); uniqueConnections.push([a, b]); } });
    const connectionsSvg = uniqueConnections.map(([a, b]) => {
      const p1 = locationMap[a]; const p2 = locationMap[b]; const active = a === selectedId || b === selectedId;
      return `<line class="route ${active ? 'active' : ''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>`;
    }).join('');
    const nodesSvg = DATA.world.locations.map((location) => {
      const d = engine.state.districts[location.id]; const selected = location.id === selectedId; const radius = location.kind === 'base' ? 62 : 52;
      const controlClass = d.control >= 55 ? 'owned' : d.rival > d.control ? 'contested' : 'neutral';
      return `<g class="district-node ${controlClass} ${selected ? 'selected' : ''}" tabindex="0" role="button" aria-label="${location.title}, Kontrolle ${d.control} Prozent" data-location="${location.id}"><polygon class="zone" points="${hexPoints(location.x, location.y, radius)}"></polygon><circle class="node-ring base" cx="${location.x}" cy="${location.y}" r="37"></circle><circle class="node-ring control" cx="${location.x}" cy="${location.y}" r="37" pathLength="100" stroke-dasharray="${d.control} ${100 - d.control}" transform="rotate(-90 ${location.x} ${location.y})"></circle><circle class="node-core" cx="${location.x}" cy="${location.y}" r="28"></circle><text class="node-value" x="${location.x}" y="${location.y + 5}" text-anchor="middle">${d.control}</text><text class="node-label" x="${location.x}" y="${location.y + 66}" text-anchor="middle">${location.short}</text><g class="threat-pips" transform="translate(${location.x - 34} ${location.y - 54})"><rect class="pip rival" width="31" height="7" rx="3.5"></rect><rect class="pip-fill rival" width="${31 * d.rival / 100}" height="7" rx="3.5"></rect><rect class="pip police" x="37" width="31" height="7" rx="3.5"></rect><rect class="pip-fill police" x="37" width="${31 * d.police / 100}" height="7" rx="3.5"></rect></g></g>`;
    }).join('');
    refs.cityMap.innerHTML = `<defs><pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="grid-line"></path></pattern></defs><rect class="map-bg" width="1000" height="700"></rect><rect class="map-grid" width="1000" height="700"></rect><g class="routes">${connectionsSvg}</g><g class="districts">${nodesSvg}</g>`;
    $$('.district-node').forEach((node) => {
      const activate = () => { engine.selectLocation(node.dataset.location); renderMap(); renderDistrict(); };
      node.addEventListener('click', activate); node.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
    });
    const selected = engine.getLocation(); const district = engine.getDistrict();
    refs.mapCallout.innerHTML = `<strong>${selected.title}</strong><span>${district.control}% Kontrolle · ${district.rival}% Rivalen · ${district.police}% Polizei</span>`;
  }
  function hexPoints(cx, cy, r) {
    return Array.from({ length: 6 }, (_, index) => { const angle = Math.PI / 3 * index + Math.PI / 6; return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`; }).join(' ');
  }
  function renderDistrict() {
    const location = engine.getLocation(); const district = engine.getDistrict();
    refs.districtKind.textContent = kindLabel(location.kind); refs.districtTitle.textContent = location.title; refs.controlBadge.textContent = `${district.control}%`;
    refs.controlBadge.className = `control-badge ${district.control >= 55 ? 'good' : district.rival > district.control ? 'bad' : ''}`;
    refs.districtDescription.textContent = location.description;
    refs.districtBars.innerHTML = [['Kontrolle', district.control, 'control'], ['Rivalen', district.rival, 'rival'], ['Polizei', district.police, 'police'], ['Unruhe', district.unrest, 'unrest']].map(([label, value, cls]) => `<div class="district-bar"><div><span>${label}</span><strong>${value}%</strong></div><div class="thin-meter ${cls}"><i style="width:${value}%"></i></div></div>`).join('');
    refs.actionGrid.innerHTML = DATA.actions.map((action) => {
      const disabled = !engine.canAfford(action);
      return `<button class="action-card tone-${action.tone}" type="button" data-action="${action.id}" ${disabled ? 'disabled' : ''}><span class="action-icon">${action.icon}</span><span class="action-copy"><strong>${action.title}</strong><small>${action.description}</small></span><span class="action-cost">${formatCost(action.cost)}</span></button>`;
    }).join('');
    $$('.action-card').forEach((button) => button.addEventListener('click', () => { const result = engine.applyAction(button.dataset.action); if (!result.ok) { refs.tickerText.textContent = result.reason; return; } renderAll(); }));
  }
  function renderGang() {
    const gang = engine.state.gang; refs.gangCountPill.textContent = `${gang.length} Leute`;
    refs.gangRoster.innerHTML = gang.map((member) => `<article class="member-card ${member.injuredUntil ? 'injured' : ''}"><div class="avatar">${initials(member.name)}</div><div class="member-main"><strong>${member.name}</strong><span>${member.role} · ${member.trait}</span><small>aus ${member.origin}${member.injuredUntil ? ' · verletzt' : ''}</small></div><div class="member-stats"><span>Macht <b>${member.power}</b></span><span>Treue <b>${member.loyalty}</b></span></div></article>`).join('');
  }
  function renderLog() {
    refs.eventLog.innerHTML = engine.state.history.map((event) => `<article class="event ${event.type}"><span class="event-turn">Z${event.turn}</span><p>${event.text}</p></article>`).join('');
    refs.tickerText.textContent = engine.state.history[0]?.text || 'Keine Meldungen.';
  }
  function kindLabel(kind) { return ({ base: 'Basis', transit: 'Verbindung', market: 'Markt', archive: 'Archiv', club: 'Nachtleben', industrial: 'Industrie', residential: 'Wohngebiet', lookout: 'Aufklärung' })[kind] || kind; }
  function formatCost(cost) { const parts = []; if (cost.money) parts.push(`${cost.money} €`); if (cost.supplies) parts.push(`${cost.supplies} Vorrat`); return parts.length ? parts.join(' · ') : 'bringt Ertrag'; }
  function initials(name) { return name.replace(/[„“"']/g, '').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  $$('.tab').forEach((tab) => tab.addEventListener('click', () => { $$('.tab').forEach((item) => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); }); $$('.tab-content').forEach((panel) => { const active = panel.dataset.panel === tab.dataset.tab; panel.classList.toggle('active', active); panel.hidden = !active; }); }));
  $('#saveButton').addEventListener('click', () => saveState(true)); $('#helpButton').addEventListener('click', () => refs.helpDialog.showModal());
  $('#resetButton').addEventListener('click', () => { if (!window.confirm('Neues Spiel starten? Der lokale Spielstand wird ersetzt.')) return; localStorage.removeItem(STORAGE_KEY); window.location.reload(); });
  renderAll();
})();
