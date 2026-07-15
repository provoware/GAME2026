class_name CommandExecutor
extends RefCounted

var _event_bus: DomainEventBus
var _transaction := EffectTransaction.new()


func _init(event_bus: DomainEventBus) -> void:
	_event_bus = event_bus


func execute(command: GameCommand, state: GameSessionState, context: Dictionary) -> GameResult:
	if command.transaction_id.strip_edges().is_empty():
		return GameResult.failure(
			GameError.new("CORE-ERR-003", "Command besitzt keine Transaktions-ID.")
		)

	if state.has_processed_transaction(command.transaction_id):
		return (
			GameResult
			. success(
				{
					"duplicate": true,
					"summary": state.processed_transactions[command.transaction_id],
				},
				["Transaktion wurde bereits verarbeitet."]
			)
		)

	var validation := command.validate(state, context)
	if not validation.ok:
		return validation

	var effects_result := command.build_effects(state, context)
	if not effects_result.ok:
		return effects_result

	var transaction_result := _transaction.execute(effects_result.value, state)
	if not transaction_result.ok:
		return transaction_result

	var summary := {
		"command_id": command.command_id,
		"actor_id": command.actor_id,
		"month_index": state.campaign_month_index,
	}
	state.mark_transaction_processed(command.transaction_id, summary)
	_event_bus.publish_many(transaction_result.value.get("events", []))

	return (
		GameResult
		. success(
			{
				"duplicate": false,
				"summary": summary,
				"events": transaction_result.value.get("events", []),
			}
		)
	)
