class_name GameError
extends RefCounted

var code: String
var message: String
var details: Dictionary


func _init(p_code: String, p_message: String, p_details: Dictionary = {}) -> void:
	code = p_code
	message = p_message
	details = p_details.duplicate(true)


func to_dict() -> Dictionary:
	return {
		"code": code,
		"message": message,
		"details": details.duplicate(true),
	}
