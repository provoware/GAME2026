class_name ResumeMissionCommand
extends GameCommand

var mission_id: String


func _init(p_mission_id: String, p_transaction_id: String, p_actor_id: String = "player") -> void:
	super("mission.resume", p_transaction_id, p_actor_id)
	mission_id = p_mission_id


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)
	var instance := state.get_mission(mission_id)
	if instance == null or instance.status != MissionStatus.PAUSED:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-056",
				"Nur eine pausierte Mission kann fortgesetzt werden.",
				{
					"mission_id": mission_id,
					"status": instance.status if instance != null else "MISSING"
				}
			)
		)
	if instance.deadline_month >= 0 and state.campaign_month_index >= instance.deadline_month:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-057",
				"Mission kann nach Ablauf ihrer absoluten Frist nicht fortgesetzt werden.",
				{"mission_id": mission_id, "deadline_month": instance.deadline_month}
			)
		)
	return GameResult.success()


func build_effects(_state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var definition := registry.get_definition(mission_id)
	return GameResult.success(
		[SetMissionPauseEffect.new(mission_id, false, "", definition.pause_extends_deadline())]
	)
