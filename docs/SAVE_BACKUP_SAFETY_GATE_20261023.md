# SAV-04 – Sicherungsrotation und Wiederherstellung (23.10.2026)

**Basis:** `main` `de351d56ca848b1fb8b668a311017663078642bc`; abhängig vom offenen Entwurfs-PR #11 (`4d444bc75eb78b64d9be6e26d03c86b61466bd86`). **Status: CODE AUF GETRENNTEM ENTWICKLUNGSZWEIG; P0-NACHWEIS OFFEN.** Keine Änderungen an echten Spielständen.

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

## Umsetzung / Testnachweise (23.10.2026)

**Arbeitszweig:** `agent/prerelease-sav04-rotation-20261023-1037` (auf `8d1cf5828e6072f0ec01493b7388dbea1bf8cdaf` aufgebaut, ohne Main-Merge). Die Sicherungsrotation ist als **unfreigegebene Codeänderung** integriert:

- vorhandene `.tmp` und `.bak.previous` sowie verwaiste `.bak` blockieren eine neue Speicherung;
- vor der Rotation wird die vollständig geschriebene `.tmp` mit dem erwarteten Inhalt verglichen;
- vorhandene ältere Sicherungen werden bis zur erfolgreichen Aktivierung in `.bak.previous` erhalten;
- Umbenennungsfehler lösen eine Rücknahme aus; Fehler der Rücknahme werden gesondert protokolliert;
- ein gescheiterter Abschluss der Aufräumarbeiten belässt die ältere Sicherung und blockiert spätere Schreibvorgänge.

**Prüfstatus:** Sechs neue statische Quelltextverträge und sechs registrierte Godot-Regressionsfälle (dreifache Rotation, Aktivierungsfehler, Sicherungsfehler, liegengebliebene Stufendatei, vorhandene tmp, verwaiste bak). **Statische Prüfungen nur nach tatsächlichem CI-Lauf PASS nennen.** Godot-4.6-Laufzeittests sind noch BLOCKED, weil die Engine in der lokalen Prüfumgebung fehlt; deshalb sind SAVE-T01 bis SAVE-T12 nicht als vollständig PASS markiert. Kein Test hat produktive Spielstände verändert.

**Offene Nachweise:** simulierte Kurzschreibvorgänge, fehlgeschlagene Rücknahme, Stromausfall an allen Umbenennungsgrenzen, Migrationen v1/v2/v3, Windows/Linux-Dateisystemsemantik, tatsächlicher Godot-4.6-Lauf, vollständige CI, Testpaket. Diese Fälle müssen vor Freigabe durch weitere automatisierte Tests abgedeckt werden.

**Nächste Implementierung:** gezielte Fehler-Injektion bei allen Umbenennungsgrenzen und nicht destruktiver Recovery-Assistent; erst danach Save-Roundtrip und Weltreise integrieren. Persönliche Endabnahme ausschließlich am eingefrorenen Kandidaten.
