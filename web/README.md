# Browserfassung 0.10.1 · LIVING-CITY-04A

Die Browserfassung läuft lokal über `index.html` und benötigt keine externen Bibliotheken.

## Bedienreparatur

- sichtbarer **Zug beenden**-Button plus Taste E;
- Rivalen wieder als eigener Haupt-Tab;
- alle Haupttabs als sichtbares Raster statt horizontal versteckter Leiste;
- Karte mit Kontrollringen, Bezirksarten, Druckwerten, Besitzerflächen und Ereignismarkern;
- erreichbare Wege, ausgewählte Verbindung und mehrstufige Routen werden getrennt visualisiert;
- direkte Kartenreise und Zoomsteuerung;
- kanonischer 0.10-Speicherspiegel `pppoppi-bunkerwahrheit-html-v0100`; `v090` bleibt als kompatibler Alt-Key synchronisiert.

## Architektur

Die 0.9-Kernlogik bleibt in `data.js` / `engine.js`; die Revival-Schicht nutzt `revival-data.js`, `revival-missions.js`, `revival-world.js`, `revival-engine.js`, `revival-ui.js` und `revival.css`. Die Karten-/Bedienkorrektur ist additiv in `repair-bootstrap.js`, `repair-04a.js` und `repair-04a.css` gekapselt; `app.js` und `styles.css` bleiben als bereits qualifizierte Kernoberfläche byte-stabil. Nur der kleine `endTurn()`-Vertrag ergänzt den Revival-Kompositionskern.

## Prüfung

```bash
node web/tests/engine.test.js
node web/tests/revival-engine.test.js
node web/tests/director-simulation.test.js
node web/tests/ui-smoke.test.js
node web/tests/static-ui.test.js
node web/tests/ui-regression.test.js
node web/tests/revival-contract.test.js
```
