# PPPOPPI – Bunkerwahrheit

Das Repository enthält zwei miteinander verbundene Entwicklungsstränge:

- das bestehende Godot-Fundament mit Command-/Effect-Architektur, Missionen, Save-System und WORLD-01;
- die neue direkt spielbare HTML-Browserfassung **Stadtsektor 9909** unter `web/`.

## Browserfassung direkt starten

`web/index.html` in Firefox oder Chrome öffnen. Es werden keine externen Bibliotheken benötigt; der Spielstand bleibt lokal im Browser.

Die aktuelle Browserfassung enthält:

- interaktive SVG-Stadtkarte mit neun Bezirken;
- dynamische Bezirkswerte für Kontrolle, Rivalen, Polizei und Unruhe;
- Boss-Werte, die sich durch konkrete Taten verändern;
- automatisch entstehende Boss-Profile statt statischer Klassen;
- sieben unterschiedliche Aktionen mit sozialen, wirtschaftlichen, aggressiven und verdeckten Folgen;
- zufällige, vom Boss-Stil beeinflusste Gang-Rekrutierung;
- Crew-Loyalität, Verletzungen, Gangstärke und mögliche Abgänge;
- autonome Rivalenbewegungen und Polizeidruck;
- Gebietseinnahmen, Chronik und lokales Autosave;
- responsive Drei-Bereich-Oberfläche mit klarer Kartenpriorität und progressiv eingeblendeten Details.

Browser-Engine testen:

```bash
node web/tests/engine.test.js
```

Weitere Hinweise: [web/README.md](web/README.md)

## Godot-Fundament

### Fundament

- typisierte Ergebnis- und Fehlerobjekte;
- Command-/Effect-Transaktionskette;
- vollständiger Rollback mehrteiliger Änderungen;
- Domain-Event-Bus;
- autoritativer `GameSessionState`;
- idempotente Transaktionen gegen Doppelbuchungen;
- atomarer JSON-Speicherstand mit SHA-256-Prüfsumme;
- Save-Version 3 mit Migration älterer Zustände.

### Missionen und Welt

- datengetriebene Missionsregistry und striktes JSON-Schema;
- mehrstufige Missionsphasen und alternative Lösungswege;
- pfadabhängige Ziele und neutrale Missionssignale;
- absolute Monatsfristen, Erfolg, Teilerfolg, Fehlschlag und Abbruch;
- Missionshistorie und sichere Wiederaufnahmepunkte;
- datengetriebener Bunker-Ring mit stabilen Orts- und Routen-IDs;
- autoritative Reise- und Positionslogik.

## Godot-Start unter Linux

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
node web/tests/engine.test.js
```

## Paket erzeugen

```bash
chmod +x package.sh
./package.sh
```

## Projektstruktur

```text
content/                Datengetriebene Missions- und Weltinhalte
schemas/                JSON-Schemas
scenes/                 Godot-Szenen
scripts/                Godot-Domain, Save, UI und Tests
web/                    direkt spielbare HTML-Browserfassung
tools/                  Validierung und Paketautomatisierung
docs/                   Spezifikationen und Iterationsberichte
```

## Entwicklungsregel

Jede weitere Fachphase liefert parallel:

1. Spezifikation,
2. ausführbaren Referenzcode,
3. automatisierte Tests,
4. aktualisierte Validierung,
5. nachvollziehbare Dokumentation.

## Entwicklerdokumentation

- [Architektur](docs/ARCHITECTURE.md)
- [Entwicklungsumgebung und Ablauf](docs/DEVELOPMENT.md)
- [Teststrategie](docs/TESTING.md)
- [Content-Erstellung](docs/CONTENT_AUTHORING.md)
- [Sicherheit und lokale Daten](docs/SECURITY_AND_DATA.md)
- [Releaseprozess](docs/RELEASE_PROCESS.md)
- [Aktueller Projektstatus](docs/PROJECT_STATUS.md)
- [Browserfassung](web/README.md)
- [Beitragsrichtlinien](CONTRIBUTING.md)

## GitHub-Arbeitsweise

Änderungen werden auf einem Arbeitsbranch entwickelt und über einen Draft-Pull-Request geprüft. Der GitHub-Actions-Workflow führt bei Pushes und Pull Requests die statische Projekt-, Schema-, Referenz- und Manifestprüfung aus.
