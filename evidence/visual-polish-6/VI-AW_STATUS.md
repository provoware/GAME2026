# Visual Polish VI-AW – Navigationsmarker-Hierarchie

## Zweck
Bei aktiver Reiseempfehlung werden die Bezirksmarker visuell hierarchisiert: Nebenbezirke treten in Ring, Kern und Nebenindikatoren kontrolliert zurück. Aktuelle Position und empfohlenes Ziel bleiben vollständig dominant. Bezirksnamen und Kartenlesbarkeit bleiben erhalten.

## Umfang
- Präsentationslayer: `web/lc11-visual-polish-6x.css`
- finale Importkette: `web/lc11-close-control.css`
- Vertragsprüfung: `web/tests/lc11-visual-polish-6aw-contract.test.js`
- `PRUEFEN.sh` Prüfblock 35 erweitert
- keine Gameplay-, Engine-, Browser-Schema- oder Save-Änderung
- keine neue DOM-Geometrie und keine Keyframes
- `prefers-contrast: more` und `prefers-reduced-motion: reduce` berücksichtigt

## Vorvalidierung
Der neue VI-AW-Vertrag und seine Node-Syntax wurden vor Veröffentlichung isoliert erfolgreich ausgeführt. Die vollständige Repository-/Chrome-Qualifikation erfolgt über den bestehenden GitHub-Actions-Gatepfad auf dem finalen Head.

## Freigabestatus
Remote-Qualifikation ausstehend. Dieser Nachweis darf erst nach erfolgreichem finalem Actions- und Chrome-E2E-Gate als remote qualifiziert bezeichnet werden.
