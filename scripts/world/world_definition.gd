class_name WorldDefinition
extends RefCounted

var id: String
var title: String
var start_location_id: String
var locations: Dictionary = {}
var connections: Array = []


static func from_dict(data: Dictionary) -> GameResult:
	var definition := WorldDefinition.new()
	definition.id = str(data.get("id", ""))
	definition.title = str(data.get("title", ""))
	definition.start_location_id = str(data.get("start_location_id", ""))
	for location_value in data.get("locations", []):
		var location: Dictionary = location_value
		var location_id := str(location.get("id", ""))
		if location_id.is_empty() or definition.locations.has(location_id):
			return GameResult.failure(
				GameError.new(
					"WORLD-ERR-001",
					"Orts-ID fehlt oder ist doppelt.",
					{"location_id": location_id}
				)
			)
		definition.locations[location_id] = location.duplicate(true)
	definition.connections = (data.get("connections", []) as Array).duplicate(true)
	if definition.id.is_empty() or not definition.locations.has(definition.start_location_id):
		return GameResult.failure(
			GameError.new("WORLD-ERR-002", "Weltdefinition besitzt keinen gültigen Startort.")
		)
	for connection_value in definition.connections:
		var connection: Dictionary = connection_value
		var source := str(connection.get("from_location_id", ""))
		var target := str(connection.get("to_location_id", ""))
		if not definition.locations.has(source) or not definition.locations.has(target):
			return GameResult.failure(
				GameError.new(
					"WORLD-ERR-003",
					"Verbindung verweist auf unbekannten Ort.",
					{"connection": connection}
				)
			)
	return GameResult.success(definition)


func location(location_id: String) -> Dictionary:
	return (locations.get(location_id, {}) as Dictionary).duplicate(true)


func connection(from_id: String, to_id: String) -> Dictionary:
	for value in connections:
		var candidate: Dictionary = value
		var source := str(candidate.get("from_location_id", ""))
		var target := str(candidate.get("to_location_id", ""))
		if source == from_id and target == to_id:
			return candidate.duplicate(true)
		if bool(candidate.get("bidirectional", false)) and source == to_id and target == from_id:
			return candidate.duplicate(true)
	return {}


func outgoing(location_id: String) -> Array:
	var result: Array = []
	for value in connections:
		var candidate: Dictionary = value
		var source := str(candidate.get("from_location_id", ""))
		var target := str(candidate.get("to_location_id", ""))
		if source == location_id:
			result.append(candidate.duplicate(true))
		elif bool(candidate.get("bidirectional", false)) and target == location_id:
			result.append(candidate.duplicate(true))
	return result
