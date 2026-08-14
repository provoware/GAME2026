#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
echo '===== LIVING-CITY-06 FÜHRUNGS-, INNENRAUM-, KLANG- & KAMPFPRÜFUNG ====='
command -v node >/dev/null 2>&1 || { echo 'Node.js fehlt. Für das Spielen ist Node nicht nötig; nur für diese Prüfung.'; exit 2; }
echo '[1/19] Basis-Daten Syntax'; node --check web/data.js
echo '[2/19] Revival-/05-/06-Daten Syntax'; node --check web/revival-data.js && node --check web/lc05-data.js && node --check web/lc06-data.js
echo '[3/19] Basis-Engine Syntax'; node --check web/engine.js
echo '[4/19] Revival-Engine Syntax'; node --check web/revival-missions.js && node --check web/revival-world.js && node --check web/revival-engine.js
echo '[5/19] 04A-Reparatur Syntax'; node --check web/repair-bootstrap.js && node --check web/repair-04a.js
echo '[6/19] LIVING-CITY-05/06 Syntax'; node --check web/lc05-engine.js && node --check web/lc06-engine.js && node --check web/lc05-bootstrap.js && node --check web/lc06-bootstrap.js && node --check web/lc05-ui.js && node --check web/lc05b-ui.js && node --check web/lc06-ui.js && node --check web/ui-refresh.js
echo '[7/19] Basis-/Revival-UI Syntax'; node --check web/app.js && node --check web/revival-ui.js
echo '[8/19] Kern-Regression / 500 Züge'; node web/tests/engine.test.js
echo '[9/19] Revival-Regression'; node web/tests/revival-engine.test.js
echo '[10/19] LIVING-CITY-05 Regression / 1200 Züge'; node web/tests/lc05-engine.test.js
echo '[11/19] LIVING-CITY-06 Regression / 1500 Züge'; node web/tests/lc06-engine.test.js
echo '[12/19] Revival-Director / 1000 Züge'; node web/tests/director-simulation.test.js
echo '[13/19] UI-Smoke + finaler statischer UI-Vertrag'; node web/tests/ui-smoke.test.js && node web/tests/static-ui.test.js
echo '[14/19] Karten-/Bedien-Regression'; node web/tests/ui-regression.test.js
echo '[15/19] LIVING-CITY-05 Modul-/Visual-Vertrag'; node web/tests/lc05-contract.test.js
echo '[16/19] Revival-Modul-/Visual-Vertrag'; node web/tests/revival-contract.test.js
echo '[17/19] Chrome-/Performance-Regression'; node web/tests/performance-regression.test.js
echo '[18/19] LIVING-CITY-05B Karten-/Responsive-Vertrag'; node web/tests/lc05b-contract.test.js
echo '[19/19] LIVING-CITY-06 Führungs-/Innenraum-/Klang-/Kampf-Vertrag'; node web/tests/lc06-contract.test.js
echo 'ERGEBNIS: PASS'
