class_name MissionProgressPlanner
extends RefCounted


static func plan_objective_advance(
	definition: MissionDefinition,
	instance: MissionInstanceState,
	objective_id: String,
	amount: int,
	state: GameSessionState
) -> GameResult:
	var phase_id := MissionRules.resolve_current_phase_id(definition, instance)
	var objective := definition.objective_by_id(objective_id, phase_id)
	if objective.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-030",
				"Missionsziel gehört nicht zur aktuellen Phase.",
				{"mission_id": definition.id, "phase_id": phase_id, "objective_id": objective_id}
			)
		)
	if not MissionRules.objective_is_applicable(objective, instance):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-050",
				"Missionsziel gehört nicht zum gewählten Lösungsweg.",
				{
					"mission_id": definition.id,
					"objective_id": objective_id,
					"selected_paths": instance.selected_paths
				}
			)
		)

	var target := int(objective.get("target", 1))
	var effects: Array = [AdvanceObjectiveEffect.new(definition.id, objective_id, amount, target)]
	var projected := instance.duplicate_state()
	if projected == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-051",
				"Missionszustand konnte für Fortschrittsplanung nicht kopiert werden.",
				{"mission_id": definition.id}
			)
		)

	projected.current_phase_id = phase_id
	projected.objective_progress[objective_id] = clampi(
		int(projected.objective_progress.get(objective_id, 0)) + amount, 0, target
	)

	if not MissionRules.all_required_objectives_complete(definition, projected, phase_id):
		return GameResult.success({"effects": effects, "projected_instance": projected})

	var phase := definition.phase_by_id(phase_id)
	var phase_effects_result := MissionEffectFactory.create_many(
		phase.get("completion_effects", []) as Array,
		"mission_phase_complete:%s:%s" % [definition.id, phase_id]
	)
	if not phase_effects_result.ok:
		return phase_effects_result
	effects.append_array(phase_effects_result.value)

	var next_phase_id := definition.next_phase_for(phase_id, projected.selected_paths)
	if not next_phase_id.is_empty():
		effects.append(SetMissionPhaseEffect.new(definition.id, next_phase_id))
		projected.current_phase_id = next_phase_id
		if not projected.visited_phases.has(next_phase_id):
			projected.visited_phases.append(next_phase_id)
		projected.capture_checkpoint(next_phase_id, state.campaign_month_index, "phase_entered")

		var next_phase := definition.phase_by_id(next_phase_id)
		var start_effects_result := MissionEffectFactory.create_many(
			next_phase.get("start_effects", []) as Array,
			"mission_phase_start:%s:%s" % [definition.id, next_phase_id]
		)
		if not start_effects_result.ok:
			return start_effects_result
		effects.append_array(start_effects_result.value)
	else:
		var quality := MissionOutcomeEvaluator.evaluate(definition, projected)
		effects.append(
			SetMissionStatusEffect.new(
				definition.id, MissionStatus.COMPLETED, "success", quality
			)
		)
		projected.status = MissionStatus.COMPLETED
		projected.outcome_id = "success"
		projected.outcome_quality = quality.duplicate(true)
		projected.completed_month = state.campaign_month_index

		var rewards_result := MissionEffectFactory.create_many(
			definition.success_effects, "mission_success:%s" % definition.id
		)
		if not rewards_result.ok:
			return rewards_result
		effects.append_array(rewards_result.value)

	return GameResult.success({"effects": effects, "projected_instance": projected})
