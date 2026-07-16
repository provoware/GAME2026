class_name WorldRegistry
extends RefCounted

var _definition: WorldDefinition

func load_from_path(path: String) -> GameResult:
	if not FileAccess.file_exists(path):
		return GameResult.failure(GameError.new("WORLD-ERR-004", "Weltdefinition fehlt.", {"path": path}))
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return GameResult.failure(GameError.new("WORLD-ERR-005", "Weltdefinition kann nicht geöffnet werden.", {"path": path}))
	var parsed := JSON.parse_string(file.get_as_text())
	if not parsed is Dictionary:
		return GameResult.failure(GameError.new("WORLD-ERR-006", "Weltdefinition ist kein gültiges JSON-Objekt."))
	var result := WorldDefinition.from_dict(parsed)
	if result.ok:
		_definition = result.value
	return result

func definition() -> WorldDefinition:
	return _definition
