class_name ModifyCampaignMonthEffect
extends GameEffect

var amount: int


func _init(p_amount: int) -> void:
	amount = p_amount


func apply(state: GameSessionState) -> GameResult:
	if amount <= 0:
		return GameResult.failure(
			GameError.new(
				"WORLD-ERR-013", "Monatsfortschritt muss positiv sein.", {"amount": amount}
			)
		)
	var before := state.campaign_month_index
	state.campaign_month_index += amount
	(
		state
		. journal
		. append(
			{
				"type": "campaign_month_advanced",
				"before": before,
				"after": state.campaign_month_index,
			}
		)
	)
	var event := (
		DomainEvent
		. new(
			"CampaignMonthAdvanced",
			{
				"before": before,
				"after": state.campaign_month_index,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
