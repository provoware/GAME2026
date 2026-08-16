# Projektstatus

## Stand

**Browser-Spielstand:** 0.17.0-living-city-11  
**Browser-Schema:** 12  
**Primärplattform:** Chrome/Chromium, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-11 – Gameplay & Visual Update

### Gameplay

- Casino 9909: Automaten, Jackpot-Töpfe, Sessionwerte, Casino-Aufgaben und 5-Card-Draw-Poker;
- Dojo Ostblock: Kampfsport, Intensität, Rangfortschritt, Stress und Trainingshistorie;
- Eisenladen: Schutzkleidung mit Zustandswert, wirksamer Abnutzung und Wartung;
- Geisterbahnhof: vier Fernziele mit Ticketkosten, Dauer und protokollierter Rückkehr;
- Innenräume werden als progressive Vollansicht dargestellt statt die Hauptoberfläche weiter zu verdichten.

### Design & Animation

- neuer LC11-Visual-Layer mit klarer Ortscodierung;
- animierte Slot-Walzen, Gleisbewegung und dezente Licht-/Sweep-Effekte;
- größere Kartenflächen und bessere visuelle Priorisierung innerhalb der Vollansicht;
- Responsive-Breakpoints für Desktop und schmale Ansichten;
- `prefers-reduced-motion` und vorhandener Ruhemodus schalten Animationen zuverlässig ab.

### Speicher & Architektur

- Schema 12;
- Save-Spiegel `pppoppi-bunkerwahrheit-html-v0170`;
- Migration aus v0160 und älteren Ständen;
- additive LC11-Schicht über LC10;
- keine globale DOM-Beobachtung und keine ungedrosselte Render-Schleife.

## Abnahmestand lokal

- Gesamtvertrag: **29/29 PASS**;
- LC11-Engine: **12/12 PASS**;
- 3500-Zug-Langlauf: **PASS**;
- historische LC03–LC10-Regressionen: **PASS**;
- LC11 UI-/Animations-/v0170-Vertrag: **PASS**.

## Nächstes Remote-Gate

GitHub Actions muss den neuen Commit erneut prüfen. Ein finaler Release-/ZIP-Stand wird erst aus einem erfolgreichen Remote-Artefakt qualifiziert.
