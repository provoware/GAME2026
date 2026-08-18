# Visual Polish VI-AR – Handlungziel auf einen Blick

- Baut additiv auf VI-AQ auf.
- Bereits ermittelte Handlungziele werden ohne zusätzliche UI-Fläche visuell unterschieden.
- `HIER` erhält eine limefarbene, doppelt unterstrichene Direktaktions-Signatur.
- `ORT` erhält eine cyanfarbene, gestrichelt unterstrichene Reise-Signatur.
- Fehlt ein direktes Ziel, tritt der Hinweis kontrolliert zurück.
- `prefers-contrast: more` erhält zusätzliche Konturen; VI-AR bleibt vollständig bewegungsfrei.
- Keine neue Interaktion, keine Gameplay-, Browser-Schema-12- oder Save-v0170-Änderung.
- Vertragsprüfung: `web/tests/lc11-visual-polish-6ar-contract.test.js`.
- Lokale Vollprüfung: **35/35 PASS**.
- LIVING-CITY-11 Engine: **12/12 PASS**, inklusive 3500-Zug-Langlauf.
- Remote-Qualifikation: ausstehend bis GitHub Actions und echter Chrome-E2E vollständig PASS.
