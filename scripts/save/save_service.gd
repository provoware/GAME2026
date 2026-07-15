class_name SaveService
extends RefCounted

const SAVE_SCHEMA_VERSION := 1


func save_to_path(path: String, state: GameSessionState) -> GameResult:
	var state_json := JSON.stringify(state.to_dict())
	var envelope := {
		"save_schema_version": SAVE_SCHEMA_VERSION,
		"checksum_sha256": state_json.sha256_text(),
		"state_json": state_json,
	}
	var payload := JSON.stringify(envelope, "  ")
	var temporary_path := "%s.tmp" % path
	var backup_path := "%s.bak" % path
	var absolute_path := ProjectSettings.globalize_path(path)
	var absolute_temporary_path := ProjectSettings.globalize_path(temporary_path)
	var absolute_backup_path := ProjectSettings.globalize_path(backup_path)

	var file := FileAccess.open(temporary_path, FileAccess.WRITE)
	if file == null:
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-002",
				"Temporärer Speicherstand konnte nicht geöffnet werden.",
				{"path": temporary_path}
			)
		)
	file.store_string(payload)
	file.flush()
	file.close()

	if FileAccess.file_exists(path):
		if FileAccess.file_exists(backup_path):
			DirAccess.remove_absolute(absolute_backup_path)
		var backup_error := DirAccess.rename_absolute(absolute_path, absolute_backup_path)
		if backup_error != OK:
			DirAccess.remove_absolute(absolute_temporary_path)
			return GameResult.failure(
				GameError.new(
					"SAVE-ERR-003",
					"Vorheriger Speicherstand konnte nicht gesichert werden.",
					{"path": path, "error": backup_error}
				)
			)

	var rename_error := DirAccess.rename_absolute(absolute_temporary_path, absolute_path)
	if rename_error != OK:
		if FileAccess.file_exists(backup_path):
			DirAccess.rename_absolute(absolute_backup_path, absolute_path)
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-004",
				"Temporärer Speicherstand konnte nicht aktiviert werden.",
				{"path": path, "error": rename_error}
			)
		)

	return GameResult.success(path)


func load_from_path(path: String) -> GameResult:
	if not FileAccess.file_exists(path):
		return GameResult.failure(
			GameError.new("SAVE-ERR-005", "Speicherstand existiert nicht.", {"path": path})
		)

	var text := FileAccess.get_file_as_string(path)
	var parser := JSON.new()
	var parse_error := parser.parse(text)
	if parse_error != OK or not parser.data is Dictionary:
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-006",
				"Speicherstand enthält ungültiges JSON.",
				{
					"path": path,
					"line": parser.get_error_line(),
					"message": parser.get_error_message()
				}
			)
		)

	var envelope: Dictionary = parser.data as Dictionary
	if int(envelope.get("save_schema_version", -1)) != SAVE_SCHEMA_VERSION:
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-007",
				"Unbekannte Speicherhüllenversion.",
				{"found": envelope.get("save_schema_version"), "expected": SAVE_SCHEMA_VERSION}
			)
		)

	var state_json := str(envelope.get("state_json", ""))
	var expected_checksum := str(envelope.get("checksum_sha256", ""))
	if state_json.is_empty() or expected_checksum != state_json.sha256_text():
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-008", "Prüfsumme des Speicherstands ist ungültig.", {"path": path}
			)
		)

	var state_parser := JSON.new()
	var state_parse_error := state_parser.parse(state_json)
	if state_parse_error != OK or not state_parser.data is Dictionary:
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-009",
				"Zustandsdaten des Speicherstands sind ungültig.",
				{
					"path": path,
					"line": state_parser.get_error_line(),
					"message": state_parser.get_error_message()
				}
			)
		)

	var state := GameSessionState.new()
	var restore_result := state.restore_from_dict(state_parser.data as Dictionary)
	if not restore_result.ok:
		return restore_result
	return GameResult.success(state)
