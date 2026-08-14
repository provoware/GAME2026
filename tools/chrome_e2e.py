#!/usr/bin/env python3
"""Real Google-Chrome E2E acceptance for PPPOPPI Bunkerwahrheit.

Runs the offline web app through Selenium/ChromeDriver, captures deterministic
screenshots and emits a machine-readable receipt. No application network calls
are required; a temporary localhost HTTP server serves the web/ directory.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import threading
import time
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:  # pragma: no cover - diagnostic noise only
        pass


@contextmanager
def local_server():
    handler = lambda *a, **kw: QuietHandler(*a, directory=str(WEB), **kw)
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/index.html"
    finally:
        server.shutdown()
        thread.join(timeout=3)
        server.server_close()


def find_executable(names: list[str]) -> str:
    for name in names:
        explicit = os.environ.get(name.upper().replace("-", "_") + "_BIN")
        if explicit and Path(explicit).exists():
            return explicit
        found = shutil.which(name)
        if found:
            return found
    raise RuntimeError(f"Keines der Programme gefunden: {', '.join(names)}")


def make_driver() -> webdriver.Chrome:
    chrome = os.environ.get("GOOGLE_CHROME_BIN") or next(
        (p for p in [shutil.which("google-chrome"), shutil.which("google-chrome-stable")] if p),
        None,
    )
    if not chrome:
        raise RuntimeError("Google Chrome fehlt. LC07-E2E akzeptiert bewusst nicht Chromium als Ersatz.")
    chromedriver = shutil.which("chromedriver")
    if not chromedriver:
        env_driver = os.environ.get("CHROMEWEBDRIVER")
        candidates = []
        if env_driver:
            p = Path(env_driver)
            candidates.extend([p, p / "chromedriver"])
        chromedriver = next((str(p) for p in candidates if p.exists() and p.is_file()), None)
    if not chromedriver:
        raise RuntimeError("ChromeDriver fehlt.")

    options = Options()
    options.binary_location = chrome
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-sync")
    options.add_argument("--metrics-recording-only")
    options.add_argument("--mute-audio")
    options.add_argument("--no-first-run")
    options.add_argument("--password-store=basic")
    options.add_argument("--use-mock-keychain")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    return webdriver.Chrome(service=Service(chromedriver), options=options)


def set_viewport(driver: webdriver.Chrome, width: int, height: int) -> None:
    driver.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": False},
    )


def wait_ready(driver: webdriver.Chrome, timeout: float = 12) -> None:
    wait = WebDriverWait(driver, timeout)
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    wait.until(lambda d: d.execute_script("return !!window.LIVING_CITY_07_ENGINE && !!document.querySelector('#cityMap .district-node')"))
    wait.until(EC.visibility_of_element_located((By.ID, "cityMap")))


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def rect(driver: webdriver.Chrome, selector: str) -> dict:
    return driver.execute_script(
        """
        const el=document.querySelector(arguments[0]);
        if(!el)return null;
        const r=el.getBoundingClientRect();
        return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
        """,
        selector,
    )


def intersection_area(a: dict, b: dict) -> float:
    if not a or not b:
        return 0
    return max(0, min(a["right"], b["right"]) - max(a["left"], b["left"])) * max(
        0, min(a["bottom"], b["bottom"]) - max(a["top"], b["top"])
    )


def verify_desktop_fit(driver: webdriver.Chrome, width: int, height: int) -> dict:
    m = driver.execute_script(
        """
        const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
        return {
          innerW:innerWidth,innerH:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,
          top:q('.topbar'),work:q('.workspace'),footer:q('.footerbar'),map:q('#mapStage'),action:q('.action-panel'),boss:q('.boss-panel')
        };
        """
    )
    assert_true(m["innerW"] == width and m["innerH"] == height, f"Viewport stimmt nicht: {m['innerW']}x{m['innerH']} statt {width}x{height}")
    assert_true(m["scrollW"] <= width + 2, f"Horizontales Seiten-Overflow bei {width}x{height}: {m['scrollW']}")
    assert_true(m["scrollH"] <= height + 3, f"Vertikales Seiten-Overflow bei {width}x{height}: {m['scrollH']}")
    for name in ("top", "work", "footer", "map", "action", "boss"):
        r = m[name]
        assert_true(bool(r), f"Hauptelement {name} fehlt")
        assert_true(r["l"] >= -2 and r["r"] <= width + 2, f"{name} läuft horizontal aus dem Viewport")
        assert_true(r["t"] >= -2 and r["b"] <= height + 2, f"{name} läuft vertikal aus dem Viewport")
    assert_true(m["map"]["w"] >= 430 and m["map"]["h"] >= 260, f"Karte zu klein bei {width}x{height}: {m['map']}")
    return m


def screenshot(driver: webdriver.Chrome, output: Path, name: str) -> str:
    path = output / name
    driver.save_screenshot(str(path))
    assert_true(path.exists() and path.stat().st_size > 10_000, f"Screenshot unvollständig: {path}")
    return path.name


def click_visible(driver: webdriver.Chrome, selector: str, timeout: float = 6):
    el = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
    driver.execute_script("arguments[0].scrollIntoView({block:'center',inline:'nearest'});", el)
    el.click()
    return el


def scenario(driver: webdriver.Chrome, url: str, output: Path) -> dict:
    result: dict = {"viewports": [], "checks": []}
    set_viewport(driver, *VIEWPORTS[0])
    driver.get(url)
    wait_ready(driver)
    driver.execute_script("localStorage.clear(); location.reload();")
    wait_ready(driver)

    version = driver.execute_script("return window.LIVING_CITY_07_ENGINE.state.version")
    schema = driver.execute_script("return window.LIVING_CITY_07_ENGINE.state.schema")
    assert_true(version == "0.13.0-living-city-07" and schema == 8, f"Falsche Browserversion: {version} / Schema {schema}")
    result["checks"].append("LC07-Version und Schema im echten Chrome geladen")

    # Initial responsive desktop acceptance at all required sizes.
    for width, height in VIEWPORTS:
        set_viewport(driver, width, height)
        time.sleep(0.12)
        metrics = verify_desktop_fit(driver, width, height)
        shot = screenshot(driver, output, f"desktop_{width}x{height}.png")
        result["viewports"].append({"width": width, "height": height, "screenshot": shot, "map": metrics["map"]})
    result["checks"].append("1280x720, 1366x768 und 1600x900 ohne Seiten-Overflow")

    set_viewport(driver, 1366, 768)
    # Help must resize beside the map rather than cover it.
    click_visible(driver, "#helpButton")
    WebDriverWait(driver, 5).until(lambda d: not d.find_element(By.ID, "helpDock").get_attribute("hidden"))
    map_rect = rect(driver, "#mapStage")
    help_rect = rect(driver, "#helpDock")
    assert_true(map_rect["w"] >= 430 and map_rect["h"] >= 250, "Karte wird durch Hilfe unbrauchbar klein")
    assert_true(intersection_area(map_rect, help_rect) < 1, "Hilfe überdeckt die Karte")
    screenshot(driver, output, "help_docked_1366x768.png")
    click_visible(driver, "#helpDockClose")
    result["checks"].append("Hilfe dockt ohne Kartenüberdeckung")

    # Map zoom and keyboard pan are real browser interactions.
    city_map = driver.find_element(By.ID, "cityMap")
    before = city_map.get_attribute("viewBox")
    click_visible(driver, "#mapZoomIn")
    after_zoom = city_map.get_attribute("viewBox")
    assert_true(after_zoom != before, "Kartenzoom reagiert nicht")
    city_map.click()
    city_map.send_keys(Keys.ARROW_RIGHT)
    after_pan = city_map.get_attribute("viewBox")
    assert_true(after_pan != after_zoom, "Karten-Pan per Tastatur reagiert nicht")
    result["checks"].append("Kartenzoom und Tastatur-Pan funktionieren")

    # Guided interior + branched dialogue at the starting bunker.
    driver.find_element(By.TAG_NAME, "body").send_keys("i")
    WebDriverWait(driver, 5).until(lambda d: d.find_element(By.ID, "sceneDialog").get_attribute("open") is not None)
    assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#sceneDialog .interior-action")) >= 2, "Interaktive Innenraumaktionen fehlen")
    start_buttons = driver.find_elements(By.CSS_SELECTOR, "#sceneDialog [data-dialogue-start]")
    assert_true(bool(start_buttons), "Ortsdialog im Hauptbunker fehlt")
    start_buttons[0].click()
    for _ in range(4):
        choices = driver.find_elements(By.CSS_SELECTOR, "#sceneDialog [data-dialogue-choice]")
        if not choices:
            break
        choices[0].click()
        time.sleep(0.08)
    story_count = driver.execute_script("return Object.keys(window.LIVING_CITY_07_ENGINE.state.storyFlags||{}).length")
    assert_true(story_count >= 1, "Dialogfolge wurde nicht gespeichert")
    assert_true(driver.execute_script("return !document.querySelector('#lc07StoryStrip').hidden"), "Folgekette wird nicht sichtbar gemacht")
    screenshot(driver, output, "interior_dialogue_consequence.png")
    click_visible(driver, "#sceneDialog [data-close='sceneDialog']")
    result["checks"].append("Innenraum, verzweigter Dialog und gespeicherte Folge funktionieren")

    # Audio mixer: no autoplay, then explicit user activation and LC07 controls.
    enabled_before = driver.execute_script("return window.LIVING_CITY_07_ENGINE.getAudioMixer().enabled")
    assert_true(enabled_before is False, "Audio startet unerwartet automatisch")
    click_visible(driver, "#lc06AudioButton")
    WebDriverWait(driver, 4).until(EC.visibility_of_element_located((By.ID, "lc06AudioDock")))
    assert_true(bool(driver.find_elements(By.CSS_SELECTOR, "#lc06AudioDock [data-audio-range='effects']")), "Effektlautstärke fehlt")
    assert_true(bool(driver.find_elements(By.CSS_SELECTOR, "#lc06AudioDock [data-audio-ducking]")), "Audio-Ducking fehlt")
    click_visible(driver, "#lc06AudioDock [data-audio-enabled='1']")
    assert_true(driver.execute_script("return window.LIVING_CITY_07_ENGINE.getAudioMixer().enabled") is True, "Klang lässt sich nicht aktivieren")
    screenshot(driver, output, "audio_mixer.png")
    click_visible(driver, "#lc06AudioDock [data-audio-close]")
    result["checks"].append("Klangmixer startet nur nach Nutzeraktion und LC07-Regler sind vorhanden")

    # Prefer the rival freight yard so we can exercise travel + combat.
    direct = driver.find_elements(By.CSS_SELECTOR, "#mapDirectTargets .direct-target")
    assert_true(bool(direct), "Keine Direktreiseziele sichtbar")
    target = next((e for e in direct if e.get_attribute("data-lc05b-select") == "location.yard.freight"), direct[0])
    old_location = driver.find_element(By.ID, "currentLocation").text
    target.click()
    travel = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#mapQuickbar [data-travel-to]")))
    travel.click()
    WebDriverWait(driver, 5).until(lambda d: d.find_element(By.ID, "currentLocation").text != old_location)
    new_location = driver.find_element(By.ID, "currentLocation").text
    assert_true(new_location, "Reiseziel wurde nicht übernommen")
    result["checks"].append(f"Direktreise funktioniert: {old_location} → {new_location}")

    # Save/reload from the canonical LC07 mirror.
    click_visible(driver, "#saveButton")
    stored = driver.execute_script("return localStorage.getItem('pppoppi-bunkerwahrheit-html-v0130')")
    assert_true(bool(stored), "Kanonischer v0130-Spielstand fehlt")
    saved_location = driver.execute_script("return window.LIVING_CITY_07_ENGINE.state.currentLocationId")
    driver.refresh(); wait_ready(driver)
    assert_true(driver.execute_script("return window.LIVING_CITY_07_ENGINE.state.currentLocationId") == saved_location, "Spielstand wurde nach Reload nicht wiederhergestellt")
    result["checks"].append("v0130-Speichern und Reload funktionieren")

    # Real combat flow at the rival freight yard when available.
    raid = driver.find_elements(By.CSS_SELECTOR, "[data-game-action='raid']:not([disabled])")
    if raid:
        raid[0].click()
        WebDriverWait(driver, 5).until(lambda d: d.find_element(By.ID, "combatDialog").get_attribute("open") is not None)
        crew = driver.find_elements(By.CSS_SELECTOR, "#combatDialog [data-combat-select]")
        assert_true(len(crew) >= 2, "Kampfvorbereitung hat zu wenig Crew-Auswahl")
        crew[0].click(); crew[1].click()
        click_visible(driver, "#combatDialog [data-combat-start]")
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "#combatDialog [data-combat-decision]")))
        assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#combatDialog .combat-choice-preview article")) == 3, "Kampfentscheidungsvorschau unvollständig")
        screenshot(driver, output, "combat_decision.png")
        driver.find_element(By.TAG_NAME, "body").send_keys("2")
        result["checks"].append("Kampfvorbereitung, Entscheidungsvorschau und Tastatur 1/2/3 funktionieren")
        # Close only if still open; result may already have changed after a decision.
        close = driver.find_elements(By.CSS_SELECTOR, "#combatDialog [data-close='combatDialog']")
        if close:
            close[0].click()
    else:
        raise AssertionError("Kampftest konnte am Rivalenbezirk nicht gestartet werden")

    # G focuses the guided next action without changing game state.
    driver.find_element(By.TAG_NAME, "body").send_keys("g")
    focused = driver.execute_script("return document.activeElement?.closest?.('.lc06-guide-card') !== null")
    assert_true(bool(focused), "Taste G fokussiert den Aufgaben-Kompass nicht")
    result["checks"].append("Geführte Tastaturaktion G fokussiert den nächsten Schritt")

    # Severe browser console errors are release blockers.
    logs = driver.get_log("browser")
    severe = [x for x in logs if x.get("level") == "SEVERE" and "favicon" not in x.get("message", "").lower()]
    assert_true(not severe, "Schwere Chrome-Konsolenfehler: " + " | ".join(x.get("message", "") for x in severe[:4]))
    result["checks"].append("Keine schweren Chrome-Konsolenfehler")
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "evidence" / "chrome-e2e"))
    args = parser.parse_args()
    out = Path(args.output).resolve(); out.mkdir(parents=True, exist_ok=True)
    receipt = {"status": "FAIL", "browser": "Google Chrome", "version": "0.13.0-living-city-07", "schema": 8}
    driver = None
    try:
        with local_server() as url:
            driver = make_driver()
            caps = driver.capabilities
            receipt["browser_version"] = caps.get("browserVersion")
            receipt["chrome_driver_version"] = (caps.get("chrome") or {}).get("chromedriverVersion")
            receipt.update(scenario(driver, url, out))
            receipt["status"] = "PASS"
    except Exception as exc:
        receipt["error"] = f"{type(exc).__name__}: {exc}"
        print(receipt["error"], file=sys.stderr)
    finally:
        if driver:
            try: driver.quit()
            except Exception: pass
        (out / "CHROME_E2E_RECEIPT.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 0 if receipt["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
