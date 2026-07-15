extends SceneTree


func _initialize() -> void:
	var registry := MissionRegistry.new()
	var registry_result := registry.load_directory("res://content/missions")
	if not registry_result.ok:
		push_error(registry_result.first_error_message())
		quit(1)
		return

	var runner := TestRunner.new(registry)
	var report := runner.run_all()
	print("[Tests] %d/%d bestanden" % [report["passed"], report["total"]])
	for failure in report["failures"]:
		push_error(str(failure))

	quit(0 if int(report["passed"]) == int(report["total"]) else 1)
