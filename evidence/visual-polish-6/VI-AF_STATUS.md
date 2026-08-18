# Visual Polish VI-AF – Kompakte semantische Wirkungsgruppen

## Ziel
Mehrere Vorher→Nachher-Werte werden zusätzlich nach ihrem sachlichen Zusammenhang lesbar: Sicherheitslage, Ressourcen und Handlungsfähigkeit. Die bestehende Priorisierung VI-AC bis VI-AE bleibt unverändert.

## Umsetzung
- `districtPolice`, `districtRival`, `tension`, `crewStress` → **Sicherheitslage**
- `money`, `supplies` → **Ressourcen**
- `districtControl`, `crewMorale`, `opportunity` → **Handlungsfähigkeit**
- Gruppenzugehörigkeit wird als `data-effect-group` ausgegeben und im `aria-label` mitgesprochen.
- Rein visuell erhalten die Gruppen eine zurückhaltende semantische Unterstreichung; keine zusätzliche Fläche, keine neue Animation, keine Interaktionsebene.
- Gameplay, Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert.

## Validierung
- `web/tests/lc11-visual-polish-6af-contract.test.js` sichert Gruppierung, Barrierefreiheit und Geometrieneutralität ab.
- `PRUEFEN.sh` führt VI-AF im bestehenden Prüfschritt 35/35 aus.
- Lokale Vollprüfung auf dem zuletzt qualifizierten Source-Artefakt: **35/35 PASS**, LIVING-CITY-11 **12/12 PASS** inklusive 3500-Zug-Langlauf.
- Remote-Qualifikation wird nach erfolgreichem GitHub-Actions- und Chrome-E2E-Gate ergänzt.
