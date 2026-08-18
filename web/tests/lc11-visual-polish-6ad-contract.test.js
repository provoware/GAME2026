const fs=require('fs');const path=require('path');const assert=require('assert');
const root=path.join(__dirname,'..');const css=fs.readFileSync(path.join(root,'lc11-visual-polish-6r.css'),'utf8');
[
  'Visual Polish VI-AD · Primär-/Sekundärgewichtung bei Gleichrang',
  'nth-child(2 of .coach-delta[data-impact="risk"][data-magnitude="strong"])',
  'nth-child(1 of .coach-delta[data-impact="risk"][data-magnitude="strong"])',
  'nth-child(2 of .coach-delta[data-impact="benefit"][data-magnitude="strong"])',
  'outline-width:2px',
  'opacity:.78',
  'outline-style:dashed'
].forEach((token)=>assert.ok(css.includes(token),token));
const section=css.split('Visual Polish VI-AD')[1]||'';
assert.ok(!/(^|[;{])\s*(padding|min-height|min-width|max-height|max-width|grid-template(?:-areas|-columns|-rows)?)\s*:/m.test(section),'VI-AD darf keine Layoutmaße oder Grid-Geometrie setzen.');
assert.ok(!section.includes('pointer-events:auto'),'VI-AD darf keine aktive Interaktionsebene erzwingen.');
assert.ok(!section.includes('animation:'),'VI-AD ergänzt keine weitere Bewegungslogik.');
console.log('PASS: Visual Polish VI-AD – Gleichrangige starke Effekte erhalten geometrieneutral Primär-/Sekundärgewichtung.');
