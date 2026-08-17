# Visual Polish VI-G – Straßen-, Bahn- und Routenhierarchie

Stand: 0.17.6 LIVING-CITY-11 Visual Polish VI-G

## Änderung
- Normale Straßen, Bahnlinien, direkt erreichbare Verbindungen, geplante Routen und das konkret gewählte Reiseziel visuell klar voneinander getrennt.
- Straßen bleiben als ruhige, durchgezogene Infrastruktur sichtbar; Bahnlinien erhalten ein eigenständiges gepunktetes Gleisbild.
- Erreichbare Verbindungen werden cyan/violett hervorgehoben, geplante Etappen goldfarben geführt und das konkret gewählte Ziel limefarben priorisiert.
- Geplante Routen erhalten eine dezente Flussanimation; Reduced-Motion und vorhandener Ruhemodus schalten sie vollständig ab.
- Rein präsentational und geometrieneutral; keine neue Kartenfläche, keine neue Interaktionsebene und keine Änderung an Routing- oder Reiseregeln.

## Kompatibilität
- Gameplay unverändert.
- Browser-Schema 12 unverändert.
- Save-Spiegel v0170 unverändert.
- Bestehende Klassen `reachable`, `planned` und `chosen` werden ausschließlich visuell ausgewertet.

## Lokale Vorqualifikation
- `PRUEFEN.sh`: **35/35 PASS**.
- LC11-Engine: **12/12 PASS**.
- 3500-Zug-Langlauf: **PASS**.

Remote-Gate und Chrome-E2E werden erst nach bestandener lokaler Prüfung und dem nicht-forcierten Fast-Forward ergänzt.
