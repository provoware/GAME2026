'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const DATA = require('../data.js');
const ENGINE = require('../engine.js');

class FakeClassList {
  constructor(){ this.values=new Set(); }
  add(...v){v.forEach((x)=>this.values.add(x));}
  remove(...v){v.forEach((x)=>this.values.delete(x));}
  toggle(v,force){if(force===true){this.values.add(v);return true;}if(force===false){this.values.delete(v);return false;}if(this.values.has(v)){this.values.delete(v);return false;}this.values.add(v);return true;}
  contains(v){return this.values.has(v);}
}
class FakeElement {
  constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.value='200';this.open=false;this.hidden=false;this.dataset={};this.classList=new FakeClassList();this.listeners={};}
  addEventListener(type,fn){(this.listeners[type] ||= []).push(fn);}
  showModal(){this.open=true;}
  close(){this.open=false;}
  closest(){return null;}
}
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map((m)=>m[1]);
const elements=new Map(ids.map((id)=>[id,new FakeElement(id)]));
const modalIds=['personDialog','combatDialog','helpDialog'];
const documentStub={
  querySelector(selector){if(selector.startsWith('#'))return elements.get(selector.slice(1))||new FakeElement(selector.slice(1));return new FakeElement();},
  querySelectorAll(selector){if(selector==='.modal')return modalIds.map((id)=>elements.get(id));return [];},
  addEventListener(){},
};
const store=new Map();
const localStorageStub={getItem:(k)=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:(k)=>store.delete(k)};
global.document=documentStub;
global.localStorage=localStorageStub;
global.confirm=()=>true;
global.location={reload(){}};
global.CSS={escape:(s)=>String(s).replace(/[^a-zA-Z0-9_-]/g,(m)=>`\\${m}`)};
global.window={GAME_DATA:DATA,GAME_ENGINE:ENGINE,document:documentStub,localStorage:localStorageStub};
window.confirm=global.confirm;window.location=global.location;window.CSS=global.CSS;
require('../app.js');
assert.match(elements.get('bossTitle').textContent,/Boss|Aufsteiger|Patron|Hand|Netzwerker|Unternehmer|Gejagter/i);
assert.ok(elements.get('topKpis').innerHTML.includes('Bargeld'));
assert.ok(elements.get('districtPanel').innerHTML.includes('Hauptbunker'));
assert.ok(elements.get('crewPanel').innerHTML.includes('Kasi'));
assert.ok(elements.get('bankPanel').innerHTML.includes('Unternehmensmarkt'));
assert.ok(elements.get('networkPanel').innerHTML.includes('MAULWURFNETZ'));
assert.ok(elements.get('cityMap').innerHTML.includes('district-node'));
assert.ok(store.has('pppoppi-bunkerwahrheit-html-v090'));
console.log('PASS: UI-Smoke – Start-Render, Kernpanels und Autosave erfolgreich.');
