# Projektstatus

## Stand

**Paket:** 0.3.0-mission-iteration-c  
**Engineziel:** Godot 4.6.x, GL Compatibility  
**Primärplattform:** Linux  
**Sekundärplattform:** Windows

## Implementiert

### Fundament

- strukturierte Ergebnisse und Fehler;
- Command-/Effect-Verarbeitung;
- atomarer Rollback;
- idempotente Transaktionen;
- Domain-Event-Bus;
- autoritativer Sitzungszustand;
- atomare Speicherung mit SHA-256;
- Save-Version 3 mit Migration älterer Zustände.

### Missionen – Iteration A bis C

- JSON-basierte Missionsregistry und striktes Schema;
- mehrstufige Phasen und alternative Lösungswege;
- pfadabhängige Ziele und neutrale Missionssignale;
- absolute Fristen, Erfolg, Teilerfolg, Fehlschlag und Abbruch;
- Pause und Fortsetzung durch `Riss`;
- Ergebnisqualität von NONE bis GOLD;
- dauerhafte Missionshistorie mit Pfad-, Phasen- und Ergebnisdaten;
- sichere Wiederaufnahmepunkte beim Start, Phasenwechsel und bei Unterbrechungen;
- kontrollierte Wiederherstellung über Command und Effect;
- Graybox-Missionstracker;
- 15 automatisierte Selbsttests;
- Massensimulation mit 120 vollständigen Durchläufen.

### Werkzeuge

- Paketverifikation;
- Manifest mit SHA-256-Prüfsummen;
- GDScript-Linting und optionale Formatierung;
- automatische ZIP-Erstellung;
- semantische Missionsgraphprüfung;
- statische Weltgraph- und Erreichbarkeitsprüfung mit zehn Negativ-/Positivtests (noch keine spielbare Reise).

## Vorrelease – Sicherheitsarbeit (noch nicht freigegeben)

- SAV-04: Sicherungsrotation auf separatem Arbeitszweig überarbeitet; alte Sicherungen und unklare Zwischenstände werden vor Überschreiben geschützt.
- Sechs statische Quelltextverträge und sechs isolierte Godot-Tests sind eingebunden; Godot 4.6 und vollständige Stromausfall-/Recovery-Prüfung sind noch offen.
- Release-Gate bleibt ROT; siehe `docs/SAVE_BACKUP_SAFETY_GATE_20261023.md` und `docs/VORRELEASE_PFLICHTMATRIX.md`.

## Noch nicht implementiert

- Missionstransformationen und Folgeaufträge;
- vollständige Archivansicht im finalen UI;
- Welt- und Stadtgraph;
- Bunkerbasisverwaltung;
- vollständige Figuren- und Beziehungssysteme;
- Resonanzsystem;
- Dialogsystem;
- Wirtschaft;
- Konfliktsystem;
- Musik- und Medienproduktion;
- finales UI und Art;
- vollständige Kampagne.

## Fortschritt

- Spezifikation und Architektur: 57 %
- Codeimplementierung: 12 %
- Validierungs- und Testinfrastruktur: 17 %
- gewichteter Gesamtfortschritt: 34 %

Die Werte beschreiben den gesamten Weg bis zu einem getesteten Release und nicht nur den Quellcodeumfang.

## Nächster Meilenstein

**WORLD-01 – Iteration A**

- datengetriebener Welt- und Stadtgraph;
- erreichbare Orte, Verbindungen und Reisekosten;
- autoritative Positionsverfolgung;
- Missionstrigger beim Betreten eines Ortes;
- Karten-Graybox mit tastaturbedienbarer Ortsauswahl;
- positive und negative Routentests;
- Save-/Load-Roundtrip für Weltzustände.
