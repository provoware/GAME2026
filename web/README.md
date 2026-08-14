# HTML-Browserfassung – Stadtsektor 9909

Version: **0.7.0-html-city-economy-combat**

## Start

`web/index.html` in Firefox oder Chrome öffnen.

## Neu in 0.7.0

### Handlungen

13 Aktionen in drei Gruppen:

- Geschäft;
- Einfluss;
- Konflikt.

Aktionen zeigen Kosten und Hauptwirkung. Konfliktaktionen zeigen zusätzlich eine ungefähre Siegchance.

### Besitz

Kaufbar sind:

- Hotel;
- Lagerhaus;
- Clubbeteiligung;
- Werkstatt;
- Spätkauf;
- Funkzentrale;
- Wohnblock-Anteil.

Kaufpreis und Ertrag reagieren auf Standort und Bezirkslage. Eigener Besitz erzeugt laufenden Nettoertrag und kann zusätzliche Boni liefern.

### Boss-Zentrale

Angezeigt werden unter anderem:

- Rang;
- Vermögen;
- Besitz-Cashflow;
- lokales Risiko;
- Rekrutierungschance;
- Crew-Bereitschaft;
- durchschnittliche Loyalität;
- priorisierte Warnhinweise.

### Kampf

Die Engine berechnet vor Konfliktaktionen eine Erfolgsprognose aus Crew-, Boss- und Bezirkswerten. Nach dem Einsatz erscheint eine eigene animierte Darstellung mit Kräftevergleich, Phasen und Ergebnis.

## Speicherung

Aktueller Schlüssel:

`pppoppi-bunkerwahrheit-html-v070`

Vorhandene 0.6.0-Spielstände werden beim Start übernommen und ergänzt.

## Technik

- `data.js`: Welt, Aktionen, Besitzarten und Rekruten;
- `engine.js`: Fachlogik;
- `app.js`: Darstellung und Bedienung;
- `styles.css`: responsive Oberfläche, Karte und Kampfanimationen;
- `tests/engine.test.js`: Regressionsprüfungen.

## Validierung

```bash
node --check web/data.js
node --check web/engine.js
node --check web/app.js
node web/tests/engine.test.js
```

Aktueller Stand:

- 13/13 Engine-Tests PASS;
- Syntaxprüfungen PASS;
- DOM-ID-Abgleich PASS;
- 500-Zug-Simulation PASS.
