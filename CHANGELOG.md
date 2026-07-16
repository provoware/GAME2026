# Changelog

## 0.4.0-world-iteration-a

- datengetriebenen Stadtgraph mit sechs Orten ergänzt
- bidirektionale Verbindungen, Reisekosten und stabile Routen-IDs implementiert
- Reisevoraussetzungen über Kampagnenflags eingeführt
- autoritativen Ortswechsel über Command und Effect umgesetzt
- Reisebuchungen atomar mit Ressourcen, Journal und Domain Events gekoppelt
- Welt- und Missionssystem über `world.location_entered` verbunden
- direkte unzulässige Reisen ohne Zustandsänderung blockiert
- Save-/Load-Roundtrip für die aktuelle Weltposition geprüft
- vier WORLD-01-Selbsttests ergänzt

## 0.3.0-mission-iteration-c

- Zustands- und Missionsschema auf Version 3 erweitert
- automatische Migration bestehender v1-/v2-Speicherstände ergänzt
- Ergebnisqualität mit den Graden NONE, FRAGMENT, BRONZE, SILVER und GOLD implementiert
- optionale und pfadabhängige Ziele in die Qualitätsberechnung aufgenommen
- unveränderliche Missionshistorie für alle terminalen Ergebnisse ergänzt
- sichere Wiederaufnahmepunkte beim Start, Phasenwechsel und bei Unterbrechungen eingeführt
- kontrollierten Restore-Command mit Journal- und Domain-Event-Anbindung ergänzt
- Abschluss, Teilerfolg, Fehlschlag und Abbruch einheitlich bewertet und archiviert
- vier zusätzliche Iteration-C-Regressionsprüfungen ergänzt
- deterministische Massensimulation mit 120 vollständigen Missionsdurchläufen ergänzt

## 0.2.0-mission-iteration-b

- Missionsdefinition auf mehrstufige Phasen erweitert
- alternative Lösungswege und pfadabhängige Ziele ergänzt
- neutrale Missionssignale für spätere Fachmodule eingeführt
- absolute Monatsfristen implementiert
- Teilerfolg und Fehlschlag bei Fristablauf umgesetzt
- Missionspause, Fortsetzung und Riss-Unterbrechung ergänzt
- kontrollierten Missionsabbruch mit Folgeeffekten implementiert
- Zustandsformat auf Version 2 erweitert und Migration vorbereitet
- Missionstracker-Graybox mit Tastaturfokus ergänzt
- Selbsttests von fünf auf elf Fälle erweitert
- JSON-Schema und semantische Missionsgraphprüfung ergänzt
- GDScript-Linting und automatische Formatierung eingerichtet
- Manifest- und ZIP-Erzeugung automatisiert

## 0.1.0-foundation-mission

- Godot-Projektgerüst angelegt
- Compatibility Renderer aktiviert
- Command-/Effect-Architektur implementiert
- idempotente Transaktionsverarbeitung ergänzt
- MissionRegistry und Missionsdefinitionen implementiert
- Missionsstart, Fortschritt, Abschluss und Belohnungen implementiert
- atomare Save-/Load-Funktion ergänzt
- vertikalen Missionstest und Selbsttests hinzugefügt
