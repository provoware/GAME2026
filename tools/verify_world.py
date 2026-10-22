#!/usr/bin/env python3
"""Statische Weltgraphprüfung: keine Spielstand- oder Projektdateien verändern."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]


def validate_world(world: Any, schema: dict[str, Any]) -> list[str]:
    """Prüft Struktur, stabile IDs, Routenziele und grundsätzliche Erreichbarkeit."""
    problems: list[str] = []
    validator = Draft202012Validator(schema)
    schema_errors = sorted(validator.iter_errors(world), key=lambda e: str(e.json_path))
    if schema_errors:
        return [f"Schema {error.json_path}: {error.message}" for error in schema_errors]

    locations = world["locations"]
    routes = world["connections"]
    location_ids = [location["id"] for location in locations]
    route_ids = [route["id"] for route in routes]
    for label, identifiers in (("Orts-ID", location_ids), ("Routen-ID", route_ids)):
        seen: set[str] = set()
        for identifier in identifiers:
            if identifier in seen:
                problems.append(f"Doppelte {label}: {identifier}")
            seen.add(identifier)

    known = set(location_ids)
    start = world["start_location_id"]
    if start not in known:
        problems.append(f"Unbekannter Startort: {start}")

    adjacency: dict[str, set[str]] = {identifier: set() for identifier in known}
    for route in routes:
        route_id = route["id"]
        source = route["from_location_id"]
        target = route["to_location_id"]
        if source not in known or target not in known:
            problems.append(f"Route {route_id} verweist auf unbekannten Ort: {source} -> {target}")
            continue
        if source == target:
            problems.append(f"Route {route_id} verbindet einen Ort mit sich selbst")
        adjacency[source].add(target)
        if route["bidirectional"]:
            adjacency[target].add(source)
        for index, requirement in enumerate(route["requirements"]):
            kind = requirement["type"]
            if kind == "resource_minimum" and (
                not requirement.get("resource_id")
                or type(requirement.get("amount")) is not int
                or requirement["amount"] < 0
            ):
                problems.append(f"Route {route_id}, Voraussetzung {index}: Ressource/Betrag fehlt")
            if kind == "flag_equals" and (
                not requirement.get("flag_id") or "value" not in requirement
            ):
                problems.append(f"Route {route_id}, Voraussetzung {index}: Flag/Wert fehlt")

    if start in known:
        visited = {start}
        pending = deque([start])
        while pending:
            for neighbor in adjacency[pending.popleft()]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    pending.append(neighbor)
        for identifier in sorted(known - visited):
            problems.append(f"Vom Startort aus unerreichbar: {identifier}")
    return problems


def main() -> int:
    schema_path = ROOT / "schemas" / "world.schema.json"
    world_dir = ROOT / "content" / "world"
    errors: list[str] = []
    try:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
    except (OSError, ValueError, TypeError, SchemaError) as exc:
        print(f"[Weltprüfung] Ungültiges Schema: {exc}")
        return 1

    files = sorted(world_dir.glob("*.json"))
    if not files:
        print("[Weltprüfung] FEHLER: Keine Weltdefinition gefunden.")
        return 1
    for path in files:
        try:
            world = json.loads(path.read_text(encoding="utf-8"))
            errors.extend(f"{path.name}: {issue}" for issue in validate_world(world, schema))
        except (OSError, ValueError, TypeError) as exc:
            errors.append(f"{path.name}: {exc}")
    if errors:
        print("[Weltprüfung] FAIL")
        for error in errors:
            print(f" - {error}")
        return 1
    print(f"[Weltprüfung] PASS: {len(files)} Weltdefinition(en) geprüft.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
