# SAV-04 – Nicht destruktive Recovery-Kopie (24.10.2026)

## Ziel und Sicherheitsgrenze

Explizit ausgewählte, bereits validierte Haupt-/Sicherungsstände werden in eine **separate** Datei kopiert. Kein automatisches Aktivieren, keine Umbenennung und kein Überschreiben des Hauptstands, der .bak, .bak.previous oder .tmp. Die .tmp-Rolle wird stets abgewiesen. Die ursprüngliche lesende Diagnose bleibt unverändert.

`SaveRecoveryCopyService.copy_candidate(save_path, role, destination_path)` akzeptiert nur `user://` als Quellbereich und nur `<save_path>.recovered.<positive_Zahl>.json` als Ziel. Rollen: `main`, `backup`, `previous_backup`. Die Auswahl muss bewusst vom aufrufenden Programm erfolgen; es gibt keine automatische Recovery.

Vor dem Kopieren wird die Quelle mit dem vorhandenen SHA-256-Save-Validator vollständig geprüft. Danach werden Quelltext vor/nach der Kopie und Ziel bytegleich verglichen und die Zielhülle erneut validiert. Bei Fehlern wird kein vorhandener Originalstand absichtlich verändert. Ein bereits existierendes Ziel wird abgewiesen; eine bei fehlgeschlagenem Kopieren entstandene Teilkopie bleibt zur manuellen Diagnose erhalten und wird nicht stillschweigend entfernt.

## Tests und offene Grenzen

Acht isolierte Godot-Fälle: gültige Sicherung, gestufte Sicherung, beschädigter Hauptstand, Zielkollision, manipulierte Sicherung, unbestätigte .tmp, fremder Zielpfad und fehlende Quelle. Testpfad: `user://_prerelease_recovery_copy_tests`. Godot-Mindestgate: 54.

**Wichtig:** Die Vorabprüfung verhindert keine gleichzeitige Änderung durch fremde Prozesse zwischen Existenzkontrolle und Kopiervorgang (TOCTOU), keine Symlink-Angriffe, keine physischen Stromausfälle und garantiert kein `fsync`. Deshalb nur ein lokaler autorisierter Writer, keine öffentliche Recovery-Freigabe. Die technische Endabnahme erfordert später exklusives Dateianlegen, echte Crash-/Stromausfall- und Plattformtests. **SAV-04 bleibt P0-OFFEN.**

**Trace:** PR #17 / HEAD `ba82bb7274372780f1485cec858e7ff5fff5bcbc` → Recovery-Copy-Service + acht Tests → `headless_test_runner.gd` / `test.sh` → CI am neuen Commit. **Kein Merge, kein Release, keine persönliche Endabnahme.**
