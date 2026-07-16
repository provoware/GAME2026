class_name SetMissionPauseEffect
extends GameEffect

var mission_id: String
var pause: bool
var reason: String
var extend_deadline: bool


func _init(
	p_mission_id: String, p_pause: bool, p_reason: String = "", p_extend_deadline: bool = false
) -> void:
	mission_id = p_mission_id
	pause = p_pause
	reason = p_reason
	extend_deadline = p_extend_deadline


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

	var old_status := instance.status
	if pause:
		instance.capture_checkpoint(
			instance.current_phase_id, state.campaign_month_index, "mission_paused"
		)
		instance.status = MissionStatus.PAUSED
		instance.pause_reason = reason
		instance.paused_at_month = state.campaign_month_index
	else:
		if extend_deadline and instance.deadline_month >= 0 and instance.paused_at_month >= 0:
			var paused_duration := maxi(0, state.campaign_month_index - instance.paused_at_month)
			instance.deadline_month += paused_duration
			instance.accumulated_paused_months += paused_duration
		instance.status = MissionStatus.ACTIVE
		instance.pause_reason = ""
		instance.paused_at_month = -1

	state.journal.append(
		{
			"type": "mission_pause_change",
			"mission_id": mission_id,
			"before": old_status,
			"after": instance.status,
			"reason": reason,
			"deadline_month": instance.deadline_month,
			"checkpoint": instance.resume_checkpoint.duplicate(true),
			"month_index": state.campaign_month_index,
		}
	)
	var event_type := "MissionPaused" if pause else "MissionResumed"
	var event := DomainEvent.new(
		event_type,
		{
			"mission_id": mission_id,
			"reason": reason,
			"deadline_month": instance.deadline_month,
			"checkpoint": instance.resume_checkpoint.duplicate(true),
		},
		state.campaign_month_index
	)
	return GameResult.success({"events": [event]})
