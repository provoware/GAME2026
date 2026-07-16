#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "MANIFEST.json"
PACKAGE_VERSION = "0.4.0-world-iteration-a"
EXCLUDED_PARTS = {".git", ".godot", ".runtime", "user", "__pycache__"}


def main() -> None:
    files = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path == MANIFEST_PATH:
            continue
        if EXCLUDED_PARTS.intersection(path.parts) or path.suffix == ".pyc":
            continue
        relative = path.relative_to(ROOT).as_posix()
        files.append(
            {
                "path": relative,
                "size": path.stat().st_size,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            }
        )

    manifest = {
        "project": "PPPOPPI – Bunkerwahrheit",
        "package_version": PACKAGE_VERSION,
        "files": files,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"[Manifest] {len(files)} Dateien erfasst: {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
