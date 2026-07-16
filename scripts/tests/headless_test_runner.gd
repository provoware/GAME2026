extends SceneTree

func _initialize() -> void:
	var mission_registry := MissionRegistry.new()
	var mission_result := mission_registry.load_directory("res://content/missions")
	if not mission_result.ok:
		push_error(mission_result.first_error_message())
		quit(1)
		return
	var world_registry := WorldRegistry.new()
	var world_result := world_registry.load_from_path("res://content/world/city_graph.json")
	if not world_result.ok:
		push_error(world_result.first_error_message())
		quit(1)
		return
	var reports := [
		TestRunner.new(mission_registry).run_all(),
		IterationCTestRunner.new(mission_registry).run_all(),
		WorldTestRunner.new(world_registry, mission_registry).run_all(),
	]
	var passed := 0
	var total := 0
	var failures: Array = []
	for report_value in reports:
		var report: Dictionary = report_value
		passed += int(report.get("passed", 0))
		total += int(report.get("total", 0))
		failures.append_array(report.get("failures", []) as Array)
	print("[Tests] %d/%d bestanden" % [passed, total])
	for failure in failures:
		push_error(str(failure))
	quit(0 if passed == total else 1)
