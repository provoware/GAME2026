# Visual Polish VI-AS – empfohlenes Reiseziel auf der Karte

## Ziel
Die in VI-AQ/VI-AR bereits ermittelte Reiseempfehlung wird ohne zusätzliche UI-Fläche direkt mit dem passenden Bezirksmarker der Stadtkarte verbunden.

## Umsetzung
- rein CSS-basierte Verknüpfung der vorhandenen `data-action-target-location`-Semantik mit stabilen `data-location`-Markern;
- Reiseziele erhalten eine cyanfarbene gestrichelte Zielkontur sowie klareren Bezirksnamen;
- direkte `HIER`-Aktionen erzeugen bewusst keine Reise-Markierung;
- `prefers-contrast: more` verstärkt die Zielkontur;
- keine Animation, keine neue DOM-Geometrie und keine neue Interaktion.

## Kompatibilität
- Gameplay: unverändert
- Browser-Schema: 12 unverändert
- Save-Spiegel: v0170 unverändert
- Layoutgeometrie: unverändert

## Prüfung
- VI-AR/AS-Vertrag: `web/tests/lc11-visual-polish-6ar-contract.test.js`
- bestehende Einbindung in Prüfblock 35 von `PRUEFEN.sh`
- vollständige lokale Prüfung: 35/35 PASS
- LIVING-CITY-11: 12/12 PASS inklusive 3500-Zug-Langlauf
- Remote-Qualifikation wird nach finalem GitHub-Actions-/Chrome-E2E-Gate ergänzt.
