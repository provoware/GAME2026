class_name SetFlagEffect
extends GameEffect

var flag_id: String
var value: Variant


func _init(p_flag_id: String, p_value: Variant) -> void:
	flag_id = p_flag_id
	value = p_value


func apply(state: GameSessionState) -> GameResult:
	var before: Variant = state.flags.get(flag_id)
	state.flags[flag_id] = value
	var event := (
		DomainEvent
		. new(
			"FlagChanged",
			{
				"flag_id": flag_id,
				"before": before,
				"after": value,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
