# Google-Chrome-Desktop-E2E – LIVING-CITY-11

## Zweck

LC11 erweitert den qualifizierten LC10-Browserpfad additiv. Alle bisherigen Karten-, Hilfe-, Dialog-, Journal-, Recovery-, Save-, Audio- und Kampfprüfungen bleiben aktiv. `tools/chrome_e2e_lc11.py` ergänzt die neue Stadtleben-Schicht.

## Geprüfte Desktopgrößen

- 1280 × 720
- 1366 × 768
- 1600 × 900

## LC11-Zusatzprüfungen

- Version `0.17.6-living-city-11-visual-polish-6` / Schema 12;
- Save-Spiegel `v0170`;
- Stadtleben-Button und modale Vollansicht;
- vier Gameplay-Bereiche Casino, Training, Schutz und Bahnhof;
- Responsive-Fit der LC11-Vollansicht ohne horizontalen Überlauf;
- vorhandene Reduced-Motion-Präferenz bleibt erreichbar;
- Screenshot `living_city_11_hub.png` als sichtbare Evidenz.

Die detaillierten Mechaniken werden zusätzlich deterministisch in `lc11-engine.test.js` geprüft; der reale Chrome-Lauf konzentriert sich auf Integration, Bedienbarkeit, Layout und tatsächliche DOM-Ausführung.
