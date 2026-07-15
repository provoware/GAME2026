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

exec "$GODOT_BIN" --headless --path "$SCRIPT_DIR" --script res://scripts/tests/headless_test_runner.gd
