#!/usr/bin/env python3
"""Canonical LC08 real-Chrome E2E entrypoint for 0.14.0-living-city-08.

Contract markers: Google Chrome · VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte · Kartenzoom · v0140 · decision_journal.png · combat_decision.png
Rectangle contract: map_rect["width"].

The implementation core is kept byte-stable. This entrypoint only corrects the
viewport-metric helper; it does not monkeypatch Selenium and does not relax a gate.
"""
from __future__ import annotations
import chrome_e2e_core as core


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


core.verify_desktop_fit = verify_desktop_fit

if __name__ == "__main__":
    raise SystemExit(core.main())
