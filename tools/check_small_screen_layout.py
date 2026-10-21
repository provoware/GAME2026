#!/usr/bin/env python3
"""Statische Kontrolle des 800x600-UI-Vertrags; kein Godot-Render-Test."""

from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def node_block(scene: str, name: str) -> str:
    """Liest den Abschnitt eines Godot-Szenenknotens ohne fremde Knoten."""
    pattern = re.compile(
        r'^\[node name="' + re.escape(name) + r'"[^\n]*\]\n(.*?)(?=^\[node |\Z)',
        re.MULTILINE | re.DOTALL,
    )
    match = pattern.search(scene)
    return match.group(0) if match else ""


def layout_errors(project: str, scene: str) -> list[str]:
    errors: list[str] = []
    for key, value in (
        ("window/size/viewport_width", 800),
        ("window/size/viewport_height", 600),
        ("window/size/window_width_override", 800),
        ("window/size/window_height_override", 600),
    ):
        if re.search(r"^" + re.escape(key) + rf"={value}$", project, re.MULTILINE) is None:
            errors.append(f"Falsche Grundgröße: {key} muss {value} sein")

    if "window/stretch/mode=\"canvas_items\"" not in project:
        errors.append("Dynamische Skalierung fehlt")

    for name in ("StatusScroll", "TrackerScroll"):
        block = node_block(scene, name)
        if not block:
            errors.append(f"Scrollbereich {name} fehlt")
            continue
        if 'type="ScrollContainer"' not in block:
            errors.append(f"{name} ist kein ScrollContainer")
        if "horizontal_scroll_mode = 0" not in block:
            errors.append(f"{name} erlaubt horizontales Scrollen")
        if "focus_mode = 2" not in block:
            errors.append(f"{name} ist nicht per Tastatur fokussierbar")

    tracker = node_block(scene, "TrackerPanel")
    if "custom_minimum_size = Vector2(280, 0)" not in tracker:
        errors.append("Missionstracker beansprucht zu viel Mindestbreite")
    if "size_flags_horizontal = 3" not in tracker:
        errors.append("Missionstracker passt sich nicht an die Breite an")
    if tracker.count("layout_mode = 2") != 1:
        errors.append("Missionstracker enthält doppelte oder fehlende Layout-Angaben")

    for name in ("StatusLabel", "DetailLabel", "TrackerLabel"):
        if "autowrap_mode = 2" not in node_block(scene, name):
            errors.append(f"{name} bricht Text nicht um")

    for name in ("RunButton", "PartialButton", "PauseButton", "SaveButton"):
        if not node_block(scene, name):
            errors.append(f"Aktionsschaltfläche {name} fehlt")

    if "offset_left = 20.0" not in scene or "offset_right = -20.0" not in scene:
        errors.append("Kompakte Seitenränder fehlen")
    return errors


class SmallScreenLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.project = (ROOT / "project.godot").read_text(encoding="utf-8")
        cls.scene = (ROOT / "scenes/main/main.tscn").read_text(encoding="utf-8")

    def test_800x600_layout_contract(self) -> None:
        self.assertEqual(layout_errors(self.project, self.scene), [])

    def test_rejects_large_default_window(self) -> None:
        altered = self.project.replace("viewport_width=800", "viewport_width=1280")
        self.assertTrue(any("viewport_width" in e for e in layout_errors(altered, self.scene)))

    def test_rejects_horizontal_scrolling(self) -> None:
        altered = self.scene.replace("horizontal_scroll_mode = 0", "horizontal_scroll_mode = 1", 1)
        self.assertTrue(any("horizontales Scrollen" in e for e in layout_errors(self.project, altered)))

    def test_rejects_duplicate_layout_property(self) -> None:
        altered = self.scene.replace(
            "custom_minimum_size = Vector2(280, 0)\nlayout_mode = 2",
            "custom_minimum_size = Vector2(280, 0)\nlayout_mode = 2\nlayout_mode = 2",
            1,
        )
        self.assertTrue(any("doppelte" in e for e in layout_errors(self.project, altered)))

    def test_rejects_missing_action(self) -> None:
        altered = self.scene.replace('name="SaveButton"', 'name="RemovedButton"', 1)
        self.assertTrue(any("SaveButton" in e for e in layout_errors(self.project, altered)))


if __name__ == "__main__":
    unittest.main()
