class_name MissionEffectFactory
extends RefCounted


static func create_many(effect_definitions: Array, reason_prefix: String) -> GameResult:
	var effects: Array = []
	for definition in effect_definitions:
		if not definition is Dictionary:
			return GameResult.failure(
				GameError.new("MISSION-ERR-024", "Effektdefinition besitzt ein ungültiges Format.")
			)

		var effect_type := str(definition.get("type", ""))
		match effect_type:
			"modify_resource":
				effects.append(
					ModifyResourceEffect.new(
						str(definition.get("resource_id", "")),
						int(definition.get("amount", 0)),
						"%s:%s" % [reason_prefix, str(definition.get("resource_id", ""))]
					)
				)
			"set_flag":
				effects.append(
					SetFlagEffect.new(
						str(definition.get("flag_id", "")), definition.get("value", true)
					)
				)
			_:
				return GameResult.failure(
					GameError.new(
						"MISSION-ERR-025", "Unbekannter Missionseffekt.", {"type": effect_type}
					)
				)
	return GameResult.success(effects)
