# Browserfassung – LIVING-CITY-08

Version **0.14.0-living-city-08**, Schema **9**, Chrome-first.

## Schichten

1. Kern: `data.js` / `engine.js` / `app.js` / `styles.css`.
2. `revival-*`: Director, Missionen, Stadtereignisse, Rivalenpolitik.
3. `repair-04a.*`: Karten-/Bedienreparatur.
4. `lc05-*`: Crew-Chemie, Briefings, Kartenebenen.
5. `lc05b-*`: Kartenfokus, Reise, Hilfe-Dock, Pan/Zoom, Responsive.
6. `lc06-*`: interaktive Innenräume, Dialoge, Aufgaben-Kompass, Klang, Kampfentscheidungshilfe.
7. `lc07-*`: ortsübergreifende Folgeketten und Chrome-Härtung.
8. **`lc08-*`: Stadtgedächtnis, Entwicklungsbögen, verzögerte Folgen, Entscheidungsjournal und Fokus-Politur.**
9. `ui-refresh.js`: zentraler gedrosselter Refresh.

## Tastatur

`M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `G` nächster Schritt · `I` Innenraum · `K` Klang · **`J` Journal** · `Alt+1–8` Bereiche · WASD/Pfeile · `+/-` · Kampf `1/2/3`.

## Prüfen

`./PRUEFEN.sh` führt 23 lokale Prüfblöcke aus. Der reale Google-Chrome-E2E-Test läuft in GitHub Actions über `tools/chrome_e2e.py`.
