class_name SaveServiceRegressionRunner
extends RefCounted


class ActivationFailureService:
	extends SaveService

	func _rename_file(source: String, destination: String) -> Error:
		if source.ends_with(".tmp"):
			return ERR_CANT_CREATE
		return super._rename_file(source, destination)


class BackupStageFailureService:
	extends SaveService

	func _rename_file(source: String, destination: String) -> Error:
		if source.ends_with(".bak") and destination.ends_with(".bak.previous"):
			return ERR_CANT_CREATE
		return super._rename_file(source, destination)


func run_all() -> Dictionary:
	var tests := [
		["Sicherung nach erfolgreichem Speichern rotiert", _test_rotation],
		["Fehler beim Aktivieren erhält beide Spielstände", _test_failed_activation],
		["Fehler beim Sichern erhält beide Spielstände", _test_failed_backup_stage],
		["Unterbrochene Rotation wird nicht überschrieben", _test_stale_stage],
		["Vorhandene tmp-Datei wird nicht überschrieben", _test_stale_tmp],
		["Verwaiste Sicherung wird nicht überschrieben", _test_orphan_backup],
	]
	var passed := 0
	var failures: Array[String] = []
	for test_case in tests:
		var result: GameResult = (test_case[1] as Callable).call()
		if result.ok:
			passed += 1
		else:
			failures.append("%s — %s" % [test_case[0], result.first_error_message()])
	return {"passed": passed, "total": tests.size(), "failures": failures}


func _test_rotation() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok:
		result = _save_amount(service, path, 800)
	if result.ok:
		result = _expect_amount(path, 800)
	if result.ok:
		result = _expect_amount("%s.bak" % path, 900)
	if result.ok and FileAccess.file_exists("%s.bak.previous" % path):
		result = _failure("TEST-SAVE-001", "Alte Sicherung blieb nach Erfolg liegen.")
	_cleanup(path)
	return result


func _test_failed_activation() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok and _save_amount(ActivationFailureService.new(), path, 800).ok:
		result = _failure("TEST-SAVE-002", "Aktivierungsfehler wurde akzeptiert.")
	if result.ok:
		result = _expect_amount(path, 900)
	if result.ok:
		result = _expect_amount("%s.bak" % path, 1000)
	_cleanup(path)
	return result


func _test_failed_backup_stage() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok and _save_amount(BackupStageFailureService.new(), path, 800).ok:
		result = _failure("TEST-SAVE-003", "Sicherungsfehler wurde akzeptiert.")
	if result.ok:
		result = _expect_amount(path, 900)
	if result.ok:
		result = _expect_amount("%s.bak" % path, 1000)
	_cleanup(path)
	return result


func _test_stale_stage() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	var stage := "%s.bak.previous" % path
	if result.ok:
		result = _write_sentinel(stage)
	if result.ok and _save_amount(service, path, 800).ok:
		result = _failure("TEST-SAVE-004", "Alte Sicherung wurde überschrieben.")
	if result.ok:
		result = _expect_amount(path, 900)
	if result.ok:
		result = _expect_amount("%s.bak" % path, 1000)
	if result.ok:
		result = _expect_sentinel(stage)
	_cleanup(path)
	return result


func _test_stale_tmp() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	var tmp := "%s.tmp" % path
	if result.ok:
		result = _write_sentinel(tmp)
	if result.ok and _save_amount(service, path, 900).ok:
		result = _failure("TEST-SAVE-005", "Alte tmp wurde überschrieben.")
	if result.ok:
		result = _expect_amount(path, 1000)
	if result.ok:
		result = _expect_sentinel(tmp)
	_cleanup(path)
	return result


func _test_orphan_backup() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	var backup := "%s.bak" % path
	if result.ok:
		var moved := DirAccess.rename_absolute(
			ProjectSettings.globalize_path(path), ProjectSettings.globalize_path(backup)
		)
		if moved != OK:
			result = _failure("TEST-SAVE-006", "Test-Sicherung konnte nicht vorbereitet werden.")
	if result.ok and _save_amount(service, path, 900).ok:
		result = _failure("TEST-SAVE-007", "Verwaiste Sicherung wurde überschrieben.")
	if result.ok:
		result = _expect_amount(backup, 1000)
	if result.ok and FileAccess.file_exists(path):
		result = _failure("TEST-SAVE-008", "Unerwarteter Hauptstand angelegt.")
	_cleanup(path)
	return result


func _new_path() -> String:
	var folder := "user://_prerelease_save_tests"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
	return "%s/save_%d_%d.json" % [folder, OS.get_process_id(), Time.get_ticks_usec()]


func _save_amount(service: SaveService, path: String, amount: int) -> GameResult:
	var state := GameSessionState.new()
	state.resources["resource.money"] = amount
	return service.save_to_path(path, state)


func _expect_amount(path: String, expected: int) -> GameResult:
	var result := SaveService.new().load_from_path(path)
	if not result.ok:
		return result
	var state: GameSessionState = result.value
	if state.resource_amount("resource.money") != expected:
		return _failure("TEST-SAVE-009", "Falscher Geldstand in %s." % path)
	return GameResult.success()


func _write_sentinel(path: String) -> GameResult:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return _failure("TEST-SAVE-010", "Testdatei konnte nicht angelegt werden.")
	file.store_string("nicht ueberschreiben")
	file.close()
	return GameResult.success()


func _expect_sentinel(path: String) -> GameResult:
	if FileAccess.get_file_as_string(path) != "nicht ueberschreiben":
		return _failure("TEST-SAVE-011", "Recovery-Datei wurde verändert.")
	return GameResult.success()


func _cleanup(path: String) -> void:
	# Ausschließlich eindeutige Dateinamen im isolierten Testordner.
	for suffix in ["", ".tmp", ".bak", ".bak.previous"]:
		var file_path := "%s%s" % [path, suffix]
		if FileAccess.file_exists(file_path):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(file_path))


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
