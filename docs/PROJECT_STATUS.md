# Projektstatus

## Stand

**Paket:** 0.3.0-mission-iteration-c  
**Engineziel:** Godot 4.6.x, GL Compatibility  
**Primärplattform:** Linux  
**Sekundärplattform:** Windows

## Implementiert

### Fundament

- strukturierte Ergebnisse und Fehler;
- Command-/Effect-Verarbeitung;
- atomarer Rollback;
- idempotente Transaktionen;
- Domain-Event-Bus;
- autoritativer Sitzungszustand;
- atomare Speicherung mit SHA-256;
- Save-Version 3 mit Migration älterer Zustände.

### Missionen – Iteration A bis C

- JSON-basierte Missionsregistry und striktes Schema;
- mehrstufige Phasen und alternative Lösungswege;
- pfadabhängige Ziele und neutrale Missionssignale;
- absolute Fristen, Erfolg, Teilerfolg, Fehlschlag und Abbruch;
- Pause und Fortsetzung durch `Riss`;
- Ergebnisqualität von NONE bis GOLD;
- dauerhafte Missionshistorie mit Pfad-, Phasen- und Ergebnisdaten;
- sichere Wiederaufnahmepunkte beim Start, Phasenwechsel und bei Unterbrechungen;
- kontrollierte Wiederherstellung über Command und Effect;
- Graybox-Missionstracker;
- 15 automatisierte Selbsttests;
- Massensimulation mit 120 vollständigen Durchläufen.

### Werkzeuge

- Paketverifikation;
- Manifest mit SHA-256-Prüfsummen;
- GDScript-Linting und optionale Formatierung;
- automatische ZIP-Erstellung;
- semantische Missionsgraphprüfung;
- statische Weltgraph- und Erreichbarkeitsprüfung mit zehn Negativ-/Positivtests (noch keine spielbare Reise).

## Vorrelease – Sicherheitsarbeit (noch nicht freigegeben)

- SAV-04: Sicherungsrotation auf separatem Arbeitszweig überarbeitet; alte Sicherungen und unklare Zwischenstände werden vor Überschreiben geschützt.
- Sechs statische Quelltextverträge und sechs isolierte Godot-Tests sind eingebunden; Godot 4.6 und vollständige Stromausfall-/Recovery-Prüfung sind noch offen.
- Release-Gate bleibt ROT; siehe `docs/SAVE_BACKUP_SAFETY_GATE_20261023.md` und `docs/VORRELEASE_PFLICHTMATRIX.md`.

## Noch nicht implementiert

- Missionstransformationen und Folgeaufträge;
- vollständige Archivansicht im finalen UI;
- Welt- und Stadtgraph;
- Bunkerbasisverwaltung;
- vollständige Figuren- und Beziehungssysteme;
- Resonanzsystem;
- Dialogsystem;
- Wirtschaft;
- Konfliktsystem;
- Musik- und Medienproduktion;
- finales UI und Art;
- vollständige Kampagne.

## Fortschritt

- Spezifikation und Architektur: 57 %
- Codeimplementierung: 12 %
- Validierungs- und Testinfrastruktur: 17 %
- gewichteter Gesamtfortschritt: 34 %

Die Werte beschreiben den gesamten Weg bis zu einem getesteten Release und nicht nur den Quellcodeumfang.

## Nächster Meilenstein

**WORLD-01 – Iteration A**

- datengetriebener Welt- und Stadtgraph;
- erreichbare Orte, Verbindungen und Reisekosten;
- autoritative Positionsverfolgung;
- Missionstrigger beim Betreten eines Ortes;
- Karten-Graybox mit tastaturbedienbarer Ortsauswahl;
- positive und negative Routentests;
- Save-/Load-Roundtrip für Weltzustände.

## Verifizierter QA-05-Zwischenstand (23.10.2026)

Auf getrenntem Entwicklungszweig `agent/prerelease-godot46-runtime-20261023-1535` wurde die echte Godot-4.6-Laufzeitprüfung eingeführt. Der erste Lauf entdeckte eine numerische Typveränderung beim Laden von JSON-Spielständen; die Korrektur und ein zusätzlicher Regressionstest sind am Commit `1044716b07ae2352749d9c9b35b53c972199a4a1` erfolgreich geprüft: https://github.com/provoware/GAME2026/actions/runs/39963911354 (**23/23 Godot, 23/23 Python, beide CI-Aufträge PASS**). Die CI erkennt nun auch Godot-Scriptfehler trotz Exitcode 0. **Kein Vorrelease-Kandidat:** SAV-04-Fehlerfälle, Weltreise, vollständige Kampagne, 800×600/Skalierung, Tastatur, Performance, Windows und Release-Freeze sind offen. Nächste Umsetzung: kontrollierte Save-Fehler-Injektion und nicht destruktive Wiederherstellung.

## SAV-04 – Rücknahme-Sicherheitsiteration (23.10.2026, 20:33 MESZ)

Auf `agent/prerelease-sav04-rollback-20261023-2033` ist die Rücknahme so angepasst, dass ein fehlgeschlagenes Wiederherstellen des Hauptstands die ältere Sicherung nicht auf den noch gültigen `.bak`-Stand verschiebt. Vier zusätzliche isolierte Godot-Negativtests prüfen Umbenennungs- und Rücknahmefehler sowie die Ablehnung einer manipulierten Prüfsumme. Das Engine-Gate fordert nun mindestens 27 Tests. **Stand dieser Dokumentation: Implementierung vorhanden, CI am neuen HEAD noch ausstehend; SAV-04 und Gesamt-Vorrelease ROT.** Nächste Arbeit: vollständige GitHub-CI prüfen, danach Kurzschreib-/Stromausfall- und Migrationstests. Persönliche Endabnahme zurückgestellt.


### Verifizierter Zwischenstand – 23.10.2026, 20:37 MESZ

Am Code-HEAD `1356e4811a1a7436dee6e9cebd1bc6f62cb2a0e1` bestanden **27/27 Godot-4.6-Tests** und **23/23 Python-Tests** samt Manifest-/GDScript-Prüfung (https://github.com/provoware/GAME2026/actions/runs/40004794570). Die Rücknahme schützt den letzten gültigen Hauptstand auch bei fehlgeschlagener Wiederherstellung. Dies ist ein **Teilnachweis**, kein vollständiger SAV-04- oder Vorrelease-Abschluss. Nachfolgende reine Dokumentationsänderungen benötigen eigene CI. Nächste Pflichtarbeit: isolierte Kurzschreib-/Unterbrechungs-/Recovery- und Migrationsprüfungen.

## SAV-04 – Lesende Recovery-Diagnose (24.10.2026)

Sechs isolierte Engine-Regressionen und eine schreibfreie Diagnose für Hauptstand, `.bak`, `.bak.previous` und `.tmp` sind auf getrenntem Entwicklungszweig implementiert. Keine automatische Wiederherstellung; `.tmp` ist niemals eine bestätigte Speicherung. **Status bis zur tatsächlichen GitHub-CI: UNGEPRUEFT.** P0-SAV-04 und alle Gesamtgates bleiben ROT. Details: `docs/SAVE_RECOVERY_INSPECTION_20261024.md`. Nächster Schritt: CI-Auswertung, anschließend isolierte Kurzschreib-/Stromausfall- und Migrationsfälle.

## Verifizierter Engine- und Integritätscheckpoint – 24.10.2026, 01:32 MESZ

**Geprüfter Code-HEAD:** `c7a6e3eeecdb35ea38e43a85b057cbdb8bb672a0`. **GitHub Actions:** https://github.com/provoware/GAME2026/actions/runs/40040205415 (auch Push-Lauf 40040189820). `godot-headless` **PASS: 33/33 tatsächliche Godot-4.6-Laufzeittests**, darunter REC-T01 bis REC-T06; offizielles Godot-Archiv mit SHA-256 verifiziert, Projektimport und Fehlergate erfolgreich. `static-validation` **PASS: 23/23 Python-Regressionen**, Manifest, JSON, GDScript und Shell erfolgreich. GitHub-Laufprotokolle wurden ausgelesen.

**Beweisgrenze:** Die sechs Recovery-Tests zeigen nur die schreibfreie Untersuchung isolierter Zustände, nicht physische Stromausfall- oder Windows-Recovery. **SAV-04 bleibt P0-OFFEN; Gesamt-Vorrelease ROT (1/44).** Dieser Nachtrag ist ein Dokumentationsfolgecommit; dessen endgültiger HEAD benötigt erneut grüne CI.

## SAV-04 – Deterministische Kurzschreib-Injektion (24.10.2026, 06:31 MESZ)

**Ausgangs-HEAD:** `f6319126e9b46708f1826095cca2af5a6ce48f5d` (offener Entwurfs-PR #15). Die produktive Schreiboperation besitzt eine überschreibbare, standardmäßig unveränderte Testnaht `_store_temporary_payload`. Drei neue Godot-Laufzeitfälle SAVE-SHORT-01/02/03 simulieren absichtlich eine halbierte `.tmp`-Datei beim ersten Speichern, mit Hauptstand und mit bereits vorhandener Sicherung. Erwartet: `SAVE-ERR-011`, keine Sicherungsrotation, bestehende Dateien bytegleich, keine verbliebene Test-`.tmp`. Ausschließlich `user://_prerelease_save_tests`.

**Status dieses Arbeitspakets:** IMPLEMENTIERT, GitHub-CI am neuen HEAD **AUSSTEHEND**. Der Teststarter fordert mindestens **36/36** Godot-4.6-Tests; Python-/Manifestprüfung ebenfalls ausstehend. SAV-04 bleibt **P0-OFFEN** und der Vorrelease-Status **ROT (1/44)**. Nicht geprüft: physischer Stromausfall, `fsync`, Windows-Dateisystem, Migrationen und vollständige Spielverläufe. **NEXT:** tatsächliche CI auswerten; danach nicht destruktive Wiederherstellung und Save-v1/v2/v3-Migrationen in isolierten Tests. Keine persönliche Endabnahme, kein Merge/Release.
