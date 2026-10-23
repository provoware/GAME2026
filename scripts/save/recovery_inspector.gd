class_name SaveRecoveryInspector
extends RefCounted

# SAV-04: ausschließlich lesende Diagnose. Keine Datei wird verschoben,
# entfernt, umbenannt oder automatisch als Spielstand aktiviert.
const SUFFIXES := ["", ".bak", ".bak.previous", ".tmp"]
const ROLES := ["main", "backup", "previous_backup", "uncommitted_temp"]


func inspect(path: String) -> Dictionary:
	var service := SaveService.new()
	var candidates: Array[Dictionary] = []
	var manual_candidate := ""
	var interruption_evidence := false
	var damaged_main := false

	for index in range(SUFFIXES.size()):
		var suffix: String = SUFFIXES[index]
		var candidate_path := "%s%s" % [path, suffix]
		var exists := FileAccess.file_exists(candidate_path)
		var entry := {
			"path": candidate_path,
			"role": ROLES[index],
			"status": "MISSING",
		}
		if exists:
			var loaded := service.load_from_path(candidate_path)
			if loaded.ok:
				entry["status"] = "VALID"
				# Eine .tmp ist noch kein aktivierter Spielstand.
				if manual_candidate.is_empty() and suffix != ".tmp":
					manual_candidate = candidate_path
			else:
				entry["status"] = "INVALID"
				entry["reason"] = loaded.first_error_message()
				if suffix.is_empty():
					damaged_main = true
		if exists and (suffix == ".tmp" or suffix == ".bak.previous"):
			interruption_evidence = true
		candidates.append(entry)

	return {
		"candidates": candidates,
		"candidate_for_manual_review": manual_candidate,
		"manual_review_required": interruption_evidence or damaged_main or manual_candidate != path,
		"auto_restore_allowed": false,
		"read_only": true,
	}
