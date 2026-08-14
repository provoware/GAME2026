# PPPOPPI – Bunkerwahrheit · LIVING-CITY-05B

Version **0.11.2-living-city-05b** ist die Chrome-first Karten-, Reise- und Bedienoptimierung des qualifizierten 0.11.1-Stands. Die Fachsysteme bleiben erhalten; die neue Schicht ordnet Sichtbarkeit, Aufgabenführung und Kartenbedienung neu.

## Direkt starten

Unter Linux `./START_GAME.sh` ausführen. Google Chrome wird bevorzugt, Chromium dient als zweite Wahl. Alternativ `web/index.html` direkt in Chrome öffnen.

## Was 0.11.2 verbessert

- **Hilfe verdeckt die Karte nicht mehr:** Sie öffnet als eigenes Dock neben der Karte und wandert auf schmalen Fenstern automatisch darunter.
- **Karte als eigener Arbeitsbereich:** Auswahl, Reisezustand und Direktziele liegen außerhalb der Kartenfläche.
- **Freies Zoomen und Verschieben:** Mausrad, Ziehen mit der Maus, +/−, Gesamtansicht sowie WASD/Pfeiltasten.
- **Direkte Reiseziele sichtbar:** erreichbare Orte stehen unmittelbar über der Karte; Ziel wählen und anschließend den großen Reisebutton benutzen.
- **Aufgaben-Dashboard oben:** nächste sinnvolle Aktion, Standort, Reise und Warnung/Stadtstatus bleiben ständig sichtbar.
- **Responsive Neuordnung:** breite, mittlere, kompakte und mobile Layoutstufen ordnen Karte, Aktionen, Boss-Bereich und Hilfe automatisch neu.
- **Keine neuen globalen DOM-Beobachter:** die Chrome-Performance-Härtung aus 0.11.1 bleibt erhalten.
- **Bestehende Systeme bleiben vollständig:** Director, Missionen, Crew-Chemie, Innenansichten, Besitz, Bank, Casino, Kampf und Kartenebenen.

## Tastatur

- `M` – Karte fokussieren
- `H` – Hilfe ein-/ausblenden
- `R` – aktuell angebotene Reise starten
- `E` – Zug beenden
- `WASD` oder Pfeile – Karte verschieben, wenn sie fokussiert ist
- `+` / `-` – Kartenzoom
- `Home` oder `0` – Gesamtkarte
- `Tab` / `Enter` – normale Tastaturnavigation und Auswahl

## Wartbare Architektur

LIVING-CITY-05B ergänzt den bestehenden Stand additiv über `web/lc05b-ui.js` und `web/lc05b.css`. `ui-refresh.js` bindet die neue Darstellung in den bereits gedrosselten zentralen Refresh ein. Engine- und Speicher-Schema bleiben unverändert bei Schema 6 / `v0110`.

## Prüfung

```bash
./PRUEFEN.sh
```

Der Prüfvertrag umfasst **17 reproduzierbare Prüfschritte**: bestehende Kern-/Revival-/LC05-Regressionen und Langläufe plus Chrome-/Performance-Gate und einen eigenen 05B-Vertrag für Hilfe-Dock, Aufgaben-Dashboard, Reise, Zoom/Pan, Tastatur und responsive Layoutstufen.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken bleiben abstrahierte fiktionale Spielsysteme ohne reale Handlungsanleitungen.
