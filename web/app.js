(function () {
  'use strict';

  const STORAGE_KEY = 'pppoppi-bunkerwahrheit-html-v070';
  const LEGACY_KEYS = ['pppoppi-bunkerwahrheit-html-v060'];
  const DATA = window.GAME_DATA;
  const { GameEngine } = window.GAME_ENGINE;
  const saved = loadStoredState();
  const engine = new GameEngine({ state: saved || undefined });
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const refs = {
    turnValue: $('#turnValue'),
    moneyValue: $('#moneyValue'),
    suppliesValue: $('#suppliesValue'),
    gangValue: $('#gangValue'),
    assetValue: $('#assetValue'),
    bossTitle: $('#bossTitle'),
    bossStyle: $('#bossStyle'),
    bossNote: $('#bossNote'),
    bossRank: $('#bossRank'),
    rankNext: $('#rankNext'),
    netWorth: $('#netWorth'),
    projectedIncome: $('#projectedIncome'),
    raidRisk: $('#raidRisk'),
    recruitChance: $('#recruitChance'),
    crewReady: $('#crewReady'),
    avgLoyalty: $('#avgLoyalty'),
    bossAlerts: $('#bossAlerts'),
    bossMetrics: $('#bossMetrics'),
    cityControl: $('#cityControl'),
    avgControl: $('#avgControl'),
    avgRival: $('#avgRival'),
    gangPower: $('#gangPower'),
    heatText: $('#heatText'),
    cityMap: $('#cityMap'),
    mapCallout: $('#mapCallout'),
    tickerText: $('#tickerText'),
    districtKind: $('#districtKind'),
    districtTitle: $('#districtTitle'),
    controlBadge: $('#controlBadge'),
    districtDescription: $('#districtDescription'),
    districtBars: $('#districtBars'),
    districtOpportunity: $('#districtOpportunity'),
    actionGrid: $('#actionGrid'),
    propertyCountPill: $('#propertyCountPill'),
    portfolioValue: $('#portfolioValue'),
    portfolioNet: $('#portfolioNet'),
    hotelCount: $('#hotelCount'),
    propertyDistrictTitle: $('#propertyDistrictTitle'),
    propertyOffers: $('#propertyOffers'),
    portfolioList: $('#portfolioList'),
    gangRoster: $('#gangRoster'),
    gangCountPill: $('#gangCountPill'),
    eventLog: $('#eventLog'),
    saveStatus: $('#saveStatus'),
    helpDialog: $('#helpDialog'),
    combatOverlay: $('#combatOverlay'),
    combatCard: $('#combatCard'),
    combatTitle: $('#combatTitle'),
    combatLocation: $('#combatLocation'),
    combatAttack: $('#combatAttack'),
    combatDefense: $('#combatDefense'),
    combatOddsBar: $('#combatOddsBar'),
    combatOdds: $('#combatOdds'),
    combatPhases: $('#combatPhases'),
    combatResult: $('#combatResult')
  };

  const metricMeta = {
    respect: ['Respekt', 'Freiwillige Gefolgschaft'],
    fear: ['Furcht', 'Abschreckung'],
    loyalty: ['Loyalität', 'Zusammenhalt'],
    influence: ['Einfluss', 'Kontakte und Zugang'],
    heat: ['Fahndung', 'Polizeiliche Aufmerksamkeit'],
    notoriety: ['Bekanntheit', 'Reichweite des Namens']
  };

  const categoryMeta = {
    geschaeft: ['GESCHÄFTE', 'Sofortiger Ertrag, aber nicht ohne Nebenwirkungen.'],
    einfluss: ['EINFLUSS & KONTROLLE', 'Stabilität, Kontakte und Vorbereitung.'],
    konflikt: ['KONFLIKT', 'Druck, Kampf oder Rückzug. Prognose beachten.']
  };

  function loadStoredState() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return JSON.parse(current);
      for (const key of LEGACY_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) return JSON.parse(legacy);
      }
      return null;
    } catch (error) {
      console.warn('Speicherstand konnte nicht gelesen werden.', error);
      return null;
    }
  }

  function saveState(manual = false) {
    try {
      localStorage.setItem(STORAGE_KEY, engine.exportState());
      refs.saveStatus.textContent = manual ? 'Spielstand jetzt gespeichert' : 'Automatisch lokal gespeichert';
      if (manual) {
        setTimeout(() => {
          refs.saveStatus.textContent = 'Automatisch lokal gespeichert';
        }, 1800);
      }
    } catch (error) {
      refs.saveStatus.textContent = 'Speichern nicht möglich';
      console.warn(error);
    }
  }

  function renderAll() {
    const state = engine.state;
    const portfolio = engine.getPortfolioSummary();
    refs.turnValue.textContent = state.turn;
    refs.moneyValue.textContent = euro(state.resources.money);
    refs.suppliesValue.textContent = state.resources.supplies;
    refs.gangValue.textContent = state.gang.length;
    refs.assetValue.textContent = portfolio.count;
    renderBoss();
    renderMap();
    renderDistrict();
    renderProperties();
    renderGang();
    renderLog();
    saveState(false);
  }

  function renderBoss() {
    const boss = engine.state.boss;
    const profile = engine.getBossProfile();
    const summary = engine.getCitySummary();
    const dashboard = engine.getBossDashboard();

    refs.bossTitle.textContent = profile.title;
    refs.bossNote.textContent = profile.note;
    refs.bossStyle.textContent = engine.getDominantStyle();
    refs.bossRank.textContent = `${dashboard.rank.title} · Stufe ${dashboard.rank.level}`;
    refs.rankNext.textContent = dashboard.rank.next;
    refs.netWorth.textContent = euro(dashboard.netWorth);
    refs.projectedIncome.textContent = `${euro(dashboard.projectedIncome)}/Z`;
    refs.raidRisk.textContent = `${dashboard.raidRisk}%`;
    refs.recruitChance.textContent = `${dashboard.recruitChance}%`;
    refs.crewReady.textContent = `${dashboard.readiness.ready}/${dashboard.readiness.total}`;
    refs.avgLoyalty.textContent = `${dashboard.avgLoyalty}%`;

    refs.bossAlerts.innerHTML = dashboard.alerts.slice(0, 3).map((alert, index) =>
      `<div class="boss-alert ${index === 0 && (boss.heat >= 65 || dashboard.raidRisk >= 20) ? 'warning' : ''}"><span>${index + 1}</span><p>${alert}</p></div>`
    ).join('');

    refs.bossMetrics.innerHTML = Object.entries(metricMeta).map(([key, meta]) => {
      const value = boss[key];
      return `<div class="metric ${key === 'heat' ? 'danger-metric' : ''}">
        <div class="metric-head"><span><strong>${meta[0]}</strong><small>${meta[1]}</small></span><b>${value}</b></div>
        <div class="meter"><i style="width:${value}%"></i></div>
      </div>`;
    }).join('');

    refs.cityControl.textContent = `${summary.controlled} / ${summary.total}`;
    refs.avgControl.textContent = `${summary.avgControl}%`;
    refs.avgRival.textContent = `${summary.avgRival}%`;
    refs.gangPower.textContent = engine.getGangPower();
    refs.heatText.textContent = boss.heat >= 75 ? 'Kritisch' : boss.heat >= 50 ? 'Heiß' : boss.heat >= 28 ? 'Beobachtet' : 'Ruhig';
  }

  function renderMap() {
    const selectedId = engine.state.selectedLocationId;
    const locationMap = Object.fromEntries(DATA.world.locations.map((location) => [location.id, location]));
    const portfolio = engine.getPortfolioSummary();
    const uniqueConnections = [];
    const seen = new Set();

    DATA.world.connections.forEach(([a, b]) => {
      const key = [a, b].sort().join('|');
      if (!seen.has(key)) {
        seen.add(key);
        uniqueConnections.push([a, b]);
      }
    });

    const connectionsSvg = uniqueConnections.map(([a, b]) => {
      const p1 = locationMap[a];
      const p2 = locationMap[b];
      const active = a === selectedId || b === selectedId;
      return `<line class="route ${active ? 'active' : ''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"></line>`;
    }).join('');

    const nodesSvg = DATA.world.locations.map((location) => {
      const d = engine.state.districts[location.id];
      const selected = location.id === selectedId;
      const radius = location.kind === 'base' ? 62 : 52;
      const controlClass = d.control >= 55 ? 'owned' : d.rival > d.control ? 'contested' : 'neutral';
      const assetCount = portfolio.byLocation[location.id] || 0;
      const assetBadge = assetCount
        ? `<g class="asset-badge" transform="translate(${location.x + 26} ${location.y + 22})"><circle r="14"></circle><text y="4" text-anchor="middle">${assetCount}</text></g>`
        : '';
      const intelBadge = d.intel > 0
        ? `<g class="intel-badge" transform="translate(${location.x - 31} ${location.y + 23})"><circle r="12"></circle><text y="4" text-anchor="middle">${d.intel}</text></g>`
        : '';
      return `<g class="district-node ${controlClass} ${selected ? 'selected' : ''}" tabindex="0" role="button"
        aria-label="${location.title}, Kontrolle ${d.control} Prozent, ${assetCount} Objekte" data-location="${location.id}">
        <polygon class="zone" points="${hexPoints(location.x, location.y, radius)}"></polygon>
        <circle class="node-ring base" cx="${location.x}" cy="${location.y}" r="37"></circle>
        <circle class="node-ring control" cx="${location.x}" cy="${location.y}" r="37" pathLength="100"
          stroke-dasharray="${d.control} ${100 - d.control}" transform="rotate(-90 ${location.x} ${location.y})"></circle>
        <circle class="node-core" cx="${location.x}" cy="${location.y}" r="28"></circle>
        <text class="node-value" x="${location.x}" y="${location.y + 5}" text-anchor="middle">${d.control}</text>
        <text class="node-label" x="${location.x}" y="${location.y + 66}" text-anchor="middle">${location.short}</text>
        <g class="threat-pips" transform="translate(${location.x - 34} ${location.y - 54})">
          <rect class="pip rival" width="31" height="7" rx="3.5"></rect>
          <rect class="pip-fill rival" width="${31 * d.rival / 100}" height="7" rx="3.5"></rect>
          <rect class="pip police" x="37" width="31" height="7" rx="3.5"></rect>
          <rect class="pip-fill police" x="37" width="${31 * d.police / 100}" height="7" rx="3.5"></rect>
        </g>
        ${assetBadge}${intelBadge}
      </g>`;
    }).join('');

    refs.cityMap.innerHTML = `<defs>
      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="grid-line"></path></pattern>
      <radialGradient id="cityGlow"><stop offset="0" stop-color="rgba(214,255,66,.06)"></stop><stop offset="1" stop-color="rgba(7,9,13,0)"></stop></radialGradient>
    </defs>
    <rect class="map-bg" width="1000" height="700"></rect>
    <circle class="city-glow" cx="520" cy="340" r="330"></circle>
    <rect class="map-grid" width="1000" height="700"></rect>
    <g class="routes">${connectionsSvg}</g>
    <g class="districts">${nodesSvg}</g>`;

    $$('.district-node').forEach((node) => {
      const activate = () => {
        engine.selectLocation(node.dataset.location);
        renderBoss();
        renderMap();
        renderDistrict();
        renderProperties();
      };
      node.addEventListener('click', activate);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });

    const selected = engine.getLocation();
    const district = engine.getDistrict();
    const assets = portfolio.byLocation[selected.id] || 0;
    refs.mapCallout.innerHTML = `<strong>${selected.title}</strong><span>${district.control}% Kontrolle · ${district.rival}% Rivalen · ${district.police}% Polizei · ${assets} Besitz</span>`;
  }

  function hexPoints(cx, cy, r) {
    return Array.from({ length: 6 }, (_, index) => {
      const angle = Math.PI / 3 * index + Math.PI / 6;
      return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
    }).join(' ');
  }

  function renderDistrict() {
    const location = engine.getLocation();
    const district = engine.getDistrict();
    const assetsHere = engine.getAssetsAtLocation();
    const availableProperties = engine.getAvailableProperties();
    const combatPreview = engine.getActionPreview('raid');

    refs.districtKind.textContent = kindLabel(location.kind);
    refs.districtTitle.textContent = location.title;
    refs.controlBadge.textContent = `${district.control}%`;
    refs.controlBadge.className = `control-badge ${district.control >= 55 ? 'good' : district.rival > district.control ? 'bad' : ''}`;
    refs.districtDescription.textContent = location.description;
    refs.districtBars.innerHTML = [
      ['Kontrolle', district.control, 'control'],
      ['Rivalen', district.rival, 'rival'],
      ['Polizei', district.police, 'police'],
      ['Unruhe', district.unrest, 'unrest']
    ].map(([label, value, cls]) =>
      `<div class="district-bar"><div><span>${label}</span><strong>${value}%</strong></div><div class="thin-meter ${cls}"><i style="width:${value}%"></i></div></div>`
    ).join('');

    const potential = Math.round(location.income * (0.8 + district.control / 170));
    refs.districtOpportunity.innerHTML = `
      <div><span>Ertragspotenzial</span><strong>~${euro(potential)}/Z</strong></div>
      <div><span>Kampfchance</span><strong>${combatPreview?.combat?.percent || 0}%</strong></div>
      <div><span>Aufklärung</span><strong>${district.intel}/5</strong></div>
      <div><span>Eigener Besitz</span><strong>${assetsHere.length}</strong></div>
      <button type="button" class="mini-link" data-open-property ${availableProperties.length ? '' : 'disabled'}>Investieren →</button>`;

    const propertyShortcut = refs.districtOpportunity.querySelector('[data-open-property]');
    if (propertyShortcut) propertyShortcut.addEventListener('click', () => activateTab('property'));

    const categories = ['geschaeft', 'einfluss', 'konflikt'];
    refs.actionGrid.innerHTML = categories.map((category) => {
      const [title, note] = categoryMeta[category];
      const actions = DATA.actions.filter((action) => action.category === category);
      return `<section class="action-group">
        <div class="action-group-head"><div><strong>${title}</strong><small>${note}</small></div></div>
        <div class="action-list">${actions.map(renderActionCard).join('')}</div>
      </section>`;
    }).join('');

    $$('.action-card').forEach((button) => {
      button.addEventListener('click', () => {
        const result = engine.applyAction(button.dataset.action);
        if (!result.ok) {
          refs.tickerText.textContent = result.reason;
          return;
        }
        renderAll();
        if (result.combat) renderCombat(result.combat);
      });
    });
  }

  function renderActionCard(action) {
    const preview = engine.getActionPreview(action.id);
    const disabled = !preview.available;
    const combat = preview.combat
      ? `<span class="preview-chip combat-preview">Sieg ~${preview.combat.percent}%</span>`
      : '';
    const important = preview.available ? actionImpactText(action) : preview.reason;
    return `<button class="action-card tone-${action.tone}" type="button" data-action="${action.id}" ${disabled ? 'disabled' : ''}>
      <span class="action-icon">${action.icon}</span>
      <span class="action-copy">
        <strong>${action.title}</strong>
        <small>${action.description}</small>
        <span class="preview-row">${combat}<span class="preview-chip">${important}</span></span>
      </span>
      <span class="action-cost">${formatCost(action.cost)}</span>
    </button>`;
  }

  function actionImpactText(action) {
    const effects = action.effects || {};
    if (action.combat) return `Beute bis ~${euro(action.combat.reward)}`;
    if ((effects.money || 0) >= 200) return `Ertrag +${euro(effects.money)}`;
    if ((effects.heat || 0) <= -7) return `Fahndung ${effects.heat}`;
    if ((effects.control || 0) >= 4) return `Kontrolle +${effects.control}`;
    if ((effects.influence || 0) >= 5) return `Einfluss +${effects.influence}`;
    return 'mehrere Folgen';
  }

  function renderProperties() {
    const portfolio = engine.getPortfolioSummary();
    const location = engine.getLocation();
    const offers = engine.getAvailableProperties();

    refs.propertyCountPill.textContent = `${portfolio.count} ${portfolio.count === 1 ? 'Objekt' : 'Objekte'}`;
    refs.portfolioValue.textContent = euro(portfolio.bookValue);
    refs.portfolioNet.textContent = `${euro(portfolio.projectedNet)}/Z`;
    refs.hotelCount.textContent = portfolio.hotelCount;
    refs.propertyDistrictTitle.textContent = `Angebote in ${location.title}`;

    refs.propertyOffers.innerHTML = offers.length ? offers.map((property) => {
      const affordable = engine.state.resources.money >= property.cost;
      const yieldPercent = property.cost > 0 ? Math.round(property.projectedNet / property.cost * 1000) / 10 : 0;
      return `<article class="property-card">
        <div class="property-icon">${property.icon}</div>
        <div class="property-main">
          <div class="property-title"><strong>${property.title}</strong><span>${euro(property.cost)}</span></div>
          <p>${property.description}</p>
          <div class="property-numbers">
            <span>Netto <b>${euro(property.projectedNet)}/Z</b></span>
            <span>Rendite <b>~${yieldPercent}%/Z</b></span>
            <span>Unterhalt <b>${euro(property.upkeep)}</b></span>
          </div>
        </div>
        <button class="buy-button" type="button" data-property="${property.id}" ${affordable ? '' : 'disabled'}>${affordable ? 'Kaufen' : 'Zu teuer'}</button>
      </article>`;
    }).join('') : `<div class="empty-state"><strong>Keine weiteren Angebote</strong><span>In diesem Bezirk sind alle passenden Objekttypen bereits gekauft.</span></div>`;

    $$('.buy-button').forEach((button) => {
      button.addEventListener('click', () => {
        const result = engine.buyProperty(button.dataset.property);
        if (!result.ok) {
          refs.tickerText.textContent = result.reason;
          return;
        }
        renderAll();
        activateTab('property');
      });
    });

    if (!engine.state.assets.length) {
      refs.portfolioList.innerHTML = `<div class="empty-state"><strong>Noch kein Besitz</strong><span>Starte günstig mit Spätkauf oder Werkstatt und arbeite dich zu Hotels und größeren Objekten hoch.</span></div>`;
      return;
    }

    refs.portfolioList.innerHTML = engine.state.assets.map((asset) => {
      const property = engine.getPropertyDefinition(asset.propertyId);
      const districtLocation = engine.getLocation(asset.locationId);
      const projection = engine.getPropertyProjection(asset);
      return `<article class="owned-property">
        <span class="owned-icon">${property.icon}</span>
        <div><strong>${property.title}</strong><small>${districtLocation.title} · gekauft Z${asset.boughtTurn}</small></div>
        <div class="owned-cash"><strong>+${euro(projection.net)}/Z</strong><small>${projection.stability}% Standortfaktor</small></div>
      </article>`;
    }).join('');
  }

  function renderGang() {
    const gang = engine.state.gang;
    refs.gangCountPill.textContent = `${gang.length} Leute`;
    refs.gangRoster.innerHTML = gang.map((member) =>
      `<article class="member-card ${member.injuredUntil ? 'injured' : ''}">
        <div class="avatar">${initials(member.name)}</div>
        <div class="member-main"><strong>${member.name}</strong><span>${member.role} · ${member.trait}</span><small>aus ${member.origin}${member.injuredUntil ? ` · verletzt bis Z${member.injuredUntil}` : ''}</small></div>
        <div class="member-stats"><span>Macht <b>${member.power}</b></span><span>Treue <b>${member.loyalty}</b></span></div>
      </article>`
    ).join('');
  }

  function renderLog() {
    refs.eventLog.innerHTML = engine.state.history.map((event) =>
      `<article class="event ${event.type}"><span class="event-turn">Z${event.turn}</span><p>${event.text}</p></article>`
    ).join('');
    refs.tickerText.textContent = engine.state.history[0]?.text || 'Keine Meldungen.';
  }

  function renderCombat(combat) {
    refs.combatTitle.textContent = combat.actionTitle;
    refs.combatLocation.textContent = combat.locationTitle;
    refs.combatAttack.textContent = combat.attackerPower;
    refs.combatDefense.textContent = combat.defenderPower;
    refs.combatOdds.textContent = `${combat.probability}%`;
    refs.combatOddsBar.style.width = `${combat.probability}%`;
    refs.combatPhases.innerHTML = combat.phases.map((phase, index) =>
      `<div style="--delay:${index * 180}ms"><span>${index + 1}</span><strong>${phase}</strong></div>`
    ).join('');
    refs.combatResult.innerHTML = `<strong>${combat.win ? 'SIEG' : 'RÜCKZUG'}</strong>
      <span>${combat.moneyDelta >= 0 ? '+' : ''}${euro(combat.moneyDelta)}${combat.injured ? ` · ${combat.injured} verletzt` : ' · keine Verletzung'}</span>`;
    refs.combatCard.className = `combat-card ${combat.win ? 'win' : 'loss'}`;
    refs.combatOverlay.hidden = false;
    requestAnimationFrame(() => refs.combatOverlay.classList.add('visible'));
  }

  function closeCombat() {
    refs.combatOverlay.classList.remove('visible');
    setTimeout(() => { refs.combatOverlay.hidden = true; }, 180);
  }

  function activateTab(name) {
    $$('.tab').forEach((item) => {
      const active = item.dataset.tab === name;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    $$('.tab-content').forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  function kindLabel(kind) {
    return ({
      base: 'Basis',
      transit: 'Verbindung',
      market: 'Markt',
      archive: 'Archiv',
      club: 'Nachtleben',
      industrial: 'Industrie',
      residential: 'Wohngebiet',
      lookout: 'Aufklärung'
    })[kind] || kind;
  }

  function formatCost(cost) {
    const parts = [];
    if (cost.money) parts.push(euro(cost.money));
    if (cost.supplies) parts.push(`${cost.supplies} Vorrat`);
    return parts.length ? parts.join(' · ') : 'kein Einsatz';
  }

  function euro(value) {
    const rounded = Math.round(value || 0);
    return `${rounded.toLocaleString('de-DE')} €`;
  }

  function initials(name) {
    return name.replace(/[„“"']/g, '').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  $$('.tab').forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
  $('#saveButton').addEventListener('click', () => saveState(true));
  $('#helpButton').addEventListener('click', () => refs.helpDialog.showModal());
  $('#combatClose').addEventListener('click', closeCombat);
  refs.combatOverlay.addEventListener('click', (event) => {
    if (event.target === refs.combatOverlay) closeCombat();
  });
  $('#resetButton').addEventListener('click', () => {
    if (!window.confirm('Neues Spiel starten? Der lokale Spielstand wird ersetzt.')) return;
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  });

  renderAll();
})();
