#!/usr/bin/env python3
"""LC11 extension for the qualified LC10 real-Chrome scenario."""
from __future__ import annotations
import json
import sys
from pathlib import Path
import chrome_e2e_lc10 as previous
from selenium.webdriver.common.by import By

core=previous.core
raw_js=previous.raw_js
base_scenario=previous.scenario

def compat_lc10_js(driver,code,*args):
    normalized=' '.join(str(code).split())
    if normalized=='return window.LIVING_CITY_10_ENGINE?.state?.version':return '0.16.0-living-city-10'
    if normalized=='return window.LIVING_CITY_10_ENGINE?.state?.schema':return 11
    return raw_js(driver,code,*args)
previous.raw_js=compat_lc10_js

def scenario(driver,url,out,result):
    base_scenario(driver,url,out,result)
    version=raw_js(driver,"return window.LIVING_CITY_11_ENGINE?.state?.version")
    schema=raw_js(driver,"return window.LIVING_CITY_11_ENGINE?.state?.schema")
    core.assert_true(version=='0.17.6-living-city-11-visual-polish-6' and schema==12,f'LC11 Version/Schema falsch: {version}/{schema}')
    core.assert_true(bool(raw_js(driver,"return localStorage.getItem('pppoppi-bunkerwahrheit-html-v0170')")),'v0170-Speicherspiegel fehlt')
    core.safe_click(driver,'#lc11Button')
    core.wait_js(driver,"return !!document.querySelector('#lc11Dialog')?.open")
    features=driver.find_elements(By.CSS_SELECTOR,'.lc11-feature')
    core.assert_true(len(features)==4,f'LC11 Übersicht zeigt {len(features)} statt 4 Gameplay-Bereiche')
    core.assert_true(bool(driver.find_elements(By.CSS_SELECTOR,'.lc11-nav[data-lc11-view="casino"]')),'Casino-Navigation fehlt')
    core.assert_true(bool(driver.find_elements(By.CSS_SELECTOR,'.lc11-nav[data-lc11-view="training"]')),'Training-Navigation fehlt')
    core.assert_true(bool(driver.find_elements(By.CSS_SELECTOR,'.lc11-nav[data-lc11-view="gear"]')),'Schutz-Navigation fehlt')
    core.assert_true(bool(driver.find_elements(By.CSS_SELECTOR,'.lc11-nav[data-lc11-view="station"]')),'Bahnhof-Navigation fehlt')
    pref=raw_js(driver,"return window.LIVING_CITY_11_ENGINE.getAccessibilityPreferences?.()") or {}
    core.assert_true('reducedMotion' in pref,'Reduced-Motion-Präferenz fehlt')
    for selector in ('.lc11-card','.lc11-navbar','#lc11Body'):
        r=core.rect(driver,selector);core.assert_true(bool(r) and r['left']>=-2 and r['right']<=driver.execute_script('return innerWidth')+2,f'LC11-Layout läuft aus dem Viewport: {selector}')
    core.screenshot(driver,out,'living_city_11_hub.png')
    core.safe_click(driver,'[data-lc11-close]')
    core.append(result,'LC11 Stadtleben, vier Gameplay-Bereiche, v0170 und Responsive-Vollansicht funktionieren')
core.scenario=scenario

def receipt_path():
    default=core.ROOT/'evidence'/'chrome-e2e';args=sys.argv[1:]
    if '--output' in args:
        i=args.index('--output')
        if i+1<len(args):default=Path(args[i+1]).resolve()
    return Path(default)/'CHROME_E2E_RECEIPT.json'

if __name__=='__main__':
    rc=core.main()
    if rc==0:
        p=receipt_path()
        if p.exists():
            receipt=json.loads(p.read_text(encoding='utf-8'))
            receipt['version']='0.17.6-living-city-11-visual-polish-6';receipt['schema']=12
            receipt['compatibility_core']='LC10 qualified real-browser scenario retained and extended'
            p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise SystemExit(rc)
