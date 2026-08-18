const assert=require('assert'),fs=require('fs');
const css=fs.readFileSync('web/lc11-visual-polish-6x.css','utf8'),loader=fs.readFileSync('web/lc11-close-control.css','utf8');
assert.ok(loader.includes('@import url("lc11-visual-polish-6x.css");'),'VI-AW CSS muss final geladen werden.');
['Visual Polish VI-AW','Navigationsmarker-Hierarchie','district-node:not(.current)','owner-ring','node-core','asset-pin','intel-pin','train-pin','data-action-target-location','prefers-contrast:more','prefers-reduced-motion:reduce'].forEach((t)=>assert.ok(css.includes(t),t));
assert.ok(css.includes('opacity:1!important'),'Aktuelle Position und empfohlenes Ziel müssen volle Markerpriorität behalten.');
assert.ok(!css.includes('@keyframes'),'VI-AW bleibt ohne neue Keyframes.');
assert.ok(!css.includes('position:absolute'),'VI-AW fügt keine neue absolute UI-Geometrie hinzu.');
console.log('LC11 Visual Polish VI-AW contract: PASS');
