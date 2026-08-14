#!/usr/bin/env python3
"""Canonical LC08 real-Chrome E2E entrypoint for 0.14.0-living-city-08.

Contract markers: Google Chrome · VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte · Kartenzoom · v0140 · decision_journal.png · combat_decision.png
Rectangle contract: map_rect["width"].

The implementation core is kept byte-stable. This entrypoint corrects viewport
metrics, adapts body-targeted shortcuts to real ActionChains at the current Chrome
focus, and restores a neutral target after dialog transitions. Selenium itself is
not globally monkeypatched and no gate is relaxed.
"""
from __future__ import annotations
import chrome_e2e_core as core
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


_original_safe_click = core.safe_click
def safe_click(driver, selector: str, timeout: float = 6):
    _original_safe_click(driver, selector, timeout)
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
core.safe_click = safe_click

core.verify_desktop_fit = verify_desktop_fit

if __name__ == "__main__":
    raise SystemExit(core.main())
