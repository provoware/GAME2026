class_name MissionMassSimulator
extends RefCounted

const MISSION_ID := "mission.neon.signal_9909"


static func run(registry: MissionRegistry, cycles: int = 100) -> GameResult:
	if cycles <= 0:
		return GameResult.failure(
			GameError.new(
				"TEST-ERR-040",
				"Massensimulation benötigt mindestens einen Durchlauf.",
				{"cycles": cycles}
			)
		)

	var event_bus := DomainEventBus.new()
	var executor := CommandExecutor.new(event_bus)
	var context := {"mission_registry": registry}
	var grade_counts: Dictionary = {}
	var completed := 0

	for index in range(cycles):
		var state := GameSessionState.new()
		var path_id := "path.quiet" if index % 2 == 0 else "path.loud"
		var prefix := "mass-%d" % index
		var result := executor.execute(
			StartMissionCommand.new(MISSION_ID, "%s-start" % prefix), state, context
		)
		if not result.ok:
			return result
		result = executor.execute(
			SelectMissionPathCommand.new(MISSION_ID, path_id, "%s-path" % prefix),
			state,
			context
		)
		if not result.ok:
			return result
		result = executor.execute(
			ApplyMissionSignalCommand.new(
				"world.location_entered",
				{"location_id": "location.neon.cellar_club"},
				"%s-location" % prefix
			),
			state,
			context
		)
		if not result.ok:
			return result

		if index % 3 != 0:
			var optional_signal := "world.control_avoided"
			var optional_payload := {"control_id": "control.neon.mobile"}
			if path_id == "path.loud":
				optional_signal = "dialogue.choice_selected"
				optional_payload = {"choice_id": "choice.publish_distraction"}
			result = executor.execute(
				ApplyMissionSignalCommand.new(
					optional_signal, optional_payload, "%s-optional" % prefix
				),
				state,
				context
			)
			if not result.ok:
				return result

		result = executor.execute(
			ApplyMissionSignalCommand.new(
				"mission.recording_secured",
				{"recording_id": "recording.signal_9909"},
				"%s-recording" % prefix
			),
			state,
			context
		)
		if not result.ok:
			return result

		var mission := state.get_mission(MISSION_ID)
		if mission == null or mission.status != MissionStatus.COMPLETED:
			return GameResult.failure(
				GameError.new(
					"TEST-ERR-041",
					"Massensimulation erzeugte keinen stabilen Abschluss.",
					{"cycle": index}
				)
			)
		if state.mission_history.size() != 1:
			return GameResult.failure(
				GameError.new(
					"TEST-ERR-042",
					"Massensimulation erzeugte eine inkonsistente Missionshistorie.",
					{"cycle": index, "history_size": state.mission_history.size()}
				)
			)
		var grade := str(mission.outcome_quality.get("grade", "NONE"))
		grade_counts[grade] = int(grade_counts.get(grade, 0)) + 1
		completed += 1

	return GameResult.success(
		{
			"cycles": cycles,
			"completed": completed,
			"grade_counts": grade_counts,
		}
	)
