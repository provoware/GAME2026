# PPPOPPI – Bunkerwahrheit · LIVING-CITY-04

Version **0.10.0-living-city-04** hebt die Browserfassung von einer umfangreichen Stadt-Sandbox zu einer verknüpften **Revival-Simulation mit dynamischem Director** an. Der Kern bleibt lokal, offline und ohne externe Bibliotheken spielbar.

## Direkt starten

`web/index.html` in Firefox oder Chrome öffnen oder unter Linux `./START_GAME.sh` ausführen.

## Der Qualitätssprung in 0.10.0

- **Revival Director** erzeugt Aufträge aus dem tatsächlichen Spielzustand statt aus einer starren Liste;
- vier dynamische Auftragsangebote, bis zu drei parallele aktive Aufträge und Folgeaufträge;
- Missionsziele reagieren auf Gebiete, Kämpfe, Beteiligungen, Firmenentwicklung, Crew-Skills, autonome Arbeit, Netzwerke und Reisen;
- dynamische Stadtereignisse mit begrenzter Laufzeit und sichtbaren Kartenmarkern;
- Tages-/Stadtphasen **Nacht, Morgengrauen, Tag, Abend** verändern die visuelle Atmosphäre;
- Rivalengangs besitzen Beziehungen untereinander: Distanz, Feindschaft, Krieg, Zweckkontakt oder Pakt;
- offene Rivalenkriege beeinflussen KI-Ziele und Ressourcen;
- Karriere-Meilensteine und ein berechneter **Prestige-Wert** geben langfristige Orientierung;
- neuer Director-Bereich bündelt aktive Aufträge, Angebote, Stadtereignisse, Rivalenpolitik und Karriere;
- Karten- und Kampfvisualisierung wurden mit Ereignis-Halos, Phasenlicht, dynamischer Stimmung und stärkerem Feedback erweitert;
- bestehende Systeme bleiben erhalten: 12 Bezirke, autonome Crew, Personenkarten, Bank/Unternehmensmarkt, Beteiligungen/Dividenden, Besitz, institutionelles Netz, Casino, Kampfsport, Ausrüstung, Reisen und taktische Kämpfe;
- Migration aus Browserständen 0.9/0.8/0.7/0.6.

## Wartbare Revival-Architektur

Die bereits qualifizierten 0.9-Kernmodule bleiben fachlich unverändert. LIVING-CITY-04 ergänzt sie über vier klar getrennte Module:

- `web/revival-data.js` – neue Director-Datenverträge;
- `web/revival-engine.js` – Missionen, Ereignisse, Rivalenpolitik, Prestige und Meilensteine;
- `web/revival-ui.js` – additive Director-Oberfläche und Kartenmarker;
- `web/revival.css` – ausschließlich die neue visuelle Ebene.

Das hält Kopplung und Regressionsrisiko niedrig und ermöglicht spätere Revival-Module ohne erneutes Aufblähen der Kernlogik.

## Tests

```bash
./PRUEFEN.sh
```

Geprüft werden 52 unveränderte Kern-Regressionen inklusive 500-Zug-Langlauf, 15 neue Revival-Regressionen, eine deterministische 1000-Zug-Director-Simulation, UI-Smoke, statischer Kernvertrag und ein eigener Revival-Modul-/Visual-Vertrag.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken sind abstrahierte fiktionale Spielsysteme. Sie dienen ausschließlich dem Gameplay.
