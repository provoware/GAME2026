class_name RestoreMissionCheckpointEffect
extends GameEffect

var mission_id: String


func _init(p_mission_id: String) -> void:
	mission_id = p_mission_id


func apply(state: GameSessionState) -> GameResult:
	var instance := state.get_mission(mission_id)
	if instance == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-023",
				"Mission ist im Kampagnenzustand nicht vorhanden.",
				{"mission_id": mission_id}
			)
		)

	var before := {
		"status": instance.status,
		"phase_id": instance.current_phase_id,
		"objective_progress": instance.objective_progress.duplicate(true),
	}
	var restore_result := instance.restore_checkpoint()
	if not restore_result.ok:
		return restore_result

	state.journal.append(
		{
			"type": "mission_checkpoint_restored",
			"mission_id": mission_id,
			"before": before,
			"after": instance.resume_checkpoint.duplicate(true),
			"month_index": state.campaign_month_index,
		}
	)
	var event := DomainEvent.new(
		"MissionCheckpointRestored",
		{
			"mission_id": mission_id,
			"phase_id": instance.current_phase_id,
			"checkpoint": instance.resume_checkpoint.duplicate(true),
		},
		state.campaign_month_index
	)
	return GameResult.success({"events": [event]})
