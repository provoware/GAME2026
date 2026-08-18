# Visual Polish VI-AO – Status

## Verbesserung
- Sekundärfolgen werden zusätzlich nach zeitlicher Dringlichkeit geordnet: **sofort → bald → später**.
- Sicherheitsfolgen führen zeitkritisch vor Folgen der Handlungsfähigkeit; Ressourcenfolgen bleiben sichtbar, werden aber zeitlich nachgeordnet.
- `data-consequence-urgency` und `data-consequence-urgency-label` transportieren die Dringlichkeit semantisch.
- `aria-label` nennt die zeitliche Dringlichkeit explizit.
- Die Darstellung bleibt geometrieneutral, bewegungsfrei und ohne neue Interaktionsebene.
- Gameplay, Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert.

## Lokale Validierung
- `PRUEFEN.sh`: **35/35 PASS**
- LIVING-CITY-11 Engine: **12/12 PASS**, inklusive 3500-Zug-Langlauf
- VI-AN-Vertrag: **PASS**
- VI-AO-Vertrag: **PASS**
- Syntax-/UI-/Regression-/Vertragskette vollständig PASS

## Repository-Hygiene
- keine unbeabsichtigten Löschungen
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien aufgenommen
- Branch-Aktualisierung ausschließlich linear / nicht-forciert

## Remote-Qualifikation
- GitHub Actions und echter Google-Chrome-Desktop-E2E werden auf dem finalen VI-AO-Head geprüft.
