const assert=require('assert'),fs=require('fs');
const hardening=fs.readFileSync('web/lc11-browser-hardening.js','utf8'),css=fs.readFileSync('web/lc11-visual-polish-6s.css','utf8');
['const actionEffectScore=','const resolveActionTarget=','data-action-target-mode="${actionTarget.mode}"','data-action-target-label="${esc(actionTarget.label)}"','HIER: ${best.action.title}','ORT: ${location} · ${best.action.title}'].forEach((t)=>assert.ok(hardening.includes(t),t));
['Visual Polish VI-AQ','attr(data-action-target-label)','data-action-target-mode="here"','data-action-target-mode="travel"'].forEach((t)=>assert.ok(css.includes(t),t));
console.log('LC11 Visual Polish VI-AQ contract: PASS');
