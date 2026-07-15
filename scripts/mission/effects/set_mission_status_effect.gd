class_name SetMissionStatusEffect
extends GameEffect

var mission_id: String
var new_status: String
var outcome_id: String


func _init(p_mission_id: String, p_new_status: String, p_outcome_id: String = "") -> void:
	mission_id = p_mission_id
	new_status = p_new_status
	outcome_id = p_outcome_id


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

	(
		state
		. journal
		. append(
			{
				"type": "mission_status_change",
				"mission_id": mission_id,
				"before": old_status,
				"after": new_status,
				"outcome_id": outcome_id,
				"month_index": state.campaign_month_index,
			}
		)
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

	var event := (
		DomainEvent
		. new(
			event_type,
			{
				"mission_id": mission_id,
				"before": old_status,
				"after": new_status,
				"outcome_id": outcome_id,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
