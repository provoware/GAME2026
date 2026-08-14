#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
echo '===== LIVING-CITY-05 REVIVAL- & TIEFENPRÜFUNG ====='
command -v node >/dev/null 2>&1 || { echo 'Node.js fehlt. Für das Spielen ist Node nicht nötig; nur für diese Prüfung.'; exit 2; }
echo '[1/15] Basis-Daten Syntax'; node --check web/data.js
echo '[2/15] Revival-/05-Daten Syntax'; node --check web/revival-data.js && node --check web/lc05-data.js
echo '[3/15] Basis-Engine Syntax'; node --check web/engine.js
echo '[4/15] Revival-Engine Syntax'; node --check web/revival-missions.js && node --check web/revival-world.js && node --check web/revival-engine.js
echo '[5/15] 04A-Reparatur Syntax'; node --check web/repair-bootstrap.js && node --check web/repair-04a.js
echo '[6/15] LIVING-CITY-05 Syntax'; node --check web/lc05-engine.js && node --check web/lc05-bootstrap.js && node --check web/lc05-ui.js
echo '[7/15] Basis-/Revival-UI Syntax'; node --check web/app.js && node --check web/revival-ui.js
echo '[8/15] Kern-Regression / 500 Züge'; node web/tests/engine.test.js
echo '[9/15] Revival-Regression'; node web/tests/revival-engine.test.js
echo '[10/15] LIVING-CITY-05 Regression / 1200 Züge'; node web/tests/lc05-engine.test.js
echo '[11/15] Revival-Director / 1000 Züge'; node web/tests/director-simulation.test.js
echo '[12/15] UI-Smoke + statischer UI-Vertrag'; node web/tests/ui-smoke.test.js && node web/tests/static-ui.test.js
echo '[13/15] Karten-/Bedien-Regression'; node web/tests/ui-regression.test.js
echo '[14/15] LIVING-CITY-05 Modul-/Visual-Vertrag'; node web/tests/lc05-contract.test.js
echo '[15/15] Revival-Modul-/Visual-Vertrag'; node web/tests/revival-contract.test.js
echo 'ERGEBNIS: PASS'
