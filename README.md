# PPPOPPI – Bunkerwahrheit · LIVING-CITY-03

Version **0.9.0-living-city-03** erweitert die spielbare HTML-Fassung zu einer vernetzten Stadt-, Crew-, Wirtschafts- und Taktiksimulation.

## Direkt starten

`web/index.html` in Firefox oder Chrome öffnen oder unter Linux `./START_GAME.sh` ausführen.

## Neu in 0.9.0

- 12 Stadtbezirke inklusive Casino 9909, Altstadt und Südhafen;
- Geisterbahnhof mit Fernlinien in andere Stadtteile;
- detaillierte Personenkarten mit 7 Skills, XP, Karriere, Ausrüstung und Kampfsport;
- dauerhafte autonome Crewaufträge mit Ziel, Fortschritt und eigenständiger Skillentwicklung;
- Skills steigen durch tatsächliche Handlungen, Entscheidungen, Kämpfe, Aufträge und Training;
- Bankkonto, lokaler Unternehmensmarkt, Aktienanteile, Kursentwicklung und Dividenden;
- Kurse reagieren auf simulierte Bezirks- und Unternehmensentwicklung;
- Maulwurfnetz in sechs Institutionen mit Nutzen, Tarnung und Entdeckungsrisiko;
- drei Rivalengangs mit verschiedenen Strategien;
- taktische Kämpfe mit Crewbeiträgen, Gelände, Moral, Vorteil, Deckung, Verletzungsrisiko und Bezirksübernahme;
- Casino mit selbst spielbarem 5-Card-Draw-Poker und drei Spielautomaten;
- Schwarzmarkt/Eisenladen mit Schutz- und Taktikausrüstung;
- Dojo in den Ostblöcken mit fünf Kampfsportarten;
- abstrakte wiederkehrende Stadtoperationen und fiktive Rivalen-Auftragsjobs;
- lokales Autosave und Migration aus v0.8/v0.7/v0.6.

## Tests

```bash
node --check web/data.js
node --check web/engine.js
node --check web/app.js
node web/tests/engine.test.js
node web/tests/ui-smoke.test.js
```

Der Engine-Test enthält 52 deterministische Prüfungen inklusive 500-Zug-Stresstest. Der UI-Smoke-Test prüft Start-Render, Kernpanels, Karte und Autosave ohne externes Framework.

## Hinweis zur Simulation

Kriminalitäts-, Waffen-, Drogen-, Prostitutions- und Auftragsmechaniken sind ausschließlich abstrahierte Spielwerte. Das Projekt enthält keine realen Beschaffungs-, Umgehungs- oder Handlungsanleitungen.
