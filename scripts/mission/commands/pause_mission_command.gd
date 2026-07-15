class_name PauseMissionCommand
extends GameCommand

var mission_id: String
var reason: String


func _init(
	p_mission_id: String, p_reason: String, p_transaction_id: String, p_actor_id: String = "player"
) -> void:
	super("mission.pause", p_transaction_id, p_actor_id)
	mission_id = p_mission_id
	reason = p_reason


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)
	var instance := state.get_mission(mission_id)
	if instance == null or not MissionStatus.can_pause(instance.status):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-055",
				"Mission kann in ihrem aktuellen Zustand nicht pausiert werden.",
				{
					"mission_id": mission_id,
					"status": instance.status if instance != null else "MISSING"
				}
			)
		)
	return GameResult.success()


func build_effects(_state: GameSessionState, _context: Dictionary) -> GameResult:
	return GameResult.success([SetMissionPauseEffect.new(mission_id, true, reason)])
