# Projektstatus

## Stand

**Browser-Spielstand:** 0.10.0-living-city-04  
**Browser-Schema:** 5  
**Primärplattform:** Firefox / Chrome, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## Implementiert

### Revival Director

- dynamische, zustandsabhängige Missionsangebote;
- bis zu drei aktive Aufträge parallel;
- Fristen, Fortschritt, Belohnung, Fehlschlag und Archivierung;
- Folgeaufträge/Missionsketten;
- Ziele aus Territorium, Kampf, Firmen, Depot, Crewskills, Daueraufträgen, Netzwerken und Reisen;
- Karriere-Meilensteine und Prestige;
- deterministische 1000-Zug-Director-Massensimulation.

### Lebende Stadt

- 12 Bezirke und sichtbare Gebietsbesitzer;
- zeitlich begrenzte Stadtereignisse;
- Ereignismarker direkt auf der SVG-Karte;
- Stadtphasen Nacht, Morgengrauen, Tag und Abend;
- Spannung/Chancen als berechnete Director-Werte.

### Rivalen

- drei Rivalengangs mit aggressiver, wirtschaftlicher und verdeckter Strategie;
- Beziehungen zwischen allen Rivalenpaaren;
- Zustände von offenem Krieg bis Pakt;
- Rivalenkriege verändern Ressourcen und KI-Zielwahl.

### Bestehende Kernsysteme

- detaillierte Crewprofile und praxisbasierte Skills;
- autonome Daueraufträge;
- Besitz mit Kauf/Ausbau/Verkauf/Crewbindung;
- Bank, Firmenmarkt, Kurse, Anteile und Dividenden;
- institutionelles Informationsnetz;
- Casino mit Poker und drei Spielautomaten;
- Schutz-/Taktikausrüstung und Kampfsport;
- Bahn-/Stadtreisen;
- taktische Kämpfe mit Crewbeiträgen, Gelände, Moral, Deckung, Verletzungsrisiko und Bezirksübernahme;
- Autosave und Migration älterer Browserstände.

## Validierung lokal

- JavaScript-Syntax: **PASS**;
- 0.9-Kern: **52/52 PASS**;
- Revival-Schicht: **15/15 PASS**;
- bestehender 500-Zug-Stresstest: **PASS**;
- zusätzlicher Revival-Director-1000-Zug-Langlauf: **PASS**;
- UI-Smoke: **PASS**;
- statischer Kern-UI-Vertrag: **PASS**;
- Revival-Modul-/Visual-Vertrag: **PASS**;
- erkannte und behobene Invariante: maximal zwei aktive Stadtereignisse auch bei erzwungener Erzeugung;
- reale Chromium-Ausführung in dieser Containerumgebung: D-Bus-Abhängigkeit verursacht Timeout; daher kein Desktop-E2E-PASS behauptet.

## Fortschritt bis vollständigem Release

- Spezifikation / Architektur: **88 %**
- Codeimplementierung: **72 %**
- UI / Spielbarkeit: **81 %**
- Test-/Validierungsinfrastruktur: **78 %**
- gewichteter Gesamtfortschritt: **77 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-05:** narrative Figurenbeziehungen und Erinnerungen, prozedurale Missionsdialoge aus dem Director, echte Bezirks-Innenansichten, Audio-/Sounddesign, Ausrüstungszustand sowie reale Firefox-/Chrome-E2E-Abnahme auf Desktop-Runner.
