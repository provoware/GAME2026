class_name SaveRecoveryCopyTestRunner
extends RefCounted


func run_all() -> Dictionary:
	var cases := [
		["Gueltige Sicherung kopieren", _test_backup_copy],
		["Vorherige Sicherung kopieren", _test_previous_copy],
		["Defekter Hauptstand bleibt erhalten", _test_corrupt_main],
		["Belegtes Ziel wird nicht ueberschrieben", _test_collision],
		["Manipulierte Sicherung wird abgewiesen", _test_invalid_backup],
		["Unbestaetigte tmp wird abgewiesen", _test_temp_rejected],
		["Fremder Zielpfad wird abgewiesen", _test_wrong_destination],
		["Fehlende Quelle wird abgewiesen", _test_missing_source],
	]
	var passed := 0
	var failures: Array[String] = []
	for test_case in cases:
		var result: GameResult = (test_case[1] as Callable).call()
		if result.ok:
			passed += 1
		else:
			failures.append("%s — %s" % [test_case[0], result.first_error_message()])
	return {"passed": passed, "total": cases.size(), "failures": failures}


func _test_backup_copy() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	if result.ok:
		result = _write_valid(path, 200)
	var destination := _destination(path)
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(path, "backup", destination)
		if not copied.ok or copied.value != destination:
			result = _failure("TEST-RCOPY-001", "Gueltige Sicherung wurde nicht kopiert.")
		elif FileAccess.get_file_as_string(destination) != before[".bak"]:
			result = _failure("TEST-RCOPY-002", "Recovery-Kopie ist nicht bytegleich.")
		elif _snapshot(path) != before:
			result = _failure("TEST-RCOPY-003", "Originale wurden veraendert.")
		elif not SaveService.new().load_from_path(destination).ok:
			result = _failure("TEST-RCOPY-004", "Kopie laesst sich nicht laden.")
	_cleanup(path, destination)
	return result


func _test_previous_copy() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	if result.ok:
		result = _write_valid(path, 200)
	if result.ok:
		if DirAccess.rename_absolute(
			ProjectSettings.globalize_path("%s.bak" % path),
			ProjectSettings.globalize_path("%s.bak.previous" % path)
		) != OK:
			result = _failure("TEST-RCOPY-005", "Test-Sicherung konnte nicht gestuft werden.")
	var destination := _destination(path)
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(
			path, "previous_backup", destination
		)
		if not copied.ok or FileAccess.get_file_as_string(destination) != before[".bak.previous"]:
			result = _failure("TEST-RCOPY-006", "Gestufte Sicherung nicht bytegleich kopiert.")
		elif _snapshot(path) != before:
			result = _failure("TEST-RCOPY-007", "Gestufte Sicherung wurde veraendert.")
	_cleanup(path, destination)
	return result


func _test_corrupt_main() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	if result.ok:
		result = _write_valid(path, 200)
	if result.ok:
		result = _write_text(path, "{beschaedigt")
	var destination := _destination(path)
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(path, "backup", destination)
		if not copied.ok or _snapshot(path) != before:
			result = _failure("TEST-RCOPY-008", "Defekter Hauptstand nicht geschuetzt.")
		elif not SaveService.new().load_from_path(destination).ok:
			result = _failure("TEST-RCOPY-009", "Sicherung nicht lesbar kopiert.")
	_cleanup(path, destination)
	return result


func _test_collision() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	var destination := _destination(path)
	if result.ok:
		result = _write_text(destination, "nicht ueberschreiben")
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(path, "main", destination)
		if copied.ok or FileAccess.get_file_as_string(destination) != "nicht ueberschreiben":
			result = _failure("TEST-RCOPY-010", "Belegtes Ziel wurde ueberschrieben.")
		elif _snapshot(path) != before:
			result = _failure("TEST-RCOPY-011", "Original bei Kollision veraendert.")
	_cleanup(path, destination)
	return result


func _test_invalid_backup() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	if result.ok:
		result = _write_text("%s.bak" % path, "{ungueltig")
	var destination := _destination(path)
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(path, "backup", destination)
		if copied.ok or FileAccess.file_exists(destination) or _snapshot(path) != before:
			result = _failure("TEST-RCOPY-012", "Manipulierte Sicherung wurde kopiert.")
	_cleanup(path, destination)
	return result


func _test_temp_rejected() -> GameResult:
	var path := _new_path()
	var result := _write_valid("%s.tmp" % path, 100)
	var destination := _destination(path)
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(
			path, "uncommitted_temp", destination
		)
		if copied.ok or FileAccess.file_exists(destination) or _snapshot(path) != before:
			result = _failure("TEST-RCOPY-013", "Unbestaetigte tmp wurde freigegeben.")
	_cleanup(path, destination)
	return result


func _test_wrong_destination() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 100)
	var forbidden := "%s.bak" % path
	if result.ok:
		var before := _snapshot(path)
		var copied := SaveRecoveryCopyService.new().copy_candidate(path, "main", forbidden)
		if copied.ok or _snapshot(path) != before:
			result = _failure("TEST-RCOPY-014", "Recovery durfte Sicherungspfad verwenden.")
	_cleanup(path, "")
	return result


func _test_missing_source() -> GameResult:
	var path := _new_path()
	var destination := _destination(path)
	var copied := SaveRecoveryCopyService.new().copy_candidate(path, "backup", destination)
	var result := GameResult.success()
	if copied.ok or FileAccess.file_exists(destination):
		result = _failure("TEST-RCOPY-015", "Fehlende Quelle wurde freigegeben.")
	_cleanup(path, destination)
	return result


func _new_path() -> String:
	var folder := "user://_prerelease_recovery_copy_tests"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
	return "%s/copy_%d_%d.json" % [folder, OS.get_process_id(), Time.get_ticks_usec()]


func _destination(path: String) -> String:
	return "%s.recovered.%d.json" % [path, Time.get_ticks_usec()]


func _write_valid(path: String, amount: int) -> GameResult:
	var state := GameSessionState.new()
	state.resources["resource.money"] = amount
	return SaveService.new().save_to_path(path, state)


func _write_text(path: String, content: String) -> GameResult:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return _failure("TEST-RCOPY-016", "Testdatei konnte nicht angelegt werden.")
	file.store_string(content)
	file.close()
	return GameResult.success()


func _snapshot(path: String) -> Dictionary:
	var result := {}
	for suffix in ["", ".bak", ".bak.previous", ".tmp"]:
		var candidate := "%s%s" % [path, suffix]
		if FileAccess.file_exists(candidate):
			result[suffix] = FileAccess.get_file_as_string(candidate)
	return result


func _cleanup(path: String, destination: String) -> void:
	for suffix in ["", ".bak", ".bak.previous", ".tmp"]:
		var candidate := "%s%s" % [path, suffix]
		if FileAccess.file_exists(candidate):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(candidate))
	if not destination.is_empty() and FileAccess.file_exists(destination):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(destination))


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
