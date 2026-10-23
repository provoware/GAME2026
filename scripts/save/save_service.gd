class_name SaveService
extends RefCounted

const SAVE_SCHEMA_VERSION := 1


func save_to_path(path: String, state: GameSessionState) -> GameResult:
	# Recovery-Dateien niemals stillschweigend überschreiben oder löschen.
	var backup_path := "%s.bak" % path
	var temporary_path := "%s.tmp" % path
	if FileAccess.file_exists(temporary_path):
		return GameResult.failure(
			GameError.new("SAVE-ERR-013", "Ungeklärter temporärer Speicherstand vorhanden.", {"path": temporary_path})
		)
	if not FileAccess.file_exists(path) and FileAccess.file_exists(backup_path):
		return GameResult.failure(
			GameError.new("SAVE-ERR-014", "Hauptstand fehlt, Sicherung muss zuerst geprüft werden.", {"path": backup_path})
		)
	var previous_backup_path := "%s.previous" % backup_path
	if FileAccess.file_exists(previous_backup_path):
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-010",
				"Eine unterbrochene Sicherungsrotation muss zuerst geprüft werden.",
				{"path": previous_backup_path}
			)
		)

	var validation := state.validate_invariants()
	if not validation.ok:
		return validation

	var state_json := JSON.stringify(state.to_dict())
	var envelope := {
		"save_schema_version": SAVE_SCHEMA_VERSION,
		"checksum_sha256": state_json.sha256_text(),
		"state_json": state_json,
	}
	var payload := JSON.stringify(envelope, "  ")
	var absolute_path := ProjectSettings.globalize_path(path)
	var absolute_temporary_path := ProjectSettings.globalize_path(temporary_path)
	var absolute_backup_path := ProjectSettings.globalize_path(backup_path)
	var absolute_previous_backup_path := ProjectSettings.globalize_path(previous_backup_path)

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

	# Bei einem unvollständigen Schreibvorgang bleibt die bisherige Sicherung unangetastet.
	if FileAccess.get_file_as_string(temporary_path) != payload:
		_remove_file(absolute_temporary_path)
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-011",
				"Temporärer Speicherstand konnte nicht vollständig geschrieben werden.",
				{"path": temporary_path}
			)
		)

	var had_save := FileAccess.file_exists(path)
	var had_backup := had_save and FileAccess.file_exists(backup_path)
	if had_save:
		# Alte Sicherung zuerst in separatem Slot erhalten.
		if had_backup:
			var stage_error := _rename_file(absolute_backup_path, absolute_previous_backup_path)
			if stage_error != OK:
				_remove_file(absolute_temporary_path)
				return GameResult.failure(
					GameError.new(
						"SAVE-ERR-012",
						"Vorhandene Sicherung konnte nicht geschützt werden.",
						{"path": backup_path, "error": stage_error}
					)
				)

		var backup_error := _rename_file(absolute_path, absolute_backup_path)
		if backup_error != OK:
			var backup_restore_error := OK
			if had_backup:
				backup_restore_error = _rename_file(
					absolute_previous_backup_path, absolute_backup_path
				)
			_remove_file(absolute_temporary_path)
			return GameResult.failure(
				GameError.new(
					"SAVE-ERR-003",
					"Vorheriger Speicherstand konnte nicht gesichert werden.",
					{
						"path": path,
						"error": backup_error,
						"backup_restore_error": backup_restore_error,
					}
				)
			)

	var rename_error := _rename_file(absolute_temporary_path, absolute_path)
	if rename_error != OK:
		var save_restore_error := OK
		var backup_restore_error := OK
		if had_save:
			save_restore_error = _rename_file(absolute_backup_path, absolute_path)
			if had_backup:
				backup_restore_error = _rename_file(
					absolute_previous_backup_path, absolute_backup_path
				)
		_remove_file(absolute_temporary_path)
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-004",
				"Temporärer Speicherstand konnte nicht aktiviert werden.",
				{
					"path": path,
					"error": rename_error,
					"save_restore_error": save_restore_error,
					"backup_restore_error": backup_restore_error,
				}
			)
		)

	if had_backup:
		var cleanup_error := _remove_file(absolute_previous_backup_path)
		if cleanup_error != OK:
			# Die ältere Sicherung bleibt erhalten, weitere Speicherungen werden gesperrt.
			return GameResult.success(
				path,
				["Alte Sicherung konnte nicht entfernt werden; weitere Speicherung gesperrt."]
			)
	return GameResult.success(path)


func _rename_file(source: String, destination: String) -> Error:
	return DirAccess.rename_absolute(source, destination)


func _remove_file(path: String) -> Error:
	return DirAccess.remove_absolute(path)


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
	# Godot-JSON liest Ganzzahlen als float; ohne Normalisierung ändern sich
	# Ressourcen, Missionsfortschritt und Journaleinträge beim Roundtrip.
	var normalized_state: Dictionary = _normalize_json_integral_numbers(state_parser.data) as Dictionary
	var restore_result := state.restore_from_dict(normalized_state as Dictionary)
	if not restore_result.ok:
		return restore_result
	return GameResult.success(state)


# JSON kennt keinen separaten Ganzzahltyp. Nur exakt darstellbare, ganze
# Zahlen konvertieren; echte Bruchwerte (z. B. Qualitätsgrade) bleiben float.
# Außerhalb des exakten IEEE-754-Bereichs ist die Präzision nicht garantiert;
# die Grenzprüfung ist vor einer vollständigen Save-Freigabe zu ergänzen.
func _normalize_json_integral_numbers(value: Variant) -> Variant:
	if value is Dictionary:
		var normalized: Dictionary = {}
		for key in value:
			normalized[key] = _normalize_json_integral_numbers(value[key])
		return normalized
	if value is Array:
		var normalized: Array = []
		for item in value:
			normalized.append(_normalize_json_integral_numbers(item))
		return normalized
	if typeof(value) == TYPE_FLOAT:
		var number: float = value
		if absf(number) <= 9007199254740991.0 and number == floorf(number):
			return int(number)
	return value
