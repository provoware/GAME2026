#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log() { printf '[Bunkerstart] %s\n' "$*"; }
fail() { printf '[Bunkerstart][FEHLER] %s\n' "$*" >&2; exit 1; }

find_godot() {
  local candidate
  for candidate in \
    "$SCRIPT_DIR/tools/godot" \
    "$SCRIPT_DIR/tools/godot4" \
    "$(command -v godot4 2>/dev/null || true)" \
    "$(command -v godot 2>/dev/null || true)"; do
    if [[ -n "$candidate" && -x "$candidate" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

[[ -f project.godot ]] || fail 'project.godot fehlt.'
mkdir -p .runtime/logs .runtime/backups

GODOT_BIN="$(find_godot || true)"
[[ -n "$GODOT_BIN" ]] || fail 'Godot 4 wurde nicht gefunden. Installiere Godot 4 oder lege die Binärdatei unter tools/godot ab.'

log "Verwende: $GODOT_BIN"
log 'Prüfe Projektdateien …'

if ! "$GODOT_BIN" --headless --path "$SCRIPT_DIR" --editor --quit-after 2 >.runtime/logs/preflight.log 2>&1; then
  log 'Vorprüfung meldete einen Fehler. Details: .runtime/logs/preflight.log'
  fail 'Projekt konnte nicht sicher gestartet werden.'
fi

log 'Starte PPPOPPI – Bunkerwahrheit …'
exec "$GODOT_BIN" --path "$SCRIPT_DIR"
