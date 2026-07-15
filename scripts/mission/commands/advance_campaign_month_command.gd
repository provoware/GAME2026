class_name AdvanceCampaignMonthCommand
extends GameCommand

var amount: int


func _init(p_amount: int, p_transaction_id: String, p_actor_id: String = "system") -> void:
	super("world.advance_month", p_transaction_id, p_actor_id)
	amount = p_amount


func validate(_state: GameSessionState, context: Dictionary) -> GameResult:
	if amount <= 0:
		return GameResult.failure(
			GameError.new(
				"WORLD-ERR-013", "Monatsfortschritt muss positiv sein.", {"amount": amount}
			)
		)
	if context.get("mission_registry") as MissionRegistry == null:
		return GameResult.failure(
			GameError.new("MISSION-ERR-060", "Missionsregistry fehlt im Ausführungskontext.")
		)
	return GameResult.success()


func build_effects(state: GameSessionState, context: Dictionary) -> GameResult:
	var registry: MissionRegistry = context["mission_registry"] as MissionRegistry
	var projected_month := state.campaign_month_index + amount
	var effects: Array = [ModifyCampaignMonthEffect.new(amount)]

	for mission_id in state.missions:
		var instance := state.get_mission(str(mission_id))
		if instance == null or MissionStatus.is_terminal(instance.status):
			continue
		var definition := registry.get_definition(str(mission_id))
		if definition == null or instance.deadline_month < 0:
			continue
		if projected_month < instance.deadline_month:
			continue
		if instance.status == MissionStatus.PAUSED and definition.pause_extends_deadline():
			continue

		var ratio := MissionRules.required_completion_ratio(definition, instance)
		var threshold := definition.partial_success_threshold()
		if (
			threshold > 0.0
			and ratio >= threshold
			and not definition.partial_success_effects.is_empty()
		):
			effects.append(AddMissionFailureReasonEffect.new(definition.id, "deadline_partial"))
			effects.append(
				SetMissionStatusEffect.new(
					definition.id, MissionStatus.PARTIAL_SUCCESS, "partial_deadline"
				)
			)
			var partial_result := MissionEffectFactory.create_many(
				definition.partial_success_effects, "mission_partial:%s" % definition.id
			)
			if not partial_result.ok:
				return partial_result
			effects.append_array(partial_result.value)
		else:
			effects.append(AddMissionFailureReasonEffect.new(definition.id, "deadline_expired"))
			effects.append(
				SetMissionStatusEffect.new(definition.id, MissionStatus.FAILED, "deadline_expired")
			)
			var failure_result := MissionEffectFactory.create_many(
				definition.failure_effects, "mission_failure:%s" % definition.id
			)
			if not failure_result.ok:
				return failure_result
			effects.append_array(failure_result.value)

	return GameResult.success(effects)
