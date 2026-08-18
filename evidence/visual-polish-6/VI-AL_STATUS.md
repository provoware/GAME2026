# Visual Polish VI-AL – Status

## Ziel
Ursache → Gruppenlage → Konsequenz in einer einzigen Blickbewegung erfassbar machen, ohne zusätzliche Layoutfläche und ohne Gameplay-/Save-Änderung.

## Umsetzung
- globale kritische Ursache behält VI-AK-Priorität
- semantische Konsequenz je Wirkungsgruppe und Gruppenlage wird aus bestehender Zustandslogik abgeleitet
- kompakte Overlay-Notiz zeigt die unmittelbare Konsequenz direkt an der kritischsten Ursache
- Sicherheitslage: u. a. „Handlungsdruck steigt“
- Ressourcen: u. a. „Spielraum sinkt“
- Handlungsfähigkeit: u. a. „Optionen werden enger“
- `aria-label` enthält die Konsequenz vollständig
- geometrieneutral, bewegungsfrei, keine neue Interaktionsebene
- Browser-Schema 12 und Save-Spiegel v0170 unverändert

## Validierung
- lokaler VI-AL-Vertrag: **PASS**
- vollständiges `PRUEFEN.sh`: **35/35 PASS** inklusive LIVING-CITY-11 12/12 und 3500-Zug-Langlauf
- GitHub Actions / Chrome-E2E: ausstehend bis Remote-Aktualisierung
