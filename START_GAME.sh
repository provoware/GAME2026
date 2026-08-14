#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME="$ROOT/web/index.html"
printf '\n============================================================\n'
printf ' PPPOPPI – Bunkerwahrheit 0.10.1 · LIVING-CITY-04A\n'
printf '============================================================\n'
printf '[1/3] Spieldatei prüfen\n'
[[ -f "$GAME" ]] || { echo 'FEHLER: web/index.html fehlt.'; exit 1; }
printf '[2/3] Browser auswählen\n'
if command -v firefox >/dev/null 2>&1; then
  BROWSER=firefox
elif command -v google-chrome >/dev/null 2>&1; then
  BROWSER=google-chrome
elif command -v chromium >/dev/null 2>&1; then
  BROWSER=chromium
elif command -v xdg-open >/dev/null 2>&1; then
  BROWSER=xdg-open
else
  echo 'Kein unterstützter Browserstarter gefunden.'
  echo "Öffne manuell: $GAME"
  exit 1
fi
printf '[3/3] Spiel starten mit %s\n' "$BROWSER"
exec "$BROWSER" "$GAME"
