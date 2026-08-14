# Projektstatus

## Stand

**Browser-Spielstand:** 0.12.0-living-city-06  
**Browser-Schema:** 7  
**Primärplattform:** Google Chrome / Chromium, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-06 – geführte Stadt, interaktive Orte und Kampfinszenierung

### Spielführung & Sichtbarkeit

- 05B-Karten-/Responsive-Basis vollständig erhalten;
- Aufgaben-Kompass im oberen Dashboard priorisiert den nächsten sinnvollen Schritt aus dem realen Spielzustand;
- nicht blockierende Coach-Leiste im Layoutfluss statt Popup über der Karte;
- Tastaturkürzel `G`, `I`, `K` und `Alt+1–9` ergänzen Karte/Hilfe/Reise/Zugende;
- Hilfe enthält die neuen Bedienwege in einfacher Sprache.

### Interaktive Innenräume & Dialoge

- Innenräume besitzen echte lokale Aktionskarten mit Verfügbarkeit, Kosten, Cooldown und Effektvorschau;
- Aktionen verändern nur abstrahierte Spielwerte wie Chancen, Spannung, Crew-Stress/Moral, Kontrolle, Skills oder Vorrat;
- Ortskontakte führen mehrstufige Dialoge mit verzweigten Entscheidungen;
- Dialogstatus, Historie und Konsequenzen werden gespeichert;
- abgeschlossene Gespräche besitzen einen Wiederholungsabstand statt beliebiger Sofortwiederholung.

### Klang & Kampf

- lokaler Web-Audio-Mixer mit Gesamt-, Musik- und Atmosphärenregler;
- vier Klangprofile, vollständig synthetisch und ohne externe Audiodateien;
- Kampfoberfläche erhält verständliche Entscheidungsunterstützung und stärkere visuelle Hierarchie;
- Empfehlung für Angriff, Deckung oder Rückzug basiert ausschließlich auf abstrakten Spielwerten.

### Speicher & Performance

- Browser-Schema 7;
- neuer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0120` mit Migration aus `v0110`, `v0100` und `v090`;
- keine neuen globalen DOM-Beobachter;
- Crewinteraktion löst keinen Vollseiten-Reload mehr aus;
- zentraler gedrosselter UI-Refresh bleibt einziger Zusatz-Renderpfad.

## Lokale Validierung

- Kern-Regressionen: **52/52 PASS**;
- Revival-Regressionen: **15/15 PASS**;
- LIVING-CITY-05: **20/20 PASS**;
- LIVING-CITY-06: **19/19 PASS**;
- 500-/1000-/1200-/1500-Zug-Langläufe: **PASS**;
- UI-Smoke und finaler statischer UI-Vertrag: **PASS**;
- Karten-/Bedien-, Chrome-/Performance- und 05B-Responsive-Verträge: **PASS**;
- LC06 Führungs-/Innenraum-/Dialog-/Klang-/Kampf-Vertrag: **PASS**;
- vollständiges `PRUEFEN.sh`: **19/19 PASS**.

## Fortschritt

- Spezifikation / Architektur: **95 %**
- Codeimplementierung: **88 %**
- UI / Spielbarkeit: **96 %**
- Test-/Validierungsinfrastruktur: **94 %**
- gewichteter Gesamtfortschritt: **93 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-07:** echte Chrome-Desktop-E2E-Abnahme auf einem Desktop-Runner, weitere Story-/Dialogketten, zusätzliche Innenraumvarianten, Audio-Härtung und Release-Politur.
