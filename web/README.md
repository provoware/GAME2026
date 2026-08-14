# PPPOPPI – Bunkerwahrheit · LIVING-CITY-02

**Browser-Spielstand:** `0.8.0-living-city-02`

## Start

`web/index.html` direkt in Firefox oder Chrome öffnen.

Es werden keine externen Bibliotheken, Server oder Online-Dienste benötigt. Der Spielstand bleibt lokal im Browser.

## Neu in LIVING-CITY-02

- Besitz kaufen, auf bis zu Stufe 3 ausbauen und wieder verkaufen.
- Bis zu zwei einsatzbereite Gangmitglieder einem Betrieb zuweisen.
- Betriebspersonal verbessert Ertrag und Sicherheit, steht aber nicht für Kämpfe zur Verfügung.
- Drei Rivalengangs mit unterschiedlichen Strategien:
  - **Rote Klingen** – aggressiv und gebietsorientiert.
  - **Graue Union** – wirtschaftlich und auf lukrative Bezirke fokussiert.
  - **Neon-Geister** – verdeckt, stören Aufklärung und erhöhen Unruhe.
- Bezirke besitzen nun einen tatsächlichen Besitzer.
- Rivalen können Bezirke übernehmen; der Spieler kann sie durch erfolgreiche Kämpfe zurückholen.
- Taktische Kämpfe: bis zu vier freie Crewmitglieder wählen, Kräfteverhältnis prüfen und pro Runde **Angriff**, **Deckung** oder **Rückzug** wählen.
- Karte zeigt Gebietsbesitzer, eigenen Besitz und lokale Aufklärung.
- Boss-Zentrale zeigt Vermögen, Cashflow, Razzia-Risiko, Beitrittschance, freie Crew, Crewtreue und priorisierte Hinweise.

## Spielprinzip

**Crew im Betrieb** → mehr Ertrag und Sicherheit, aber weniger Kampfkraft.  
**Crew im Kampf** → stärkere Expansion, aber Betriebe laufen schwächer.  
**Hoher Gebietsdruck** → mehr Einnahmen, gleichzeitig stärkere Reaktion der Rivalen und Polizei.

## Dateien

- `data.js` – Welt, Aktionen, Immobilien, Rivalengangs, Crew-Pool.
- `engine.js` – deterministische Fachlogik.
- `app.js` – Oberfläche, Interaktion und Autosave.
- `styles.css` – responsive Darstellung und Kampfanimation.
- `tests/engine.test.js` – Regressionen und 500-Zug-Stresstest.

## Tests

```bash
node web/tests/engine.test.js
node --check web/data.js
node --check web/engine.js
node --check web/app.js
```

Aktueller lokaler Nachweis: **21/21 Engine-Tests PASS**.

## Speicherstand

Aktueller Schlüssel: `pppoppi-bunkerwahrheit-html-v080`

Vorhandene Stände aus `v070` und `v060` werden als Migrationsquelle gelesen und auf Schema 3 ergänzt.
