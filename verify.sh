#!/usr/bin/env bash
set -Eeuo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
python3 tools/build_manifest.py
python3 tools/verify_package.py
python3 tools/verify_world.py
python3 -m unittest discover -s tools/tests -v
