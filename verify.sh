#!/usr/bin/env bash
set -Eeuo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if ! command -v python3 >/dev/null 2>&1; then
	printf '[Prüfung][FEHLER] Python 3 fehlt. Installiere Python 3 und starte ./verify.sh erneut.\n' >&2
	exit 1
fi

if ! python3 -c 'import jsonschema' >/dev/null 2>&1; then
	printf '%s\n' \
		'[Prüfung][FEHLER] Das Python-Paket jsonschema fehlt.' \
		'Führe exakt diesen Befehl aus:' \
		'python3 -m pip install --user jsonschema' \
		'und starte danach ./verify.sh erneut.' >&2
	exit 1
fi

python3 tools/build_manifest.py
python3 tools/verify_package.py
