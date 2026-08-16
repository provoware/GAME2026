const fs=require('fs');const path=require('path');const assert=require('assert');const root=path.join(__dirname,'..');const read=(f)=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'),css=read('lc11-visual-polish-6.css')+read('lc11-visual-polish-6b.css')+read('lc11-visual-polish-6c.css'),closeCss=read('lc11-close-control.css'),ui=read('lc11-ui.js'),data=read('lc11-data.js');
assert.ok(html.includes('lc11-visual-polish-6.css')&&html.includes('lc11-visual-polish-6b.css')&&html.includes('lc11-visual-polish-6c.css')&&html.includes('lc11-close-control.css'));
assert.ok(html.indexOf('lc11-visual-polish-5b.css')<html.indexOf('lc11-visual-polish-6.css'));
assert.ok(html.indexOf('lc11-visual-polish-6.css')<html.indexOf('lc11-visual-polish-6b.css'));
assert.ok(html.indexOf('lc11-visual-polish-6b.css')<html.indexOf('lc11-visual-polish-6c.css'));
assert.ok(html.indexOf('lc11-visual-polish-6c.css')<html.indexOf('lc11-close-control.css'),'Kritischer Close-Control-Layer muss nach Visual Polish VI laden.');
assert.ok(html.includes('0.17.6 LIVING-CITY-11 VISUAL-POLISH-VI'));
assert.ok(data.includes("version:'0.17.6-living-city-11-visual-polish-6'"));
assert.ok(ui.includes('0.17.6 · Schema 12'));
[
  '--vp6-cyan:#79f1ff',
  'body::after',
  '.district-node[data-location="location.casino.9909"]',
  '.district-node[data-location="location.station.ghost"]',
  '.direct-target::before',
  '.lc11-feature.casino::before',
  '.lc11-reels{',
  '.lc11-training-hero::after',
  '.scene-hero::after',
  '.combat-stage{',
  '@keyframes vp6SceneSweep',
  '@media(prefers-reduced-motion:reduce)',
  'body.lc09-reduced-motion',
  '--vp6-text-secondary:#c4d2df',
  '.tab.active{',
  '.btn:focus-visible',
  '@media (min-width:1100px) and (max-height:800px)',
  'Kleine Desktop-Höhen: weniger Leerraum statt kleinere Schrift'
].forEach((x)=>assert.ok(css.includes(x),x));
assert.ok(css.includes('button:focus-visible')&&css.includes('.district-node:focus-visible'),'Fokuszustände müssen sichtbar bleiben.');
assert.ok(!css.includes('pointer-events:auto'),'Visual Polish VI darf keine eigene aktive Interaktionsebene erzwingen.');
const pointerAuto=(closeCss.match(/pointer-events:auto/g)||[]).length;assert.equal(pointerAuto,1,'Nur Close-Control darf pointer-events:auto explizit setzen.');
assert.ok(closeCss.includes('z-index:120!important')&&closeCss.includes('visibility:visible!important'));
console.log('PASS: Visual-Polish VI – räumliche Kartenbühne, Bezirksidentität, Spezialorte, Innenräume, Kampf und Reduced-Motion geprüft.');
