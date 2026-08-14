# HTML-Browserfassung – Stadtsektor 9909

Diese Fassung ist ein eigenständig spielbarer Browser-Strang von **PPPOPPI – Bunkerwahrheit**. Sie läuft ohne externe Bibliotheken und speichert ausschließlich lokal im Browser.

## Start

`web/index.html` in Firefox oder Chrome öffnen. Für lokale Entwicklung kann alternativ ein beliebiger statischer Webserver verwendet werden.

## Enthalten

- interaktive, skalierende SVG-Stadtkarte mit neun Bezirken;
- Bezirkswerte für Kontrolle, Rivalen, Polizei und Unruhe;
- Boss-Werte, die ausschließlich durch Taten und deren Folgen entstehen;
- automatisch abgeleitetes Boss-Profil statt statischer Charakterklasse;
- sieben Aktionen mit sozialen, wirtschaftlichen, aggressiven und verdeckten Folgen;
- zufällige Gang-Rekrutierung mit boss- und bezirksabhängiger Wahrscheinlichkeit;
- Gangstärke, Verletzungen, Loyalitätsentwicklung und mögliche Abgänge;
- autonome Rivalenbewegungen;
- dynamischer Polizeidruck und Razzienrisiko;
- passive Gebietseinnahmen;
- Chronik und lokale automatische Speicherung via `localStorage`;
- responsive Drei-Bereich-Oberfläche mit progressiv eingeblendeten Details.

## Spielidee dieses Stands

Der Spieler soll Bezirke auf mindestens 55 % stabile Kontrolle bringen. Hohe Kontrolle steigert Einnahmen, zieht aber Gegenreaktionen nach sich. Ein Boss kann über Respekt, Furcht, Loyalität oder Einfluss wachsen; ein zu hoher Fahndungswert macht aggressive Expansion zunehmend teuer.

## Technik

- `data.js`: Welt, Aktionen, Rekruten und Startcrew;
- `engine.js`: deterministische Fachlogik ohne DOM-Abhängigkeit;
- `app.js`: Darstellung, Interaktion und lokale Speicherung;
- `styles.css`: responsive Oberfläche und Kartenvisualisierung;
- `tests/engine.test.js`: Node-basierter Smoke-/Regressionscheck der Fachlogik.

## Test

```bash
node web/tests/engine.test.js
```

Geprüft werden Startzustand, Boss-Wertänderungen, Ressourcenprüfung, Rekrutierung, Wertebegrenzungen und Boss-Profilwechsel.
