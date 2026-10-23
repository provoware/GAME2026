"""Statische SAV-04-Verträge; kein Ersatz für die Godot-Laufzeittests."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
SERVICE = ROOT / "scripts/save/save_service.gd"
RUNNER = ROOT / "scripts/tests/headless_test_runner.gd"
TESTS = ROOT / "scripts/tests/save_service_regression_runner.gd"


class SaveServiceSourceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = SERVICE.read_text(encoding="utf-8")
        cls.runner = RUNNER.read_text(encoding="utf-8")
        cls.tests = TESTS.read_text(encoding="utf-8")

    def test_backup_is_not_deleted_before_activation(self):
        section = self.source.split("func save_to_path(", 1)[1].split(
            "func load_from_path(", 1
        )[0]
        self.assertNotIn("_remove_file(absolute_backup_path)", section)
        activation = section.index("_rename_file(absolute_temporary_path, absolute_path)")
        cleanup = section.index("_remove_file(absolute_previous_backup_path)")
        self.assertGreater(cleanup, activation)

    def test_backup_staging_is_collision_guarded(self):
        self.assertIn("FileAccess.file_exists(previous_backup_path)", self.source)
        self.assertIn('"SAVE-ERR-010"', self.source)
        self.assertIn("absolute_previous_backup_path, absolute_backup_path", self.source)

    def test_temporary_write_is_verified_before_rotation(self):
        check = self.source.index("FileAccess.get_file_as_string(temporary_path) != payload")
        rotation = self.source.index("_rename_file(absolute_backup_path, absolute_previous_backup_path)")
        self.assertLess(check, rotation)

    def test_existing_tmp_is_rejected_before_opening_for_write(self):
        guard = self.source.index("FileAccess.file_exists(temporary_path)")
        open_write = self.source.index("FileAccess.open(temporary_path, FileAccess.WRITE)")
        self.assertLess(guard, open_write)
        self.assertIn('"SAVE-ERR-013"', self.source)

    def test_orphan_backup_is_rejected_before_write(self):
        guard = self.source.index(
            "not FileAccess.file_exists(path) and FileAccess.file_exists(backup_path)"
        )
        open_write = self.source.index("FileAccess.open(temporary_path, FileAccess.WRITE)")
        self.assertLess(guard, open_write)
        self.assertIn('"SAVE-ERR-014"', self.source)

    def test_runtime_regressions_are_registered(self):
        self.assertIn("SaveServiceRegressionRunner.new().run_all()", self.runner)
        for test in (
            "_test_rotation",
            "_test_failed_activation",
            "_test_failed_backup_stage",
            "_test_stale_stage",
            "_test_stale_tmp",
            "_test_orphan_backup",
        ):
            self.assertIn(test, self.tests)


if __name__ == "__main__":
    unittest.main()
