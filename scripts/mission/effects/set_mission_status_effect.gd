class_name SetMissionStatusEffect
extends GameEffect

var mission_id: String
var new_status: String
var outcome_id: String
var quality_data: Dictionary


func _init(
	p_mission_id: String,
	p_new_status: String,
	p_outcome_id: String = "",
	p_quality_data: Dictionary = {}
) -> void:
	mission_id = p_mission_id
	new_status = p_new_status
	outcome_id = p_outcome_id
	quality_data = p_quality_data.duplicate(true)


func apply(state: GameSessionState) -> GameResult:
	if not MissionStatus.is_valid(new_status):
		return GameResult.failure(
			GameError.new("MISSION-ERR-008", "Ungültiger Missionsstatus.", {"status": new_status})
		)

	var instance := state.get_mission(mission_id)
	if instance == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-023",
				"Mission ist im Kampagnenzustand nicht vorhanden.",
				{"mission_id": mission_id}
			)
		)

	var old_status := instance.status
	instance.status = new_status
	instance.outcome_id = outcome_id
	if MissionStatus.is_terminal(new_status):
		instance.completed_month = state.campaign_month_index
		instance.pause_reason = ""
		instance.paused_at_month = -1
		instance.outcome_quality = _normalized_quality()
		_archive_terminal_result(state, instance)

	state.journal.append(
		{
			"type": "mission_status_change",
			"mission_id": mission_id,
			"before": old_status,
			"after": new_status,
			"outcome_id": outcome_id,
			"quality": instance.outcome_quality.duplicate(true),
			"month_index": state.campaign_month_index,
		}
	)

	var event_type := "MissionStatusChanged"
	match new_status:
		MissionStatus.COMPLETED:
			event_type = "MissionCompleted"
		MissionStatus.PARTIAL_SUCCESS:
			event_type = "MissionPartiallyCompleted"
		MissionStatus.FAILED:
			event_type = "MissionFailed"
		MissionStatus.CANCELLED:
			event_type = "MissionCancelled"

	var event := DomainEvent.new(
		event_type,
		{
			"mission_id": mission_id,
			"before": old_status,
			"after": new_status,
			"outcome_id": outcome_id,
			"quality": instance.outcome_quality.duplicate(true),
		},
		state.campaign_month_index
	)
	return GameResult.success({"events": [event]})


func _normalized_quality() -> Dictionary:
	var result := quality_data.duplicate(true)
	result["score"] = clampf(float(result.get("score", 0.0)), 0.0, 1.0)
	result["grade"] = str(result.get("grade", MissionOutcomeEvaluator.GRADE_NONE))
	result["completed_objectives"] = maxi(0, int(result.get("completed_objectives", 0)))
	result["total_objectives"] = maxi(0, int(result.get("total_objectives", 0)))
	result["optional_completed"] = maxi(0, int(result.get("optional_completed", 0)))
	result["optional_total"] = maxi(0, int(result.get("optional_total", 0)))
	return result


func _archive_terminal_result(state: GameSessionState, instance: MissionInstanceState) -> void:
	for entry_value in state.mission_history:
		var entry: Dictionary = entry_value
		if (
			str(entry.get("mission_id", "")) == mission_id
			and int(entry.get("completed_month", -1)) == instance.completed_month
		):
			return

	state.mission_history.append(
		{
			"mission_id": mission_id,
			"status": new_status,
			"outcome_id": outcome_id,
			"quality_score": float(instance.outcome_quality.get("score", 0.0)),
			"quality_grade": str(instance.outcome_quality.get("grade", "")),
			"started_month": instance.started_month,
			"completed_month": instance.completed_month,
			"duration_months": maxi(0, instance.completed_month - instance.started_month),
			"selected_paths": instance.selected_paths.duplicate(),
			"visited_phases": instance.visited_phases.duplicate(),
			"failure_reasons": instance.failure_reasons.duplicate(),
		}
	)
