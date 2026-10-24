class_name SaveRecoveryCopyService
extends RefCounted

# SAV-04: Nur explizit ausgewaehlte und gepruefte Kopien.
# Hauptstand, Sicherungen und .tmp werden niemals aktiviert oder verschoben.
const SUFFIXES := {"main": "", "backup": ".bak", "previous_backup": ".bak.previous"}


func copy_candidate(save_path: String, role: String, destination_path: String) -> GameResult:
	if not SUFFIXES.has(role):
		return _failure("REC-COPY-001", "Nur bestaetigte Speicherrollen sind zulaessig.")
	if not save_path.begins_with("user://") or save_path.contains(".."):
		return _failure("REC-COPY-002", "Nur lokale Spielstandpfade sind zulaessig.")
	var prefix := "%s.recovered." % save_path
	if not destination_path.begins_with(prefix) or not destination_path.ends_with(".json"):
		return _failure("REC-COPY-003", "Ziel muss eine separate Recovery-Kopie sein.")
	var identifier := destination_path.substr(
		prefix.length(), destination_path.length() - prefix.length() - 5
	)
	if identifier.is_empty() or not identifier.is_valid_int() or int(identifier) <= 0:
		return _failure("REC-COPY-003", "Recovery-Kopie benoetigt eine positive Kennzahl.")
	if destination_path.contains("..") or destination_path.contains("\\"):
		return _failure("REC-COPY-003", "Ungueltiger Recovery-Zielpfad.")
	var source_path: String = save_path + str(SUFFIXES[role])
	if not FileAccess.file_exists(source_path):
		return _failure("REC-COPY-004", "Ausgewaehlte Quelle fehlt.")
	if _destination_exists(destination_path):
		return _failure("REC-COPY-005", "Recovery-Ziel ist bereits belegt.")

	var service := SaveService.new()
	if not service.load_from_path(source_path).ok:
		return _failure("REC-COPY-006", "Quelle ist nicht als gueltiger Spielstand lesbar.")
	var before := FileAccess.get_file_as_string(source_path)
	if before.is_empty() or _destination_exists(destination_path):
		return _failure("REC-COPY-007", "Quelle leer oder Recovery-Ziel inzwischen belegt.")

	# Keine Schreiboperation an Quelle, Hauptstand oder Sicherungen.
	var copy_error := _copy_file(
		ProjectSettings.globalize_path(source_path),
		ProjectSettings.globalize_path(destination_path)
	)
	if copy_error != OK:
		return _failure("REC-COPY-008", "Recovery-Kopie konnte nicht geschrieben werden.")
	if not FileAccess.file_exists(destination_path):
		return _failure("REC-COPY-009", "Recovery-Kopie fehlt nach dem Kopieren.")
	var after := FileAccess.get_file_as_string(source_path)
	var copied := FileAccess.get_file_as_string(destination_path)
	if before != after or before != copied:
		return _failure("REC-COPY-010", "Quelle oder Kopie hat sich beim Kopieren geaendert.")
	if not service.load_from_path(destination_path).ok:
		return _failure("REC-COPY-011", "Recovery-Kopie besteht die erneute Pruefung nicht.")
	return GameResult.success(destination_path)


func _destination_exists(path: String) -> bool:
	return FileAccess.file_exists(path) or DirAccess.dir_exists_absolute(
		ProjectSettings.globalize_path(path)
	)


func _copy_file(source: String, destination: String) -> Error:
	return DirAccess.copy_absolute(source, destination)


func _failure(code: String, message: String) -> GameResult:
	return GameResult.failure(GameError.new(code, message))
