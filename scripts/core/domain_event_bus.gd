class_name DomainEventBus
extends RefCounted

signal event_published(event: DomainEvent)

var _history: Array = []


func publish(event: DomainEvent) -> void:
	_history.append(event)
	event_published.emit(event)


func publish_many(events: Array) -> void:
	for event in events:
		if event is DomainEvent:
			publish(event)


func history() -> Array:
	return _history.duplicate()
