# Browserfassung – LIVING-CITY-05A

Version **0.11.1-living-city-05a**, Schema **6**.

## Schichten

1. `data.js` / `engine.js` / `app.js` / `styles.css` – qualifizierter Kern.
2. `revival-*` – Director, Missionen, Stadtereignisse und Rivalenpolitik.
3. `repair-04a.*` – Karten- und Bedienreparatur inklusive sichtbarem Zugende.
4. `lc05-*` – Crew-Chemie, Innenansichten, Briefings, Kartenebenen und Atmosphäre.

## LC05-Systeme

- Moral/Stress und paarweise Crew-Beziehungen;
- zugbasierte Crewinteraktionen;
- strategische Missionsbriefings;
- Innenansichten mit Hotspots und lokalen Kennzahlen;
- Kartenebenen für Gebiete, Druck, Wirtschaft und Ereignisse;
- optionale synthetische Browser-Atmosphäre;
- Save-Migration auf `v0110`.

## Prüfen

Im Projektstamm `./PRUEFEN.sh` ausführen.


## Performance-Härtung 0.11.1

Chrome-first. Keine globalen MutationObserver mehr; UI-Erweiterungen werden über `ui-refresh.js` maximal einmal pro Benutzeraktion aktualisiert.
