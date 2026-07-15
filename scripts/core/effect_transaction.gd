class_name EffectTransaction
extends RefCounted


func execute(effects: Array, state: GameSessionState) -> GameResult:
	var snapshot := state.to_dict()
	var emitted_events: Array = []

	for effect in effects:
		if not effect is GameEffect:
			state.restore_from_dict(snapshot)
			return GameResult.failure(
				GameError.new("CORE-ERR-002", "Ungültiges Objekt in Effekttransaktion.")
			)

		var result: GameResult = effect.apply(state)
		if not result.ok:
			state.restore_from_dict(snapshot)
			return result

		if result.value is Dictionary:
			emitted_events.append_array(result.value.get("events", []))

	var invariant_result := state.validate_invariants()
	if not invariant_result.ok:
		state.restore_from_dict(snapshot)
		return invariant_result

	return GameResult.success({"events": emitted_events})
