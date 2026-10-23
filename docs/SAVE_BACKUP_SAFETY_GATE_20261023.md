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

## Laufzeit-Nachweisauftrag – 23.10.2026, 15:35 MESZ

**Änderung:** Der getrennte Entwicklungszweig `agent/prerelease-godot46-runtime-20261023-1535` ergänzt einen GitHub-CI-Auftrag für Godot 4.6-stable mit fester SHA-256-Prüfsumme. Der Projektimport und die sechs bereits registrierten SAV-04-Regressionen sollen damit erstmals in der echten Engine laufen. **Status zunächst IN PRUEFUNG, nicht PASS.** Kein Spielstand außerhalb des isolierten Testverzeichnisses wird als Testziel verwendet. Die zwölf SAVE-T01 bis SAVE-T12 bleiben bis zu ihrem jeweils vollständigen Nachweis offen; insbesondere Fehler-Injektion, Recovery nach Unterbrechung und Windows bleiben ungeprüft.

**Nachfolge:** CI-Protokoll zum HEAD dokumentieren; bei Fehlern Tests oder Produktcode auf dem Entwicklungszweig korrigieren. Danach Save-v1/v2/v3-Migration und Rücknahmefehler unter kontrollierter Fehler-Injektion testen. Kein Merge, kein Release, keine persönliche Abnahme.

## Tatsächlich ausgeführte Godot-Tests – 23.10.2026, 15:46 MESZ

**PASS (eingeschränkter Umfang):** https://github.com/provoware/GAME2026/actions/runs/39963911354 am Code-HEAD `1044716b07ae2352749d9c9b35b53c972199a4a1`. Offizielle Godot 4.6-stable geprüft; Projektimport fehlerfrei; 23/23 Engine-Selbsttests einschließlich sieben Save-Regressionen und 23/23 Python-Tests erfolgreich. Ein realer JSON-Ganzzahl-Roundtrip-Fehler wurde dadurch entdeckt und behoben. 

**NICHT FREIGEGEBEN:** SAVE-T01/T02/T05/T06/T08 besitzen jetzt Teilnachweise, aber die zwölf vollständigen Sicherheitsfälle sind nicht geschlossen. Insbesondere Kurzschreiben, fehlgeschlagene Rücknahme, Stromausfall, Save-v1/v2/v3, Windows-Dateisystem und Grenzen großer Zahlen bleiben offen. Kein produktiver Spielstand wurde als Testdatensatz verwendet. **SAV-04 P0 bleibt offen.**

## SAV-04 – Rücknahme-Fehler-Injektion (23.10.2026, 20:33 MESZ)

**Arbeitszweig:** `agent/prerelease-sav04-rollback-20261023-2033`, Ausgangs-HEAD `f095970a158ea64628fa3334de6d4643d5ad0aa6` (PR #13). Keine echten Spielstände betroffen.

**Prüfhypothese (Quellcodebefund):** Scheitert die Rücknahme `.bak -> Hauptstand` nach fehlgeschlagener Aktivierung, darf `.bak.previous -> .bak` nicht mehr ausgeführt werden. Andernfalls kann die ältere Sicherung den letzten gültigen Hauptstand in `.bak` ersetzen. Der Zweig enthält eine Schutzbedingung und einen gezielten Negativtest.

**Neu registrierte Engine-Regressionen (bis zum CI-Lauf UNGEPRUEFT):**
- SAVE-T05: Fehler beim Verschieben des aktuellen Hauptstands nach `.bak`; ältere Sicherung muss unverändert zurückkehren.
- SAVE-T07a: Rücknahme der alten Sicherung scheitert; `.bak.previous` bleibt unverändert erhalten und der Fehler wird gesondert gemeldet.
- SAVE-T07b: Aktivierung und Hauptstand-Rücknahme scheitern; `.bak` muss den zuletzt gültigen Hauptstand und `.bak.previous` die ältere Sicherung enthalten. Kein stilles Überschreiben.
- SAVE-T09: Manipulierte SHA-256-Prüfsumme wird beim Laden abgelehnt, ohne die bestehende Sicherung zu verändern.

**CI-Gate:** `test.sh` verlangt mindestens **27/27** registrierte Godot-Tests. Der frühere Nachweis von 23/23 auf PR #13 gilt nur für dessen HEAD. Ergebnisse des neuen Zweigs erst nach tatsächlichem GitHub-Actions-Lauf als PASS/FAIL bewerten.

**Weiterhin P0-OFFEN:** unvollständiges Schreiben/Datenträgerfehler, tatsächliche Unterbrechung an jeder Umbenennungsgrenze, automatisierte nicht destruktive Recovery-Anleitung, Save-v1/v2/v3, große Zahlen und Windows-Semantik. Kein Merge, kein Release.


### Verifizierter SAV-04-Codecheckpoint – 23.10.2026, 20:37 MESZ

**PASS auf Code-HEAD `1356e4811a1a7436dee6e9cebd1bc6f62cb2a0e1`:** GitHub Actions https://github.com/provoware/GAME2026/actions/runs/40004794570 – Godot 4.6-stable **27/27 Engine-Tests**, Python **23/23 Tests**, GDScript/JSON/Shell/Manifest **PASS**. Die vier neuen Fehler-Injektionsfälle wurden tatsächlich ausgeführt. Die vorangegangene Syntaxstörung im Testcode wurde behoben; frühere fehlgeschlagene Zwischen-HEADs sind keine Freigaben. **SAV-04 bleibt P0-OFFEN** für Kurzschreiben, Stromausfall-/Recovery-Tests, Migration und Windows. Dokumentationsfolgecommits erfordern erneut eine grüne CI auf ihrem eigenen HEAD.
