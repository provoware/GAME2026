# PPPOPPI – Bunkerwahrheit · LIVING-CITY-11

Version **0.17.5-living-city-11-visual-polish-5**, Browser-Schema **12**. LC11 baut additiv auf dem qualifizierten LC10-Stadtmodell auf und macht vier bisher vorhandene Grundsysteme zu eigenständigen Gameplay-Schleifen: **Casino, Kampfsporttraining, Schutz/Ausrüstung und Bahnhof-Fernreisen**. Darauf liegen fünf additive Visual-Polish-Stufen; Visual Polish V priorisiert Spielfläche, Kontrast, Kartenlesbarkeit und Kampfdramaturgie, ohne Gameplay oder Save-Schema zu verändern.

## Neu in LIVING-CITY-11

- **Casino 9909:** drei vollständig bedienbare Automaten mit animierten Walzen, Session-Bilanz, Gewinnserie, wachsendem Jackpot und kleinen Casino-Aufgaben;
- **5-Card-Draw-Poker:** Hand starten, Karten halten, bis zu zwei Ziehrunden, Showdown und Session-Auswertung;
- **Dojo Ostblock:** Crew wählen, Kampfsportart und Trainingsintensität bestimmen, Rangfortschritt und Stressentwicklung sehen;
- **Schutz & Ausrüstung:** Schutzkleidung besitzt einen Zustandswert, wirkt abhängig vom Zustand und kann im Eisenladen gewartet werden;
- **Geisterbahnhof:** Fernreisen nach Nordhafen, Stahlwerk-Metropole, Lichtbogen und Grenzring mit Ticketkosten, Reisedauer und abstrakten Spielbelohnungen;
- **Stärker inszenierte Innenräume:** eigene Vollansicht „Stadtleben“ mit Ortslicht, Karten, Szenenflächen, Automaten-/Gleisanimationen und klarer visueller Hierarchie;
- **Barrierefreiheit:** Animationen respektieren `prefers-reduced-motion` sowie den vorhandenen LC09-Ruhemodus;
- **Speicher:** neuer Spiegel `v0170`, Schema 12, automatische Migration aus LC10 und älteren Ständen.

## Visual Polish V – 0.17.5

- kompakterer Kopfbereich und mehr sichtbare Karten-/Spielfläche;
- klarere Drei-Bereich-Hierarchie: Führung links, Spielbühne Mitte, Entscheidungen rechts;
- kontraststärkeres Farb- und Fokusmodell mit klarer Zustandskodierung;
- hochwertigere Stadtkarte, Innenräume, Stadtleben-Ansicht und Kampfinszenierung;
- vollständiger Reduced-Motion-/Ruhemodus-Vertrag für die neuen Übergänge;
- Gameplay und Browser-Schema bleiben unverändert.

## Schnellstart

Unter Linux/Kubuntu:

```bash
./START_GAME.sh
```

Unter Windows `START_GAME.bat` starten. Alternativ `web/index.html` direkt öffnen.

## Bedienung

`V` Stadtleben · `G` nächster Schritt · `L` Stadtlage · `J` Stadtgedächtnis · `U` Stadt & Komfort · `M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `I` Innenraum · `K` Klang.

Die LC11-Vollansicht zeigt **Casino / Training / Schutz / Bahnhof** nur auf Abruf. Die Hauptansicht bleibt dadurch kompakt.

## Prüfvertrag

```bash
./PRUEFEN.sh
```

Der lokale Vertrag umfasst **34 reproduzierbare Prüfblöcke**. LC11 selbst besitzt **12/12 Engine-Tests** einschließlich eines **3500-Zug-Langlaufs** sowie einen eigenen UI-/Animations-/Speichervertrag. Alle historischen LC03–LC10-Regressionssätze bleiben aktiv.

## Architektur

LC11 bleibt additiv: `lc11-data.js`, `lc11-engine.js`, `lc11-bootstrap.js`, `lc11-ui.js`, `lc11.css` und eigene Tests. Bestehende LC10-Dateien werden nur dort angepasst, wo ein historischer Test ausdrücklich lernen muss, dass eine spätere Version weiterhin die LC10-Schicht enthält.

## Simulationshinweis

Konflikt-, Casino-, Institutions- und Stadtmechaniken sind fiktionale Spielsysteme. Sie sind als Spielwerte und Unterhaltung umgesetzt, nicht als reale Handlungsanleitung.
