class_name MissionOutcomeEvaluator
extends RefCounted

const GRADE_NONE := "NONE"
const GRADE_FRAGMENT := "FRAGMENT"
const GRADE_BRONZE := "BRONZE"
const GRADE_SILVER := "SILVER"
const GRADE_GOLD := "GOLD"


static func evaluate(definition: MissionDefinition, instance: MissionInstanceState) -> Dictionary:
	var total_objectives := 0
	var completed_objectives := 0
	var optional_total := 0
	var optional_completed := 0

	for phase_value in definition.phases:
		var phase: Dictionary = phase_value
		var phase_id := str(phase.get("id", ""))
		for objective_value in definition.applicable_objectives(
			phase_id, instance.selected_paths
		):
			var objective: Dictionary = objective_value
			var objective_id := str(objective.get("id", ""))
			var target := maxi(1, int(objective.get("target", 1)))
			var progress := clampi(
				int(instance.objective_progress.get(objective_id, 0)), 0, target
			)
			total_objectives += 1
			if progress >= target:
				completed_objectives += 1
			if not bool(objective.get("required", true)):
				optional_total += 1
				if progress >= target:
					optional_completed += 1

	var score := 0.0
	if total_objectives > 0:
		score = float(completed_objectives) / float(total_objectives)

	return {
		"score": snappedf(clampf(score, 0.0, 1.0), 0.001),
		"grade": _grade_for_score(score),
		"completed_objectives": completed_objectives,
		"total_objectives": total_objectives,
		"optional_completed": optional_completed,
		"optional_total": optional_total,
	}


static func _grade_for_score(score: float) -> String:
	if score >= 0.999:
		return GRADE_GOLD
	if score >= 0.75:
		return GRADE_SILVER
	if score >= 0.5:
		return GRADE_BRONZE
	if score > 0.0:
		return GRADE_FRAGMENT
	return GRADE_NONE
