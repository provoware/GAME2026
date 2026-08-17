# Visual Polish VI-T – Status

## Verbesserungsschritt
Visual Polish VI-T verbessert die Icon-/Text-Balance der Innenraum-Aktionskarten, damit Symbol, Titel, Nutzen und Risiko schneller als zusammengehörige Entscheidungseinheit gelesen werden können.

- Icons treten im Ruhezustand bewusst leicht hinter den Titel zurück
- Hover/Fokus hebt Icon und Entscheidungseinheit gemeinsam hervor
- Titel erhalten eine ruhigere, balancierte Zeilenbildung
- Nutzen- und Risikozeilen werden typografisch enger an die Aktion gebunden
- deaktivierte Icons treten klar zurück, Sperrgründe bleiben dominant
- keine neuen Layoutmaße, keine zusätzliche UI-Fläche und keine neue Interaktionsebene
- Reduced Motion bleibt vollständig berücksichtigt

## Kompatibilität
- Gameplay: unverändert
- Engine: unverändert
- Browser-Schema: 12, unverändert
- Save-Spiegel: v0170, unverändert
- keine neue aktive Interaktionsebene
- geometrieneutral; keine neuen Layoutmaße oder Grid-Geometrie

## Vertragsabsicherung
- neuer Präsentationslayer: `web/lc11-visual-polish-6k.css`
- `web/lc11-close-control.css` importiert VI-T vor dem finalen Close-Control-Regelsatz
- `web/tests/lc11-visual-polish-6-contract.test.js` prüft VI-T-Marker, Geometrieneutralität und das Verbot zusätzlicher `pointer-events:auto`-Ebenen

## Lokale Vorqualifikation
- `PRUEFEN.sh`: **35/35 PASS**
- LC11-Engine: **12/12 PASS**
- 3500-Zug-Langlauf: **PASS**
- historische Regressionen, UI-/Visual-Verträge und Python-Syntax: **PASS**

## Repository-Hygiene
- keine beabsichtigten Löschungen
- keine `__pycache__`- oder `.pyc`-Dateien hinzufügen
- keine ZIP-Dateien ins Repository aufnehmen
- Branch bleibt `agent/html-gang-map-boss-dynamics`
- PR #6 bleibt Draft, offen und ungemergt

## Remote-Gate
Nach dem sequenziellen, nicht-forcierten Branch-Update auf dem finalen Head vollständig zu prüfen.
