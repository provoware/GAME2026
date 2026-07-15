# PPPOPPI – Bunkerwahrheit

Professionelles Godot-Grundprojekt für die schrittweise, testbare Umsetzung des Spiels.

## Aktueller implementierter Umfang

### Fundament

- typisierte Ergebnis- und Fehlerobjekte
- Command-/Effect-Transaktionskette
- vollständiger Rollback mehrteiliger Änderungen
- Domain-Event-Bus
- autoritativer `GameSessionState`
- idempotente Transaktionen gegen Doppelbuchungen
- atomarer JSON-Speicherstand mit SHA-256-Prüfsumme
- Migration des Zustandsformats von Version 1 auf Version 2

### MISSION-01 · Iteration A und B

- datengetriebene Missionsregistry
- striktes JSON-Schema für Missionscontent
- mehrstufige Missionsphasen
- alternative Lösungswege mit Voraussetzungen
- pfadabhängige Pflicht- und optionale Ziele
- neutrale Missionssignale für Welt, Dialog, Figuren und Resonanz
- absolute Monatsfristen
- voller Erfolg, Teilerfolg, Fehlschlag und Abbruch
- sichere Missionspause und Fortsetzung
- automatische Pause durch das Signal `resonance.riss_invoked`
- Abbruch-, Fehlschlags- und Teilerfolgsfolgen
- Missionsgraph- und Erreichbarkeitsprüfung
- Missionstracker als Graybox-Oberfläche
- elf automatisierte Selbsttests

## Start unter Linux

```bash
chmod +x start.sh
./start.sh
```

Das Startskript sucht `godot4`, `godot` oder eine lokale Godot-Binärdatei unter `./tools/`.

## Tests

```bash
chmod +x test.sh verify.sh
./verify.sh
./test.sh
```

- `verify.sh` erneuert das deterministische Manifest und prüft GDScript, JSON-Schema, Missionsgraphen, IDs, Ressourcenpfade und Prüfsummen.
- `test.sh` führt die Godot-Selbsttests aus, sobald eine Godot-4-Binärdatei verfügbar ist.

## Paket erzeugen

```bash
chmod +x package.sh
./package.sh
```

Der Ablauf formatiert den GDScript-Code, baut das Manifest neu auf, prüft das Projekt und erzeugt anschließend ein ZIP-Paket.

## Vertikaler Referenzablauf

```text
Mission starten
→ Lösungsweg wählen
→ Welt- oder Dialogsignal empfangen
→ Ziel automatisch fortschreiben
→ Folgephase aktivieren
→ Riss-Unterbrechung verarbeiten
→ Frist oder Abschluss auflösen
→ Folgen atomar buchen
→ Zustand speichern und laden
```

## Projektstruktur

```text
content/missions/       Missionsdefinitionen als JSON
schemas/                JSON-Schemas
scenes/                 Godot-Szenen
scripts/core/            Grundarchitektur
scripts/mission/         Missionssystem
scripts/save/            Speicherarchitektur
scripts/ui/              Präsentationsschicht
scripts/tests/           Selbsttests
tools/                   Validierung und Paketautomatisierung
docs/                    Spezifikationen und Iterationsberichte
```

## Entwicklungsregel

Jede weitere Fachphase liefert parallel:

1. Spezifikation,
2. ausführbaren Referenzcode,
3. automatisierte Tests,
4. aktualisierte Validierung,
5. neues Downloadpaket.

Der aktuelle Code ist ein belastbares vertikales Fundament, noch kein vollständiges Spiel.

## Entwicklerdokumentation

- [Architektur](docs/ARCHITECTURE.md)
- [Entwicklungsumgebung und Ablauf](docs/DEVELOPMENT.md)
- [Teststrategie](docs/TESTING.md)
- [Content-Erstellung](docs/CONTENT_AUTHORING.md)
- [Sicherheit und lokale Daten](docs/SECURITY_AND_DATA.md)
- [Releaseprozess](docs/RELEASE_PROCESS.md)
- [Aktueller Projektstatus](docs/PROJECT_STATUS.md)
- [Beitragsrichtlinien](CONTRIBUTING.md)

## GitHub-Arbeitsweise

Änderungen werden auf einem Arbeitsbranch entwickelt und über einen Draft-Pull-Request geprüft. Der GitHub-Actions-Workflow führt bei Pushes und Pull Requests die statische Projekt-, Schema-, Referenz- und Manifestprüfung aus.
