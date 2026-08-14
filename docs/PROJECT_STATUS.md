# Projektstatus

## Stand

**Browser-Spielstand:** 0.16.0-living-city-10  
**Browser-Schema:** 11  
**Primärplattform:** Google Chrome, offline-first; Chromium nachgelagerte Kompatibilität  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-10 – Bezirksdynamik und Crew-Eigeninitiative

### Spieltiefe

- zwölf Stadtorte besitzen gespeicherte Trendwerte für Druck, Stabilität, Chancen und Momentum;
- Trends werden aus Kontrolle, Rivalendruck, Polizei, Unruhe und Standortwert abgeleitet;
- Reise, Innenraumentscheidung, Konfliktfolge und Crew-Initiative hinterlassen nachvollziehbare Trendursachen;
- Crew-Eigeninitiativen entstehen deterministisch und werden höchstens drei gleichzeitig offen gehalten;
- Unterstützen, Beobachten und Umlenken verändern ausschließlich abstrakte Spielwerte;
- jede Crew-Entscheidung wird im Stadtgedächtnis protokolliert.

### Bedienung

- `L` öffnet die progressive **Stadtlage**;
- keine zusätzliche permanente Spalte;
- Bezirkskarten zeigen drei kompakte Balken und die letzte Ursache;
- `J` Stadtgedächtnis, `U` Stadt & Komfort, `G` Aufgaben-Kompass bleiben bestehen;
- bestehende Kontrast-, Schrift- und Reduced-Motion-Profile bleiben erhalten.

### Speicher & Architektur

- Browser-Schema 11;
- kanonischer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0160`;
- Migration aus v0150/v0140/v0130/v0120/v0110/v0100/v090;
- LC10 additive Schicht über LC09;
- keine neue DOM-Beobachtung und keine Render-Schleife.

## Abnahmestand

- lokaler Prüfvertrag: **27/27 PASS**;
- LC10-Engine: **12/12 PASS**, einschließlich 3000-Zug-Langlauf;
- echter Google-Chrome-E2E-Pfad ist verpflichtendes Remote-Gate;
- Release folgt ausschließlich aus einem erfolgreichen GitHub-Artefakt mit erneutem Entpack-/Prüflauf und SHA-256.
