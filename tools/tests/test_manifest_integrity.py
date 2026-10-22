"""Regressionen für die unveränderte Prüfung des versionierten Manifests."""
from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "tools"))
import verify_package


class ManifestIntegrityTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.data_path = self.root / "beispiel.txt"
        self.data_path.write_text("unveraendert\n", encoding="utf-8")
        self.write_manifest()

    def write_manifest(self, entries=None):
        if entries is None:
            payload = self.data_path.read_bytes()
            entries = [{
                "path": self.data_path.name,
                "size": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
            }]
        manifest = {"project": "Test", "package_version": "test", "files": entries}
        (self.root / "MANIFEST.json").write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )

    def findings(self):
        with patch.object(verify_package, "ROOT", self.root):
            verify_package.errors.clear()
            try:
                verify_package.verify_manifest()
                return list(verify_package.errors)
            finally:
                verify_package.errors.clear()

    def test_01_intakte_datei_besteht(self):
        self.assertEqual(self.findings(), [])

    def test_02_manipulierte_datei_faellt_durch(self):
        self.data_path.write_text("manipuliert\n", encoding="utf-8")
        self.assertTrue(any("Prüfsummenabweichung" in x for x in self.findings()))

    def test_03_fehlender_manifesteintrag_faellt_durch(self):
        self.write_manifest([])
        self.assertTrue(any("Manifest fehlen Dateien" in x for x in self.findings()))

    def test_04_zusaetzliche_datei_faellt_durch(self):
        (self.root / "unerfasst.txt").write_text("neu", encoding="utf-8")
        self.assertTrue(any("Manifest fehlen Dateien" in x for x in self.findings()))

    def test_05_geloeschte_datei_faellt_durch(self):
        self.data_path.unlink()
        self.assertTrue(any("Manifest enthält nicht vorhandene Dateien" in x for x in self.findings()))

    def test_06_verify_sh_erneuert_manifest_nicht(self):
        script = (PROJECT_ROOT / "verify.sh").read_text(encoding="utf-8")
        self.assertNotIn("python3 tools/build_manifest.py", script)

    def test_07_ci_erneuert_manifest_nicht(self):
        workflow = (PROJECT_ROOT / ".github/workflows/validate.yml").read_text(encoding="utf-8")
        self.assertNotIn("run: python tools/build_manifest.py", workflow)


if __name__ == "__main__":
    unittest.main()
