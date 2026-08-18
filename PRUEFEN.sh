#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
echo '===== LIVING-CITY-11 VISUAL-POLISH-VI GAMEPLAY-, VISUAL-, BROWSER- & RELEASE-VORPRÜFUNG ====='
command -v node >/dev/null 2>&1 || { echo 'Node.js fehlt. Für das Spielen ist Node nicht nötig; nur für diese Prüfung.'; exit 2; }
echo '[1/35] Basis-Daten Syntax'; node --check web/data.js
echo '[2/35] Revival-/05-/06-/07-/08-/09-Daten Syntax'; node --check web/revival-data.js; node --check web/lc05-data.js; node --check web/lc06-data.js; node --check web/lc07-data.js; node --check web/lc08-data.js; node --check web/lc09-data.js; node --check web/lc10-data.js; node --check web/lc11-data.js
echo '[3/35] Basis-Engine Syntax'; node --check web/engine.js
echo '[4/35] Revival-Engine Syntax'; node --check web/revival-missions.js; node --check web/revival-world.js; node --check web/revival-engine.js
echo '[5/35] 04A-Reparatur Syntax'; node --check web/repair-bootstrap.js; node --check web/repair-04a.js
echo '[6/35] LIVING-CITY-05/06/07/08/09 Syntax'; for f in web/lc05-engine.js web/lc06-engine.js web/lc07-engine.js web/lc08-engine.js web/lc09-engine.js web/lc10-engine.js web/lc11-engine.js web/lc05-bootstrap.js web/lc06-bootstrap.js web/lc07-bootstrap.js web/lc08-bootstrap.js web/lc09-bootstrap.js web/lc10-bootstrap.js web/lc11-bootstrap.js web/lc05-ui.js web/lc05b-ui.js web/lc06-ui.js web/lc07-ui.js web/lc08-ui.js web/lc09-ui.js web/lc10-ui.js web/lc11-ui.js web/ui-refresh.js; do node --check "$f"; done
echo '[7/35] Basis-/Revival-UI Syntax'; node --check web/app.js; node --check web/revival-ui.js
echo '[8/35] Kern-Regression / 500 Züge'; node web/tests/engine.test.js
echo '[9/35] Revival-Regression'; node web/tests/revival-engine.test.js
echo '[10/35] LIVING-CITY-05 Regression / 1200 Züge'; node web/tests/lc05-engine.test.js
echo '[11/35] LIVING-CITY-06 Regression / 1500 Züge'; node web/tests/lc06-engine.test.js
echo '[12/35] LIVING-CITY-07 Regression / 2000 Züge'; node web/tests/lc07-engine.test.js
echo '[13/35] LIVING-CITY-08 Regression / 2500 Züge'; node web/tests/lc08-engine.test.js
echo '[14/35] LIVING-CITY-09 Stadt-Puls-/Bedienprofil-Regression'; node web/tests/lc09-engine.test.js
echo '[15/35] LIVING-CITY-10 Bezirks-/Crew-Regression / 3000 Züge'; node web/tests/lc10-engine.test.js
echo '[16/35] LIVING-CITY-11 Gameplay-Regression / 3500 Züge'; node web/tests/lc11-engine.test.js
echo '[17/35] Revival-Director / 1000 Züge'; node web/tests/director-simulation.test.js
echo '[18/35] UI-Smoke + finaler statischer UI-Vertrag'; node web/tests/ui-smoke.test.js; node web/tests/static-ui.test.js
echo '[19/35] Karten-/Bedien-Regression'; node web/tests/ui-regression.test.js
echo '[20/35] LIVING-CITY-05 Modul-/Visual-Vertrag'; node web/tests/lc05-contract.test.js
echo '[21/35] Revival-Modul-/Visual-Vertrag'; node web/tests/revival-contract.test.js
echo '[22/35] Chrome-/Performance-Regression'; node web/tests/performance-regression.test.js
echo '[23/35] LIVING-CITY-05B Karten-/Responsive-Vertrag'; node web/tests/lc05b-contract.test.js
echo '[24/35] LIVING-CITY-06 Führungs-/Innenraum-/Klang-/Kampf-Vertrag'; node web/tests/lc06-contract.test.js
echo '[25/35] LIVING-CITY-07 Folgeketten-/Chrome-Basisvertrag'; node web/tests/lc07-contract.test.js
echo '[26/35] LIVING-CITY-08 Stadtgedächtnis-/Journal-/Fokusvertrag'; node web/tests/lc08-contract.test.js
echo '[27/35] LIVING-CITY-09 Recovery-/Lesemodus-Vertrag'; node web/tests/lc09-contract.test.js
echo '[28/35] LIVING-CITY-10 Bezirksdynamik-/Crew-/v0160-Vertrag + Python-Syntax'; node web/tests/lc10-contract.test.js; python3 -m py_compile tools/chrome_e2e.py tools/chrome_e2e_core.py tools/chrome_e2e_lc10.py tools/chrome_e2e_lc11.py
echo '[29/35] LIVING-CITY-11 Casino-/Training-/Schutz-/Fernreise-/Animationsvertrag'; node web/tests/lc11-contract.test.js
echo '[30/35] LIVING-CITY-11 Visual-Polish-Vertrag'; node web/tests/lc11-visual-polish-contract.test.js
echo '[31/35] LIVING-CITY-11 Visual-Polish-II-Vertrag'; node web/tests/lc11-visual-polish-2-contract.test.js
echo '[32/35] LIVING-CITY-11 Visual-Polish-III-/Living-Atmosphere-Vertrag'; node web/tests/lc11-visual-polish-3-contract.test.js
echo '[33/35] LIVING-CITY-11 Visual-Polish-IV-/Layout-/Kontrast-Vertrag'; node web/tests/lc11-visual-polish-4-contract.test.js
echo '[34/35] LIVING-CITY-11 Visual-Polish-V-/Premium-Ansicht-/Kontrast-Vertrag'; node web/tests/lc11-visual-polish-5-contract.test.js
echo '[35/35] LIVING-CITY-11 Visual-Polish-VI-/Cinematic-City-Vertrag'; node web/tests/lc11-visual-polish-6-contract.test.js; node web/tests/lc11-visual-polish-6ac-contract.test.js; node web/tests/lc11-visual-polish-6ad-contract.test.js; node web/tests/lc11-visual-polish-6ae-contract.test.js; node web/tests/lc11-visual-polish-6af-contract.test.js; node web/tests/lc11-visual-polish-6ag-contract.test.js; node web/tests/lc11-visual-polish-6ah-contract.test.js; node web/tests/lc11-visual-polish-6ai-contract.test.js; node web/tests/lc11-visual-polish-6aj-contract.test.js; node web/tests/lc11-visual-polish-6ak-contract.test.js; node web/tests/lc11-visual-polish-6al-contract.test.js; node web/tests/lc11-visual-polish-6am-contract.test.js; node web/tests/lc11-visual-polish-6an-contract.test.js; node web/tests/lc11-visual-polish-6ao-contract.test.js; node web/tests/lc11-visual-polish-6ap-contract.test.js
node web/tests/lc11-visual-polish-6aq-contract.test.js
node web/tests/lc11-visual-polish-6ar-contract.test.js
echo 'ERGEBNIS: PASS'
