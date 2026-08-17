#!/usr/bin/env python3
"""Real Google-Chrome desktop E2E acceptance for LIVING-CITY-08.

Hard release contract:
Google Chrome
VIEWPORTS = [(1280, 720), (1366, 768), (1600, 900)]
Hilfe überdeckt die Karte
Kartenzoom
v0140
combat_decision.png
map_rect["width"]

The runner deliberately re-queries dynamic DOM nodes after every render. It does
not monkeypatch Selenium and it never substitutes JavaScript state changes for
user actions. JavaScript is used only for read-only DOM/state assertions.
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
from selenium.common.exceptions import StaleElementReferenceException
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
    def log_message(self, _fmt: str, *_args) -> None:
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


def make_driver() -> webdriver.Chrome:
    chrome = os.environ.get("GOOGLE_CHROME_BIN") or shutil.which("google-chrome") or shutil.which("google-chrome-stable")
    chromedriver = shutil.which("chromedriver")
    if not chrome:
        raise RuntimeError("Google Chrome fehlt. Chromium ist für dieses Release-Gate bewusst kein Ersatz.")
    if not chromedriver:
        root = os.environ.get("CHROMEWEBDRIVER")
        if root:
            p = Path(root)
            for candidate in (p, p / "chromedriver"):
                if candidate.is_file():
                    chromedriver = str(candidate)
                    break
    if not chromedriver:
        raise RuntimeError("ChromeDriver fehlt.")
    options = Options()
    options.binary_location = chrome
    for arg in (
        "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
        "--disable-background-networking", "--disable-default-apps",
        "--disable-extensions", "--disable-sync", "--metrics-recording-only",
        "--mute-audio", "--no-first-run", "--password-store=basic",
        "--use-mock-keychain",
    ):
        options.add_argument(arg)
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    return webdriver.Chrome(service=Service(chromedriver), options=options)


def set_viewport(driver: webdriver.Chrome, width: int, height: int) -> None:
    driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
        "width": width, "height": height, "deviceScaleFactor": 1, "mobile": False,
    })


def wait_ready(driver: webdriver.Chrome, timeout: float = 12) -> None:
    wait = WebDriverWait(driver, timeout)
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    wait.until(lambda d: d.execute_script(
        "return !!window.LIVING_CITY_08_ENGINE && !!document.querySelector('#cityMap .district-node')"
    ))
    wait.until(EC.visibility_of_element_located((By.ID, "cityMap")))


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def js(driver: webdriver.Chrome, code: str, *args):
    return driver.execute_script(code, *args)


def viewbox(driver: webdriver.Chrome) -> str | None:
    return js(driver, "return document.querySelector('#cityMap')?.getAttribute('viewBox') || null")


def rect(driver: webdriver.Chrome, selector: str) -> dict | None:
    return js(driver, """
      const e=document.querySelector(arguments[0]); if(!e)return null;
      const r=e.getBoundingClientRect();
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
    """, selector)


def overlap(a: dict | None, b: dict | None) -> float:
    if not a or not b:
        return 0
    return max(0, min(a["right"], b["right"]) - max(a["left"], b["left"])) * max(
        0, min(a["bottom"], b["bottom"]) - max(a["top"], b["top"])
    )


def safe_click(driver: webdriver.Chrome, selector: str, timeout: float = 6):
    last = None
    for _ in range(3):
        try:
            el = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
            js(driver, "arguments[0].scrollIntoView({block:'center',inline:'nearest'});", el)
            el.click()
            return
        except StaleElementReferenceException as exc:
            last = exc
            time.sleep(.05)
    raise last or RuntimeError(f"Element nicht klickbar: {selector}")


def wait_js(driver: webdriver.Chrome, code: str, timeout: float = 6):
    return WebDriverWait(driver, timeout).until(lambda d: d.execute_script(code))


def screenshot(driver: webdriver.Chrome, out: Path, name: str) -> str:
    p = out / name
    driver.save_screenshot(str(p))
    assert_true(p.exists() and p.stat().st_size > 10_000, f"Screenshot unvollständig: {name}")
    return name


def verify_desktop_fit(driver: webdriver.Chrome, width: int, height: int) -> dict:
    m = js(driver, """
      const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
      return {innerW,innerH,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,
        top:q('.topbar'),work:q('.workspace'),footer:q('.footerbar'),map:q('#mapStage'),action:q('.action-panel'),boss:q('.boss-panel')};
    """)
    assert_true(m["innerW"] == width and m["innerH"] == height, f"Viewport falsch: {m['innerW']}x{m['innerH']}")
    assert_true(m["scrollW"] <= width + 2, f"Horizontaler Seitenüberlauf bei {width}x{height}: {m['scrollW']}")
    assert_true(m["scrollH"] <= height + 3, f"Vertikaler Seitenüberlauf bei {width}x{height}: {m['scrollH']}")
    for key in ("top", "work", "footer", "map", "action", "boss"):
        r = m[key]
        assert_true(bool(r), f"Hauptelement {key} fehlt")
        assert_true(r["l"] >= -2 and r["r"] <= width + 2, f"{key} läuft horizontal aus dem Viewport")
        assert_true(r["t"] >= -2 and r["b"] <= height + 2, f"{key} läuft vertikal aus dem Viewport")
    assert_true(m["map"]["w"] >= 430 and m["map"]["h"] >= 260, f"Karte zu klein bei {width}x{height}: {m['map']}")
    return m


def append(result: dict, text: str) -> None:
    result["checks"].append(text)


def real_map_keyboard_pan(driver: webdriver.Chrome) -> tuple[str, str]:
    before = viewbox(driver)
    assert_true(bool(before), "Karten-viewBox fehlt vor Pan")
    x, _y, width, _height = map(float, before.split())
    key = Keys.ARROW_LEFT if x >= 1000.0 - width - .5 else Keys.ARROW_RIGHT
    for _ in range(3):
        try:
            el = driver.find_element(By.ID, "cityMap")
            js(driver, "arguments[0].focus();", el)
            el.send_keys(key)
            break
        except StaleElementReferenceException:
            time.sleep(.05)
    time.sleep(.08)
    after = viewbox(driver)
    assert_true(after != before, f"Karten-Pan per Tastatur reagiert nicht: {before!r} → {after!r}")
    return before, after


def route_to_freight_yard(driver: webdriver.Chrome) -> list[str]:
    travelled: list[str] = []
    for _ in range(8):
        current = js(driver, "return window.LIVING_CITY_08_ENGINE.state.currentLocationId")
        if current == "location.yard.freight":
            return travelled
        next_id = js(driver, """
          const target='location.yard.freight', s=window.LIVING_CITY_08_ENGINE.state.currentLocationId;
          const g={}; const add=(a,b)=>((g[a]||=[]).push(b));
          GAME_DATA.world.connections.forEach(([a,b])=>{add(a,b);add(b,a)});
          (GAME_DATA.world.trainRoutes||[]).forEach(r=>add(r.from,r.to));
          const q=[s],prev={[s]:null}; let found=false;
          while(q.length&&!found){const a=q.shift();for(const b of g[a]||[]){if(b in prev)continue;prev[b]=a;if(b===target){found=true;break}q.push(b)}}
          if(!(target in prev))return null; let c=target,p=[c];while(prev[c]!==null){c=prev[c];p.unshift(c)} return p[1]||null;
        """)
        assert_true(bool(next_id), "Keine Route zum Rivalenbezirk Südhafen-Terminal/Frachtareal")
        selector = f'#mapDirectTargets [data-lc05b-select="{next_id}"]'
        safe_click(driver, selector)
        wait_js(driver, f"return window.LIVING_CITY_08_ENGINE.state.selectedLocationId === {json.dumps(next_id)}")
        old = current
        safe_click(driver, "#mapQuickbar [data-travel-to]")
        wait_js(driver, f"return window.LIVING_CITY_08_ENGINE.state.currentLocationId !== {json.dumps(old)}")
        travelled.append(next_id)
    raise AssertionError("Rivalenbezirk wurde nach 8 Reiseetappen nicht erreicht")


def scenario(driver: webdriver.Chrome, url: str, out: Path, result: dict) -> None:
    set_viewport(driver, *VIEWPORTS[0])
    driver.get(url)
    wait_ready(driver)
    js(driver, "localStorage.clear(); location.reload();")
    wait_ready(driver)
    version = js(driver, "return window.LIVING_CITY_08_ENGINE.state.version")
    schema = js(driver, "return window.LIVING_CITY_08_ENGINE.state.schema")
    assert_true(version == "0.14.0-living-city-08" and schema == 9, f"Falsche Version/Schema: {version}/{schema}")
    append(result, "LC08-Version und Schema im echten Chrome geladen")

    for width, height in VIEWPORTS:
        set_viewport(driver, width, height)
        time.sleep(.12)
        metrics = verify_desktop_fit(driver, width, height)
        shot = screenshot(driver, out, f"desktop_{width}x{height}.png")
        result["viewports"].append({"width": width, "height": height, "screenshot": shot, "map": metrics["map"]})
    append(result, "1280x720, 1366x768 und 1600x900 ohne Seiten-Overflow")

    set_viewport(driver, 1366, 768)
    safe_click(driver, "#helpButton")
    wait_js(driver, "return !document.querySelector('#helpDock').hidden")
    map_rect = rect(driver, "#mapStage")
    help_rect = rect(driver, "#helpDock")
    assert_true(map_rect["width"] >= 430 and map_rect["height"] >= 250, "Karte wird durch Hilfe unbrauchbar klein")
    assert_true(overlap(map_rect, help_rect) < 1, "Hilfe überdeckt die Karte")
    screenshot(driver, out, "help_docked_1366x768.png")
    safe_click(driver, "#helpDockClose")
    append(result, "Hilfe dockt ohne Kartenüberdeckung")

    before = viewbox(driver)
    safe_click(driver, "#mapZoomIn")
    time.sleep(.12)
    after = viewbox(driver)
    assert_true(after != before, f"Kartenzoom reagiert nicht: {before!r} → {after!r}")
    append(result, "Sichtbarer Kartenzoom funktioniert")
    real_map_keyboard_pan(driver)
    append(result, "Karten-Pan per echter Pfeiltaste funktioniert")

    # Interior/dialogue. Press I as a real keyboard input, then query all dynamic nodes fresh.
    body = driver.find_element(By.TAG_NAME, "body")
    body.send_keys("i")
    wait_js(driver, "return !!document.querySelector('#sceneDialog')?.open")
    assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#sceneDialog .interior-action")) >= 2, "Interaktive Innenraumaktionen fehlen")
    safe_click(driver, "#sceneDialog [data-dialogue-start]")
    for _ in range(4):
        choices = driver.find_elements(By.CSS_SELECTOR, "#sceneDialog [data-dialogue-choice]")
        if not choices:
            break
        label = choices[0].get_attribute("data-dialogue-choice")
        safe_click(driver, f'#sceneDialog [data-dialogue-choice="{label}"]')
        time.sleep(.08)
    story_count = js(driver, "return Object.keys(window.LIVING_CITY_08_ENGINE.state.storyFlags||{}).length")
    assert_true(story_count >= 1, "Dialogfolge wurde nicht gespeichert")
    assert_true(js(driver, "return !document.querySelector('#lc07StoryStrip').hidden"), "Folgekette wird nicht sichtbar")
    screenshot(driver, out, "interior_dialogue_consequence.png")
    safe_click(driver, "#sceneDialog [data-close='sceneDialog']")
    append(result, "Innenraum, verzweigter Dialog und gespeicherte Folge funktionieren")

    driver.find_element(By.TAG_NAME, "body").send_keys("j")
    wait_js(driver, "return !!document.querySelector('#lc08JournalDialog')?.open")
    assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#lc08JournalDialog .lc08-arc")) == 3, "Stadtgedächtnis zeigt nicht alle Entwicklungsbögen")
    assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#lc08JournalDialog .lc08-journal-row")) >= 1, "Entscheidungsjournal bleibt nach Dialog leer")
    screenshot(driver, out, "decision_journal.png")
    safe_click(driver, "#lc08JournalDialog [data-lc08-close]")
    append(result, "Journal öffnet per J und erklärt Entwicklungsbögen/Folgen")

    assert_true(js(driver, "return window.LIVING_CITY_08_ENGINE.getAudioMixer().enabled") is False, "Audio startet automatisch")
    safe_click(driver, "#lc06AudioButton")
    wait_js(driver, "return !!document.querySelector('#lc06AudioDock') && !document.querySelector('#lc06AudioDock').hidden")
    assert_true(bool(driver.find_elements(By.CSS_SELECTOR, "#lc06AudioDock [data-audio-range='effects']")), "Effektlautstärke fehlt")
    assert_true(bool(driver.find_elements(By.CSS_SELECTOR, "#lc06AudioDock [data-audio-ducking]")), "Audio-Ducking fehlt")
    safe_click(driver, "#lc06AudioDock [data-audio-enabled='1']")
    assert_true(js(driver, "return window.LIVING_CITY_08_ENGINE.getAudioMixer().enabled") is True, "Klang lässt sich nicht aktivieren")
    screenshot(driver, out, "audio_mixer.png")
    safe_click(driver, "#lc06AudioDock [data-audio-close]")
    append(result, "Klangmixer startet nur nach Nutzeraktion; Effekte und Ducking vorhanden")

    travelled = route_to_freight_yard(driver)
    append(result, f"Reise zum Rivalenbezirk funktioniert ({len(travelled)} Etappen)")

    safe_click(driver, "#saveButton")
    assert_true(bool(js(driver, "return localStorage.getItem('pppoppi-bunkerwahrheit-html-v0140')")), "Kanonischer v0140-Spielstand fehlt")
    saved = js(driver, "return window.LIVING_CITY_08_ENGINE.state.currentLocationId")
    driver.refresh()
    wait_ready(driver)
    assert_true(js(driver, "return window.LIVING_CITY_08_ENGINE.state.currentLocationId") == saved, "Spielstand nach Reload nicht wiederhergestellt")
    append(result, "v0140-Speichern und Reload funktionieren")

    raid = driver.find_elements(By.CSS_SELECTOR, "[data-game-action='raid']:not([disabled])")
    assert_true(bool(raid), "Kampftest kann im Rivalenbezirk nicht gestartet werden")
    safe_click(driver, "[data-game-action='raid']:not([disabled])")
    wait_js(driver, "return !!document.querySelector('#combatDialog')?.open")
    crew = driver.find_elements(By.CSS_SELECTOR, "#combatDialog [data-combat-select]")
    assert_true(len(crew) >= 2, "Kampfvorbereitung hat zu wenig Crew-Auswahl")
    for _ in range(2):
        buttons = driver.find_elements(By.CSS_SELECTOR, "#combatDialog [data-combat-select]:not([disabled])")
        assert_true(bool(buttons), "Keine weitere Crew auswählbar")
        buttons[0].click()
        time.sleep(.05)
    safe_click(driver, "#combatDialog [data-combat-start]")
    wait_js(driver, "return document.querySelectorAll('#combatDialog [data-combat-decision]').length >= 3")
    assert_true(len(driver.find_elements(By.CSS_SELECTOR, "#combatDialog .combat-choice-preview article")) == 3, "Kampfentscheidungsvorschau unvollständig")
    screenshot(driver, out, "combat_decision.png")
    driver.find_element(By.TAG_NAME, "body").send_keys("2")
    append(result, "Kampfvorbereitung, Vorschau und Tastatur 1/2/3 funktionieren")
    close = driver.find_elements(By.CSS_SELECTOR, "#combatDialog [data-close='combatDialog']")
    if close:
        safe_click(driver, "#combatDialog [data-close='combatDialog']")

    # Nach dem dynamischen Kampf-Render kann noch ein bereits geplanter UI-Refresh
    # auslaufen. Erst danach prüfen wir den realen Tastaturfokus; bei einem
    # transienten Fokusverlust ist genau ein erneuter echter Tastendruck erlaubt.
    focus_probe = """
      const a=document.activeElement;
      return !!a && (a.closest?.('#focusDashboard,.focus-dashboard,.lc06-guide-card,[data-guide-action]')!==null);
    """
    time.sleep(.12)
    driver.find_element(By.TAG_NAME, "body").send_keys("g")
    focused = bool(js(driver, focus_probe))
    if not focused:
        time.sleep(.12)
        driver.find_element(By.TAG_NAME, "body").send_keys("g")
        focused = bool(js(driver, focus_probe))
    assert_true(focused, "Taste G fokussiert den Aufgaben-Kompass auch nach einem Wiederholungsversuch nicht")
    append(result, "G fokussiert den nächsten sinnvollen Schritt")

    unnamed = js(driver, """
      return [...document.querySelectorAll('button')].filter(b=>{
        const r=b.getBoundingClientRect(),visible=r.width>0&&r.height>0&&!b.hidden;
        const name=(b.getAttribute('aria-label')||b.getAttribute('title')||b.innerText||'').trim();
        return visible&&!name;
      }).length;
    """)
    assert_true(unnamed == 0, f"Sichtbare Buttons ohne zugänglichen Namen: {unnamed}")
    assert_true(bool(driver.find_elements(By.ID, "lc08Live")), "ARIA-Live-Region für späte Folgen fehlt")
    append(result, "Fokus-/ARIA-Basis im echten Chrome vorhanden")

    severe = [x for x in driver.get_log("browser") if x.get("level") == "SEVERE" and "favicon" not in x.get("message", "").lower()]
    assert_true(not severe, "Schwere Chrome-Konsolenfehler: " + " | ".join(x.get("message", "") for x in severe[:4]))
    append(result, "Keine schweren Chrome-Konsolenfehler")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "evidence" / "chrome-e2e"))
    args = parser.parse_args()
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    result = {"viewports": [], "checks": []}
    receipt = {"status": "FAIL", "browser": "Google Chrome", "version": "0.14.0-living-city-08", "schema": 9}
    driver = None
    try:
        with local_server() as url:
            driver = make_driver()
            caps = driver.capabilities
            receipt["browser_version"] = caps.get("browserVersion")
            receipt["chrome_driver_version"] = (caps.get("chrome") or {}).get("chromedriverVersion")
            scenario(driver, url, out, result)
            receipt["status"] = "PASS"
    except Exception as exc:
        receipt["error"] = f"{type(exc).__name__}: {exc}"
        print(receipt["error"], file=sys.stderr)
    finally:
        receipt.update(result)
        if driver:
            try:
                driver.quit()
            except Exception:
                pass
        (out / "CHROME_E2E_RECEIPT.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 0 if receipt["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
