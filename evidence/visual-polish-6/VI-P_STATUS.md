# Visual Polish VI-P – Status

## Ziel
Die vorhandenen Innenraum-Aktionskarten werden ohne neue UI-Fläche so gewichtet, dass Titel, Beschreibung, Ergebnis/Kostenzeile und Sperrgrund schneller auseinanderzuhalten sind.

## Umsetzung
- vorhandenes Aktionssymbol (`>i`) klarer als Orientierungspunkt
- reale Ergebnis-/Kostenzeile (`em`) grün und kontraststärker gewichtet
- realer Sperrgrund (`u`) als rote Warninformation priorisiert
- deaktivierte Aktionen bleiben zurückgenommen, ihr Sperrgrund bleibt aber lesbar
- Hover/Fokus verstärkt ausschließlich die vorhandene Ergebniszeile
- keine Layoutmaße, keine neue Interaktion, keine Gameplay-, Engine-, Schema- oder Save-Änderung

## Vorvalidierung
- Ausgangsstand VI-O: GitHub Actions #199 SUCCESS
- lokale Vorqualifikation `PRUEFEN.sh`: **35/35 PASS**
- LC11-Engine: **12/12 PASS**
- 3500-Zug-Langlauf: **PASS**
- Remote-Gate: nach Branch-Aktualisierung ausstehend

## Repository-Hygiene
Keine ZIP-, `__pycache__`- oder `.pyc`-Dateien und keine beabsichtigten Löschungen.
