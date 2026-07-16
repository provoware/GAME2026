class_name WorldTestRunner
extends RefCounted

const MISSION_ID := "mission.neon.signal_9909"
var _world_registry: WorldRegistry
var _mission_registry: MissionRegistry
var _executor := CommandExecutor.new(DomainEventBus.new())
var _context: Dictionary

func _init(world_registry: WorldRegistry, mission_registry: MissionRegistry) -> void:
	_world_registry = world_registry
	_mission_registry = mission_registry
	_context = {"world_registry": _world_registry, "mission_registry": _mission_registry}

func run_all() -> Dictionary:
	var tests := [
		["Direkte Reise bucht Kosten und Position", _test_valid_travel],
		["Nicht verbundener Ort wird atomar blockiert", _test_invalid_route],
		["Ortsbetreten treibt Mission automatisch", _test_mission_bridge],
		["Weltposition übersteht Save/Load", _test_save_roundtrip],
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

func _test_valid_travel() -> GameResult:
	var state := GameSessionState.new()
	var result := _travel(state, "location.tunnel.west", "world-valid")
	if not result.ok:
		return result
	if state.current_location_id != "location.tunnel.west":
		return _failure("TEST-ERR-060", "Position wurde nicht aktualisiert.")
	if state.resource_amount("resource.money") != 980 or state.resource_amount("resource.supply.general") != 9:
		return _failure("TEST-ERR-061", "Reisekosten wurden nicht korrekt gebucht.")
	return GameResult.success()

func _test_invalid_route() -> GameResult:
	var state := GameSessionState.new()
	var before := state.to_dict()
	var result := _travel(state, "location.neon.cellar_club", "world-invalid")
	if result.ok:
		return _failure("TEST-ERR-062", "Nicht verbundener Zielort wurde akzeptiert.")
	if state.to_dict() != before:
		return _failure("TEST-ERR-063", "Blockierte Reise veränderte den Zustand.")
	return GameResult.success()

func _test_mission_bridge() -> GameResult:
	var state := GameSessionState.new()
	var result := _executor.execute(StartMissionCommand.new(MISSION_ID, "world-mission-start"), state, _context)
	if not result.ok:
		return result
	result = _executor.execute(SelectMissionPathCommand.new(MISSION_ID, "path.quiet", "world-mission-path"), state, _context)
	if not result.ok:
		return result
	result = _travel(state, "location.tunnel.west", "world-mission-tunnel")
	if not result.ok:
		return result
	result = _travel(state, "location.neon.cellar_club", "world-mission-neon")
	if not result.ok:
		return result
	if state.get_mission(MISSION_ID).current_phase_id != "phase.recovery":
		return _failure("TEST-ERR-064", "Reise löste das Ortsziel der Mission nicht aus.")
	return GameResult.success()

func _test_save_roundtrip() -> GameResult:
	var state := GameSessionState.new()
	var result := _travel(state, "location.tunnel.west", "world-save-travel")
	if not result.ok:
		return result
	var service := SaveService.new()
	var path := "user://world_iteration_a_self_test.json"
	result = service.save_to_path(path, state)
	if not result.ok:
		return result
	var loaded := service.load_from_path(path)
	if not loaded.ok:
		return loaded
	if (loaded.value as GameSessionState).current_location_id != state.current_location_id:
		return _failure("TEST-ERR-065", "Weltposition ging beim Laden verloren.")
	return GameResult.success()

func _travel(state: GameSessionState, target: String, transaction_id: String) -> GameResult:
	return _executor.execute(TravelToLocationCommand.new(target, transaction_id), state, _context)

func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
