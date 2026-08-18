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
- Dokumentations-/Head-Gate GitHub Actions **#286 / 32106622096: SUCCESS**
- echter Google-Chrome-Desktop-E2E: **PASS**
- Source-, Syntax-, Manifest- und Paketprüfungen: **PASS**
- qualifiziertes Source-Artefakt aus #286: `9313392389`
- qualifiziertes Chrome-E2E-Artefakt aus #286: `9313390521`
- beide Artefakte sind exakt an Head `72f139c21ea4201926b9b87d3078b29c4dc3c9b1` gebunden

## Repository-Hygiene
- lineare, nicht-forcierte Branch-Aktualisierung
- keine unbeabsichtigten Löschungen
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien in den Repository-Änderungen

## Status
VI-AG ist funktional und remote qualifiziert. Diese abschließende Statussynchronisierung ändert nur den Nachweistext; der daraus entstehende finale Dokumentations-Head wird zusätzlich durch GitHub Actions qualifiziert und im PR-Nachweis mit Commit, Tree und finalen Artefakten festgehalten.
