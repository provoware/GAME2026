class_name RestoreMissionCheckpointCommand
extends GameCommand

var mission_id: String


func _init(
	p_mission_id: String, p_transaction_id: String, p_actor_id: String = "player"
) -> void:
	super("mission.restore_checkpoint", p_transaction_id, p_actor_id)
	mission_id = p_mission_id


func validate(state: GameSessionState, _context: Dictionary) -> GameResult:
	var instance := state.get_mission(mission_id)
	if instance == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-023",
				"Mission ist im Kampagnenzustand nicht vorhanden.",
				{"mission_id": mission_id}
			)
		)
	if MissionStatus.is_terminal(instance.status):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-066",
				"Abgeschlossene Mission kann nicht auf einen Zwischenstand zurückgesetzt werden.",
				{"mission_id": mission_id, "status": instance.status}
			)
		)
	if instance.resume_checkpoint.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-061",
				"Mission besitzt keinen sicheren Wiederaufnahmepunkt.",
				{"mission_id": mission_id}
			)
		)
	return GameResult.success()


func build_effects(_state: GameSessionState, _context: Dictionary) -> GameResult:
	return GameResult.success([RestoreMissionCheckpointEffect.new(mission_id)])
