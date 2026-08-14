# Projektstatus

## Stand

**Browser-Spielstand:** 0.10.1-living-city-04a  
**Browser-Schema:** 5  
**Primärplattform:** Firefox / Chrome, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## Aktuelle Reparatur

### Bedienbarkeit

- `Zug beenden` wieder dauerhaft sichtbar;
- Tastenkürzel E;
- vollständiger Simulationszyklus bei bewusstem Warten;
- Sperre bei offenem Kampf/Poker;
- Rivalen wieder als eigener Hauptbereich;
- alle Haupttabs ohne horizontales Verstecken sichtbar.

### Karte

- stärkere visuelle Gebietsstruktur;
- Besitzerflächen und Kontrollringe;
- Bezirksarten als Icons;
- Rivalen-/Polizeidruck direkt am Knoten;
- direkte Wege und Bahnlinien hervorgehoben;
- ausgewählte Verbindung separat markiert;
- mehrstufige Routenplanung mit nächstem Halt;
- direkte Reise aus der Kartenleiste;
- Zoomsteuerung und bessere Callouts.

### Konsistenz

- 0.10-Speicherspiegel `v0100` ergänzt und mit dem bisherigen `v090`-Key kompatibel synchronisiert;
- Migration alter Browserstände bleibt erhalten;
- UI-Smoke und statischer UI-Vertrag verwenden jetzt die finale Revival-Engine;
- eigener Regressionstest für Zugsteuerung, Rivalen, Karte und Speicher-Migration.

## Bestehende Systeme

Revival Director, Missionen, Stadtereignisse, Rivalenpolitik, Crewprofile/-aufträge, Besitz, Bank/Firmenmarkt, Casino, Kampfsport, Ausrüstung, institutionelles Netz, Reisen und taktische Kämpfe bleiben enthalten.

## Validierung lokal

- JavaScript-Syntax: **PASS**;
- Kern: **52/52 PASS**;
- Revival: **15/15 PASS**;
- 500-Zug-Kernlanglauf: **PASS**;
- 1000-Zug-Director-Langlauf: **PASS**;
- UI-Smoke: **PASS**;
- statischer UI-Vertrag: **PASS**;
- Karten-/Bedien-Regression: **PASS**;
- Revival-Modul-/Visual-Vertrag: **PASS**;
- Shell-Syntax: **PASS**;
- Chromium-Screenshot-E2E in dieser Containerumgebung weiterhin durch fehlenden D-Bus blockiert; kein falsches PASS.

## Fortschritt bis vollständigem Release

- Spezifikation / Architektur: **89 %**
- Codeimplementierung: **74 %**
- UI / Spielbarkeit: **86 %**
- Test-/Validierungsinfrastruktur: **83 %**
- gewichteter Gesamtfortschritt: **80 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-05:** narrative Figurenbeziehungen, Innenansichten, Sounddesign, tiefere Missionsdialoge und reale Firefox-/Chrome-Desktop-E2E-Abnahme auf einem vollständigen Desktop-Runner.
