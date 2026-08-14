# Projektstatus

## Stand

**Browser-Spielstand:** 0.9.0-living-city-03  
**Browser-Schema:** 4  
**Primärplattform:** Firefox / Chrome, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## Implementiert

- 12 Bezirke und sichtbare Gebietsbesitzer;
- Besitzsystem mit Kauf, Ausbau, Verkauf und Crewbindung;
- drei Rivalengangs mit aggressiver, wirtschaftlicher und verdeckter Strategie;
- detaillierte Crewprofile und praxisbasierter Skillaufbau;
- dauerhafte autonome Crewaufträge;
- Bank, Depot, Firmenkurse, Unternehmensentwicklung und Dividenden;
- Maulwurfnetz in sechs Institutionen;
- Casino mit Poker und drei Spielautomaten;
- Schutz-/Taktikausrüstung und Kampfsport;
- Bahnreisen in entfernte Stadtteile;
- taktisches Kampfsystem mit detaillierter Vorschau und Ergebnisdarstellung;
- abstrakte fiktive Straßen-/Auftragsoperationen;
- Autosave und Migration älterer Browserstände.

## Validierung lokal

- JavaScript-Syntax: PASS;
- Engine: **52/52 PASS**;
- UI-Smoke: PASS;
- statischer UI-Vertrag: PASS;
- 500-Zug-Stresstest: PASS;
- reale Chromium-Ausführung in dieser Containerumgebung: durch D-Bus-Abhängigkeit blockiert, daher kein PASS behauptet.

## Fortschritt bis vollständiger Release

- Spezifikation/Architektur: **82 %**
- Codeimplementierung: **61 %**
- UI/Spielbarkeit: **72 %**
- Test-/Validierungsinfrastruktur: **63 %**
- gewichteter Gesamtfortschritt: **67 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-04:** echte Missionsketten aus Firmen, Maulwürfen und Crew-Zielen; Ausrüstungsverschleiß; Beziehungen zwischen Rivalengangs; reale Firefox-/Chrome-E2E-Abnahme auf einem Desktop-Runner.
