class_name MissionDefinition
extends RefCounted

var id: String
var title: String
var description: String
var category: String
var start_requirements: Array
var start_costs: Array
var phases: Array
var start_phase_id: String
var deadline: Dictionary
var success_effects: Array
var partial_success_effects: Array
var failure_effects: Array
var cancel_effects: Array
var pause_on_signals: Array[String]
var tags: Array[String]
var repeat_policy: String


static func from_dict(data: Dictionary) -> GameResult:
	var errors: Array = []
	for field in ["id", "title", "description"]:
		if not data.has(field):
			errors.append(
				GameError.new(
					"MISSION-ERR-001", "Pflichtfeld in Missionsdefinition fehlt.", {"field": field}
				)
			)

	if not errors.is_empty():
		return GameResult.failure_many(errors)

	var definition := MissionDefinition.new()
	definition.id = str(data["id"])
	definition.title = str(data["title"])
	definition.description = str(data["description"])
	definition.category = str(data.get("category", "general"))
	definition.start_requirements = (data.get("start_requirements", []) as Array).duplicate(true)
	definition.start_costs = (data.get("start_costs", []) as Array).duplicate(true)
	definition.phases = _read_phases_with_legacy_support(data)
	definition.start_phase_id = str(data.get("start_phase_id", ""))
	if definition.start_phase_id.is_empty() and not definition.phases.is_empty():
		definition.start_phase_id = str((definition.phases[0] as Dictionary).get("id", ""))
	definition.deadline = (data.get("deadline", {}) as Dictionary).duplicate(true)
	definition.success_effects = (data.get("success_effects", []) as Array).duplicate(true)
	definition.partial_success_effects = (
		(data.get("partial_success_effects", []) as Array).duplicate(true)
	)
	definition.failure_effects = (data.get("failure_effects", []) as Array).duplicate(true)
	definition.cancel_effects = (data.get("cancel_effects", []) as Array).duplicate(true)
	definition.pause_on_signals = []
	for signal_type in data.get("pause_on_signals", []):
		definition.pause_on_signals.append(str(signal_type))
	definition.tags = []
	for tag in data.get("tags", []):
		definition.tags.append(str(tag))
	definition.repeat_policy = str(data.get("repeat_policy", "ONCE_PER_CAMPAIGN"))

	var validation := definition.validate_definition()
	if not validation.ok:
		return validation
	return GameResult.success(definition)


static func _read_phases_with_legacy_support(data: Dictionary) -> Array:
	if data.has("phases"):
		return (data.get("phases", []) as Array).duplicate(true)

	var legacy_objectives := (data.get("objectives", []) as Array).duplicate(true)
	if legacy_objectives.is_empty():
		return []

	return [
		{
			"id": "phase.main",
			"title": "Hauptphase",
			"objectives": legacy_objectives,
			"completion_effects": [],
			"next_phase_id": "",
			"paths": [],
		}
	]


func validate_definition() -> GameResult:
	if id.strip_edges().is_empty():
		return GameResult.failure(
			GameError.new("MISSION-ERR-002", "Mission-ID darf nicht leer sein.")
		)
	if phases.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-003", "Mission benötigt mindestens eine Phase.", {"mission_id": id}
			)
		)

	var phase_ids: Dictionary = {}
	var objective_ids: Dictionary = {}
	var path_ids: Dictionary = {}

	for phase_value in phases:
		if not phase_value is Dictionary:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-003",
					"Missionsphase besitzt ein ungültiges Format.",
					{"mission_id": id}
				)
			)
		var phase: Dictionary = phase_value
		var phase_id := str(phase.get("id", ""))
		if phase_id.is_empty() or phase_ids.has(phase_id):
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-004",
					"Missionsphase benötigt eine eindeutige ID.",
					{"mission_id": id, "phase_id": phase_id}
				)
			)
		phase_ids[phase_id] = true

		var phase_paths: Array = phase.get("paths", []) as Array
		for path_value in phase_paths:
			if not path_value is Dictionary:
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-005",
						"Missionspfad besitzt ein ungültiges Format.",
						{"mission_id": id, "phase_id": phase_id}
					)
				)
			var path: Dictionary = path_value
			var path_id := str(path.get("id", ""))
			if path_id.is_empty() or path_ids.has(path_id):
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-005",
						"Missionspfad benötigt eine missionsweit eindeutige ID.",
						{"mission_id": id, "path_id": path_id}
					)
				)
			path_ids[path_id] = true

		var phase_objectives: Array = phase.get("objectives", []) as Array
		if phase_objectives.is_empty():
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-006",
					"Missionsphase benötigt mindestens ein Ziel.",
					{"mission_id": id, "phase_id": phase_id}
				)
			)
		var required_count := 0
		for objective_value in phase_objectives:
			if not objective_value is Dictionary:
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-003",
						"Missionsziel besitzt ein ungültiges Format.",
						{"mission_id": id, "phase_id": phase_id}
					)
				)
			var objective: Dictionary = objective_value
			var objective_id := str(objective.get("id", ""))
			var target := int(objective.get("target", 0))
			if objective_id.is_empty() or target <= 0 or objective_ids.has(objective_id):
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-004",
						"Missionsziel benötigt eine eindeutige ID und ein positives Ziel.",
						{"mission_id": id, "phase_id": phase_id, "objective": objective}
					)
				)
			objective_ids[objective_id] = true
			if bool(objective.get("required", true)):
				required_count += 1

		if required_count == 0:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-006",
					"Missionsphase benötigt mindestens ein Pflichtziel.",
					{"mission_id": id, "phase_id": phase_id}
				)
			)

	if not phase_ids.has(start_phase_id):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-031",
				"Startphase der Mission existiert nicht.",
				{"mission_id": id, "start_phase_id": start_phase_id}
			)
		)

	for phase_value in phases:
		var phase: Dictionary = phase_value
		var next_phase_id := str(phase.get("next_phase_id", ""))
		if not next_phase_id.is_empty() and not phase_ids.has(next_phase_id):
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-032",
					"Folgephase existiert nicht.",
					{"mission_id": id, "phase_id": phase.get("id"), "next_phase_id": next_phase_id}
				)
			)
		var next_by_path: Dictionary = phase.get("next_phase_by_path", {}) as Dictionary
		for path_id in next_by_path:
			if not path_ids.has(str(path_id)) or not phase_ids.has(str(next_by_path[path_id])):
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-033",
						"Pfadabhängige Folgephase ist ungültig.",
						{
							"mission_id": id,
							"path_id": path_id,
							"next_phase_id": next_by_path[path_id]
						}
					)
				)

	for phase_value in phases:
		var phase: Dictionary = phase_value
		for objective_value in phase.get("objectives", []):
			var objective: Dictionary = objective_value
			for path_id in objective.get("path_ids", []):
				if not path_ids.has(str(path_id)):
					return GameResult.failure(
						GameError.new(
							"MISSION-ERR-034",
							"Missionsziel verweist auf unbekannten Pfad.",
							{
								"mission_id": id,
								"objective_id": objective.get("id"),
								"path_id": path_id
							}
						)
					)

	if not deadline.is_empty():
		var offset_months := int(deadline.get("offset_months", 0))
		var threshold := float(deadline.get("partial_success_threshold", 0.0))
		if offset_months <= 0:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-035",
					"Missionsfrist benötigt einen positiven Monatsabstand.",
					{"mission_id": id}
				)
			)
		if threshold < 0.0 or threshold > 1.0:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-036",
					"Teilerfolgsschwelle muss zwischen 0 und 1 liegen.",
					{"mission_id": id, "threshold": threshold}
				)
			)

	return _validate_phase_graph()


func _validate_phase_graph() -> GameResult:
	var visiting: Dictionary = {}
	var visited: Dictionary = {}
	var cycle_result := _visit_phase(start_phase_id, visiting, visited)
	if not cycle_result.ok:
		return cycle_result
	if visited.size() != phases.size():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-037",
				"Mission enthält unerreichbare Phasen.",
				{"mission_id": id, "reachable": visited.keys(), "phase_count": phases.size()}
			)
		)
	return GameResult.success()


func _visit_phase(phase_id: String, visiting: Dictionary, visited: Dictionary) -> GameResult:
	if visiting.has(phase_id):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-038",
				"Zyklische Missionsphasen sind in MISSION-01 nicht erlaubt.",
				{"mission_id": id, "phase_id": phase_id}
			)
		)
	if visited.has(phase_id):
		return GameResult.success()

	visiting[phase_id] = true
	var phase := phase_by_id(phase_id)
	var next_ids: Array[String] = []
	var direct_next := str(phase.get("next_phase_id", ""))
	if not direct_next.is_empty():
		next_ids.append(direct_next)
	var next_by_path: Dictionary = phase.get("next_phase_by_path", {}) as Dictionary
	for next_value in next_by_path.values():
		var next_id := str(next_value)
		if not next_id.is_empty() and not next_ids.has(next_id):
			next_ids.append(next_id)

	for next_id in next_ids:
		var result := _visit_phase(next_id, visiting, visited)
		if not result.ok:
			return result

	visiting.erase(phase_id)
	visited[phase_id] = true
	return GameResult.success()


func phase_by_id(phase_id: String) -> Dictionary:
	for phase_value in phases:
		var phase: Dictionary = phase_value
		if str(phase.get("id", "")) == phase_id:
			return phase
	return {}


func objective_by_id(objective_id: String, phase_id: String = "") -> Dictionary:
	for phase_value in phases:
		var phase: Dictionary = phase_value
		if not phase_id.is_empty() and str(phase.get("id", "")) != phase_id:
			continue
		for objective_value in phase.get("objectives", []):
			var objective: Dictionary = objective_value
			if str(objective.get("id", "")) == objective_id:
				return objective
	return {}


func phase_for_objective(objective_id: String) -> Dictionary:
	for phase_value in phases:
		var phase: Dictionary = phase_value
		if not objective_by_id(objective_id, str(phase.get("id", ""))).is_empty():
			return phase
	return {}


func path_by_id(phase_id: String, path_id: String) -> Dictionary:
	var phase := phase_by_id(phase_id)
	for path_value in phase.get("paths", []):
		var path: Dictionary = path_value
		if str(path.get("id", "")) == path_id:
			return path
	return {}


func applicable_objectives(phase_id: String, selected_paths: Array[String]) -> Array:
	var result: Array = []
	var phase := phase_by_id(phase_id)
	for objective_value in phase.get("objectives", []):
		var objective: Dictionary = objective_value
		var path_filter: Array = objective.get("path_ids", []) as Array
		if path_filter.is_empty() or _has_any_selected_path(path_filter, selected_paths):
			result.append(objective)
	return result


func _has_any_selected_path(path_filter: Array, selected_paths: Array[String]) -> bool:
	for path_id in path_filter:
		if selected_paths.has(str(path_id)):
			return true
	return false


func next_phase_for(current_phase_id: String, selected_paths: Array[String]) -> String:
	var phase := phase_by_id(current_phase_id)
	var next_by_path: Dictionary = phase.get("next_phase_by_path", {}) as Dictionary
	for selected_path in selected_paths:
		if next_by_path.has(selected_path):
			return str(next_by_path[selected_path])
	return str(phase.get("next_phase_id", ""))


func has_pause_signal(signal_type: String) -> bool:
	return pause_on_signals.has(signal_type)


func deadline_offset_months() -> int:
	return int(deadline.get("offset_months", 0))


func partial_success_threshold() -> float:
	return float(deadline.get("partial_success_threshold", 0.0))


func pause_extends_deadline() -> bool:
	return bool(deadline.get("pause_extends_deadline", false))
