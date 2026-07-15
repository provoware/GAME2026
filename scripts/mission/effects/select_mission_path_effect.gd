class_name SelectMissionPathEffect
extends GameEffect

var mission_id: String
var path_id: String


func _init(p_mission_id: String, p_path_id: String) -> void:
	mission_id = p_mission_id
	path_id = p_path_id


func apply(state: GameSessionState) -> GameResult:
	var instance := state.get_mission(mission_id)
	if instance == null:
		return GameResult.failure(
			GameError.new(
				"MISSION-ERR-023",
				"Mission ist im Kampagnenzustand nicht vorhanden.",
				{"mission_id": mission_id}
			)
		)
	if instance.selected_paths.has(path_id):
		return GameResult.success({"events": []}, ["Missionspfad war bereits gewählt."])

	instance.selected_paths.append(path_id)
	(
		state
		. journal
		. append(
			{
				"type": "mission_path_selected",
				"mission_id": mission_id,
				"path_id": path_id,
				"month_index": state.campaign_month_index,
			}
		)
	)
	var event := (
		DomainEvent
		. new(
			"MissionPathSelected",
			{
				"mission_id": mission_id,
				"path_id": path_id,
			},
			state.campaign_month_index
		)
	)
	return GameResult.success({"events": [event]})
