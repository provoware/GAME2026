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



class CurrentBackupFailureService:
	extends SaveService

	func _rename_file(source: String, destination: String) -> Error:
		if source.ends_with(".json") and destination.ends_with(".bak"):
			return ERR_CANT_CREATE
		return super._rename_file(source, destination)


class BackupRestoreFailureService:
	extends SaveService

	func _rename_file(source: String, destination: String) -> Error:
		if source.ends_with(".json") and destination.ends_with(".bak"):
			return ERR_CANT_CREATE
		if source.ends_with(".bak.previous") and destination.ends_with(".bak"):
			return ERR_CANT_CREATE
		return super._rename_file(source, destination)


class FailedRollbackService:
	extends SaveService

	func _rename_file(source: String, destination: String) -> Error:
		if source.ends_with(".tmp") and destination.ends_with(".json"):
			return ERR_CANT_CREATE
		if source.ends_with(".bak") and destination.ends_with(".json"):
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
		["Hauptstand-Sicherungsfehler rollt vollständig zurück", _test_failed_current_backup],
		["Fehlgeschlagene Sicherungsrücknahme erhält Stufendatei", _test_failed_backup_restore],
		["Fehlgeschlagene Hauptstand-Rücknahme erhält beide gültigen Stände", _test_failed_main_rollback],
		["Defekte Prüfsumme verändert keine Sicherung", _test_invalid_checksum],
		["JSON-Ganzzahlen und Bruchwerte bleiben erhalten", _test_json_number_types],
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



func _test_failed_current_backup() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok:
		var failed := _save_amount(CurrentBackupFailureService.new(), path, 800)
		if failed.ok or (failed.errors[0] as GameError).code != "SAVE-ERR-003":
			result = _failure("TEST-SAVE-015", "Hauptstand-Sicherungsfehler wurde nicht erkannt.")
	if result.ok:
		result = _expect_amount(path, 900)
	if result.ok:
		result = _expect_amount("%s.bak" % path, 1000)
	if result.ok and FileAccess.file_exists("%s.tmp" % path):
		result = _failure("TEST-SAVE-016", "Temporäre Datei blieb nach Rücknahme liegen.")
	if result.ok and FileAccess.file_exists("%s.bak.previous" % path):
		result = _failure("TEST-SAVE-016", "Stufendatei blieb nach Rücknahme liegen.")
	_cleanup(path)
	return result


func _test_failed_backup_restore() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok:
		var failed := _save_amount(BackupRestoreFailureService.new(), path, 800)
		if failed.ok:
			result = _failure("TEST-SAVE-017", "Fehlerhafte Sicherungsrücknahme wurde akzeptiert.")
		else:
			var error: GameError = failed.errors[0]
			if error.code != "SAVE-ERR-003" or int(error.details.get("backup_restore_error", OK)) == OK:
				result = _failure("TEST-SAVE-018", "Rücknahmefehler wurde nicht gemeldet.")
	if result.ok:
		result = _expect_amount(path, 900)
	if result.ok:
		result = _expect_amount("%s.bak.previous" % path, 1000)
	if result.ok and FileAccess.file_exists("%s.bak" % path):
		result = _failure("TEST-SAVE-019", "Unerwartete Sicherung nach fehlgeschlagener Rücknahme.")
	_cleanup(path)
	return result


func _test_failed_main_rollback() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok:
		var failed := _save_amount(FailedRollbackService.new(), path, 800)
		if failed.ok:
			result = _failure("TEST-SAVE-020", "Fehlgeschlagene Hauptstand-Rücknahme wurde akzeptiert.")
		else:
			var error: GameError = failed.errors[0]
			if error.code != "SAVE-ERR-004" or int(error.details.get("save_restore_error", OK)) == OK:
				result = _failure("TEST-SAVE-021", "Hauptstand-Rücknahmefehler fehlt im Ergebnis.")
	if result.ok and FileAccess.file_exists(path):
		result = _failure("TEST-SAVE-022", "Unerwarteter Hauptstand nach fehlgeschlagener Rücknahme.")
	if result.ok:
		result = _expect_amount("%s.bak" % path, 900)
	if result.ok:
		result = _expect_amount("%s.bak.previous" % path, 1000)
	if result.ok and FileAccess.file_exists("%s.tmp" % path):
		result = _failure("TEST-SAVE-023", "Temporärer Teststand blieb liegen.")
	_cleanup(path)
	return result


func _test_invalid_checksum() -> GameResult:
	var path := _new_path()
	var service := SaveService.new()
	var result := _save_amount(service, path, 1000)
	if result.ok:
		result = _save_amount(service, path, 900)
	if result.ok:
		var parser := JSON.new()
		if parser.parse(FileAccess.get_file_as_string(path)) != OK:
			result = _failure("TEST-SAVE-024", "Testhülle konnte nicht gelesen werden.")
		else:
			var envelope: Dictionary = parser.data
			envelope["checksum_sha256"] = "absichtlich-falsch"
			var file := FileAccess.open(path, FileAccess.WRITE)
			if file == null:
				result = _failure("TEST-SAVE-025", "Isolierte Testhülle konnte nicht verändert werden.")
			else:
				file.store_string(JSON.stringify(envelope))
				file.close()
				var before := FileAccess.get_file_as_string(path)
				var failed := service.load_from_path(path)
				if failed.ok or (failed.errors[0] as GameError).code != "SAVE-ERR-008":
					result = _failure("TEST-SAVE-026", "Ungültige Prüfsumme wurde akzeptiert.")
				elif FileAccess.get_file_as_string(path) != before:
					result = _failure("TEST-SAVE-027", "Fehlerhaftes Laden veränderte den Spielstand.")
	if result.ok:
		result = _expect_amount("%s.bak" % path, 1000)
	_cleanup(path)
	return result


func _test_json_number_types() -> GameResult:
	var path := _new_path()
	var state := GameSessionState.new()
	state.resources["resource.money"] = 900
	state.journal.append({"type": "test_metric", "value": 0.75})
	var service := SaveService.new()
	var result := service.save_to_path(path, state)
	if result.ok:
		var load_result := service.load_from_path(path)
		if not load_result.ok:
			result = load_result
		else:
			var restored: GameSessionState = load_result.value
			if typeof(restored.resources["resource.money"]) != TYPE_INT:
				result = _failure("TEST-SAVE-012", "Ganzzahliger Ressourcenwert wurde zum float.")
			elif typeof(restored.journal[0]["value"]) != TYPE_FLOAT:
				result = _failure("TEST-SAVE-013", "Bruchwert wurde fälschlich zu int.")
			elif restored.journal[0]["value"] != 0.75:
				result = _failure("TEST-SAVE-014", "Bruchwert wurde verändert.")
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
