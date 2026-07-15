extends Control

const MISSION_ID := "mission.neon.signal_9909"

@onready var status_label: Label = %StatusLabel
@onready var detail_label: Label = %DetailLabel
@onready var tracker_label: Label = %TrackerLabel
@onready var run_button: Button = %RunButton
@onready var partial_button: Button = %PartialButton
@onready var pause_button: Button = %PauseButton
@onready var save_button: Button = %SaveButton

var _registry := MissionRegistry.new()
var _event_bus := DomainEventBus.new()
var _executor := CommandExecutor.new(_event_bus)
var _state := GameSessionState.new()
var _context: Dictionary
var _save_service := SaveService.new()
var _transaction_counter := 0


func _ready() -> void:
	_context = {"mission_registry": _registry}
	run_button.pressed.connect(_run_success_slice)
	partial_button.pressed.connect(_run_partial_slice)
	pause_button.pressed.connect(_toggle_pause_slice)
	save_button.pressed.connect(_save_and_reload)
	_event_bus.event_published.connect(_on_domain_event)

	var registry_result := _registry.load_directory("res://content/missions")
	if not registry_result.ok:
		_show_error(registry_result)
		_set_actions_disabled(true)
		return

	status_label.text = "Bereit – %d Missionsdefinition(en) geladen" % int(registry_result.value)
	detail_label.text = "MISSION-01 · Iteration B\nPhasen, Pfade, Signale, Fristen, Teilerfolg und Unterbrechung sind aktiv."
	_refresh_tracker()

	if bool(ProjectSettings.get_setting("debug/settings/run_self_tests_on_start", true)):
		_run_self_tests()


func _run_self_tests() -> void:
	var runner := TestRunner.new(_registry)
	var report := runner.run_all()
	if int(report["passed"]) == int(report["total"]):
		status_label.text = "Selbsttests bestanden: %d/%d" % [report["passed"], report["total"]]
	else:
		status_label.text = (
			"Selbsttests fehlgeschlagen: %d/%d" % [report["passed"], report["total"]]
		)
		detail_label.text = "\n".join(report["failures"])


func _run_success_slice() -> void:
	_state = GameSessionState.new()
	var steps: Array[String] = []

	var result := _execute(StartMissionCommand.new(MISSION_ID, _tx("success-start")))
	if not _append_step(result, steps, "Mission gestartet; absolute Frist gesetzt."):
		return
	result = _execute(SelectMissionPathCommand.new(MISSION_ID, "path.quiet", _tx("success-path")))
	if not _append_step(result, steps, "Leiser Lösungsweg gewählt."):
		return
	result = _execute(
		ApplyMissionSignalCommand.new(
			"world.location_entered",
			{"location_id": "location.neon.cellar_club"},
			_tx("success-location")
		)
	)
	if not _append_step(result, steps, "Kellerclub erreicht; Folgephase aktiviert."):
		return
	result = _execute(
		ApplyMissionSignalCommand.new(
			"world.control_avoided", {"control_id": "control.neon.mobile"}, _tx("success-control")
		)
	)
	if not _append_step(result, steps, "Optionales Pfadziel erfüllt."):
		return
	result = _execute(
		ApplyMissionSignalCommand.new(
			"mission.recording_secured",
			{"recording_id": "recording.signal_9909"},
			_tx("success-recording")
		)
	)
	if not _append_step(result, steps, "Aufnahme gesichert; Mission abgeschlossen."):
		return

	status_label.text = "Vertikaler Erfolgsablauf abgeschlossen"
	detail_label.text = (
		"%s\n\nKohle: %d · Einfluss: %d"
		% [
			"\n".join(steps),
			_state.resource_amount("resource.money"),
			_state.resource_amount("resource.influence"),
		]
	)
	_refresh_tracker()


func _run_partial_slice() -> void:
	_state = GameSessionState.new()
	var steps: Array[String] = []

	var result := _execute(StartMissionCommand.new(MISSION_ID, _tx("partial-start")))
	if not _append_step(result, steps, "Mission gestartet."):
		return
	result = _execute(SelectMissionPathCommand.new(MISSION_ID, "path.loud", _tx("partial-path")))
	if not _append_step(result, steps, "Öffentlicher Lösungsweg gewählt."):
		return
	result = _execute(
		ApplyMissionSignalCommand.new(
			"world.location_entered",
			{"location_id": "location.neon.cellar_club"},
			_tx("partial-location")
		)
	)
	if not _append_step(result, steps, "Erste Phase abgeschlossen."):
		return
	result = _execute(AdvanceCampaignMonthCommand.new(3, _tx("partial-deadline")))
	if not _append_step(result, steps, "Absolute Frist erreicht; Teilerfolg aufgelöst."):
		return

	status_label.text = "Teilerfolgsablauf abgeschlossen"
	detail_label.text = (
		"%s\n\nDie Mission bleibt nicht offen und wird deterministisch abgerechnet."
		% "\n".join(steps)
	)
	_refresh_tracker()


func _toggle_pause_slice() -> void:
	var mission := _state.get_mission(MISSION_ID)
	if mission == null or MissionStatus.is_terminal(mission.status):
		_state = GameSessionState.new()
		var start_result := _execute(StartMissionCommand.new(MISSION_ID, _tx("pause-start")))
		if not start_result.ok:
			_show_error(start_result)
			return
		var path_result := _execute(
			SelectMissionPathCommand.new(MISSION_ID, "path.quiet", _tx("pause-path"))
		)
		if not path_result.ok:
			_show_error(path_result)
			return
		mission = _state.get_mission(MISSION_ID)

	var result: GameResult
	if mission.status == MissionStatus.PAUSED:
		result = _execute(ResumeMissionCommand.new(MISSION_ID, _tx("resume")))
		status_label.text = "Mission fortgesetzt" if result.ok else "Fortsetzung fehlgeschlagen"
	else:
		result = _execute(
			ApplyMissionSignalCommand.new(
				"resonance.riss_invoked", {"character_id": "character.pppoppi"}, _tx("riss")
			)
		)
		status_label.text = (
			"Mission durch ‚Riss‘ sicher pausiert" if result.ok else "Pausierung fehlgeschlagen"
		)
	if not result.ok:
		_show_error(result)
		return
	detail_label.text = "Pausierte Missionen erhalten keine Zielfortschritte. Absolute Fristen laufen laut Missionsdefinition weiter."
	_refresh_tracker()


func _save_and_reload() -> void:
	var path := "user://pppoppi_mission_iteration_b.json"
	var save_result := _save_service.save_to_path(path, _state)
	if not save_result.ok:
		_show_error(save_result)
		return
	var load_result := _save_service.load_from_path(path)
	if not load_result.ok:
		_show_error(load_result)
		return
	_state = load_result.value
	status_label.text = "Speichern und Laden erfolgreich"
	detail_label.text = (
		"Pfad: %s\nMissionen: %d\nJournal-Einträge: %d\nMonat: %d"
		% [
			path,
			_state.missions.size(),
			_state.journal.size(),
			_state.campaign_month_index,
		]
	)
	_refresh_tracker()


func _execute(command: GameCommand) -> GameResult:
	return _executor.execute(command, _state, _context)


func _append_step(result: GameResult, steps: Array[String], text: String) -> bool:
	if not result.ok:
		_show_error(result)
		return false
	steps.append(text)
	return true


func _refresh_tracker() -> void:
	var mission := _state.get_mission(MISSION_ID)
	if mission == null:
		tracker_label.text = "MISSIONSTRACKER\nKeine aktive Mission."
		pause_button.text = "Riss / Fortsetzen demonstrieren"
		return

	var definition := _registry.get_definition(MISSION_ID)
	var phase_id := MissionRules.resolve_current_phase_id(definition, mission)
	var phase := definition.phase_by_id(phase_id)
	var objective_lines: Array[String] = []
	for objective_value in definition.applicable_objectives(phase_id, mission.selected_paths):
		var objective: Dictionary = objective_value
		var objective_id := str(objective.get("id", ""))
		(
			objective_lines
			. append(
				(
					"%s: %d/%d%s"
					% [
						str(objective.get("title", objective_id)),
						int(mission.objective_progress.get(objective_id, 0)),
						int(objective.get("target", 1)),
						" · optional" if not bool(objective.get("required", true)) else "",
					]
				)
			)
		)

	tracker_label.text = (
		"MISSIONSTRACKER\n%s\nStatus: %s\nPhase: %s\nPfad: %s\nFrist: Monat %d\n\n%s"
		% [
			definition.title,
			mission.status,
			str(phase.get("title", phase_id)),
			(
				", ".join(mission.selected_paths)
				if not mission.selected_paths.is_empty()
				else "noch offen"
			),
			mission.deadline_month,
			"\n".join(objective_lines),
		]
	)
	pause_button.text = (
		"Mission fortsetzen"
		if mission.status == MissionStatus.PAUSED
		else "Riss auslösen / pausieren"
	)


func _tx(label: String) -> String:
	_transaction_counter += 1
	return "ui-%s-%d" % [label, _transaction_counter]


func _on_domain_event(event: DomainEvent) -> void:
	print("[DomainEvent] %s %s" % [event.event_type, event.payload])


func _show_error(result: GameResult) -> void:
	status_label.text = "Fehler"
	detail_label.text = result.first_error_message()
	_refresh_tracker()


func _set_actions_disabled(disabled: bool) -> void:
	run_button.disabled = disabled
	partial_button.disabled = disabled
	pause_button.disabled = disabled
	save_button.disabled = disabled
