# SAV-04 – Sicherungsrotation und Wiederherstellung (23.10.2026)

**Basis:** `main` `de351d56ca848b1fb8b668a311017663078642bc`; abhängig vom offenen Entwurfs-PR #11 (`4d444bc75eb78b64d9be6e26d03c86b61466bd86`). **Status: P0-OFFEN / CODEÜBERTRAGUNG BLOCKED.** Keine Änderungen an echten Spielständen.

## Bestätigter Befund

`scripts/save/save_service.gd` löscht eine vorhandene `.bak` vor dem Umbenennen des aktuellen Spielstands und vor dem Aktivieren der neuen `.tmp`. Scheitert eine der folgenden Umbenennungen, ist die ältere Sicherung unwiederbringlich verloren. Das Verhalten verletzt die geforderte Erhaltung gültiger Spielstände bei fehlgeschlagenen Schreibvorgängen.

## Verbindliche Invarianten

1. Ein Fehler vor dem erfolgreichen Aktivieren eines neuen Spielstands darf weder den bisherigen Hauptstand noch die vorherige Sicherung endgültig vernichten.
2. Eine bereits vorhandene Zwischen-/Wiederherstellungsdatei darf niemals stillschweigend überschrieben oder gelöscht werden.
3. Vor jeder Sicherungsrotation muss der temporäre Stand vollständig geschrieben, geschlossen und geprüft sein.
4. Scheitert eine Umbenennung, müssen Rücknahmefehler getrennt gemeldet und alle noch intakten Dateien erhalten bleiben.
5. Nach Stromausfall muss eine dokumentierte, nicht destruktive Wiederherstellung möglich sein; automatisches Löschen verdächtiger Dateien ist untersagt.
6. Tests benutzen ausschließlich eindeutig gekennzeichnete, isolierte Testverzeichnisse und niemals vorhandene Benutzerspielstände.

## Technische Prüfmatrix

| ID | Szenario | Erwartetes Ergebnis | Status |
|---|---|---|---|
| SAVE-T01 | Erster Speichervorgang | Neuer Stand korrekt lesbar | OFFEN (Godot) |
| SAVE-T02 | Zwei und drei erfolgreiche Speichervorgänge | Hauptstand neu, `.bak` unmittelbarer Vorgänger | OFFEN (Godot) |
| SAVE-T03 | Fehler beim Öffnen der `.tmp` | Bestehende Dateien unverändert | OFFEN (Godot) |
| SAVE-T04 | Unvollständiges Schreiben | Keine Sicherungsrotation | OFFEN (Godot) |
| SAVE-T05 | Fehler beim Sichern des Hauptstands | Hauptstand und ältere Sicherung erhalten | OFFEN (Godot) |
| SAVE-T06 | Fehler beim Aktivieren der `.tmp` | Hauptstand und ältere Sicherung wiederhergestellt | OFFEN (Godot) |
| SAVE-T07 | Fehler während Rücknahme | Intakte Dateien bleiben erhalten; Fehlerdetails | OFFEN (Godot) |
| SAVE-T08 | Zurückgelassene Zwischen-/Sicherungsdatei | Sicheres Stoppen statt Überschreiben | OFFEN (Godot) |
| SAVE-T09 | Beschädigtes JSON oder SHA-256 | Laden verweigert; Dateien unverändert | OFFEN (Godot) |
| SAVE-T10 | Save-v1/v2/v3-Migration | Korrekte Migration und identischer Roundtrip | OFFEN (Godot) |
| SAVE-T11 | Stromausfall an jeder Umbenennungsgrenze | Nachweisbar wiederherstellbarer letzter gültiger Stand | OFFEN (Recovery-Test) |
| SAVE-T12 | Linux und Windows | Korrekte Umbenennungssemantik und Zugriffsfehler | OFFEN (Plattformtest) |

## Umsetzung / Blockade

Die Codeänderung zur nicht destruktiven Sicherungsrotation wurde am 23.10.2026 zur Übertragung versucht, jedoch durch eine Sicherheitsprüfung des Schreibwerkzeugs abgewiesen. **Kein Code-Commit und kein bestandener Godot-Test.** Ein eigenständiger lokaler Entwurf und vier statische Vertragsprüfungen liegen vor, ersetzen aber keine Godot-Laufzeitprüfung.

**Nächster erlaubter Schritt:** Korrektur nach regulärer Freigabe des Schreibwegs übertragen, `test.sh` mit Godot 4.6 auf isolierten Testdaten ausführen, alle zwölf Fälle dokumentieren, Manifest bewusst neu berechnen, `verify.sh` ohne Manifeständerung ausführen und GitHub-CI am neuen SHA prüfen. Persönliche Endabnahme bleibt bis zum eingefrorenen Kandidaten zurückgestellt.
