#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME="$ROOT/web/index.html"
printf '\n============================================================\n'
printf ' PPPOPPI – Bunkerwahrheit 0.12.0 · LIVING-CITY-06\n'
printf '============================================================\n'
printf '[1/3] Spieldatei prüfen\n'
[[ -f "$GAME" ]] || { echo 'FEHLER: web/index.html fehlt.'; exit 1; }
printf '[2/3] Browser auswählen\n'
if command -v google-chrome >/dev/null 2>&1; then
  BROWSER=google-chrome
elif command -v google-chrome-stable >/dev/null 2>&1; then
  BROWSER=google-chrome-stable
elif command -v chromium >/dev/null 2>&1; then
  BROWSER=chromium
elif command -v firefox >/dev/null 2>&1; then
  BROWSER=firefox
elif command -v xdg-open >/dev/null 2>&1; then
  BROWSER=xdg-open
else
  echo 'Kein unterstützter Browserstarter gefunden.'
  echo "Öffne manuell: $GAME"
  exit 1
fi
printf '[3/3] Spiel starten mit %s\n' "$BROWSER"
if [[ "$BROWSER" == "google-chrome" || "$BROWSER" == "google-chrome-stable" || "$BROWSER" == "chromium" ]]; then
  exec "$BROWSER" --new-window "file://$GAME"
fi
exec "$BROWSER" "$GAME"
