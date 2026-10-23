# SAV-04 – Lesende Wiederherstellungsdiagnose (24.10.2026)

## Ziel und Sicherheitsgrenze

Nach unterbrochener Sicherungsrotation dürfen vorhandene Hauptstände, Sicherungen und Zwischenstände **nicht** automatisch gelöscht, umbenannt oder aktiviert werden. `SaveRecoveryInspector.inspect(path)` untersucht ausschließlich lesend vier Kandidaten: `path`, `path.bak`, `path.bak.previous` und `path.tmp`.

Die Prüfung benutzt die bestehende `SaveService.load_from_path`-Validierung einschließlich JSON-Hülle, SHA-256 und Zustandsinvarianten. Für jeden Kandidaten meldet sie `MISSING`, `VALID` oder `INVALID`; bei Fehlern wird der Ladegrund angegeben. `candidate_for_manual_review` ist eine **Prüfhilfe**, keine automatische Wiederherstellung. Eine `.tmp` wird nie als aktivierter Stand empfohlen, selbst wenn ihre Prüfsumme stimmt. `auto_restore_allowed` ist immer `false`.

## Isolierte Regressionen

| Fall | Erwartung | Status vor GitHub-CI |
|---|---|---|
| REC-T01 | Nur Hauptstand gültig; unverändert | UNGEPRUEFT |
| REC-T02 | Unterbrechung nach Backup-Rotation: `.bak` und `.bak.previous` gültig; keine Mutation | UNGEPRUEFT |
| REC-T03 | Defekter Hauptstand, gültige `.bak`; manuelle Prüfung erforderlich | UNGEPRUEFT |
| REC-T04 | Ausschließlich gültige `.tmp`: keine automatische Empfehlung | UNGEPRUEFT |
| REC-T05 | Beschädigte `.tmp` neben Hauptstand; Warnung und keine Mutation | UNGEPRUEFT |
| REC-T06 | Alle Kandidaten fehlen; keine fiktive Wiederherstellung | UNGEPRUEFT |

Alle Tests erzeugen und entfernen nur eigene Dateien unter `user://_prerelease_recovery_tests`. Die Diagnose selbst ist schreibfrei. **Kein produktiver Spielstand wird geöffnet oder verändert.**

## Grenzen und nächster Pflichtschritt

Diese Diagnose stellt **noch keine Wiederherstellungsfunktion** dar. Sie beweist keine Stromausfallsicherheit auf physischem Datenträger, keine Windows-Umbenennungssemantik, keine garantierte Schreibdauerhaftigkeit (fsync), keine Save-v1/v2/v3-Migration und keine Behandlung von Zugriffs-/Sperrfehlern. Bei mehreren gültigen Kandidaten muss der Benutzer später eine gesondert abgesicherte Entscheidung treffen; Dateinamen allein beweisen nicht die jüngste Spielversion.

**Traceability:** SAV-04 → REC-T01 bis REC-T06 → `scripts/save/recovery_inspector.gd` → `scripts/tests/recovery_inspector_test_runner.gd` → `headless_test_runner.gd` → GitHub Actions auf dem finalen HEAD. Vor Ausführung: UNGEPRUEFT; kein Vorrelease, kein Merge. Persönliche Endabnahme zurückgestellt.
