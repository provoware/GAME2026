"""Weltgraph: reale Definition und gezielte Positiv-/Negativfälle."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from verify_world import validate_world

WORLD = json.loads((ROOT / "content/world/city_graph.json").read_text(encoding="utf-8"))
SCHEMA = json.loads((ROOT / "schemas/world.schema.json").read_text(encoding="utf-8"))


class WorldGraphTests(unittest.TestCase):
    def check(self, mutate, fragment):
        world = copy.deepcopy(WORLD)
        mutate(world)
        issues = validate_world(world, SCHEMA)
        self.assertTrue(any(fragment in issue for issue in issues), issues)

    def test_01_real_world_valid(self):
        self.assertEqual(validate_world(copy.deepcopy(WORLD), SCHEMA), [])

    def test_02_duplicate_location_id(self):
        self.check(lambda w: w["locations"].append(copy.deepcopy(w["locations"][0])), "Doppelte Orts-ID")

    def test_03_duplicate_route_id(self):
        self.check(lambda w: w["connections"].append(copy.deepcopy(w["connections"][0])), "Doppelte Routen-ID")

    def test_04_unknown_start(self):
        self.check(lambda w: w.update(start_location_id="location.invalid"), "Unbekannter Startort")

    def test_05_missing_route_endpoint(self):
        self.check(lambda w: w["connections"][0].update(to_location_id="location.invalid"), "unbekannten Ort")

    def test_06_self_connection(self):
        def mutate(w):
            w["connections"][0]["to_location_id"] = w["connections"][0]["from_location_id"]
        self.check(mutate, "mit sich selbst")

    def test_07_unreachable_location(self):
        def mutate(w):
            for route in w["connections"]:
                if route["to_location_id"] == "location.neon.cellar_club":
                    route["to_location_id"] = "location.tunnel.west"
            # Der neon-Club bleibt noch durch route.archive.neon erreichbar? Hier alles entfernen.
            w["connections"] = [r for r in w["connections"] if r["from_location_id"] != "location.neon.cellar_club"]
        self.check(mutate, "unerreichbar")

    def test_08_negative_required_resource(self):
        def mutate(w):
            w["connections"][0]["requirements"].append(
                {"type": "resource_minimum", "resource_id": "resource.money", "amount": -1}
            )
        self.check(mutate, "Schema")

    def test_09_missing_requirement_flag(self):
        def mutate(w):
            w["connections"][0]["requirements"].append({"type": "flag_equals", "value": True})
        self.check(mutate, "Flag/Wert fehlt")

    def test_10_missing_required_property(self):
        self.check(lambda w: w["locations"][0].pop("position"), "Schema")


if __name__ == "__main__":
    unittest.main()
