# Projektstatus

## Stand

**Browser-Spielstand:** 0.11.1-living-city-05a  
**Browser-Schema:** 6  
**Primärplattform:** Google Chrome (primär) / Chromium, Firefox nur Kompatibilitätsreserve, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-05A – Chrome-/Performance-Härtung

### Stadt & Darstellung

- bestehende 04A-Kartenreparatur vollständig erhalten;
- vier umschaltbare Kartenebenen: Gebiete, Druck, Wirtschaft, Ereignisse;
- acht individuelle Innenansichten wichtiger Orte plus Fallback-Szenen;
- lokale Hotspots, Unternehmen, Besitz, Gebietsstatus und Ereignisse in der Ortsszene;
- optionale, rein lokal synthetisierte Web-Audio-Atmosphäre ohne externe Assets.

### Personen & Crew

- jede Person besitzt Moral und Stress;
- Beziehungen werden paarweise gespeichert und verständlich klassifiziert;
- Daueraufträge, Erholung, gemeinsame Arbeit und Kämpfe verändern Crew-Chemie;
- Aussprache, gemeinsame Planung und Sparring als echte, zugbasierte Crewinteraktionen;
- Personenkarten zeigen individuelle Beziehungen und Belastung;
- ausgeschiedene Personen werden automatisch aus dem Beziehungsgraphen entfernt.

### Missionen & Director

- aktive Aufträge besitzen einmalige Missionsbriefings;
- drei strategische Briefingwege mit Frist-, Belohnungs-, Director- und Crewfolgen;
- Director-Modifikatoren klingen kontrolliert über weitere Züge ab;
- bestehende Missionsketten, Stadtereignisse und Rivalenpolitik bleiben vollständig kompatibel.

### Speicher & Migration

- Browser-Schema 6;
- kanonischer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0110`;
- Migration/Synchronisierung aus `v0100` und `v090` bleibt erhalten.

## Lokale Validierung

- Kern-Regressionen: **52/52 PASS**;
- Revival-Regressionen: **15/15 PASS**;
- LIVING-CITY-05-Regressionen: **20/20 PASS**;
- 500-Zug-Kernlanglauf: **PASS**;
- 1000-Zug-Director-Langlauf: **PASS**;
- 1200-Zug-LC05-Langlauf: **PASS**;
- UI-Smoke: **PASS**;
- statischer UI-Vertrag: **PASS**;
- Karten-/Bedien-Regression: **PASS**;
- LC05-Modul-/Visual-Vertrag: **PASS**;
- Revival-Modul-/Visual-Vertrag: **PASS**;
- realer Chromium-Screenshot-E2E bleibt in der Containerumgebung wegen fehlender D-Bus-Desktop-Sitzung offen; kein falsches PASS.

## Fortschritt bis vollständigem Release

- Spezifikation / Architektur: **92 %**
- Codeimplementierung: **81 %**
- UI / Spielbarkeit: **90 %**
- Test-/Validierungsinfrastruktur: **88 %**
- gewichteter Gesamtfortschritt: **86 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-06:** auf der jetzt stabilisierten Chrome-first-Basis: tiefere verzweigte Dialogketten und Konsequenzen, interaktive Innenraumaktionen, Sound-/Musikmixer, stärkere Kampfinszenierung, geführte Aufgabenleitung, Popups/Hilfetexte und vollständige Tastatursteuerung.
