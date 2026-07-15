class_name GameCommand
extends RefCounted

var command_id: String
var transaction_id: String
var actor_id: String


func _init(p_command_id: String, p_transaction_id: String, p_actor_id: String = "system") -> void:
	command_id = p_command_id
	transaction_id = p_transaction_id
	actor_id = p_actor_id


func validate(_state: GameSessionState, _context: Dictionary) -> GameResult:
	return GameResult.success()


func build_effects(_state: GameSessionState, _context: Dictionary) -> GameResult:
	return GameResult.success([])
