#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
echo '===== LIVING-CITY-05A CHROME- & PERFORMANCEPRÜFUNG ====='
command -v node >/dev/null 2>&1 || { echo 'Node.js fehlt. Für das Spielen ist Node nicht nötig; nur für diese Prüfung.'; exit 2; }
echo '[1/16] Basis-Daten Syntax'; node --check web/data.js
echo '[2/16] Revival-/05-Daten Syntax'; node --check web/revival-data.js && node --check web/lc05-data.js
echo '[3/16] Basis-Engine Syntax'; node --check web/engine.js
echo '[4/16] Revival-Engine Syntax'; node --check web/revival-missions.js && node --check web/revival-world.js && node --check web/revival-engine.js
echo '[5/16] 04A-Reparatur Syntax'; node --check web/repair-bootstrap.js && node --check web/repair-04a.js
echo '[6/16] LIVING-CITY-05A Syntax'; node --check web/lc05-engine.js && node --check web/lc05-bootstrap.js && node --check web/lc05-ui.js && node --check web/ui-refresh.js
echo '[7/16] Basis-/Revival-UI Syntax'; node --check web/app.js && node --check web/revival-ui.js
echo '[8/16] Kern-Regression / 500 Züge'; node web/tests/engine.test.js
echo '[9/16] Revival-Regression'; node web/tests/revival-engine.test.js
echo '[10/16] LIVING-CITY-05 Regression / 1200 Züge'; node web/tests/lc05-engine.test.js
echo '[11/16] Revival-Director / 1000 Züge'; node web/tests/director-simulation.test.js
echo '[12/16] UI-Smoke + statischer UI-Vertrag'; node web/tests/ui-smoke.test.js && node web/tests/static-ui.test.js
echo '[13/16] Karten-/Bedien-Regression'; node web/tests/ui-regression.test.js
echo '[14/16] LIVING-CITY-05 Modul-/Visual-Vertrag'; node web/tests/lc05-contract.test.js
echo '[15/16] Revival-Modul-/Visual-Vertrag'; node web/tests/revival-contract.test.js
echo '[16/16] Chrome-/Performance-Regression'; node web/tests/performance-regression.test.js
echo 'ERGEBNIS: PASS'
