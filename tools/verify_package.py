#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
EXCLUDED_PARTS = {".git", ".godot", ".runtime", "user", "__pycache__"}


def fail(message: str) -> None:
    errors.append(message)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def verify_json() -> None:
    for path in ROOT.rglob("*.json"):
        try:
            load_json(path)
        except Exception as exc:  # noqa: BLE001 - verification must report all malformed files
            fail(f"Ungültiges JSON: {path.relative_to(ROOT)} — {exc}")


def verify_gdscript() -> None:
    executable = shutil.which("gdlint")
    if executable is None:
        print("[Verifikation] Hinweis: gdlint nicht installiert; Parserprüfung übersprungen.")
        return
    result = subprocess.run(
        [executable, "scripts"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        fail(f"GDScript-Prüfung fehlgeschlagen:\n{result.stdout}{result.stderr}")


def verify_classes() -> None:
    found: dict[str, Path] = {}
    pattern = re.compile(r"^class_name\s+([A-Za-z_][A-Za-z0-9_]*)\s*$", re.MULTILINE)
    for path in ROOT.rglob("*.gd"):
        for class_name in pattern.findall(path.read_text(encoding="utf-8")):
            if class_name in found:
                fail(
                    "Doppelte class_name-Definition "
                    f"{class_name}: {found[class_name]} und {path}"
                )
            found[class_name] = path


def verify_resource_paths() -> None:
    path_pattern = re.compile(r'path="res://([^"]+)"')
    for path in list(ROOT.rglob("*.tscn")) + list(ROOT.rglob("*.tres")):
        text = path.read_text(encoding="utf-8")
        for resource in path_pattern.findall(text):
            if not (ROOT / resource).exists():
                fail(f"Fehlende res://-Referenz in {path.relative_to(ROOT)}: {resource}")

    project_text = (ROOT / "project.godot").read_text(encoding="utf-8")
    match = re.search(r'run/main_scene="res://([^"]+)"', project_text)
    if not match:
        fail("run/main_scene fehlt in project.godot")
    elif not (ROOT / match.group(1)).exists():
        fail(f"Hauptszene fehlt: {match.group(1)}")


def iter_effects(data: dict[str, Any]) -> list[dict[str, Any]]:
    effects: list[dict[str, Any]] = []
    for key in (
        "start_costs",
        "success_effects",
        "partial_success_effects",
        "failure_effects",
        "cancel_effects",
    ):
        effects.extend(data.get(key, []))
    for phase in data.get("phases", []):
        effects.extend(phase.get("start_effects", []))
        effects.extend(phase.get("completion_effects", []))
        for path in phase.get("paths", []):
            effects.extend(path.get("selection_effects", []))
    return effects


def verify_mission_schema(data: dict[str, Any], path: Path) -> None:
    schema_path = ROOT / "schemas" / "mission.schema.json"
    schema = load_json(schema_path)
    validator = Draft202012Validator(schema)
    for issue in sorted(validator.iter_errors(data), key=lambda item: list(item.path)):
        location = "/".join(str(part) for part in issue.path) or "<root>"
        fail(f"Missionsschema {path.relative_to(ROOT)} [{location}]: {issue.message}")


def verify_mission_semantics(data: dict[str, Any], path: Path) -> None:
    mission_id = data["id"]
    phases = data.get("phases", [])
    phase_ids = [phase["id"] for phase in phases]
    if len(phase_ids) != len(set(phase_ids)):
        fail(f"Doppelte Phasen-ID in {mission_id}")
    if data.get("start_phase_id") not in set(phase_ids):
        fail(f"Unbekannte Startphase in {mission_id}: {data.get('start_phase_id')}")

    objective_ids: set[str] = set()
    path_ids: set[str] = set()
    adjacency: dict[str, set[str]] = {phase_id: set() for phase_id in phase_ids}

    for phase in phases:
        phase_id = phase["id"]
        required = 0
        for path_definition in phase.get("paths", []):
            path_id = path_definition["id"]
            if path_id in path_ids:
                fail(f"Doppelte Pfad-ID in {mission_id}: {path_id}")
            path_ids.add(path_id)
        for objective in phase.get("objectives", []):
            objective_id = objective["id"]
            if objective_id in objective_ids:
                fail(f"Doppelte Ziel-ID in {mission_id}: {objective_id}")
            objective_ids.add(objective_id)
            if objective.get("required", True):
                required += 1
        if required == 0:
            fail(f"Phase ohne Pflichtziel in {mission_id}: {phase_id}")

        direct_next = phase.get("next_phase_id", "")
        if direct_next:
            adjacency[phase_id].add(direct_next)
        adjacency[phase_id].update(phase.get("next_phase_by_path", {}).values())

    for phase in phases:
        for objective in phase.get("objectives", []):
            for path_id in objective.get("path_ids", []):
                if path_id not in path_ids:
                    fail(
                        f"Unbekannter Pfad {path_id} in "
                        f"{mission_id}/{objective['id']}"
                    )

    for source, targets in adjacency.items():
        for target in targets:
            if target not in adjacency:
                fail(f"Unbekannte Folgephase in {mission_id}: {source} -> {target}")

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(phase_id: str) -> None:
        if phase_id in visiting:
            fail(f"Zyklische Missionsphase in {mission_id}: {phase_id}")
            return
        if phase_id in visited or phase_id not in adjacency:
            return
        visiting.add(phase_id)
        for target in adjacency[phase_id]:
            visit(target)
        visiting.remove(phase_id)
        visited.add(phase_id)

    visit(data["start_phase_id"])
    unreachable = sorted(set(phase_ids) - visited)
    if unreachable:
        fail(f"Unerreichbare Phasen in {mission_id}: {unreachable}")

    supported_effects = {"modify_resource", "set_flag"}
    for effect in iter_effects(data):
        if effect.get("type") not in supported_effects:
            fail(f"Nicht unterstützter Effekt in {mission_id}: {effect.get('type')}")


def verify_missions() -> None:
    mission_ids: set[str] = set()
    mission_dir = ROOT / "content" / "missions"
    for path in sorted(mission_dir.glob("*.json")):
        data = load_json(path)
        verify_mission_schema(data, path)
        mission_id = data.get("id")
        if not mission_id:
            continue
        if mission_id in mission_ids:
            fail(f"Doppelte Missions-ID: {mission_id}")
        mission_ids.add(mission_id)
        verify_mission_semantics(data, path)


def verify_manifest() -> None:
    manifest_path = ROOT / "MANIFEST.json"
    if not manifest_path.exists():
        fail("MANIFEST.json fehlt")
        return
    manifest = load_json(manifest_path)
    expected = {entry["path"]: entry for entry in manifest.get("files", [])}
    actual = {
        path.relative_to(ROOT).as_posix(): path
        for path in ROOT.rglob("*")
        if (
            path.is_file()
            and path.name != "MANIFEST.json"
            and not EXCLUDED_PARTS.intersection(path.parts)
            and path.suffix != ".pyc"
        )
    }
    if set(expected) != set(actual):
        missing = sorted(set(actual) - set(expected))
        stale = sorted(set(expected) - set(actual))
        if missing:
            fail(f"Manifest fehlen Dateien: {missing}")
        if stale:
            fail(f"Manifest enthält nicht vorhandene Dateien: {stale}")
        return
    for relative_path, path in actual.items():
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != expected[relative_path]["sha256"]:
            fail(f"Prüfsummenabweichung: {relative_path}")


def main() -> int:
    verify_json()
    verify_gdscript()
    verify_classes()
    verify_resource_paths()
    verify_missions()
    verify_manifest()
    if errors:
        print("[Verifikation] FEHLER")
        for error in errors:
            print(f" - {error}")
        return 1
    print(
        "[Verifikation] GDScript, JSON-Schema, Missionsgraph, IDs, "
        "Referenzen und Prüfsummen sind konsistent."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
