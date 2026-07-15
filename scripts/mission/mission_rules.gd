class_name MissionRules
extends RefCounted


static func evaluate_requirements(
	requirements: Array, state: GameSessionState, instance: MissionInstanceState = null
) -> GameResult:
	var failures: Array = []
	for requirement in requirements:
		if not requirement is Dictionary:
			failures.append(GameError.new("MISSION-ERR-016", "Ungültige Missionsvoraussetzung."))
			continue

		var requirement_type := str(requirement.get("type", ""))
		match requirement_type:
			"resource_minimum":
				var resource_id := str(requirement.get("resource_id", ""))
				var minimum := int(requirement.get("amount", 0))
				if state.resource_amount(resource_id) < minimum:
					failures.append(
						GameError.new(
							"MISSION-ERR-017",
							"Ressourcenvoraussetzung nicht erfüllt.",
							{
								"resource_id": resource_id,
								"required": minimum,
								"available": state.resource_amount(resource_id)
							}
						)
					)
			"flag_true":
				var flag_id := str(requirement.get("flag_id", ""))
				if not bool(state.flags.get(flag_id, false)):
					failures.append(
						GameError.new(
							"MISSION-ERR-018",
							"Erforderliches Flag ist nicht aktiv.",
							{"flag_id": flag_id}
						)
					)
			"flag_false":
				var flag_id := str(requirement.get("flag_id", ""))
				if bool(state.flags.get(flag_id, false)):
					failures.append(
						GameError.new(
							"MISSION-ERR-042", "Flag muss inaktiv sein.", {"flag_id": flag_id}
						)
					)
			"mission_completed":
				var mission_id := str(requirement.get("mission_id", ""))
				var mission := state.get_mission(mission_id)
				if mission == null or mission.status != MissionStatus.COMPLETED:
					failures.append(
						GameError.new(
							"MISSION-ERR-019",
							"Vorausgesetzte Mission ist nicht abgeschlossen.",
							{"mission_id": mission_id}
						)
					)
			"mission_status":
				var mission_id := str(requirement.get("mission_id", ""))
				var required_status := str(requirement.get("status", ""))
				var mission := state.get_mission(mission_id)
				if mission == null or mission.status != required_status:
					failures.append(
						GameError.new(
							"MISSION-ERR-043",
							"Vorausgesetzter Missionsstatus ist nicht erfüllt.",
							{"mission_id": mission_id, "required_status": required_status}
						)
					)
			"month_at_least":
				var month := int(requirement.get("month", 0))
				if state.campaign_month_index < month:
					failures.append(
						GameError.new(
							"MISSION-ERR-020",
							"Mission ist noch nicht verfügbar.",
							{"required_month": month, "current_month": state.campaign_month_index}
						)
					)
			"month_before":
				var month := int(requirement.get("month", 0))
				if state.campaign_month_index >= month:
					failures.append(
						GameError.new(
							"MISSION-ERR-044",
							"Frist für diese Handlung ist abgelaufen.",
							{
								"required_before_month": month,
								"current_month": state.campaign_month_index
							}
						)
					)
			"current_location":
				var location_id := str(requirement.get("location_id", ""))
				if state.current_location_id != location_id:
					failures.append(
						GameError.new(
							"MISSION-ERR-045",
							"Falscher Standort für diese Handlung.",
							{
								"required_location": location_id,
								"current_location": state.current_location_id
							}
						)
					)
			"character_available":
				var character_id := str(requirement.get("character_id", ""))
				if not state.is_character_available(character_id):
					failures.append(
						GameError.new(
							"MISSION-ERR-046",
							"Erforderliche Figur ist nicht verfügbar.",
							{"character_id": character_id}
						)
					)
			"ability_unlocked":
				var ability_id := str(requirement.get("ability_id", ""))
				if not state.is_ability_unlocked(ability_id):
					failures.append(
						GameError.new(
							"MISSION-ERR-047",
							"Erforderliche Fähigkeit ist nicht freigeschaltet.",
							{"ability_id": ability_id}
						)
					)
			"path_selected":
				var path_id := str(requirement.get("path_id", ""))
				if instance == null or not instance.selected_paths.has(path_id):
					failures.append(
						GameError.new(
							"MISSION-ERR-048",
							"Erforderlicher Missionspfad wurde nicht gewählt.",
							{"path_id": path_id}
						)
					)
			"objective_complete":
				var objective_id := str(requirement.get("objective_id", ""))
				var target := int(requirement.get("target", 1))
				if (
					instance == null
					or int(instance.objective_progress.get(objective_id, 0)) < target
				):
					failures.append(
						GameError.new(
							"MISSION-ERR-049",
							"Erforderliches Missionsziel ist nicht abgeschlossen.",
							{"objective_id": objective_id, "target": target}
						)
					)
			_:
				failures.append(
					GameError.new(
						"MISSION-ERR-021",
						"Unbekannter Voraussetzungstyp.",
						{"type": requirement_type}
					)
				)

	if failures.is_empty():
		return GameResult.success()
	return GameResult.failure_many(failures)


static func resolve_current_phase_id(
	definition: MissionDefinition, instance: MissionInstanceState
) -> String:
	if definition.phase_by_id(instance.current_phase_id).is_empty():
		return definition.start_phase_id
	return instance.current_phase_id


static func objective_is_applicable(objective: Dictionary, instance: MissionInstanceState) -> bool:
	var path_ids: Array = objective.get("path_ids", []) as Array
	if path_ids.is_empty():
		return true
	for path_id in path_ids:
		if instance.selected_paths.has(str(path_id)):
			return true
	return false


static func all_required_objectives_complete(
	definition: MissionDefinition, instance: MissionInstanceState, phase_id: String = ""
) -> bool:
	var effective_phase_id := phase_id
	if effective_phase_id.is_empty():
		effective_phase_id = resolve_current_phase_id(definition, instance)
	var applicable := definition.applicable_objectives(effective_phase_id, instance.selected_paths)
	for objective_value in applicable:
		var objective: Dictionary = objective_value
		if not bool(objective.get("required", true)):
			continue
		var objective_id := str(objective.get("id", ""))
		var target := int(objective.get("target", 1))
		if int(instance.objective_progress.get(objective_id, 0)) < target:
			return false
	return true


static func required_completion_ratio(
	definition: MissionDefinition, instance: MissionInstanceState
) -> float:
	var required_count := 0
	var completed_count := 0
	for phase_value in definition.phases:
		var phase: Dictionary = phase_value
		var phase_id := str(phase.get("id", ""))
		for objective_value in definition.applicable_objectives(phase_id, instance.selected_paths):
			var objective: Dictionary = objective_value
			if not bool(objective.get("required", true)):
				continue
			required_count += 1
			var objective_id := str(objective.get("id", ""))
			if (
				int(instance.objective_progress.get(objective_id, 0))
				>= int(objective.get("target", 1))
			):
				completed_count += 1
	if required_count == 0:
		return 0.0
	return float(completed_count) / float(required_count)


static func signal_matches(trigger: Dictionary, signal_type: String, payload: Dictionary) -> bool:
	if str(trigger.get("signal", "")) != signal_type:
		return false
	var expected: Dictionary = trigger.get("match", {}) as Dictionary
	for key in expected:
		if not payload.has(key) or payload[key] != expected[key]:
			return false
	return true


static func objective_progress_amount(objective: Dictionary, payload: Dictionary) -> int:
	var trigger: Dictionary = objective.get("trigger", {}) as Dictionary
	var amount_field := str(trigger.get("amount_field", ""))
	if not amount_field.is_empty() and payload.has(amount_field):
		return maxi(1, int(payload[amount_field]))
	return maxi(1, int(trigger.get("amount", 1)))
