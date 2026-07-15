class_name AddMissionFailureReasonEffect
extends GameEffect

var mission_id: String
var reason: String


func _init(p_mission_id: String, p_reason: String) -> void:
	mission_id = p_mission_id
	reason = p_reason


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
	if not instance.failure_reasons.has(reason):
		instance.failure_reasons.append(reason)
	return GameResult.success({"events": []})
