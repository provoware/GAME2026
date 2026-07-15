class_name GameSessionState
extends RefCounted

const SCHEMA_VERSION := 2

var schema_version: int = SCHEMA_VERSION
var campaign_id: String = "campaign-local"
var campaign_month_index: int = 0
var current_location_id: String = "location.bunker.main"
var resources: Dictionary = {}
var flags: Dictionary = {}
var available_characters: Dictionary = {}
var unlocked_abilities: Dictionary = {}
var missions: Dictionary = {}
var journal: Array = []
var processed_transactions: Dictionary = {}


func _init() -> void:
	resources = {
		"resource.money": 1000,
		"resource.material": 20,
		"resource.supply.general": 10,
		"resource.influence": 0,
		"resource.system_pressure": 0,
	}
	available_characters = {
		"character.pppoppi": true,
		"character.etna_ruppen": true,
		"character.onkel_knister": true,
		"character.milchmaedchen_piet": true,
		"character.lass_sie": true,
		"character.viertel_mumpi_paule": true,
	}
	unlocked_abilities = {
		"ability.paule.quarter_truth": true,
		"ability.etna.anchor": true,
	}


func resource_amount(resource_id: String) -> int:
	return int(resources.get(resource_id, 0))


func is_character_available(character_id: String) -> bool:
	return bool(available_characters.get(character_id, false))


func is_ability_unlocked(ability_id: String) -> bool:
	return bool(unlocked_abilities.get(ability_id, false))


func has_processed_transaction(transaction_id: String) -> bool:
	return processed_transactions.has(transaction_id)


func mark_transaction_processed(transaction_id: String, summary: Dictionary) -> void:
	processed_transactions[transaction_id] = summary.duplicate(true)


func get_mission(mission_id: String) -> MissionInstanceState:
	return missions.get(mission_id) as MissionInstanceState


func to_dict() -> Dictionary:
	var mission_data: Dictionary = {}
	for mission_id in missions:
		var instance: MissionInstanceState = missions[mission_id]
		mission_data[mission_id] = instance.to_dict()

	return {
		"schema_version": schema_version,
		"campaign_id": campaign_id,
		"campaign_month_index": campaign_month_index,
		"current_location_id": current_location_id,
		"resources": resources.duplicate(true),
		"flags": flags.duplicate(true),
		"available_characters": available_characters.duplicate(true),
		"unlocked_abilities": unlocked_abilities.duplicate(true),
		"missions": mission_data,
		"journal": journal.duplicate(true),
		"processed_transactions": processed_transactions.duplicate(true),
	}


func restore_from_dict(data: Dictionary) -> GameResult:
	var found_version := int(data.get("schema_version", 1))
	if found_version < 1 or found_version > SCHEMA_VERSION:
		return GameResult.failure(
			GameError.new(
				"SAVE-ERR-001",
				"Unbekannte Speicherstandversion.",
				{"found": found_version, "maximum_supported": SCHEMA_VERSION}
			)
		)

	schema_version = SCHEMA_VERSION
	campaign_id = str(data.get("campaign_id", "campaign-local"))
	campaign_month_index = int(data.get("campaign_month_index", 0))
	current_location_id = str(data.get("current_location_id", "location.bunker.main"))
	resources = (data.get("resources", {}) as Dictionary).duplicate(true)
	flags = (data.get("flags", {}) as Dictionary).duplicate(true)
	available_characters = (
		(data.get("available_characters", _default_available_characters()) as Dictionary)
		. duplicate(true)
	)
	unlocked_abilities = (
		(data.get("unlocked_abilities", _default_unlocked_abilities()) as Dictionary)
		. duplicate(true)
	)
	journal = (data.get("journal", []) as Array).duplicate(true)
	processed_transactions = (data.get("processed_transactions", {}) as Dictionary).duplicate(true)
	missions.clear()

	var raw_missions: Dictionary = data.get("missions", {}) as Dictionary
	for mission_id in raw_missions:
		var instance_result := MissionInstanceState.from_dict(raw_missions[mission_id])
		if not instance_result.ok:
			return instance_result
		missions[mission_id] = instance_result.value

	return validate_invariants()


func _default_available_characters() -> Dictionary:
	return {
		"character.pppoppi": true,
		"character.etna_ruppen": true,
		"character.onkel_knister": true,
		"character.milchmaedchen_piet": true,
		"character.lass_sie": true,
		"character.viertel_mumpi_paule": true,
	}


func _default_unlocked_abilities() -> Dictionary:
	return {
		"ability.paule.quarter_truth": true,
		"ability.etna.anchor": true,
	}


func validate_invariants() -> GameResult:
	if campaign_month_index < 0:
		return GameResult.failure(
			GameError.new(
				"WORLD-ERR-011",
				"Negativer Kampagnenmonat ist unzulässig.",
				{"campaign_month_index": campaign_month_index}
			)
		)
	if current_location_id.strip_edges().is_empty():
		return GameResult.failure(
			GameError.new("WORLD-ERR-012", "Kampagnenzustand besitzt keinen gültigen Standort.")
		)

	for resource_id in resources:
		var amount := int(resources[resource_id])
		if amount < 0:
			return GameResult.failure(
				GameError.new(
					"ECON-ERR-016",
					"Unzulässiger negativer Ressourcenbestand.",
					{"resource_id": resource_id, "amount": amount}
				)
			)

	for mission_id in missions:
		var mission: MissionInstanceState = missions[mission_id]
		var result := mission.validate_invariants()
		if not result.ok:
			return result

	return GameResult.success()
