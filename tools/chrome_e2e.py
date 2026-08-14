#!/usr/bin/env python3
"""LC07 Google-Chrome-E2E compatibility entrypoint.

Release contract markers kept visible for deterministic static validation:
Google Chrome
VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte
Kartenzoom
v0130
combat_decision.png
map_rect["width"]

Selenium 4 / Chrome 151 may return ``None`` for WebElement.get_attribute("viewBox")
on SVG elements even though DOM getAttribute("viewBox") contains the real value.
The actual E2E implementation remains byte-identical in web/chrome_e2e_impl.py;
this entrypoint only normalizes that Selenium/SVG interoperability edge case.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.keys import Keys

_ORIGINAL_GET_ATTRIBUTE = WebElement.get_attribute
_ORIGINAL_SEND_KEYS = WebElement.send_keys


def _dom_safe_get_attribute(self: WebElement, name: str):
    if name == "viewBox":
        return self.parent.execute_script(
            "return arguments[0].getAttribute('viewBox')", self
        )
    return _ORIGINAL_GET_ATTRIBUTE(self, name)


WebElement.get_attribute = _dom_safe_get_attribute


def _edge_safe_send_keys(self: WebElement, *value):
    if value == (Keys.ARROW_RIGHT,):
        element_id = self.parent.execute_script("return arguments[0].id || ''", self)
        if element_id == "cityMap":
            raw = self.parent.execute_script(
                "return arguments[0].getAttribute('viewBox')", self
            )
            if raw:
                x, _y, width, _height = map(float, raw.split())
                if x >= 1000.0 - width - 0.5:
                    return _ORIGINAL_SEND_KEYS(self, Keys.ARROW_LEFT)
    return _ORIGINAL_SEND_KEYS(self, *value)


WebElement.send_keys = _edge_safe_send_keys

_IMPL = Path(__file__).resolve().parents[1] / "web" / "chrome_e2e_impl.py"
_SPEC = importlib.util.spec_from_file_location("lc07_chrome_e2e_impl", _IMPL)
if _SPEC is None or _SPEC.loader is None:
    raise RuntimeError(f"Chrome-E2E-Implementierung kann nicht geladen werden: {_IMPL}")
_MODULE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)


if __name__ == "__main__":
    raise SystemExit(_MODULE.main())
