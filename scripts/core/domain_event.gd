class_name DomainEvent
extends RefCounted

var event_id: String
var event_type: String
var payload: Dictionary
var month_index: int


func _init(p_event_type: String, p_payload: Dictionary = {}, p_month_index: int = 0) -> void:
	event_id = "%s-%s" % [p_event_type, str(Time.get_ticks_usec())]
	event_type = p_event_type
	payload = p_payload.duplicate(true)
	month_index = p_month_index


func to_dict() -> Dictionary:
	return {
		"event_id": event_id,
		"event_type": event_type,
		"payload": payload.duplicate(true),
		"month_index": month_index,
	}
