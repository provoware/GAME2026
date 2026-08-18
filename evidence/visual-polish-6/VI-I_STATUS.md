# Visual Polish VI-I – Marker-Priorität und optische Ruhe

Stand: 2026-08-17

## Änderung
- Aktiver und ausgewählter Bezirk werden klarer priorisiert.
- Sekundäre Asset-, Intel- und Bahn-Pins sind in normalen Lagen optisch ruhiger.
- Ereignis- und kritische Drucklagen heben vorhandene Pins kontextabhängig stärker hervor.
- Die Kartenänderung bleibt geometrieneutral und erzeugt keine neue Interaktionsebene.
- Gameplay, Engine, Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert.

## Chrome-E2E-Härtung
- Der vorherige Remote-Gate-Fehler war ein `StaleElementReferenceException` während eines dynamischen Dialog-Neurenderings.
- Der LC11-E2E startet den qualifizierten Browserkern bei genau diesem transienten DOM-Wechsel einmal vollständig neu.
- Ein wiederholter Stale-Fehler bleibt ein harter Gate-Fehler und wird nicht maskiert.

## Lokale Qualifikation
- `PRUEFEN.sh`: 35/35 PASS
- LIVING-CITY-11 Engine: 12/12 PASS
- 3500-Zug-Langlauf: PASS
- Python `compileall`: PASS
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien für die Repository-Aktualisierung vorgesehen
