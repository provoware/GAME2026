# Browserfassung – LIVING-CITY-06

Version **0.12.0-living-city-06**, Schema **7**, Chrome-first.

## Schichten

1. `data.js` / `engine.js` / `app.js` / `styles.css` – qualifizierter Kern.
2. `revival-*` – Director, Missionen, Stadtereignisse und Rivalenpolitik.
3. `repair-04a.*` – Karten-/Bedienreparatur und sichtbares Zugende.
4. `lc05-*` – Crew-Chemie, visuelle Innenansichten, Briefings, Kartenebenen.
5. `lc05b-ui.js` / `lc05b.css` – Kartenfokus, Reise, Hilfe-Dock, Pan/Zoom und responsives Layout.
6. `lc06-*` – interaktive Innenräume, mehrstufige Dialoge, Aufgaben-Kompass, Klangmixer und Kampfentscheidungshilfe.
7. `ui-refresh.js` – zentraler gedrosselter UI-Refresh ohne globale MutationObserver.

## Tastatur

`M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `G` nächster Schritt · `I` Innenraum · `K` Klang · `Alt+1–9` Spielbereiche · WASD/Pfeile bewegen · `+/-` zoomen.

## Prüfen

Im Projektstamm `./PRUEFEN.sh` ausführen.
