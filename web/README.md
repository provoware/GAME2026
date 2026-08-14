# Browserfassung – LIVING-CITY-07

Version **0.13.0-living-city-07**, Schema **8**, Chrome-first.

## Schichten

1. `data.js` / `engine.js` / `app.js` / `styles.css` – qualifizierter Kern.
2. `revival-*` – Director, Missionen, Stadtereignisse und Rivalenpolitik.
3. `repair-04a.*` – Karten-/Bedienreparatur und sichtbares Zugende.
4. `lc05-*` – Crew-Chemie, Innenansichten, Briefings, Kartenebenen.
5. `lc05b-ui.js` / `lc05b.css` – Kartenfokus, Reise, Hilfe-Dock, Pan/Zoom und responsives Layout.
6. `lc06-*` – interaktive Innenräume, Dialoge, Aufgaben-Kompass, Klangmixer und Kampfentscheidungshilfe.
7. `lc07-*` – ortsübergreifende Folgeketten, vollständige individuelle Ortsaktionen, Audio-Härtung und Release-Politur.
8. `ui-refresh.js` – zentraler gedrosselter UI-Refresh ohne globale MutationObserver.

## Tastatur

`M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `G` nächster Schritt · `I` Innenraum · `K` Klang · `Alt+1–8` Spielbereiche · WASD/Pfeile bewegen · `+/-` zoomen · im Kampf `1/2/3`.

## Prüfen

Im Projektstamm `./PRUEFEN.sh` ausführen. Der echte Google-Chrome-E2E-Test läuft über `tools/chrome_e2e.py` in der GitHub-Abnahme.
