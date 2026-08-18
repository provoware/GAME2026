# Visual Polish VI-AK – Gruppenübergreifender Kritikalitätsfokus

Status: remote qualifiziert

## Verbesserung
Wenn mehrere Wirkungsgruppen gleichzeitig kippen, wird aus den bereits bestimmten dominanten Gruppenursachen genau die gruppenübergreifend kritischste Ursache priorisiert. Bewertet wird zuerst die bestehende Wirkungsschwere, danach die bereits etablierte Metrikpriorität. Andere kippende Gruppen bleiben vollständig sichtbar, treten aber visuell zurück.

## Verträge
- keine zusätzliche Layoutfläche oder Geometrie
- keine neue Animation oder Interaktion
- Gameplay unverändert
- Browser-Schema 12 unverändert
- Save-Spiegel v0170 unverändert
- semantische Kennzeichnung über `data-global-critical` und `aria-label`

## Dateien
- `web/lc11-browser-hardening.js`
- `web/lc11-visual-polish-6s.css`
- `web/tests/lc11-visual-polish-6ak-contract.test.js`
- `PRUEFEN.sh`
- `evidence/visual-polish-6/VI-AK_STATUS.md`

## Lokale Qualifikation
- `PRUEFEN.sh`: 35/35 PASS
- LIVING-CITY-11 Engine: 12/12 PASS inklusive 3500-Zug-Langlauf
- VI-AK-Vertrag: PASS

## Remote-Qualifikation
- Implementierungs-Gate GitHub Actions #304 / 32126974248: SUCCESS
- echter Google-Chrome-Desktop-E2E: SUCCESS
- qualifizierter Vertragslauf, Shell-/Browser-JavaScript-/Python-Syntax, deterministischer Manifest-Neubau und Paketvalidierung: SUCCESS
- Source-Artefakt: 9320734787
- Chrome-E2E-Artefakt: 9320732918
- Implementierungs-Head: `b266dfb7f615af7651aa3d74a0f4fe8790d11428`

Der abschließende Status-Commit benötigt ein finales Head-Gate; nur dessen erfolgreicher Lauf gilt als endgültige Remote-Qualifikation des dokumentierten Endstands.
