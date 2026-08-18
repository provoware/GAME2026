# Visual Polish VI-AG – Dominante Einzelwirkung je Wirkungsgruppe

## Ziel
Innerhalb der in VI-AF eingeführten Wirkungsgruppen wird die jeweils entscheidungsrelevanteste Einzelwirkung zusätzlich hervorgehoben, damit bei mehreren Sicherheits-, Ressourcen- oder Handlungsfähigkeitswerten sofort der führende Faktor erkennbar ist.

## Umsetzung
- `web/lc11-browser-hardening.js` bestimmt je Wirkungsgruppe genau eine dominante Einzelwirkung.
- Rangfolge innerhalb einer Gruppe: starkes Risiko → starker Vorteil → mittleres Risiko → mittlerer Vorteil → kleines Risiko → kleiner Vorteil → neutral.
- Bei Gleichrang entscheidet die bestehende semantische Metrikpriorität aus VI-AE.
- `data-group-dominant="true|false"` macht die Zuordnung maschinenlesbar.
- Der `aria-label` nennt die dominante Gruppenwirkung ausdrücklich.
- `web/lc11-visual-polish-6r.css` verstärkt nur Unterstreichung, Leuchtakzent und Sättigung des Gruppen-Leitwerts.
- Keine zusätzliche Layoutfläche, keine neue Animation und keine neue Interaktionsebene.
- Gameplay, Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert.

## Vertragsabsicherung
- Neuer Vertrag: `web/tests/lc11-visual-polish-6ag-contract.test.js`
- `PRUEFEN.sh` führt VI-AG innerhalb Prüfschritt 35/35 aus.
- Geometrie-, Animations- und Interaktionsverbote werden explizit geprüft.

## Validierung
- lokale Vollprüfung `PRUEFEN.sh`: **35/35 PASS**
- LIVING-CITY-11 Gameplay-Regression: **12/12 PASS**, inklusive 3500-Zug-Langlauf
- Implementierungs-Gate GitHub Actions **#285 / 32106511167: SUCCESS**
- echter Google-Chrome-Desktop-E2E: **PASS**
- Source-, Syntax-, Manifest- und Paketprüfungen: **PASS**
- qualifiziertes Implementierungs-Source-Artefakt: `9313350034`
- qualifiziertes Implementierungs-Chrome-E2E-Artefakt: `9313348779`
- beide Artefakte sind exakt an Implementierungs-Head `b460d8035a02db534e6735d855a24a6e903e13ca` gebunden

## Repository-Hygiene
- lineare, nicht-forcierte Branch-Aktualisierung
- keine unbeabsichtigten Löschungen
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien in den Repository-Änderungen

## Status
VI-AG ist implementiert und auf dem Implementierungs-Head remote qualifiziert. Der Dokumentations-Head wird anschließend separat durch das finale Remote-Gate qualifiziert.
