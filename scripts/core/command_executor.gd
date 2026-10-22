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
		var previous_summary: Dictionary = state.processed_transactions[command.transaction_id]
		if _transaction_conflicts(command, previous_summary):
			return GameResult.failure(
				GameError.new(
					"CORE-ERR-004",
					"Transaktions-ID wurde bereits für einen anderen Command verwendet.",
					{
						"transaction_id": command.transaction_id,
						"previous_command_id": previous_summary.get("command_id", ""),
						"command_id": command.command_id,
					}
				)
			)
		return (
			GameResult
			. success(
				{
					"duplicate": true,
					"summary": previous_summary,
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


func _transaction_conflicts(command: GameCommand, previous_summary: Dictionary) -> bool:
	var previous_command_id := str(previous_summary.get("command_id", ""))
	var previous_actor_id := str(previous_summary.get("actor_id", ""))
	return (
		(not previous_command_id.is_empty() and previous_command_id != command.command_id)
		or (not previous_actor_id.is_empty() and previous_actor_id != command.actor_id)
	)
