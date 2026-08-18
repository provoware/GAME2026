# Visual Polish VI-AK – Gruppenübergreifender Kritikalitätsfokus

Status: lokal qualifizierter Implementierungskandidat

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

## Remote-Qualifikation
Noch ausstehend; erst nach erfolgreichem GitHub-Actions- und echtem Chrome-E2E-Gate als remote qualifiziert markieren.
