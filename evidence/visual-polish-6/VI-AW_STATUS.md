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
Der neue VI-AW-Vertrag und seine Node-Syntax wurden vor Veröffentlichung isoliert erfolgreich ausgeführt.

## Remote-Qualifikation
- Implementierungs-Head: `a8b64c3bcc9218cfc15253a3b5d9f774abdc9e0e`
- Tree: `eef4ca89e12d1cfe282d489d5b0c9a611737d0d4`
- GitHub Actions #369 / `32187496076`: **SUCCESS**
- vollständiger qualifizierter Repository-Vertrag einschließlich Prüfblock 35: **PASS**
- echter Chrome-E2E-Pfad des bestehenden Gates: **PASS**

## Freigabestatus
VI-AW ist auf dem Implementierungs-Head remote qualifiziert. Der nachfolgende reine Status-/Dokumentations-Head muss abschließend erneut durch das unveränderte Gate laufen, bevor er als final qualifizierter Stand ausgewiesen wird.
