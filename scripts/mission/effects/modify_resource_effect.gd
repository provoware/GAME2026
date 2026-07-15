class_name ModifyResourceEffect
extends GameEffect

var resource_id: String
var amount: int
var reason: String


func _init(p_resource_id: String, p_amount: int, p_reason: String = "") -> void:
	resource_id = p_resource_id
	amount = p_amount
	reason = p_reason


func apply(state: GameSessionState) -> GameResult:
	var before := state.resource_amount(resource_id)
	var after := before + amount
	if resource_id != "resource.money" and after < 0:
		return GameResult.failure(
			GameError.new(
				"ECON-ERR-002",
				"Ressource reicht für die Transaktion nicht aus.",
				{"resource_id": resource_id, "required_change": amount, "available": before}
			)
		)
	if resource_id == "resource.money" and after < 0:
		return GameResult.failure(
			GameError.new(
				"ECON-ERR-002",
				"Kohle reicht für die Transaktion nicht aus.",
				{"resource_id": resource_id, "required_change": amount, "available": before}
			)
		)

	state.resources[resource_id] = after
	(
		state
		. journal
		. append(
			{
				"type": "resource_change",
				"resource_id": resource_id,
				"amount": amount,
				"before": before,
				"after": after,
				"reason": reason,
				"month_index": state.campaign_month_index,
			}
		)
	)
	var event := (
		DomainEvent
		. new(
			"ResourceChanged",
			{
				"resource_id": resource_id,
				"amount": amount,
				"before": before,
				"after": after,
				"reason": reason,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
