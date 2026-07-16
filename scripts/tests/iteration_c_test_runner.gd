class_name IterationCTestRunner
extends RefCounted

const MISSION_ID := "mission.neon.signal_9909"

var _registry: MissionRegistry
var _executor := CommandExecutor.new(DomainEventBus.new())
var _context: Dictionary


func _init(registry: MissionRegistry) -> void:
	_registry = registry
	_context = {"mission_registry": _registry}


func run_all() -> Dictionary:
	var tests := [
		["Gold-Qualität und Historie", _test_gold_quality_and_history],
		["Sicherer Wiederaufnahmepunkt", _test_checkpoint_restore],
		["Save-v2-Migration auf v3", _test_legacy_migration],
		["Massensimulation 120 Durchläufe", _test_mass_simulation],
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


func _test_gold_quality_and_history() -> GameResult:
	var state := GameSessionState.new()
	var result := _start(state, "c-quality", "path.quiet")
	if not result.ok:
		return result
	result = _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"c-quality-location"
	)
	if not result.ok:
		return result
	result = _signal(
		state,
		"world.control_avoided",
		{"control_id": "control.neon.mobile"},
		"c-quality-optional"
	)
	if not result.ok:
		return result
	result = _signal(
		state,
		"mission.recording_secured",
		{"recording_id": "recording.signal_9909"},
		"c-quality-recording"
	)
	if not result.ok:
		return result
	var mission := state.get_mission(MISSION_ID)
	if str(mission.outcome_quality.get("grade", "")) != MissionOutcomeEvaluator.GRADE_GOLD:
		return _failure("TEST-ERR-043", "Vollständiger Ablauf erhielt keinen Gold-Grad.")
	if state.mission_history.size() != 1:
		return _failure("TEST-ERR-044", "Terminaler Missionsabschluss wurde nicht einmalig archiviert.")
	var history := state.latest_mission_history(MISSION_ID)
	if str(history.get("quality_grade", "")) != MissionOutcomeEvaluator.GRADE_GOLD:
		return _failure("TEST-ERR-045", "Archiv enthält nicht die berechnete Ergebnisqualität.")
	return GameResult.success()


func _test_checkpoint_restore() -> GameResult:
	var state := GameSessionState.new()
	var result := _start(state, "c-checkpoint", "path.quiet")
	if not result.ok:
		return result
	result = _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"c-checkpoint-location"
	)
	if not result.ok:
		return result
	result = _signal(
		state,
		"world.control_avoided",
		{"control_id": "control.neon.mobile"},
		"c-checkpoint-progress"
	)
	if not result.ok:
		return result
	var mission := state.get_mission(MISSION_ID)
	if int(mission.objective_progress.get("avoid_control", 0)) != 1:
		return _failure("TEST-ERR-046", "Testfortschritt wurde nicht aufgebaut.")
	result = _executor.execute(
		RestoreMissionCheckpointCommand.new(MISSION_ID, "c-checkpoint-restore"), state, _context
	)
	if not result.ok:
		return result
	if mission.current_phase_id != "phase.recovery":
		return _failure("TEST-ERR-047", "Wiederherstellung sprang in die falsche Phase.")
	if int(mission.objective_progress.get("avoid_control", 0)) != 0:
		return _failure("TEST-ERR-048", "Unsicherer Fortschritt blieb nach Wiederherstellung erhalten.")
	return GameResult.success()


func _test_legacy_migration() -> GameResult:
	var state := GameSessionState.new()
	var result := _start(state, "c-migration", "path.loud")
	if not result.ok:
		return result
	var legacy := state.to_dict()
	legacy["schema_version"] = 2
	legacy.erase("mission_history")
	var missions: Dictionary = legacy["missions"]
	var mission_data: Dictionary = missions[MISSION_ID]
	mission_data["schema_version"] = 2
	mission_data.erase("outcome_quality")
	mission_data.erase("resume_checkpoint")
	mission_data.erase("phase_timeline")
	var migrated := GameSessionState.new()
	result = migrated.restore_from_dict(legacy)
	if not result.ok:
		return result
	var mission := migrated.get_mission(MISSION_ID)
	if migrated.schema_version != 3 or mission.schema_version != 3:
		return _failure("TEST-ERR-049", "Legacy-Speicherstand wurde nicht auf Schema v3 migriert.")
	if mission.resume_checkpoint.is_empty():
		return _failure("TEST-ERR-050", "Migration erzeugte keinen sicheren Wiederaufnahmepunkt.")
	return GameResult.success()


func _test_mass_simulation() -> GameResult:
	var result := MissionMassSimulator.run(_registry, 120)
	if not result.ok:
		return result
	var report: Dictionary = result.value
	if int(report.get("completed", 0)) != 120:
		return _failure("TEST-ERR-051", "Massensimulation schloss nicht alle Durchläufe ab.")
	var grades: Dictionary = report.get("grade_counts", {}) as Dictionary
	if not grades.has(MissionOutcomeEvaluator.GRADE_GOLD):
		return _failure("TEST-ERR-052", "Massensimulation erzeugte keine Gold-Ergebnisse.")
	if not grades.has(MissionOutcomeEvaluator.GRADE_SILVER):
		return _failure("TEST-ERR-053", "Massensimulation erzeugte keine abgestuften Ergebnisse.")
	return GameResult.success()


func _start(state: GameSessionState, prefix: String, path_id: String) -> GameResult:
	var result := _executor.execute(
		StartMissionCommand.new(MISSION_ID, "%s-start" % prefix), state, _context
	)
	if not result.ok:
		return result
	return _executor.execute(
		SelectMissionPathCommand.new(MISSION_ID, path_id, "%s-path" % prefix), state, _context
	)


func _signal(
	state: GameSessionState, signal_type: String, payload: Dictionary, transaction_id: String
) -> GameResult:
	return _executor.execute(
		ApplyMissionSignalCommand.new(signal_type, payload, transaction_id), state, _context
	)


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
