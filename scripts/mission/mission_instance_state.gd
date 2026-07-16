class_name MissionInstanceState
extends RefCounted

const SCHEMA_VERSION := 3

var schema_version: int = SCHEMA_VERSION
var mission_id: String
var status: String = MissionStatus.ACTIVE
var started_month: int = 0
var completed_month: int = -1
var current_phase_id: String = ""
var deadline_month: int = -1
var objective_progress: Dictionary = {}
var selected_paths: Array[String] = []
var visited_phases: Array[String] = []
var outcome_id: String = ""
var outcome_quality: Dictionary = {}
var pause_reason: String = ""
var paused_at_month: int = -1
var accumulated_paused_months: int = 0
var failure_reasons: Array[String] = []
var resume_checkpoint: Dictionary = {}
var phase_timeline: Array = []


static func create(definition: MissionDefinition, month_index: int) -> MissionInstanceState:
	var instance := MissionInstanceState.new()
	instance.mission_id = definition.id
	instance.status = MissionStatus.ACTIVE
	instance.started_month = month_index
	instance.current_phase_id = definition.start_phase_id
	instance.visited_phases = [definition.start_phase_id]
	if definition.deadline_offset_months() > 0:
		instance.deadline_month = month_index + definition.deadline_offset_months()
	for phase_value in definition.phases:
		var phase: Dictionary = phase_value
		for objective_value in phase.get("objectives", []):
			var objective: Dictionary = objective_value
			instance.objective_progress[str(objective.get("id", ""))] = 0
	instance.capture_checkpoint(definition.start_phase_id, month_index, "mission_started")
	return instance


func capture_checkpoint(phase_id: String, month_index: int, reason: String) -> void:
	resume_checkpoint = {
		"phase_id": phase_id,
		"month_index": month_index,
		"reason": reason,
		"objective_progress": objective_progress.duplicate(true),
		"selected_paths": selected_paths.duplicate(),
	}
	phase_timeline.append(
		{
			"phase_id": phase_id,
			"month_index": month_index,
			"reason": reason,
		}
	)


func restore_checkpoint() -> GameResult:
	if resume_checkpoint.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-061",
				"Mission besitzt keinen sicheren Wiederaufnahmepunkt.",
				{"mission_id": mission_id}
			)
		)
	var checkpoint_phase := str(resume_checkpoint.get("phase_id", ""))
	if checkpoint_phase.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-062",
				"Wiederaufnahmepunkt besitzt keine gültige Phase.",
				{"mission_id": mission_id}
			)
		)
	current_phase_id = checkpoint_phase
	objective_progress = (
		(resume_checkpoint.get("objective_progress", {}) as Dictionary).duplicate(true)
	)
	selected_paths = []
	for path_id in resume_checkpoint.get("selected_paths", []):
		selected_paths.append(str(path_id))
	status = MissionStatus.ACTIVE
	pause_reason = ""
	paused_at_month = -1
	if not visited_phases.has(current_phase_id):
		visited_phases.append(current_phase_id)
	return validate_invariants()


func to_dict() -> Dictionary:
	return {
		"schema_version": schema_version,
		"mission_id": mission_id,
		"status": status,
		"started_month": started_month,
		"completed_month": completed_month,
		"current_phase_id": current_phase_id,
		"deadline_month": deadline_month,
		"objective_progress": objective_progress.duplicate(true),
		"selected_paths": selected_paths.duplicate(),
		"visited_phases": visited_phases.duplicate(),
		"outcome_id": outcome_id,
		"outcome_quality": outcome_quality.duplicate(true),
		"pause_reason": pause_reason,
		"paused_at_month": paused_at_month,
		"accumulated_paused_months": accumulated_paused_months,
		"failure_reasons": failure_reasons.duplicate(),
		"resume_checkpoint": resume_checkpoint.duplicate(true),
		"phase_timeline": phase_timeline.duplicate(true),
	}


static func from_dict(data: Dictionary) -> GameResult:
	var instance := MissionInstanceState.new()
	instance.schema_version = int(data.get("schema_version", 1))
	instance.mission_id = str(data.get("mission_id", ""))
	instance.status = str(data.get("status", MissionStatus.ACTIVE))
	instance.started_month = int(data.get("started_month", 0))
	instance.completed_month = int(data.get("completed_month", -1))
	instance.current_phase_id = str(data.get("current_phase_id", ""))
	instance.deadline_month = int(data.get("deadline_month", -1))
	instance.objective_progress = (data.get("objective_progress", {}) as Dictionary).duplicate(true)
	instance.selected_paths = []
	for path_id in data.get("selected_paths", []):
		instance.selected_paths.append(str(path_id))
	instance.visited_phases = []
	for phase_id in data.get("visited_phases", []):
		instance.visited_phases.append(str(phase_id))
	if instance.current_phase_id.is_empty() and not MissionStatus.is_terminal(instance.status):
		instance.current_phase_id = "phase.main"
	if instance.visited_phases.is_empty() and not instance.current_phase_id.is_empty():
		instance.visited_phases.append(instance.current_phase_id)
	instance.outcome_id = str(data.get("outcome_id", ""))
	instance.outcome_quality = (
		(data.get("outcome_quality", {}) as Dictionary).duplicate(true)
	)
	instance.pause_reason = str(data.get("pause_reason", ""))
	instance.paused_at_month = int(data.get("paused_at_month", -1))
	instance.accumulated_paused_months = int(data.get("accumulated_paused_months", 0))
	instance.failure_reasons = []
	for reason in data.get("failure_reasons", []):
		instance.failure_reasons.append(str(reason))
	instance.resume_checkpoint = (
		(data.get("resume_checkpoint", {}) as Dictionary).duplicate(true)
	)
	instance.phase_timeline = (data.get("phase_timeline", []) as Array).duplicate(true)
	if instance.resume_checkpoint.is_empty() and not instance.current_phase_id.is_empty():
		instance.capture_checkpoint(
			instance.current_phase_id, instance.started_month, "migrated_legacy_state"
		)
	instance.schema_version = SCHEMA_VERSION

	var validation := instance.validate_invariants()
	if not validation.ok:
		return validation
	return GameResult.success(instance)


func validate_invariants() -> GameResult:
	if mission_id.is_empty():
		return GameResult.failure(
			GameError.new("MISSION-ERR-007", "Missionszustand besitzt keine Mission-ID.")
		)
	if not MissionStatus.is_valid(status):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-008",
				"Ungültiger Missionsstatus.",
				{"mission_id": mission_id, "status": status}
			)
		)
	if not MissionStatus.is_terminal(status) and current_phase_id.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-039",
				"Aktive Mission besitzt keine aktuelle Phase.",
				{"mission_id": mission_id}
			)
		)
	if status == MissionStatus.PAUSED and paused_at_month < 0:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-040",
				"Pausierte Mission besitzt keinen Pausenzeitpunkt.",
				{"mission_id": mission_id}
			)
		)
	if status != MissionStatus.PAUSED and paused_at_month >= 0:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-041",
				"Nicht pausierte Mission enthält veraltete Pausendaten.",
				{"mission_id": mission_id, "status": status}
			)
		)
	for objective_id in objective_progress:
		if int(objective_progress[objective_id]) < 0:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-009",
					"Negativer Zielfortschritt ist unzulässig.",
					{"mission_id": mission_id, "objective_id": objective_id}
				)
			)
	if resume_checkpoint.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-061",
				"Mission besitzt keinen sicheren Wiederaufnahmepunkt.",
				{"mission_id": mission_id}
			)
		)
	var checkpoint_phase := str(resume_checkpoint.get("phase_id", ""))
	if checkpoint_phase.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-062",
				"Wiederaufnahmepunkt besitzt keine gültige Phase.",
				{"mission_id": mission_id}
			)
		)
	if not outcome_quality.is_empty():
		var score := float(outcome_quality.get("score", 0.0))
		if score < 0.0 or score > 1.0:
			return GameResult.failure(
				GameError.new(
					"MISSION-ERR-063",
					"Ergebnisqualität liegt außerhalb des gültigen Bereichs.",
					{"mission_id": mission_id, "score": score}
				)
			)
	return GameResult.success()


func duplicate_state() -> MissionInstanceState:
	var result := MissionInstanceState.from_dict(to_dict())
	if result.ok:
		return result.value
	return null
