#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

GODOT_BIN="$(find_godot || true)"
if [[ -z "$GODOT_BIN" ]]; then
  printf '[Tests][FEHLER] Godot 4 wurde nicht gefunden.\n' >&2
  exit 1
fi

# Godot kann bei Script-/Compile-Fehlern mit Exitcode 0 enden.
# Deshalb Fehlerausgabe und vollständige Testanzahl kontrollieren.
test_log="$(mktemp)"
trap 'rm -f -- "$test_log"' EXIT
"$GODOT_BIN" --headless --path "$SCRIPT_DIR" --script res://scripts/tests/headless_test_runner.gd 2>&1 | tee "$test_log"
if grep -Eq 'SCRIPT ERROR:|ERROR: Failed to load script|Invalid call|Invalid access to property' "$test_log"; then
  echo "[Tests][FEHLER] Godot meldet Script- oder Laufzeitfehler." >&2
  exit 1
fi
summary="$(grep -F '[Tests] ' "$test_log" | tail -n 1 || true)"
counts="$(printf '%s\n' "$summary" | awk '{print $2}')"
if [[ "$summary" != *" bestanden" || "$counts" != */* ]]; then
  echo "[Tests][FEHLER] Verbindliche Testzusammenfassung fehlt." >&2
  exit 1
fi
IFS=/ read -r passed total <<< "$counts"
if [[ ! "$passed" =~ ^[0-9]+$ || ! "$total" =~ ^[0-9]+$ ]]; then
  echo "[Tests][FEHLER] Ungültige Testzahlen." >&2
  exit 1
fi
if (( total < 23 || passed != total )); then
  echo "[Tests][FEHLER] Unvollständige Suite: $passed/$total (mindestens 23 erwartet)." >&2
  exit 1
fi
