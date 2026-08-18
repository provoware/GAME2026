const assert=require('assert');
const DATA=require('../lc09-data.js');
const API=require('../lc09-engine.js');
let pass=0;
function test(name,fn){try{fn();pass++;}catch(error){console.error(`FAIL: ${name}`);throw error;}}
function engine(){return new API.GameEngine();}
test('Version und Schema',()=>{assert.equal(DATA.version,'0.15.0-living-city-09');assert.equal(DATA.schema,10);assert.equal(API.VERSION,DATA.version);assert.equal(API.SCHEMA,10);});
test('Standard-Bedienprofil',()=>{const e=engine(),p=e.getAccessibilityPreferences();assert.deepEqual(p,{fontScale:1,highContrast:false,reducedMotion:false});});
test('Lesbar-Preset',()=>{const e=engine(),r=e.applyAccessibilityPreset('lesbar');assert.equal(r.ok,true);assert.equal(r.preferences.fontScale,1.1);assert.equal(r.preferences.highContrast,true);});
test('Ruhig-Preset',()=>{const e=engine(),r=e.applyAccessibilityPreset('ruhig');assert.equal(r.ok,true);assert.equal(r.preferences.fontScale,1.2);assert.equal(r.preferences.reducedMotion,true);});
test('Ungültige Schriftgröße wird normalisiert',()=>{const e=engine();e.setAccessibilityPreferences({fontScale:9});assert.equal(e.getAccessibilityPreferences().fontScale,1);});
test('Stadt-Puls hat stabile Kennzahlen',()=>{const e=engine(),p=e.getCityPulse();['turn','pressure','tension','opportunity','pendingConsequences','arcsComplete','arcsTotal','avgStress','avgMorale'].forEach(k=>assert.equal(Number.isFinite(p[k]),true,k));assert.ok(Array.isArray(p.signals)&&p.signals.length);assert.ok(p.pressure>=0&&p.pressure<=100);});
test('Migration ergänzt Accessibility und Schema 10',()=>{const old=engine().state;delete old.preferences.accessibility;old.schema=9;old.version='0.14.0-living-city-08';const e=new API.GameEngine({state:old});assert.equal(e.state.schema,10);assert.equal(e.state.version,DATA.version);assert.equal(e.getAccessibilityPreferences().fontScale,1);});
test('Export enthält LC09-Version',()=>{const e=engine(),saved=JSON.parse(e.exportState());assert.equal(saved.schema,10);assert.equal(saved.version,DATA.version);assert.ok(saved.preferences.accessibility);});
console.log(`PASS: LIVING-CITY-09 Engine – ${pass}/${pass} Tests erfolgreich.`);
