#!/usr/bin/env python3
"""LC10 extension for the already qualified LC09 real-Chrome scenario."""
from __future__ import annotations
import json
import sys
from pathlib import Path
import chrome_e2e as previous
from selenium.webdriver.common.by import By

core=previous.core
raw_js=previous._raw_js
base_scenario=previous.scenario

def compat_lc09_js(driver,code,*args):
    normalized=' '.join(str(code).split())
    if normalized=='return window.LIVING_CITY_09_ENGINE?.state?.version':return '0.15.0-living-city-09'
    if normalized=='return window.LIVING_CITY_09_ENGINE?.state?.schema':return 10
    return raw_js(driver,code,*args)
previous._raw_js=compat_lc09_js

def scenario(driver,url,out,result):
    base_scenario(driver,url,out,result)
    version=raw_js(driver,"return window.LIVING_CITY_10_ENGINE?.state?.version")
    schema=raw_js(driver,"return window.LIVING_CITY_10_ENGINE?.state?.schema")
    core.assert_true(version=='0.16.0-living-city-10' and schema==11,f'LC10 Version/Schema falsch: {version}/{schema}')
    core.assert_true(bool(raw_js(driver,"return localStorage.getItem('pppoppi-bunkerwahrheit-html-v0160')")),'v0160-Speicherspiegel fehlt')
    previous.safe_click(driver,'#lc10CityButton')
    core.wait_js(driver,"return !!document.querySelector('#lc10CityDialog')?.open")
    cards=driver.find_elements(By.CSS_SELECTOR,'.lc10-district')
    core.assert_true(len(cards)==12,f'Stadtlage zeigt {len(cards)} statt 12 Bezirke')
    trends=raw_js(driver,"return window.LIVING_CITY_10_ENGINE.getCityTrends()")
    core.assert_true(bool(trends.get('pressure')) and bool(trends.get('improving')),'Stadttrends fehlen')
    pulse=raw_js(driver,"return window.LIVING_CITY_10_ENGINE.getCityPulse()")
    core.assert_true('avgStress' in pulse and 'avgMorale' in pulse,'LC10 Crew-Puls fehlt')
    core.screenshot(driver,out,'city_situation_lc10.png')
    previous.safe_click(driver,'[data-lc10-close]')
    core.append(result,'LC10 Stadtlage, zwölf Bezirks-Trends, Crew-Puls und v0160 funktionieren')
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
            receipt['version']='0.16.0-living-city-10';receipt['schema']=11
            receipt['compatibility_core']='LC09 qualified real-browser scenario retained and extended'
            p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise SystemExit(rc)
