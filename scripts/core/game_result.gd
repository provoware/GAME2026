class_name GameResult
extends RefCounted

var ok: bool
var value: Variant
var errors: Array
var warnings: Array[String]


func _init(
	p_ok: bool, p_value: Variant = null, p_errors: Array = [], p_warnings: Array[String] = []
) -> void:
	ok = p_ok
	value = p_value
	errors = p_errors.duplicate()
	warnings = p_warnings.duplicate()


static func success(p_value: Variant = null, p_warnings: Array[String] = []) -> GameResult:
	return GameResult.new(true, p_value, [], p_warnings)


static func failure(error: GameError) -> GameResult:
	return GameResult.new(false, null, [error], [])


static func failure_many(p_errors: Array) -> GameResult:
	return GameResult.new(false, null, p_errors, [])


func first_error_message() -> String:
	if errors.is_empty():
		return "Unbekannter Fehler."
	var error: GameError = errors[0]
	return "%s: %s" % [error.code, error.message]
