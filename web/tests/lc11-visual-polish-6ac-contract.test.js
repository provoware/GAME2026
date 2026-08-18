const fs=require('fs');const path=require('path');const assert=require('assert');
const root=path.join(__dirname,'..');const css=fs.readFileSync(path.join(root,'lc11-visual-polish-6r.css'),'utf8');
[
  'Visual Polish VI-AC · Priorisierung mehrerer Vorher→Nachher-Werte',
  'starke Risiken > starke Vorteile > mittlere Risiken > mittlere Vorteile',
  ':has(.coach-delta[data-impact="risk"][data-magnitude="strong"])',
  ':has(.coach-delta[data-impact="benefit"][data-magnitude="strong"])',
  ':has(.coach-delta[data-impact="risk"][data-magnitude="medium"])',
  ':has(.coach-delta[data-impact="benefit"][data-magnitude="medium"])',
  'opacity:.56',
  'outline:1px solid currentColor'
].forEach((token)=>assert.ok(css.includes(token),token));
assert.ok(!/(^|[;{])\s*(padding|min-height|min-width|max-height|max-width|grid-template(?:-areas|-columns|-rows)?)\s*:/m.test(css.split('Visual Polish VI-AC')[1]||''),'VI-AC darf keine Layoutmaße oder Grid-Geometrie setzen.');
assert.ok(!css.includes('pointer-events:auto'),'VI-AC darf keine eigene aktive Interaktionsebene erzwingen.');
console.log('PASS: Visual Polish VI-AC – Mehrfachwerte nach Entscheidungsrelevanz geometrieneutral priorisiert.');
