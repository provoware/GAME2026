# PPPOPPI – Bunkerwahrheit

Das Repository enthält das Godot-Fundament und die direkt spielbare HTML-Browserfassung **Stadtsektor 9909** unter `web/`.

## Browserfassung 0.7.0

`web/index.html` in Firefox oder Chrome öffnen. Keine externen Bibliotheken erforderlich; Speicherung erfolgt lokal im Browser.

Aktueller Umfang:

- interaktive SVG-Stadtkarte mit neun Bezirken;
- dynamische Bezirks- und Bosswerte;
- 13 Handlungsoptionen in Geschäft, Einfluss und Konflikt;
- kaufbare Stadtobjekte mit Kaufpreis, Unterhalt und laufendem Nettoertrag;
- Hotel, Lagerhaus, Clubbeteiligung, Werkstatt, Spätkauf, Funkzentrale und Wohnblock-Anteil;
- Portfolioübersicht und Besitz-Cashflow;
- Boss-Zentrale mit Vermögen, Risiko, Rekrutierung, Crew-Bereitschaft und Rang;
- Kampfprognose und animierte Kampfdarstellung;
- zufällige Rekrutierung, Loyalität, Verletzungen und Abgänge;
- Rivalen- und Polizeidruck;
- lokales Autosave mit Übernahme des 0.6.0-Browserstands.

Browser-Engine testen:

```bash
node web/tests/engine.test.js
```

Aktueller Browser-Teststand: **13/13 PASS**, zusätzlich Syntaxcheck, DOM-ID-Abgleich und 500-Zug-Simulation.

Weitere Hinweise: [web/README.md](web/README.md)

## Godot-Fundament

Das bestehende Godot-Projekt enthält Command-/Effect-Architektur, Missionen, Save-System, Weltgraph, automatisierte Selbsttests und Paket-/Validierungswerkzeuge.

## Tests

```bash
chmod +x test.sh verify.sh
./verify.sh
./test.sh
node web/tests/engine.test.js
```

## Projektstruktur

```text
content/                Missions- und Weltinhalte
schemas/                JSON-Schemas
scenes/                 Godot-Szenen
scripts/                Godot-Domain, Save, UI und Tests
web/                    HTML-Browserfassung
tools/                  Validierung und Paketautomatisierung
docs/                   Spezifikationen und Status
```

## Entwicklerdokumentation

- [Architektur](docs/ARCHITECTURE.md)
- [Teststrategie](docs/TESTING.md)
- [Aktueller Projektstatus](docs/PROJECT_STATUS.md)
- [Browserfassung](web/README.md)
- [Beitragsrichtlinien](CONTRIBUTING.md)
