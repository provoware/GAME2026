#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
echo '===== LIVING-CITY-04 REVIVAL-PRÜFUNG ====='
command -v node >/dev/null 2>&1 || { echo 'Node.js fehlt. Für das Spielen ist Node nicht nötig; nur für diese Prüfung.'; exit 2; }
echo '[1/11] Basis-Daten Syntax'; node --check web/data.js
echo '[2/11] Revival-Daten Syntax'; node --check web/revival-data.js
echo '[3/11] Basis-Engine Syntax'; node --check web/engine.js
echo '[4/11] Revival-Module Syntax'; node --check web/revival-missions.js && node --check web/revival-world.js && node --check web/revival-engine.js
echo '[5/11] Basis-UI Syntax'; node --check web/app.js
echo '[6/11] Revival-UI Syntax'; node --check web/revival-ui.js
echo '[7/11] Kern-Regression / 500 Züge'; node web/tests/engine.test.js
echo '[8/11] Revival-Regression'; node web/tests/revival-engine.test.js
echo '[9/11] Revival-Director / 1000 Züge'; node web/tests/director-simulation.test.js
echo '[10/11] UI-Smoke + statischer Kernvertrag'; node web/tests/ui-smoke.test.js && node web/tests/static-ui.test.js
echo '[11/11] Revival-Modul-/Visual-Vertrag'; node web/tests/revival-contract.test.js
echo 'ERGEBNIS: PASS'
