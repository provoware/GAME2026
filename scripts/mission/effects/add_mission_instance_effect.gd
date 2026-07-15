class_name AddMissionInstanceEffect
extends GameEffect

var definition: MissionDefinition


func _init(p_definition: MissionDefinition) -> void:
	definition = p_definition


func apply(state: GameSessionState) -> GameResult:
	if state.missions.has(definition.id):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-022",
				"Mission existiert bereits im Kampagnenzustand.",
				{"mission_id": definition.id}
			)
		)

	state.missions[definition.id] = MissionInstanceState.create(
		definition, state.campaign_month_index
	)
	var event := DomainEvent.new(
		"MissionStarted", {"mission_id": definition.id}, state.campaign_month_index
	)
	return GameResult.success({"events": [event]})
