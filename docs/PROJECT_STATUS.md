# Projektstatus

## Stand

**Paket:** 0.4.0-world-iteration-a  
**Engineziel:** Godot 4.6.x, GL Compatibility  
**Primärplattform:** Linux  
**Sekundärplattform:** Windows

## Implementiert

### Fundament

- strukturierte Ergebnisse und Fehler;
- Command-/Effect-Verarbeitung mit atomarem Rollback;
- idempotente Transaktionen und Domain-Event-Bus;
- autoritativer Sitzungszustand;
- atomare Speicherung mit SHA-256;
- Save-Version 3 mit Migration älterer Zustände.

### Missionen – Iteration A bis C

- mehrstufige Missionen, alternative Lösungswege und Fristen;
- Erfolg, Teilerfolg, Fehlschlag und Abbruch;
- Ergebnisqualität von NONE bis GOLD;
- Missionshistorie und sichere Wiederaufnahmepunkte;
- 15 automatisierte Missionstests;
- Massensimulation mit 120 vollständigen Durchläufen.

### Welt – Iteration A

- datengetriebener Stadtgraph mit sechs Orten;
- bidirektionale Verbindungen mit stabilen IDs;
- Reisekosten für Kohle und Vorräte;
- verbindliche Reisevoraussetzungen über Kampagnenflags;
- autoritative Positionsverfolgung im Sitzungszustand;
- atomarer Reise-Command und Reise-Effect;
- Journal- und Domain-Event-Ausgabe für Ortswechsel;
- automatische Missionsfortschreibung beim Betreten eines Ortes;
- vier positive und negative Welt-Selbsttests;
- Save-/Load-Roundtrip der aktuellen Position.

### Werkzeuge

- Paketverifikation und deterministisches Manifest;
- GDScript-Linting und optionale Formatierung;
- automatische ZIP-Erstellung;
- semantische Missionsgraphprüfung.

## Noch nicht implementiert

- Karten-Graybox mit eigenständiger Ortsauswahl;
- Wegfindung über mehrere Verbindungen;
- dynamische Sperrungen, Gefahren und Reiseereignisse;
- Bunkerbasisverwaltung;
- vollständige Figuren- und Beziehungssysteme;
- Resonanz-, Dialog-, Wirtschafts- und Konfliktsystem;
- Musik- und Medienproduktion;
- finales UI, Art und vollständige Kampagne.

## Fortschritt

- Spezifikation und Architektur: 60 %
- Codeimplementierung: 16 %
- Validierungs- und Testinfrastruktur: 20 %
- gewichteter Gesamtfortschritt: 38 %

Die Werte beschreiben den gesamten Weg bis zu einem getesteten Release und nicht nur den Quellcodeumfang.

## Nächster Meilenstein

**WORLD-01 – Iteration B**

- Karten-Graybox mit tastaturbedienbarer Ortsauswahl;
- automatische Mehrschritt-Wegfindung;
- Reisevorschau mit Kosten, Dauer und Sperrgrund;
- dynamische Gefahren- und Kontrollereignisse;
- responsive Darstellung ohne überdeckte Elemente;
- Integration in den sichtbaren Spielablauf.
