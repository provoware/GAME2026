class_name AdvanceObjectiveEffect
extends GameEffect

var mission_id: String
var objective_id: String
var amount: int
var target: int


func _init(p_mission_id: String, p_objective_id: String, p_amount: int, p_target: int) -> void:
	mission_id = p_mission_id
	objective_id = p_objective_id
	amount = p_amount
	target = p_target


func apply(state: GameSessionState) -> GameResult:
	var instance := state.get_mission(mission_id)
	if instance == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-023",
				"Mission ist im Kampagnenzustand nicht vorhanden.",
				{"mission_id": mission_id}
			)
		)

	var before := int(instance.objective_progress.get(objective_id, 0))
	var after := clampi(before + amount, 0, target)
	instance.objective_progress[objective_id] = after
	(
		state
		. journal
		. append(
			{
				"type": "mission_objective_progress",
				"mission_id": mission_id,
				"objective_id": objective_id,
				"before": before,
				"after": after,
				"target": target,
				"month_index": state.campaign_month_index,
			}
		)
	)
	var event := (
		DomainEvent
		. new(
			"MissionObjectiveAdvanced",
			{
				"mission_id": mission_id,
				"objective_id": objective_id,
				"before": before,
				"after": after,
				"target": target,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
