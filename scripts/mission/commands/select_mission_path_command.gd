class_name SelectMissionPathCommand
extends GameCommand

var mission_id: String
var path_id: String


func _init(
	p_mission_id: String, p_path_id: String, p_transaction_id: String, p_actor_id: String = "player"
) -> void:
	super("mission.select_path", p_transaction_id, p_actor_id)
	mission_id = p_mission_id
	path_id = p_path_id


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)
	var instance := state.get_mission(mission_id)
	if instance == null or instance.status != MissionStatus.ACTIVE:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-029",
				"Missionspfad kann nur bei einer aktiven Mission gewählt werden.",
				{"mission_id": mission_id}
			)
		)
	if not instance.selected_paths.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-053",
				"Für diese Mission wurde bereits ein Lösungsweg gewählt.",
				{"mission_id": mission_id, "selected_paths": instance.selected_paths}
			)
		)

	var definition := registry.get_definition(mission_id)
	var phase_id := MissionRules.resolve_current_phase_id(definition, instance)
	var path := definition.path_by_id(phase_id, path_id)
	if path.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-054",
				"Missionspfad ist in der aktuellen Phase nicht verfügbar.",
				{"mission_id": mission_id, "phase_id": phase_id, "path_id": path_id}
			)
		)
	return MissionRules.evaluate_requirements(
		path.get("requirements", []) as Array, state, instance
	)


func build_effects(_state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var definition := registry.get_definition(mission_id)
	var instance := _state.get_mission(mission_id)
	var phase_id := MissionRules.resolve_current_phase_id(definition, instance)
	var path := definition.path_by_id(phase_id, path_id)
	var effects: Array = [SelectMissionPathEffect.new(mission_id, path_id)]
	var path_effects_result := MissionEffectFactory.create_many(
		path.get("selection_effects", []) as Array, "mission_path:%s:%s" % [mission_id, path_id]
	)
	if not path_effects_result.ok:
		return path_effects_result
	effects.append_array(path_effects_result.value)
	return GameResult.success(effects)
