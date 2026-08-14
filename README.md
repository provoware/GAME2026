# PPPOPPI – Bunkerwahrheit · LIVING-CITY-10

Version **0.16.0-living-city-10**, Browser-Schema **11**. Das Spiel ist ein offline-first Browsergame mit einer additiven Living-City-Architektur. LC10 erweitert den qualifizierten LC09-Stand um langfristige Bezirksentwicklung und nachvollziehbare Crew-Eigeninitiative, ohne die Hauptoberfläche mit weiteren Dauerflächen zu überladen.

## Neu in LIVING-CITY-10

- zwölf Stadtorte mit gespeicherten Trends für **Druck, Stabilität, Chancen und Momentum**;
- geglättete Entwicklung aus realen Spielwerten statt zufälligem Hin-und-her;
- deterministische **Crew-Eigeninitiativen** im Vier-Zug-Rhythmus, höchstens drei gleichzeitig offen;
- abstrakte Reaktionen **Unterstützen**, **Beobachten** und **Umlenken**;
- jede Initiative und ihre Folge landet im vorhandenen Stadtgedächtnis;
- progressive Ansicht **Stadtlage** per Taste `L`;
- Verlauf erklärt mit Zugnummer und Ursache, warum sich ein Bezirk verändert hat;
- Stadt-Puls verwendet korrekt die kanonische Crewstruktur `state.gang`;
- Save-Spiegel **v0160** mit Migration aus älteren Browserständen;
- bestehende Lesbarkeits-, Recovery-, Journal-, Audio-, Karten-, Kampf- und Chrome-E2E-Funktionen bleiben erhalten.

## Schnellstart

Unter Linux/Kubuntu:

```bash
./START_GAME.sh
```

Unter Windows `START_GAME.bat` starten. Alternativ kann `web/index.html` direkt geöffnet werden. Google Chrome ist die primäre qualifizierte Browserplattform; Chromium ist nachgelagerte Kompatibilität.

## Wichtige Tasten

`G` nächster sinnvoller Schritt · `L` Stadtlage · `J` Stadtgedächtnis · `U` Stadt & Komfort · `M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `I` Innenraum · `K` Klang · WASD/Pfeile Karte bewegen · `+/-` zoomen · Kampf `1/2/3`.

## Prüfvertrag

```bash
./PRUEFEN.sh
```

Der aktuelle Vertrag umfasst **27 reproduzierbare Prüfblöcke**: alle historischen Regressionen, LC10-Engine-Tests, 3000-Zug-Langlauf, UI-/Responsive-/Speicherverträge und Python-Syntax. GitHub Actions ergänzt dies um einen echten Google-Chrome-Desktop-E2E-Lauf für 1280×720, 1366×768 und 1600×900.

## Architektur

LC10 bleibt additiv: `lc10-data.js`, `lc10-engine.js`, `lc10-bootstrap.js`, `lc10-ui.js`, `lc10.css` sowie eigene Tests. Qualifizierte historische Schichten werden möglichst nicht umgeschrieben. `ui-refresh.js` koordiniert gezielte Aktualisierungen ohne globale DOM-Beobachtung oder Render-Schleife.

## Simulationshinweis

Konflikt-, institutionelle und Stadtmechaniken sind abstrahierte fiktionale Spielsysteme. Sie liefern keine realweltlichen Handlungsanleitungen.
