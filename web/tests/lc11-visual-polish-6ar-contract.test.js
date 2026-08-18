const assert=require('assert'),fs=require('fs');
const hardening=fs.readFileSync('web/lc11-browser-hardening.js','utf8'),css=fs.readFileSync('web/lc11-visual-polish-6s.css','utf8');
['data-action-target-mode="${actionTarget.mode}"','data-action-target-label="${esc(actionTarget.label)}"','HIER: ${best.action.title}','ORT: ${location} · ${best.action.title}'].forEach((t)=>assert.ok(hardening.includes(t),t));
['Visual Polish VI-AR','data-action-target-mode="here"','data-action-target-mode="travel"','data-action-target-mode="none"','text-decoration-style:double','text-decoration-style:dashed','prefers-contrast:more'].forEach((t)=>assert.ok(css.includes(t),t));
assert.ok(!css.includes('@keyframes viAR'),'VI-AR bleibt bewegungsfrei');
console.log('LC11 Visual Polish VI-AR contract: PASS');
