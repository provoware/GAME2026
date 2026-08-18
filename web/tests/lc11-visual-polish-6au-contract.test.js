const assert=require('assert'),fs=require('fs');
const css=fs.readFileSync('web/lc11-visual-polish-6v.css','utf8'),loader=fs.readFileSync('web/lc11-close-control.css','utf8'),map=fs.readFileSync('web/repair-04a.js','utf8');
assert.ok(loader.includes('@import url("lc11-visual-polish-6v.css");'),'VI-AU CSS muss final geladen werden.');
['recommendation-route-next','recommendation-route','district-node.current','--vi-au-origin','--vi-au-next','--vi-au-target','prefers-contrast:more','prefers-reduced-motion:reduce'].forEach((t)=>assert.ok(css.includes(t),t));
['recommendedNext','recommendation-route-next','recommendedKeys'].forEach((t)=>assert.ok(map.includes(t),t));
assert.ok(!css.includes('@keyframes'),'VI-AU bleibt ohne neue Keyframes.');
assert.ok(!css.includes('position:absolute'),'VI-AU fügt keine neue absolute UI-Geometrie hinzu.');
console.log('LC11 Visual Polish VI-AU contract: PASS');
