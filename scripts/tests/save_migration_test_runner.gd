class_name SaveMigrationTestRunner
extends RefCounted

# MIG-01: synthetische, gueltig signierte v1/v2/v3-Huellen und Negativfaelle.
# Es werden ausschliesslich eindeutige Dateien im Testverzeichnis verwendet.


func run_all() -> Dictionary:
	var tests := [
		["Save-v1 wird ohne Quelldatei-Mutation auf v3 migriert", _test_v1],
		["Save-v2 wird ohne Quelldatei-Mutation auf v3 migriert", _test_v2],
		["Save-v3 bleibt beim Laden konsistent", _test_v3],
		["Save-v0 wird abgewiesen", _test_version_zero],
		["Zukuenftige Save-v4 wird abgewiesen", _test_version_future],
		["Text statt Zustandsversion wird abgewiesen", _test_version_text],
		["Liste statt Ressourcen-Dictionary wird abgewiesen", _test_resources_list],
		["Text statt Missions-Dictionary wird abgewiesen", _test_missions_text],
		["Dictionary statt Missionshistorie wird abgewiesen", _test_history_map],
		["Negative Ressourcen werden ohne Dateiaenderung abgewiesen", _test_negative_money],
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


func _test_v1() -> GameResult:
	return _check_migration(1)


func _test_v2() -> GameResult:
	return _check_migration(2)


func _test_v3() -> GameResult:
	return _check_migration(3)


func _check_migration(version: int) -> GameResult:
	var data := GameSessionState.new().to_dict()
	data["schema_version"] = version
	data["resources"]["resource.money"] = 712
	data["journal"] = [{"type": "migration_fixture", "fraction": 0.625}]
	if version == 1:
		data.erase("available_characters")
		data.erase("unlocked_abilities")
		data.erase("processed_transactions")
	if version < 3:
		data.erase("mission_history")
	var path := _new_path()
	var result := _write_fixture(path, data)
	if result.ok:
		var before := FileAccess.get_file_as_string(path)
		var loaded := SaveService.new().load_from_path(path)
		if not loaded.ok:
			result = loaded
		else:
			var state: GameSessionState = loaded.value
			if state.schema_version != 3 or state.resource_amount("resource.money") != 712:
				result = _failure("TEST-MIG-001", "Versions- oder Ressourcenmigration ist falsch.")
			elif not state.is_character_available("character.pppoppi"):
				result = _failure("TEST-MIG-002", "Legacy-Standardfiguren fehlen.")
			elif state.journal.size() != 1 or state.journal[0]["fraction"] != 0.625:
				result = _failure("TEST-MIG-003", "Historischer Bruchwert ging verloren.")
			elif typeof(state.journal[0]["fraction"]) != TYPE_FLOAT:
				result = _failure("TEST-MIG-004", "Historischer Bruchwert hat falschen Typ.")
		if result.ok and FileAccess.get_file_as_string(path) != before:
			result = _failure("TEST-MIG-005", "Migration veraenderte die Quelldatei.")
	_cleanup(path)
	return result


func _test_version_zero() -> GameResult:
	return _check_rejected("schema_version", 0, "SAVE-ERR-001")


func _test_version_future() -> GameResult:
	return _check_rejected("schema_version", 4, "SAVE-ERR-001")


func _test_version_text() -> GameResult:
	return _check_rejected("schema_version", "3", "SAVE-ERR-001")


func _test_resources_list() -> GameResult:
	return _check_rejected("resources", ["keine_map"], "SAVE-ERR-015")


func _test_missions_text() -> GameResult:
	return _check_rejected("missions", "keine_map", "SAVE-ERR-015")


func _test_history_map() -> GameResult:
	return _check_rejected("mission_history", {}, "SAVE-ERR-015")


func _test_negative_money() -> GameResult:
	var data := GameSessionState.new().to_dict()
	data["resources"]["resource.money"] = -1
	return _check_rejected_data(data, "ECON-ERR-016")


func _check_rejected(field: String, value: Variant, error_code: String) -> GameResult:
	var data := GameSessionState.new().to_dict()
	data[field] = value
	return _check_rejected_data(data, error_code)


func _check_rejected_data(data: Dictionary, error_code: String) -> GameResult:
	var path := _new_path()
	var result := _write_fixture(path, data)
	if result.ok:
		var before := FileAccess.get_file_as_string(path)
		var loaded := SaveService.new().load_from_path(path)
		if loaded.ok or loaded.errors.is_empty():
			result = _failure("TEST-MIG-006", "Ungueltige Zustandsdaten wurden akzeptiert.")
		elif (loaded.errors[0] as GameError).code != error_code:
			result = _failure("TEST-MIG-007", "Falscher Fehlercode bei ungueltigen Daten.")
		elif FileAccess.get_file_as_string(path) != before:
			result = _failure("TEST-MIG-008", "Abgewiesene Datei wurde veraendert.")
	_cleanup(path)
	return result


func _write_fixture(path: String, data: Dictionary) -> GameResult:
	var state_json := JSON.stringify(data)
	var envelope := {
		"save_schema_version": 1,
		"checksum_sha256": state_json.sha256_text(),
		"state_json": state_json,
	}
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return _failure("TEST-MIG-009", "Isolierte Testdatei nicht schreibbar.")
	file.store_string(JSON.stringify(envelope))
	file.flush()
	file.close()
	return GameResult.success()


func _new_path() -> String:
	var folder := "user://_prerelease_migration_tests"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
	return "%s/migration_%d_%d.json" % [folder, OS.get_process_id(), Time.get_ticks_usec()]


func _cleanup(path: String) -> void:
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(path))


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
