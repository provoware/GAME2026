class_name MissionStatus
extends RefCounted

const LOCKED := "LOCKED"
const AVAILABLE := "AVAILABLE"
const ACTIVE := "ACTIVE"
const PAUSED := "PAUSED"
const COMPLETED := "COMPLETED"
const PARTIAL_SUCCESS := "PARTIAL_SUCCESS"
const FAILED := "FAILED"
const CANCELLED := "CANCELLED"
const TRANSFORMED := "TRANSFORMED"


static func is_valid(value: String) -> bool:
	return (
		value
		in [
			LOCKED,
			AVAILABLE,
			ACTIVE,
			PAUSED,
			COMPLETED,
			PARTIAL_SUCCESS,
			FAILED,
			CANCELLED,
			TRANSFORMED,
		]
	)


static func is_terminal(value: String) -> bool:
	return value in [COMPLETED, PARTIAL_SUCCESS, FAILED, CANCELLED, TRANSFORMED]


static func can_progress(value: String) -> bool:
	return value == ACTIVE


static func can_pause(value: String) -> bool:
	return value == ACTIVE
