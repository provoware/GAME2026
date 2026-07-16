class_name TravelToLocationCommand
extends GameCommand

var target_location_id: String


func _init(
	p_target_location_id: String,
	p_transaction_id: String,
	p_actor_id: String = "player"
) -> void:
	super("world.travel", p_transaction_id, p_actor_id)
	target_location_id = p_target_location_id


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	var world_registry: WorldRegistry = context.get("world_registry") as WorldRegistry
	if world_registry == null or world_registry.definition() == null:
		return GameResult.failure(
			GameError.new("WORLD-ERR-007", "Weltregistry fehlt im Ausführungskontext.")
		)
	var definition := world_registry.definition()
	if definition.location(target_location_id).is_empty():
		return GameResult.failure(
			GameError.new(
				"WORLD-ERR-008",
				"Zielort ist unbekannt.",
				{"location_id": target_location_id}
			)
		)
	if target_location_id == state.current_location_id:
		return GameResult.failure(
			GameError.new("WORLD-ERR-009", "Spieler befindet sich bereits am Zielort.")
		)
	var connection := definition.connection(state.current_location_id, target_location_id)
	if connection.is_empty():
		return GameResult.failure(
			GameError.new(
				"WORLD-ERR-010",
				"Zwischen den Orten existiert keine direkte Verbindung.",
				{"from": state.current_location_id, "to": target_location_id}
			)
		)
	for requirement_value in connection.get("requirements", []):
		var requirement: Dictionary = requirement_value
		if str(requirement.get("type", "")) == "flag_equals":
			var flag_id := str(requirement.get("flag_id", ""))
			var actual: Variant = state.flags.get(flag_id)
			if actual != requirement.get("value"):
				return GameResult.failure(
					GameError.new(
						"WORLD-ERR-014",
						"Reisevoraussetzung ist nicht erfüllt.",
						{"requirement": requirement}
					)
				)
	for cost_value in connection.get("costs", []):
		var cost: Dictionary = cost_value
		var resource_id := str(cost.get("resource_id", ""))
		var amount := int(cost.get("amount", 0))
		if state.resource_amount(resource_id) < amount:
			return GameResult.failure(
				GameError.new(
					"WORLD-ERR-015",
					"Ressourcen reichen für die Reise nicht aus.",
					{"resource_id": resource_id, "required": amount}
				)
			)
	return GameResult.success()


func build_effects(state: GameSessionState, context: Dictionary) -> GameResult:
	var world_registry: WorldRegistry = context["world_registry"] as WorldRegistry
	var definition := world_registry.definition()
	var connection := definition.connection(state.current_location_id, target_location_id)
	var effects: Array = []
	for cost_value in connection.get("costs", []):
		var cost: Dictionary = cost_value
		effects.append(
			ModifyResourceEffect.new(
				str(cost.get("resource_id", "")),
				-int(cost.get("amount", 0)),
				"world_travel"
			)
		)
	effects.append(
		TravelToLocationEffect.new(
			str(connection.get("id", "")),
			target_location_id,
			int(connection.get("duration_steps", 1))
		)
	)
	var mission_registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if mission_registry != null:
		var signal_command := ApplyMissionSignalCommand.new(
			"world.location_entered",
			{"location_id": target_location_id},
			"%s:mission-signal" % transaction_id,
			actor_id
		)
		var mission_effects := signal_command.build_effects(state, context)
		if not mission_effects.ok:
			return mission_effects
		effects.append_array(mission_effects.value)
	return GameResult.success(effects)
