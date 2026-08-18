const assert=require('assert'),fs=require('fs');
const css=fs.readFileSync('web/lc11-visual-polish-6w.css','utf8'),loader=fs.readFileSync('web/lc11-close-control.css','utf8');
assert.ok(loader.includes('@import url("lc11-visual-polish-6w.css");'),'VI-AV CSS muss final geladen werden.');
['Visual Polish VI-AV','Navigationskorridor','route:not(.recommendation-route)','train-route:not(.recommendation-route)','route.reachable:not(.recommendation-route)','route.planned:not(.recommendation-route)','recommendation-route-next','district-field','prefers-contrast:more','prefers-reduced-motion:reduce'].forEach((t)=>assert.ok(css.includes(t),t));
assert.ok(!css.includes('@keyframes'),'VI-AV bleibt ohne neue Keyframes.');
assert.ok(!css.includes('position:absolute'),'VI-AV fügt keine neue absolute UI-Geometrie hinzu.');
console.log('LC11 Visual Polish VI-AV contract: PASS');
