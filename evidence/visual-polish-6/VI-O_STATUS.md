# Visual Polish VI-O – Innenraum-Aktionshierarchie

## Ziel
Hauptaktion, Nutzen/Kosten, Risiko und Nebenaktionen in Innenräumen schneller unterscheidbar machen, ohne zusätzliche Layoutfläche oder Gameplay-/Save-Änderungen.

## Umsetzung
- Aktionsflächen erhalten eine stärkere visuelle Grundhierarchie und klarere Fokus-/Hover-Zustände.
- Kosten werden warm-gold, Risiko-/Warninformationen rot priorisiert; Sekundärtext bleibt kontrastreich, aber ruhiger.
- Deaktivierte Aktionen werden eindeutig zurückgenommen.
- Nachgeordnete Aktionen innerhalb eines Hotspots treten gegenüber der ersten Aktion zurück.
- Casino, Dojo, Schwarzmarkt und Bahnhof behalten ihre ortsspezifischen Fokusakzente.
- Keine Layoutmaße, Grid-Geometrie, aktive Interaktionsschicht, Engine-, Schema- oder Save-Änderung.

## Vertragsnachweis
`web/tests/lc11-visual-polish-6-contract.test.js` prüft VI-O-Marker, Kosten-/Risiko-/Disabled-Hierarchie, ortsspezifische Fokuszustände und die fortbestehende Geometrieneutralität.

## Repository-Hygiene
Keine ZIP-, `__pycache__`- oder `.pyc`-Dateien hinzugefügt; keine beabsichtigten Löschungen.

## Qualifikationsstatus
Implementierung und Vertragscheck committed. Remote-Gate/Chrome-E2E werden auf dem finalen VI-O-Head ausgewertet; dieser Nachweis wird erst nach erfolgreichem Gate als remote qualifiziert bezeichnet.
