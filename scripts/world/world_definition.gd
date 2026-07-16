class_name WorldDefinition
extends RefCounted

var id: String
var title: String
var start_location_id: String
var locations: Dictionary = {}
var routes: Array = []


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
				GameError.new("WORLD-ERR-001", "Orts-ID fehlt oder ist doppelt.", {"location_id": location_id})
			)
		definition.locations[location_id] = location.duplicate(true)
	definition.routes = (data.get("routes", []) as Array).duplicate(true)
	if definition.id.is_empty() or not definition.locations.has(definition.start_location_id):
		return GameResult.failure(
			GameError.new("WORLD-ERR-002", "Weltdefinition besitzt keinen gültigen Startort.")
		)
	for route_value in definition.routes:
		var route: Dictionary = route_value
		if not definition.locations.has(str(route.get("from", ""))) or not definition.locations.has(str(route.get("to", ""))):
			return GameResult.failure(
				GameError.new("WORLD-ERR-003", "Route verweist auf unbekannten Ort.", {"route": route})
			)
	return GameResult.success(definition)


func location(location_id: String) -> Dictionary:
	return (locations.get(location_id, {}) as Dictionary).duplicate(true)


func route(from_id: String, to_id: String) -> Dictionary:
	for route_value in routes:
		var candidate: Dictionary = route_value
		if str(candidate.get("from", "")) == from_id and str(candidate.get("to", "")) == to_id:
			return candidate.duplicate(true)
	return {}


func outgoing(location_id: String) -> Array:
	var result: Array = []
	for route_value in routes:
		var candidate: Dictionary = route_value
		if str(candidate.get("from", "")) == location_id:
			result.append(candidate.duplicate(true))
	return result
