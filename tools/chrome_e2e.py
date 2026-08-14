#!/usr/bin/env python3
"""Canonical LC08 real-Chrome E2E entrypoint for 0.14.0-living-city-08.

Contract markers: Google Chrome · VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte · Kartenzoom · v0140 · decision_journal.png · combat_decision.png
Rectangle contract: map_rect["width"].

The implementation core is kept byte-stable. This entrypoint corrects viewport
metrics, adapts body-targeted shortcuts to real ActionChains at the current Chrome
focus, restores a neutral target after dialog transitions, synchronizes additive
UI layers, scrolls enabled dynamic controls through their nearest scroll container
before clicking, and turns anonymous Selenium waits into actionable diagnostics.
No release gate is relaxed and clicks remain real Selenium element clicks.
"""
from __future__ import annotations
import json
import time
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
    def __init__(self, driver, element):
        self._driver = driver
        self._element = element

    def __getattr__(self, name):
        return getattr(self._element, name)

    def send_keys(self, *keys):
        ActionChains(self._driver).send_keys(*keys).perform()


class _ChromeDriverAdapter:
    def __init__(self, driver):
        self._driver = driver

    def __getattr__(self, name):
        return getattr(self._driver, name)

    def find_element(self, by=By.ID, value=None):
        element = self._driver.find_element(by, value)
        if by == By.TAG_NAME and str(value).lower() == "body":
            return _BodyKeyboardAdapter(self._driver, element)
        return element


_original_make_driver = core.make_driver
def make_driver():
    return _ChromeDriverAdapter(_original_make_driver())


core.make_driver = make_driver


def focus_keyboard_sink(driver) -> None:
    """Restore a neutral, real keyboard target after native dialog transitions."""
    core.js(driver, "document.body.setAttribute('tabindex','-1'); document.body.focus({preventScroll:true});")


def browser_state(driver, selector: str | None = None) -> dict:
    return core.js(driver, """
      const selector=arguments[0], q=s=>document.querySelector(s);
      const matches=selector?[...document.querySelectorAll(selector)].map((e,i)=>{
        const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
        return {i,tag:e.tagName,id:e.id||'',hidden:e.hidden,disabled:!!e.disabled,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
          rect:{x:r.x,y:r.y,w:r.width,h:r.height},text:(e.textContent||'').trim().slice(0,80)};
      }):[];
      return {
        selector,matches,
        location:window.LIVING_CITY_08_ENGINE?.state?.currentLocationId||null,
        selected:window.LIVING_CITY_08_ENGINE?.state?.selectedLocationId||null,
        combatSession:!!window.LIVING_CITY_08_ENGINE?.state?.combatSession,
        combatOpen:!!q('#combatDialog')?.open,
        crewChoices:document.querySelectorAll('#combatDialog [data-combat-select]').length,
        combatDecisions:document.querySelectorAll('#combatDialog [data-combat-decision]').length,
        ticker:q('#tickerText')?.textContent||'',
        activeTag:document.activeElement?.tagName||null,
        activeId:document.activeElement?.id||null
      };
    """, selector)


_original_wait_ready = core.wait_ready
def wait_ready(driver, timeout: float = 12) -> None:
    _original_wait_ready(driver, timeout)
    focus_keyboard_sink(driver)


_original_wait_js = core.wait_js
def wait_js(driver, code: str, timeout: float = 6):
    try:
        return _original_wait_js(driver, code, timeout)
    except TimeoutException as exc:
        raise AssertionError(
            "Chrome-Wartebedingung nicht erfüllt: " + code.replace("\n", " ").strip()[:260]
            + " | Zustand=" + json.dumps(browser_state(driver), ensure_ascii=False, sort_keys=True)
        ) from exc


def _enabled_candidate(driver, selector: str):
    for element in driver.find_elements(By.CSS_SELECTOR, selector):
        try:
            if element.is_enabled():
                return element
        except StaleElementReferenceException:
            continue
    return False


def _is_visible_enabled(element) -> bool:
    try:
        return element.is_displayed() and element.is_enabled()
    except StaleElementReferenceException:
        return False


def _scroll_target_into_visible_container(driver, element) -> None:
    core.js(driver, """
      const el=arguments[0];
      let p=el.parentElement;
      while(p){
        const cs=getComputedStyle(p);
        const scrollable=/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight>p.clientHeight+1;
        if(scrollable){
          const er=el.getBoundingClientRect(),pr=p.getBoundingClientRect();
          const delta=(er.top-pr.top)-Math.max(0,(p.clientHeight-er.height)/2);
          p.scrollTop+=delta;
          break;
        }
        p=p.parentElement;
      }
      el.scrollIntoView({block:'nearest',inline:'nearest'});
    """, element)


def safe_click(driver, selector: str, timeout: float = 6):
    last = None
    for _ in range(3):
        try:
            element = WebDriverWait(driver, timeout).until(lambda d: _enabled_candidate(d, selector))
            _scroll_target_into_visible_container(driver, element)
            WebDriverWait(driver, timeout).until(lambda _: _is_visible_enabled(element))
            element.click()
            break
        except StaleElementReferenceException as exc:
            last = exc
            time.sleep(.05)
        except ElementClickInterceptedException as exc:
            last = exc
            time.sleep(.08)
        except TimeoutException as exc:
            raise AssertionError(
                "Klicktreffer wurde nicht sichtbar/aktiv: " + selector
                + " | Zustand=" + json.dumps(browser_state(driver, selector), ensure_ascii=False, sort_keys=True)
            ) from exc
    else:
        raise AssertionError(
            "Klick blieb nach DOM-Erneuerung blockiert: " + selector
            + " | Zustand=" + json.dumps(browser_state(driver, selector), ensure_ascii=False, sort_keys=True)
        ) from last

    if selector == "#lc06AudioButton":
        core.wait_js(driver, "return !!document.querySelector('#lc06AudioDock [data-audio-range=\"effects\"]') && !!document.querySelector('#lc06AudioDock [data-audio-ducking]')", timeout)

    if "data-game-action='raid'" in selector:
        core.wait_js(driver, "return !!document.querySelector('#combatDialog')?.open", timeout)
    if "data-combat-start" in selector:
        time.sleep(.05)
        state = browser_state(driver, selector)
        core.assert_true(state["combatSession"], "Kampfstart wurde abgelehnt: " + json.dumps(state, ensure_ascii=False, sort_keys=True))

    if "data-close" in selector or "data-lc08-close" in selector:
        dialog_id = None
        for candidate in ("sceneDialog", "lc08JournalDialog", "combatDialog"):
            if candidate in selector:
                dialog_id = candidate
                break
        if dialog_id:
            core.wait_js(driver, f"return !document.querySelector('#{dialog_id}')?.open", timeout)
        focus_keyboard_sink(driver)


core.wait_ready = wait_ready
core.wait_js = wait_js
core.safe_click = safe_click
core.verify_desktop_fit = verify_desktop_fit

if __name__ == "__main__":
    raise SystemExit(core.main())
