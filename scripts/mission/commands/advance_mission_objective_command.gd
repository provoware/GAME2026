class_name AdvanceMissionObjectiveCommand
extends GameCommand

var mission_id: String
var objective_id: String
var amount: int


func _init(
	p_mission_id: String,
	p_objective_id: String,
	p_amount: int,
	p_transaction_id: String,
	p_actor_id: String = "player"
) -> void:
	super("mission.advance_objective", p_transaction_id, p_actor_id)
	mission_id = p_mission_id
	objective_id = p_objective_id
	amount = p_amount


func validate(state: GameSessionState, context: Dictionary) -> GameResult:
	if amount <= 0:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-028", "Zielfortschritt muss positiv sein.", {"amount": amount}
			)
		)

	var registry: MissionRegistry = context.get("mission_registry") as MissionRegistry
	if registry == null or not registry.has_definition(mission_id):
		return GameResult.failure(
			GameError.new("MISSION-ERR-026", "Unbekannte Mission.", {"mission_id": mission_id})
		)

	var instance := state.get_mission(mission_id)
	if instance == null or not MissionStatus.can_progress(instance.status):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-029",
				"Mission ist nicht aktiv.",
				{
					"mission_id": mission_id,
					"status": instance.status if instance != null else "MISSING"
				}
			)
		)

	var definition := registry.get_definition(mission_id)
	var phase_id := MissionRules.resolve_current_phase_id(definition, instance)
	var objective := definition.objective_by_id(objective_id, phase_id)
	if objective.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-030",
				"Unbekanntes Ziel in der aktuellen Missionsphase.",
				{"mission_id": mission_id, "phase_id": phase_id, "objective_id": objective_id}
			)
		)
	if not MissionRules.objective_is_applicable(objective, instance):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-050",
				"Missionsziel gehört nicht zum gewählten Lösungsweg.",
				{"mission_id": mission_id, "objective_id": objective_id}
			)
		)

	return GameResult.success()


func build_effects(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var definition := registry.get_definition(mission_id)
	var instance := state.get_mission(mission_id)
	var plan_result := MissionProgressPlanner.plan_objective_advance(
		definition, instance, objective_id, amount, state
	)
	if not plan_result.ok:
		return plan_result
	return GameResult.success((plan_result.value as Dictionary).get("effects", []))
