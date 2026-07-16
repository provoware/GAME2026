class_name SetMissionPhaseEffect
extends GameEffect

var mission_id: String
var new_phase_id: String


func _init(p_mission_id: String, p_new_phase_id: String) -> void:
	mission_id = p_mission_id
	new_phase_id = p_new_phase_id


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
	if new_phase_id.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-052",
				"Neue Missionsphase darf nicht leer sein.",
				{"mission_id": mission_id}
			)
		)

	var old_phase_id := instance.current_phase_id
	instance.current_phase_id = new_phase_id
	if not instance.visited_phases.has(new_phase_id):
		instance.visited_phases.append(new_phase_id)
	instance.capture_checkpoint(new_phase_id, state.campaign_month_index, "phase_entered")
	state.journal.append(
		{
			"type": "mission_phase_change",
			"mission_id": mission_id,
			"before": old_phase_id,
			"after": new_phase_id,
			"checkpoint": instance.resume_checkpoint.duplicate(true),
			"month_index": state.campaign_month_index,
		}
	)
	var event := DomainEvent.new(
		"MissionPhaseChanged",
		{
			"mission_id": mission_id,
			"before": old_phase_id,
			"after": new_phase_id,
			"checkpoint": instance.resume_checkpoint.duplicate(true),
		},
		state.campaign_month_index
	)
	return GameResult.success({"events": [event]})
