# Browserfassung – LIVING-CITY-05B

Version **0.11.2-living-city-05b**, Schema **6**, Chrome-first.

## Schichten

1. `data.js` / `engine.js` / `app.js` / `styles.css` – qualifizierter Kern.
2. `revival-*` – Director, Missionen, Stadtereignisse und Rivalenpolitik.
3. `repair-04a.*` – Karten- und Bedienreparatur inklusive sichtbarem Zugende.
4. `lc05-*` – Crew-Chemie, Innenansichten, Briefings, Kartenebenen und Atmosphäre.
5. `lc05b-ui.js` / `lc05b.css` – nicht blockierende Hilfe, Aufgaben-Dashboard, vereinfachte Reise, freies Karten-Pan/Zoom und responsive Neuordnung.
6. `ui-refresh.js` – zentraler gedrosselter UI-Refresh ohne globale MutationObserver.

## Kartenbedienung

- Mausrad oder +/−: zoomen
- Ziehen / WASD / Pfeile: verschieben
- Doppelklick auf Bezirk: zentrieren
- `M`: Kartenfokus
- `H`: Hilfe-Dock
- `R`: angebotene Reise starten
- `Home` / `0`: Gesamtkarte

## Prüfen

Im Projektstamm `./PRUEFEN.sh` ausführen.
