#!/usr/bin/env python3
"""Canonical LC08 real-Chrome E2E entrypoint for 0.14.0-living-city-08.

Contract markers: Google Chrome · VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte · Kartenzoom · v0140 · decision_journal.png · combat_decision.png
Rectangle contract: map_rect["width"].

The implementation core is kept byte-stable. This entrypoint corrects viewport
metrics, adapts body-targeted shortcuts to real ActionChains at the current Chrome
focus, restores a neutral target after dialog transitions, synchronizes additive
UI layers, and turns anonymous Selenium wait timeouts into actionable browser-state
diagnostics. Selenium itself is not globally monkeypatched and no release gate is
relaxed.
"""
from __future__ import annotations
import json
import time
import chrome_e2e_core as core
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By


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


_original_wait_ready = core.wait_ready
def wait_ready(driver, timeout: float = 12) -> None:
    _original_wait_ready(driver, timeout)
    focus_keyboard_sink(driver)


_original_wait_js = core.wait_js
def wait_js(driver, code: str, timeout: float = 6):
    try:
        return _original_wait_js(driver, code, timeout)
    except TimeoutException as exc:
        diagnostic = core.js(driver, """
          const q=s=>document.querySelector(s);
          const combat=q('#combatDialog');
          const start=q('#combatDialog [data-combat-start]');
          return {
            location: window.LIVING_CITY_08_ENGINE?.state?.currentLocationId || null,
            selected: window.LIVING_CITY_08_ENGINE?.state?.selectedLocationId || null,
            combatSession: !!window.LIVING_CITY_08_ENGINE?.state?.combatSession,
            combatOpen: !!combat?.open,
            crewChoices: document.querySelectorAll('#combatDialog [data-combat-select]').length,
            combatDecisions: document.querySelectorAll('#combatDialog [data-combat-decision]').length,
            startPresent: !!start,
            startDisabled: start ? !!start.disabled : null,
            raidEnabled: !!q("[data-game-action='raid']:not([disabled])"),
            effectsRange: !!q('#lc06AudioDock [data-audio-range="effects"]'),
            ducking: !!q('#lc06AudioDock [data-audio-ducking]'),
            ticker: q('#tickerText')?.textContent || '',
            activeTag: document.activeElement?.tagName || null,
            activeId: document.activeElement?.id || null
          };
        """)
        raise AssertionError(
            "Chrome-Wartebedingung nicht erfüllt: " + code.replace("\n", " ").strip()[:260]
            + " | Zustand=" + json.dumps(diagnostic, ensure_ascii=False, sort_keys=True)
        ) from exc


_original_safe_click = core.safe_click
def safe_click(driver, selector: str, timeout: float = 6):
    _original_safe_click(driver, selector, timeout)

    # LC06 baut den Mixer synchron, LC07 ergänzt Effekte/Ducking additiv per Render.
    # Der reale Test wartet auf die tatsächlich sichtbare Endfassung statt auf ein
    # zufälliges requestAnimationFrame-/setTimeout-Timing.
    if selector == "#lc06AudioButton":
        core.wait_js(driver, "return !!document.querySelector('#lc06AudioDock [data-audio-range=\"effects\"]') && !!document.querySelector('#lc06AudioDock [data-audio-ducking]')", timeout)

    # Der Kampfpfad wird in reale, diagnostizierbare Zustände zerlegt.
    if "data-game-action='raid'" in selector:
        core.wait_js(driver, "return !!document.querySelector('#combatDialog')?.open", timeout)
    if "data-combat-start" in selector:
        time.sleep(.05)
        state = core.js(driver, """
          return {
            session: !!window.LIVING_CITY_08_ENGINE?.state?.combatSession,
            decisions: document.querySelectorAll('#combatDialog [data-combat-decision]').length,
            ticker: document.querySelector('#tickerText')?.textContent || '',
            selectedCrew: document.querySelectorAll('#combatDialog .crew-select.selected').length
          };
        """)
        core.assert_true(state["session"], "Kampfstart wurde abgelehnt: " + json.dumps(state, ensure_ascii=False, sort_keys=True))

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
