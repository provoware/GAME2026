class_name StartMissionCommand
extends GameCommand

var mission_id: String


func _init(p_mission_id: String, p_transaction_id: String, p_actor_id: String = "player") -> void:
	super("mission.start", p_transaction_id, p_actor_id)
	mission_id = p_mission_id


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)
	if state.missions.has(mission_id):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-027", "Mission wurde bereits gestartet.", {"mission_id": mission_id}
			)
		)

	var definition := registry.get_definition(mission_id)
	return MissionRules.evaluate_requirements(definition.start_requirements, state)


func build_effects(_state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var definition := registry.get_definition(mission_id)
	var effects: Array = [AddMissionInstanceEffect.new(definition)]

	var costs_result := MissionEffectFactory.create_many(
		definition.start_costs, "mission_start:%s" % mission_id
	)
	if not costs_result.ok:
		return costs_result
	effects.append_array(costs_result.value)

	var start_phase := definition.phase_by_id(definition.start_phase_id)
	var phase_start_result := MissionEffectFactory.create_many(
		start_phase.get("start_effects", []) as Array,
		"mission_phase_start:%s:%s" % [mission_id, definition.start_phase_id]
	)
	if not phase_start_result.ok:
		return phase_start_result
	effects.append_array(phase_start_result.value)
	return GameResult.success(effects)
