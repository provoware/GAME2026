# Visual Polish VI-AM – Status

## Ziel
Bei mehreren gleichzeitig kritischen Wirkungsgruppen Hauptfolge und sekundäre Folgen in derselben Blickzone eindeutig unterscheiden, ohne zusätzliche Layoutfläche und ohne Gameplay-/Save-Änderung.

## Umsetzung
- VI-AK/VI-AL bestimmen weiterhin exakt eine gruppenübergreifend kritischste Ursache
- deren Konsequenz wird als **Hauptfolge** gekennzeichnet
- dominante Ursachen weiterer gleichzeitig kippender Wirkungsgruppen werden als **sekundäre kritische Ursachen** erkannt
- deren Konsequenzen werden als visuell zurückgenommene **Sekundärfolgen** direkt am jeweiligen Wert angezeigt
- semantische Attribute: `data-secondary-critical` und `data-consequence-tier`
- `aria-label` unterscheidet Hauptfolge, Sekundärfolge und normale Folge ausdrücklich
- geometrieneutral, bewegungsfrei, keine neue Interaktionsebene
- Browser-Schema 12 und Save-Spiegel v0170 unverändert

## Validierung
- lokaler VI-AM-Vertrag: **PASS**
- vollständiges lokales `PRUEFEN.sh`: **35/35 PASS** inklusive LIVING-CITY-11 12/12 und 3500-Zug-Langlauf
- bestehender VI-AL-Vertrag nach Kompatibilitätskorrektur erneut: **PASS**
- Remote-Gate und echter Google-Chrome-Desktop-E2E: werden auf dem finalen Head geprüft
