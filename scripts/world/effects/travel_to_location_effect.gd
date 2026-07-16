class_name TravelToLocationEffect
extends GameEffect

var connection_id: String
var target_location_id: String
var duration_steps: int

func _init(p_connection_id: String, p_target_location_id: String, p_duration_steps: int) -> void:
	connection_id = p_connection_id
	target_location_id = p_target_location_id
	duration_steps = p_duration_steps

func apply(state: GameSessionState) -> GameResult:
	var previous_location := state.current_location_id
	state.current_location_id = target_location_id
	state.journal.append({
		"type": "world_travel",
		"connection_id": connection_id,
		"from_location_id": previous_location,
		"to_location_id": target_location_id,
		"duration_steps": duration_steps,
		"month_index": state.campaign_month_index,
	})
	var event := DomainEvent.new(
		"WorldLocationEntered",
		{"connection_id": connection_id, "from_location_id": previous_location, "location_id": target_location_id, "duration_steps": duration_steps},
		state.campaign_month_index
	)
	return GameResult.success({"events": [event]})
