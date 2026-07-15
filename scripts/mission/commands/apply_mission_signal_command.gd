class_name ApplyMissionSignalCommand
extends GameCommand

var signal_type: String
var payload: Dictionary


func _init(
	p_signal_type: String,
	p_payload: Dictionary,
	p_transaction_id: String,
	p_actor_id: String = "system"
) -> void:
	super("mission.apply_signal", p_transaction_id, p_actor_id)
	signal_type = p_signal_type
	payload = p_payload.duplicate(true)


func validate(_state: GameSessionState, context: Dictionary) -> GameResult:
	if signal_type.strip_edges().is_empty():
		return GameResult.failure(
			GameError.new("MISSION-ERR-059", "Missionssignal benötigt einen Typ.")
		)
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null:
		return GameResult.failure(
			GameError.new("MISSION-ERR-060", "Missionsregistry fehlt im Ausführungskontext.")
		)
	return GameResult.success()


func build_effects(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var effects: Array = []

	for mission_id in state.missions:
		var instance := state.get_mission(str(mission_id))
		if instance == null or MissionStatus.is_terminal(instance.status):
			continue
		var definition := registry.get_definition(str(mission_id))
		if definition == null:
			continue

		if definition.has_pause_signal(signal_type) and instance.status == MissionStatus.ACTIVE:
			effects.append(
				SetMissionPauseEffect.new(definition.id, true, "signal:%s" % signal_type)
			)
			continue

		if instance.status != MissionStatus.ACTIVE:
			continue

		var phase_id := MissionRules.resolve_current_phase_id(definition, instance)
		for objective_value in definition.applicable_objectives(phase_id, instance.selected_paths):
			var objective: Dictionary = objective_value
			var trigger: Dictionary = objective.get("trigger", {}) as Dictionary
			if trigger.is_empty() or not MissionRules.signal_matches(trigger, signal_type, payload):
				continue

			var amount := MissionRules.objective_progress_amount(objective, payload)
			var plan_result := MissionProgressPlanner.plan_objective_advance(
				definition, instance, str(objective.get("id", "")), amount, state
			)
			if not plan_result.ok:
				return plan_result
			effects.append_array((plan_result.value as Dictionary).get("effects", []))
			break

	return GameResult.success(effects)
