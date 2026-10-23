class_name SaveRecoveryInspectorTestRunner
extends RefCounted


func run_all() -> Dictionary:
	var tests := [
		["Nur Hauptstand: lesende Prüfung", _test_main_only],
		["Unterbrechung nach Backup-Rotation", _test_interrupted_rotation],
		["Defekter Hauptstand: gültige Sicherung", _test_corrupt_main],
		["Nur .tmp: keine automatische Freigabe", _test_temp_only],
		["Beschädigte .tmp: Hauptstand erhalten", _test_invalid_temp],
		["Keine Dateien: keine Wiederherstellung", _test_empty],
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


func _test_main_only() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 1000)
	if result.ok:
		var before := _snapshot(path)
		var report := SaveRecoveryInspector.new().inspect(path)
		var items: Array = report["candidates"]
		if report["candidate_for_manual_review"] != path or items[0]["status"] != "VALID":
			result = _failure("TEST-REC-001", "Gültiger Hauptstand nicht erkannt.")
		elif report["manual_review_required"] or report["auto_restore_allowed"]:
			result = _failure("TEST-REC-002", "Unzulässige automatische Wiederherstellung.")
		elif _snapshot(path) != before:
			result = _failure("TEST-REC-003", "Lesende Prüfung hat Dateien verändert.")
	_cleanup(path)
	return result


func _test_interrupted_rotation() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 1000)
	if result.ok:
		result = _write_valid(path, 900)
	if result.ok:
		result = _move("%s.bak" % path, "%s.bak.previous" % path)
	if result.ok:
		result = _move(path, "%s.bak" % path)
	if result.ok:
		var before := _snapshot(path)
		var report := SaveRecoveryInspector.new().inspect(path)
		var items: Array = report["candidates"]
		if report["candidate_for_manual_review"] != "%s.bak" % path:
			result = _failure("TEST-REC-004", "Letzter gültiger Hauptstand nicht auffindbar.")
		elif items[1]["status"] != "VALID" or items[2]["status"] != "VALID":
			result = _failure("TEST-REC-005", "Gültige Zwischenstände nicht erkannt.")
		elif not report["manual_review_required"] or report["auto_restore_allowed"]:
			result = _failure("TEST-REC-006", "Unterbrechung darf nicht automatisch repariert werden.")
		elif _snapshot(path) != before:
			result = _failure("TEST-REC-007", "Diagnose hat Recovery-Dateien verändert.")
	_cleanup(path)
	return result


func _test_corrupt_main() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 1000)
	if result.ok:
		result = _write_valid(path, 900)
	if result.ok:
		result = _write_text(path, "{kaputt")
	if result.ok:
		var before := _snapshot(path)
		var report := SaveRecoveryInspector.new().inspect(path)
		var items: Array = report["candidates"]
		if items[0]["status"] != "INVALID" or items[1]["status"] != "VALID":
			result = _failure("TEST-REC-008", "Beschädigung oder Sicherung nicht erkannt.")
		elif report["candidate_for_manual_review"] != "%s.bak" % path:
			result = _failure("TEST-REC-009", "Sicherung nicht zur manuellen Prüfung angeboten.")
		elif not report["manual_review_required"] or _snapshot(path) != before:
			result = _failure("TEST-REC-010", "Defekter Stand wurde verändert oder übergangen.")
	_cleanup(path)
	return result


func _test_temp_only() -> GameResult:
	var path := _new_path()
	var result := _write_valid("%s.tmp" % path, 777)
	if result.ok:
		var before := _snapshot(path)
		var report := SaveRecoveryInspector.new().inspect(path)
		var items: Array = report["candidates"]
		if items[3]["status"] != "VALID" or report["candidate_for_manual_review"] != "":
			result = _failure("TEST-REC-011", "Unbestätigte .tmp wurde fälschlich freigegeben.")
		elif not report["manual_review_required"] or report["auto_restore_allowed"]:
			result = _failure("TEST-REC-012", "Unbestätigte .tmp darf nicht aktiviert werden.")
		elif _snapshot(path) != before:
			result = _failure("TEST-REC-013", "Temporärer Stand wurde verändert.")
	_cleanup(path)
	return result


func _test_invalid_temp() -> GameResult:
	var path := _new_path()
	var result := _write_valid(path, 1000)
	if result.ok:
		result = _write_text("%s.tmp" % path, "abgebrochen")
	if result.ok:
		var before := _snapshot(path)
		var report := SaveRecoveryInspector.new().inspect(path)
		var items: Array = report["candidates"]
		if items[3]["status"] != "INVALID" or report["candidate_for_manual_review"] != path:
			result = _failure("TEST-REC-014", "Beschädigte .tmp oder gültiger Hauptstand nicht erkannt.")
		elif not report["manual_review_required"] or _snapshot(path) != before:
			result = _failure("TEST-REC-015", "Unterbrechung wurde nicht sicher angezeigt.")
	_cleanup(path)
	return result


func _test_empty() -> GameResult:
	var path := _new_path()
	var report := SaveRecoveryInspector.new().inspect(path)
	var items: Array = report["candidates"]
	if report["candidate_for_manual_review"] != "" or not report["manual_review_required"]:
		return _failure("TEST-REC-016", "Fehlende Daten dürfen nicht als gültig gelten.")
	for entry in items:
		if entry["status"] != "MISSING":
			return _failure("TEST-REC-017", "Unerwartete Datei im isolierten Test.")
	return GameResult.success()


func _new_path() -> String:
	var folder := "user://_prerelease_recovery_tests"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
	return "%s/recovery_%d_%d.json" % [folder, OS.get_process_id(), Time.get_ticks_usec()]


func _write_valid(path: String, amount: int) -> GameResult:
	var state := GameSessionState.new()
	state.resources["resource.money"] = amount
	return SaveService.new().save_to_path(path, state)


func _write_text(path: String, value: String) -> GameResult:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return _failure("TEST-REC-018", "Isolierte Testdatei konnte nicht geschrieben werden.")
	file.store_string(value)
	file.close()
	return GameResult.success()


func _move(source: String, destination: String) -> GameResult:
	if DirAccess.rename_absolute(
		ProjectSettings.globalize_path(source), ProjectSettings.globalize_path(destination)
	) != OK:
		return _failure("TEST-REC-019", "Isolierter Unterbrechungszustand nicht herstellbar.")
	return GameResult.success()


func _snapshot(path: String) -> Dictionary:
	var files := {}
	for suffix in ["", ".bak", ".bak.previous", ".tmp"]:
		var candidate := "%s%s" % [path, suffix]
		if FileAccess.file_exists(candidate):
			files[suffix] = FileAccess.get_file_as_string(candidate)
	return files


func _cleanup(path: String) -> void:
	for suffix in ["", ".bak", ".bak.previous", ".tmp"]:
		var candidate := "%s%s" % [path, suffix]
		if FileAccess.file_exists(candidate):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(candidate))


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
