class_name TestRunner
extends RefCounted

const MISSION_ID := "mission.neon.signal_9909"

var _registry: MissionRegistry
var _event_bus: DomainEventBus
var _executor: CommandExecutor
var _context: Dictionary


func _init(registry: MissionRegistry) -> void:
	_registry = registry
	_event_bus = DomainEventBus.new()
	_executor = CommandExecutor.new(_event_bus)
	_context = {"mission_registry": _registry}


func run_all() -> Dictionary:
	var tests := [
		["Mission kann gestartet werden", _test_start_mission],
		["Standortvoraussetzung blockiert korrekt", _test_location_requirement],
		["Signal wechselt Missionsphase", _test_signal_phase_transition],
		["Alternativer Pfad begrenzt Ziele", _test_alternative_path_filter],
		["Mission wird über Signale abgeschlossen", _test_completion_and_reward],
		["Frist erzeugt Teilerfolg", _test_deadline_partial_success],
		["Frist erzeugt Fehlschlag", _test_deadline_failure],
		["Riss pausiert und Fortsetzung funktioniert", _test_pause_resume],
		["Abbruchfolgen werden atomar gebucht", _test_cancel_consequences],
		["Doppelte Transaktion wird nicht doppelt gebucht", _test_idempotency],
		["Transaktions-ID-Kollision wird abgewiesen", _test_transaction_id_collision],
		["Save-/Load-Roundtrip bleibt konsistent", _test_save_load_roundtrip],
	]

	var passed := 0
	var failures: Array[String] = []
	for test_case in tests:
		var test_name: String = test_case[0]
		var callable: Callable = test_case[1]
		var result: GameResult = callable.call()
		if result.ok:
			passed += 1
		else:
			failures.append("%s — %s" % [test_name, result.first_error_message()])

	return {
		"passed": passed,
		"total": tests.size(),
		"failures": failures,
	}


func _test_start_mission() -> GameResult:
	var state := GameSessionState.new()
	var result := _start(state, "test-start-001", "path.quiet")
	if not result.ok:
		return result
	var mission := state.get_mission(MISSION_ID)
	if mission == null:
		return _failure("TEST-ERR-001", "Mission wurde nicht in den Zustand aufgenommen.")
	if mission.current_phase_id != "phase.approach":
		return _failure("TEST-ERR-002", "Mission startete nicht in der definierten Startphase.")
	if mission.deadline_month != 3:
		return _failure("TEST-ERR-003", "Absolute Missionsfrist wurde nicht korrekt berechnet.")
	if state.resource_amount("resource.money") != 900:
		return _failure("TEST-ERR-004", "Startkosten wurden nicht korrekt gebucht.")
	return GameResult.success()


func _test_location_requirement() -> GameResult:
	var state := GameSessionState.new()
	state.current_location_id = "location.neon.cellar_club"
	var result := _executor.execute(
		StartMissionCommand.new(MISSION_ID, "test-location-block"), state, _context
	)
	if result.ok:
		return _failure("TEST-ERR-005", "Mission startete trotz falschem Ausgangsort.")
	if not state.missions.is_empty() or state.resource_amount("resource.money") != 1000:
		return _failure("TEST-ERR-006", "Fehlgeschlagener Missionsstart veränderte den Zustand.")
	return GameResult.success()


func _test_signal_phase_transition() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-phase-start", "path.quiet")
	if not start.ok:
		return start
	var signal_result := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-phase-location"
	)
	if not signal_result.ok:
		return signal_result
	var mission := state.get_mission(MISSION_ID)
	if mission.current_phase_id != "phase.recovery":
		return _failure("TEST-ERR-007", "Pflichtziel wechselte nicht in die Folgephase.")
	if not bool(state.flags.get("mission.signal_9909.club_reached", false)):
		return _failure("TEST-ERR-008", "Phasen-Abschlusseffekt wurde nicht ausgeführt.")
	return GameResult.success()


func _test_alternative_path_filter() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-path-start", "path.quiet")
	if not start.ok:
		return start
	var phase_result := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-path-location"
	)
	if not phase_result.ok:
		return phase_result
	var result := _executor.execute(
		AdvanceMissionObjectiveCommand.new(
			MISSION_ID, "publish_distraction", 1, "test-wrong-path-objective"
		),
		state,
		_context
	)
	if result.ok:
		return _failure("TEST-ERR-009", "Ziel des nicht gewählten Pfads wurde akzeptiert.")
	if int(state.get_mission(MISSION_ID).objective_progress.get("publish_distraction", 0)) != 0:
		return _failure("TEST-ERR-010", "Abgewiesenes Pfadziel veränderte den Fortschritt.")
	return GameResult.success()


func _test_completion_and_reward() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-complete-start", "path.quiet")
	if not start.ok:
		return start
	var reach := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-complete-reach"
	)
	if not reach.ok:
		return reach
	var secure := _signal(
		state,
		"mission.recording_secured",
		{"recording_id": "recording.signal_9909"},
		"test-complete-secure"
	)
	if not secure.ok:
		return secure

	var mission := state.get_mission(MISSION_ID)
	if mission.status != MissionStatus.COMPLETED:
		return _failure("TEST-ERR-011", "Mission wurde nicht abgeschlossen.")
	if state.resource_amount("resource.money") != 1700:
		return _failure("TEST-ERR-012", "Belohnung wurde nicht korrekt gebucht.")
	if not bool(state.flags.get("world.signal_9909.secured", false)):
		return _failure("TEST-ERR-013", "Abschlussflag wurde nicht gesetzt.")
	return GameResult.success()


func _test_deadline_partial_success() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-partial-start", "path.loud")
	if not start.ok:
		return start
	var reach := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-partial-reach"
	)
	if not reach.ok:
		return reach
	var month_result := _executor.execute(
		AdvanceCampaignMonthCommand.new(3, "test-partial-month"), state, _context
	)
	if not month_result.ok:
		return month_result
	var mission := state.get_mission(MISSION_ID)
	if mission.status != MissionStatus.PARTIAL_SUCCESS:
		return _failure(
			"TEST-ERR-014", "Frist erzeugte trotz 50 Prozent Fortschritt keinen Teilerfolg."
		)
	if state.resource_amount("resource.money") != 1150:
		return _failure("TEST-ERR-015", "Teilerfolgsbelohnung wurde nicht korrekt gebucht.")
	return GameResult.success()


func _test_deadline_failure() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-failure-start", "path.loud")
	if not start.ok:
		return start
	var month_result := _executor.execute(
		AdvanceCampaignMonthCommand.new(3, "test-failure-month"), state, _context
	)
	if not month_result.ok:
		return month_result
	var mission := state.get_mission(MISSION_ID)
	if mission.status != MissionStatus.FAILED:
		return _failure(
			"TEST-ERR-016",
			"Abgelaufene Mission ohne Fortschritt wurde nicht als Fehlschlag markiert."
		)
	if state.resource_amount("resource.system_pressure") != 10:
		return _failure("TEST-ERR-017", "Fehlschlagsfolge wurde nicht korrekt angewandt.")
	return GameResult.success()


func _test_pause_resume() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-pause-start", "path.quiet")
	if not start.ok:
		return start
	var pause_result := _signal(
		state, "resonance.riss_invoked", {"character_id": "character.pppoppi"}, "test-pause-signal"
	)
	if not pause_result.ok:
		return pause_result
	var mission := state.get_mission(MISSION_ID)
	if mission.status != MissionStatus.PAUSED:
		return _failure("TEST-ERR-018", "Riss-Signal pausierte die Mission nicht.")

	var blocked_signal := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-pause-blocked-signal"
	)
	if not blocked_signal.ok:
		return blocked_signal
	if int(mission.objective_progress.get("reach_neon_club", 0)) != 0:
		return _failure("TEST-ERR-019", "Pausierte Mission erhielt Zielfortschritt.")

	var resume_result := _executor.execute(
		ResumeMissionCommand.new(MISSION_ID, "test-pause-resume"), state, _context
	)
	if not resume_result.ok:
		return resume_result
	if mission.status != MissionStatus.ACTIVE or mission.paused_at_month != -1:
		return _failure("TEST-ERR-020", "Mission wurde nicht sauber fortgesetzt.")
	return GameResult.success()


func _test_cancel_consequences() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-cancel-start", "path.loud")
	if not start.ok:
		return start
	var cancel_result := _executor.execute(
		CancelMissionCommand.new(MISSION_ID, "player_abort", "test-cancel"), state, _context
	)
	if not cancel_result.ok:
		return cancel_result
	var mission := state.get_mission(MISSION_ID)
	if mission.status != MissionStatus.CANCELLED:
		return _failure("TEST-ERR-021", "Mission wurde nicht als abgebrochen markiert.")
	if state.resource_amount("resource.money") != 850:
		return _failure("TEST-ERR-022", "Abbruchfolge wurde nicht korrekt gebucht.")
	return GameResult.success()


func _test_idempotency() -> GameResult:
	var state := GameSessionState.new()
	var command := StartMissionCommand.new(MISSION_ID, "test-duplicate")
	var first := _executor.execute(command, state, _context)
	if not first.ok:
		return first
	var money_after_first := state.resource_amount("resource.money")
	var second := _executor.execute(command, state, _context)
	if not second.ok:
		return second
	if state.resource_amount("resource.money") != money_after_first:
		return _failure("TEST-ERR-023", "Doppelte Transaktion hat erneut Ressourcen verändert.")
	return GameResult.success()


func _test_transaction_id_collision() -> GameResult:
	var state := GameSessionState.new()
	var transaction_id := "test-collision"
	var first := _executor.execute(
		StartMissionCommand.new(MISSION_ID, transaction_id), state, _context
	)
	if not first.ok:
		return first

	var month_before_collision := state.campaign_month_index
	var collision := _executor.execute(
		AdvanceCampaignMonthCommand.new(1, transaction_id), state, _context
	)
	if collision.ok:
		return _failure("TEST-ERR-025", "Kollision der Transaktions-ID wurde akzeptiert.")
	if state.campaign_month_index != month_before_collision:
		return _failure("TEST-ERR-026", "Abgewiesene Kollision veränderte den Zustand.")
	return GameResult.success()


func _test_save_load_roundtrip() -> GameResult:
	var state := GameSessionState.new()
	var start := _start(state, "test-save-start", "path.quiet")
	if not start.ok:
		return start
	var reach := _signal(
		state,
		"world.location_entered",
		{"location_id": "location.neon.cellar_club"},
		"test-save-progress"
	)
	if not reach.ok:
		return reach
	var pause := _signal(state, "resonance.riss_invoked", {}, "test-save-pause")
	if not pause.ok:
		return pause

	var service := SaveService.new()
	var path := "user://mission_iteration_b_self_test.json"
	var save_result := service.save_to_path(path, state)
	if not save_result.ok:
		return save_result
	var load_result := service.load_from_path(path)
	if not load_result.ok:
		return load_result

	var loaded: GameSessionState = load_result.value
	if loaded.to_dict() != state.to_dict():
		return _failure("TEST-ERR-024", "Geladener Zustand unterscheidet sich vom Original.")
	return GameResult.success()


func _start(state: GameSessionState, transaction_prefix: String, path_id: String) -> GameResult:
	var start_result := _executor.execute(
		StartMissionCommand.new(MISSION_ID, "%s:start" % transaction_prefix), state, _context
	)
	if not start_result.ok:
		return start_result
	return _executor.execute(
		SelectMissionPathCommand.new(MISSION_ID, path_id, "%s:path" % transaction_prefix),
		state,
		_context
	)


func _signal(
	state: GameSessionState, signal_type: String, payload: Dictionary, transaction_id: String
) -> GameResult:
	return _executor.execute(
		ApplyMissionSignalCommand.new(signal_type, payload, transaction_id), state, _context
	)


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
