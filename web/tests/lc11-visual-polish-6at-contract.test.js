const assert=require('assert'),fs=require('fs');
const map=fs.readFileSync('web/repair-04a.js','utf8'),css=fs.readFileSync('web/lc11-visual-polish-6u.css','utf8'),loader=fs.readFileSync('web/lc11-close-control.css','utf8');
['data-action-target-mode="travel"','data-global-critical="true"','recommendedKeys','recommendation-route','recommendation-route-next','setTimeout(renderMap04A,0)'].forEach((t)=>assert.ok(map.includes(t),t));
assert.ok(loader.includes('@import url("lc11-visual-polish-6u.css");'),'VI-AT CSS muss final geladen werden.');
assert.ok(!css.includes('@keyframes'),'VI-AT bleibt bewegungsfrei');
['prefers-contrast:more','stroke:#79f1ff','stroke:#e3ff63'].forEach((t)=>assert.ok(css.includes(t),t));
console.log('LC11 Visual Polish VI-AT contract: PASS');
