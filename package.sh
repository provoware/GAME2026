#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_PATH="${1:-${ROOT_DIR}/../PPPOPPI_Bunkerwahrheit_0.2.0.zip}"

cd -- "${ROOT_DIR}"

if command -v gdformat >/dev/null 2>&1; then
    gdformat scripts >/dev/null
fi
python3 tools/build_manifest.py
python3 tools/verify_package.py

rm -f -- "${OUTPUT_PATH}"
(
    cd -- "${ROOT_DIR}/.."
    zip -qr "${OUTPUT_PATH}" "$(basename -- "${ROOT_DIR}")" \
        -x '*/.godot/*' '*/user/*' '*/.git/*' '*/__pycache__/*' '*.pyc'
)

printf '[Paket] Erstellt: %s\n' "${OUTPUT_PATH}"
