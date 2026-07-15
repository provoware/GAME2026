class_name MissionRegistry
extends RefCounted

var _definitions: Dictionary = {}


func load_directory(path: String) -> GameResult:
	_definitions.clear()
	var directory := DirAccess.open(path)
	if directory == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-010",
				"Missionsverzeichnis konnte nicht geöffnet werden.",
				{"path": path}
			)
		)

	directory.list_dir_begin()
	var file_name := directory.get_next()
	while not file_name.is_empty():
		if not directory.current_is_dir() and file_name.get_extension().to_lower() == "json":
			var result := _load_file(path.path_join(file_name))
			if not result.ok:
				directory.list_dir_end()
				return result
		file_name = directory.get_next()
	directory.list_dir_end()

	if _definitions.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-011", "Keine gültigen Missionsdefinitionen gefunden.", {"path": path}
			)
		)

	return GameResult.success(_definitions.size())


func _load_file(path: String) -> GameResult:
	var json_text := FileAccess.get_file_as_string(path)
	if json_text.is_empty():
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-012", "Missionsdatei ist leer oder nicht lesbar.", {"path": path}
			)
		)

	var parser := JSON.new()
	var parse_error := parser.parse(json_text)
	if parse_error != OK:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-013",
				"Missionsdatei enthält ungültiges JSON.",
				{
					"path": path,
					"line": parser.get_error_line(),
					"message": parser.get_error_message()
				}
			)
		)

	if not parser.data is Dictionary:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-014", "Missionsdatei muss ein JSON-Objekt enthalten.", {"path": path}
			)
		)

	var definition_result := MissionDefinition.from_dict(parser.data)
	if not definition_result.ok:
		return definition_result

	var definition: MissionDefinition = definition_result.value
	if _definitions.has(definition.id):
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-015",
				"Doppelte Missions-ID.",
				{"mission_id": definition.id, "path": path}
			)
		)

	_definitions[definition.id] = definition
	return GameResult.success(definition)


func get_definition(mission_id: String) -> MissionDefinition:
	return _definitions.get(mission_id) as MissionDefinition


func has_definition(mission_id: String) -> bool:
	return _definitions.has(mission_id)


func all_definitions() -> Array:
	return _definitions.values()
