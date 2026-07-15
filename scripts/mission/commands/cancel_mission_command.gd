class_name CancelMissionCommand
extends GameCommand

var mission_id: String
var reason: String


func _init(
	p_mission_id: String, p_reason: String, p_transaction_id: String, p_actor_id: String = "player"
) -> void:
	super("mission.cancel", p_transaction_id, p_actor_id)
	mission_id = p_mission_id
	reason = p_reason


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)
	var instance := state.get_mission(mission_id)
	if instance == null or MissionStatus.is_terminal(instance.status):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-058",
				"Mission kann nicht mehr abgebrochen werden.",
				{
					"mission_id": mission_id,
					"status": instance.status if instance != null else "MISSING"
				}
			)
		)
	return GameResult.success()


func build_effects(_state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var definition := registry.get_definition(mission_id)
	var effects: Array = [
		AddMissionFailureReasonEffect.new(mission_id, reason),
		SetMissionStatusEffect.new(mission_id, MissionStatus.CANCELLED, "cancelled"),
	]
	var cancel_effects_result := MissionEffectFactory.create_many(
		definition.cancel_effects, "mission_cancel:%s" % mission_id
	)
	if not cancel_effects_result.ok:
		return cancel_effects_result
	effects.append_array(cancel_effects_result.value)
	return GameResult.success(effects)
