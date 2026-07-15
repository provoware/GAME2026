class_name GameEffect
extends RefCounted


func apply(_state: GameSessionState) -> GameResult:
	return GameResult.failure(
		GameError.new("CORE-ERR-001", "Abstrakter Effekt wurde direkt ausgeführt.")
	)
