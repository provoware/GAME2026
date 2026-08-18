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
- Implementierungs-Gate GitHub Actions **#280 / 32102721727: SUCCESS**.
- Echter Google-Chrome-Desktop-E2E: **PASS**.
- Source-, Syntax-, Manifest- und Paketprüfungen: **PASS**.
- Implementierungs-Head: `8bfa88b7f4f8dbdef65d7fbbccbcd1f33851f7fc`, Tree `a7e199a1a6115b970f195c7fa2be852db4645335`.
- Implementierungs-Artefakte: Source `9312121739`, Chrome-E2E `9312120391`; beide exakt an diesen Head gebunden.
- Finales Dokumentations-/Head-Gate folgt auf dem abschließenden Head.
