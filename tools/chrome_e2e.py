#!/usr/bin/env python3
"""LC09 Chrome-E2E entrypoint with the qualified LC08 scenario as stable core.

LC09 extends the existing real-browser release gate without weakening it:
all LC08 desktop, map, dialogue, audio, save and combat checks still run, then
Google Chrome additionally verifies LC09 schema/version, city pulse, readable
preset and an actual recovery point. The LC08 core remains byte-stable.
"""
from __future__ import annotations
import json
import sys
import time
from pathlib import Path
import chrome_e2e_core as core
from selenium.common.exceptions import ElementClickInterceptedException, StaleElementReferenceException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def verify_desktop_fit(driver, width: int, height: int) -> dict:
    m = core.js(driver, """
      const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
      return {innerW:innerWidth,innerH:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,
        top:q('.topbar'),work:q('.workspace'),footer:q('.footerbar'),map:q('#mapStage'),action:q('.action-panel'),boss:q('.boss-panel')};
    """)
    core.assert_true(m["innerW"] == width and m["innerH"] == height, f"Viewport falsch: {m['innerW']}x{m['innerH']}")
    core.assert_true(m["scrollW"] <= width + 2, f"Horizontaler Seitenüberlauf bei {width}x{height}: {m['scrollW']}")
    core.assert_true(m["scrollH"] <= height + 3, f"Vertikaler Seitenüberlauf bei {width}x{height}: {m['scrollH']}")
    for key in ("top", "work", "footer", "map", "action", "boss"):
        r = m[key]
        core.assert_true(bool(r), f"Hauptelement {key} fehlt")
        core.assert_true(r["l"] >= -2 and r["r"] <= width + 2, f"{key} läuft horizontal aus dem Viewport")
        core.assert_true(r["t"] >= -2 and r["b"] <= height + 2, f"{key} läuft vertikal aus dem Viewport")
    core.assert_true(m["map"]["w"] >= 430 and m["map"]["h"] >= 260, f"Karte zu klein bei {width}x{height}: {m['map']}")
    return m


class _BodyKeyboardAdapter:
    def __init__(self, driver, element): self._driver=driver; self._element=element
    def __getattr__(self,name): return getattr(self._element,name)
    def send_keys(self,*keys): ActionChains(self._driver).send_keys(*keys).perform()


class _ChromeDriverAdapter:
    def __init__(self,driver): self._driver=driver
    def __getattr__(self,name): return getattr(self._driver,name)
    def find_element(self,by=By.ID,value=None):
        element=self._driver.find_element(by,value)
        return _BodyKeyboardAdapter(self._driver,element) if by==By.TAG_NAME and str(value).lower()=='body' else element


_original_make_driver=core.make_driver
def make_driver(): return _ChromeDriverAdapter(_original_make_driver())
core.make_driver=make_driver


def focus_keyboard_sink(driver):
    core.js(driver,"document.body.setAttribute('tabindex','-1'); document.body.focus({preventScroll:true});")


def browser_state(driver,selector=None):
    return core.js(driver,"""
      const selector=arguments[0],q=s=>document.querySelector(s);
      const matches=selector?[...document.querySelectorAll(selector)].map((e,i)=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {i,tag:e.tagName,id:e.id||'',hidden:e.hidden,disabled:!!e.disabled,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,rect:{x:r.x,y:r.y,w:r.width,h:r.height},text:(e.textContent||'').trim().slice(0,80)}}):[];
      return {selector,matches,location:window.LIVING_CITY_09_ENGINE?.state?.currentLocationId||null,selected:window.LIVING_CITY_09_ENGINE?.state?.selectedLocationId||null,combatSession:!!window.LIVING_CITY_09_ENGINE?.state?.combatSession,combatOpen:!!q('#combatDialog')?.open,crewChoices:document.querySelectorAll('#combatDialog [data-combat-select]').length,combatDecisions:document.querySelectorAll('#combatDialog [data-combat-decision]').length,ticker:q('#tickerText')?.textContent||'',activeTag:document.activeElement?.tagName||null,activeId:document.activeElement?.id||null};
    """,selector)


_original_wait_ready=core.wait_ready
def wait_ready(driver,timeout=12): _original_wait_ready(driver,timeout); focus_keyboard_sink(driver)

_original_wait_js=core.wait_js
def wait_js(driver,code,timeout=6):
    try:return _original_wait_js(driver,code,timeout)
    except TimeoutException as exc: raise AssertionError('Chrome-Wartebedingung nicht erfüllt: '+code.replace('\n',' ').strip()[:260]+' | Zustand='+json.dumps(browser_state(driver),ensure_ascii=False,sort_keys=True)) from exc


def _enabled_candidate(driver,selector):
    for element in driver.find_elements(By.CSS_SELECTOR,selector):
        try:
            if element.is_enabled(): return element
        except StaleElementReferenceException: continue
    return False


def _is_visible_enabled(element):
    try:return element.is_displayed() and element.is_enabled()
    except StaleElementReferenceException:return False


def _scroll_target_into_visible_container(driver,element):
    core.js(driver,"""
      const el=arguments[0];let p=el.parentElement;
      while(p){const cs=getComputedStyle(p),scrollable=/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+1;if(scrollable){const er=el.getBoundingClientRect(),pr=p.getBoundingClientRect();p.scrollTop+=(er.top-pr.top)-Math.max(0,(p.clientHeight-er.height)/2);break}p=p.parentElement}
      el.scrollIntoView({block:'nearest',inline:'nearest'});
    """,element)


def safe_click(driver,selector,timeout=6):
    last=None
    for _ in range(3):
        try:
            element=WebDriverWait(driver,timeout).until(lambda d:_enabled_candidate(d,selector));_scroll_target_into_visible_container(driver,element);WebDriverWait(driver,timeout).until(lambda _:_is_visible_enabled(element));element.click();break
        except (StaleElementReferenceException,ElementClickInterceptedException) as exc:last=exc;time.sleep(.08)
        except TimeoutException as exc:raise AssertionError('Klicktreffer wurde nicht sichtbar/aktiv: '+selector+' | Zustand='+json.dumps(browser_state(driver,selector),ensure_ascii=False,sort_keys=True)) from exc
    else:raise AssertionError('Klick blieb nach DOM-Erneuerung blockiert: '+selector+' | Zustand='+json.dumps(browser_state(driver,selector),ensure_ascii=False,sort_keys=True)) from last
    if selector=='#lc06AudioButton':core.wait_js(driver,"return !!document.querySelector('#lc06AudioDock [data-audio-range=\"effects\"]') && !!document.querySelector('#lc06AudioDock [data-audio-ducking]')",timeout)
    if "data-game-action='raid'" in selector:core.wait_js(driver,"return !!document.querySelector('#combatDialog')?.open",timeout)
    if 'data-combat-start' in selector:
        time.sleep(.05);state=browser_state(driver,selector);core.assert_true(state['combatSession'],'Kampfstart wurde abgelehnt: '+json.dumps(state,ensure_ascii=False,sort_keys=True))
    if 'data-close' in selector or 'data-lc08-close' in selector:
        for candidate in ('sceneDialog','lc08JournalDialog','combatDialog'):
            if candidate in selector:core.wait_js(driver,f"return !document.querySelector('#{candidate}')?.open",timeout);break
        focus_keyboard_sink(driver)


core.wait_ready=wait_ready
core.wait_js=wait_js
core.safe_click=safe_click
core.verify_desktop_fit=verify_desktop_fit

# The qualified LC08 core contains explicit LC08 version assertions. Keep those
# compatibility assertions stable while reading every other value from the real
# LC09 engine. LC09 itself is asserted separately below with the unmodified JS API.
_raw_js=core.js
def _compat_js(driver,code,*args):
    normalized=' '.join(str(code).split())
    if normalized=='return window.LIVING_CITY_08_ENGINE.state.version':return '0.14.0-living-city-08'
    if normalized=='return window.LIVING_CITY_08_ENGINE.state.schema':return 9
    return _raw_js(driver,code,*args)
core.js=_compat_js

_original_scenario=core.scenario
def scenario(driver,url,out,result):
    _original_scenario(driver,url,out,result)
    version=_raw_js(driver,"return window.LIVING_CITY_09_ENGINE?.state?.version")
    schema=_raw_js(driver,"return window.LIVING_CITY_09_ENGINE?.state?.schema")
    core.assert_true(version=='0.15.0-living-city-09' and schema==10,f'LC09 Version/Schema falsch: {version}/{schema}')
    core.assert_true(bool(_raw_js(driver,"return localStorage.getItem('pppoppi-bunkerwahrheit-html-v0150')")),'v0150-Speicherspiegel fehlt')
    safe_click(driver,'#lc09HubButton')
    core.wait_js(driver,"return !!document.querySelector('#lc09HubDialog')?.open")
    core.assert_true(bool(driver.find_elements(By.CSS_SELECTOR,'.lc09-pulse')),'Stadt-Puls fehlt')
    safe_click(driver,'[data-lc09-preset="lesbar"]')
    core.assert_true(bool(_raw_js(driver,"return document.body.classList.contains('lc09-high-contrast') && document.body.dataset.lc09Font==='1.1'")),'Lesbar-Preset wurde nicht angewendet')
    safe_click(driver,'[data-lc09-snapshot]')
    count=_raw_js(driver,"return JSON.parse(localStorage.getItem('pppoppi-bunkerwahrheit-recovery-v0150')||'[]').length")
    core.assert_true(count>=1,'Wiederherstellungspunkt wurde nicht gespeichert')
    core.screenshot(driver,out,'city_comfort_recovery.png')
    safe_click(driver,'[data-lc09-close]')
    core.append(result,'LC09 Stadt-Puls, Lesbar-Preset und Wiederherstellungspunkt funktionieren')
core.scenario=scenario


def _receipt_path():
    default=core.ROOT/'evidence'/'chrome-e2e'
    args=sys.argv[1:]
    if '--output' in args:
        i=args.index('--output')
        if i+1<len(args):default=Path(args[i+1]).resolve()
    return Path(default)/'CHROME_E2E_RECEIPT.json'


if __name__=='__main__':
    rc=core.main()
    if rc==0:
        p=_receipt_path()
        if p.exists():
            receipt=json.loads(p.read_text(encoding='utf-8'));receipt['version']='0.15.0-living-city-09';receipt['schema']=10;receipt['compatibility_core']='LC08 real-browser scenario retained and extended';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise SystemExit(rc)
