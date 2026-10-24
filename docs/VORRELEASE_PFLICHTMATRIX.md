# GAME2026 – Verbindliche Vorrelease-Pflichtmatrix

**Basis:** `main` `de351d56ca848b1fb8b668a311017663078642bc`, geprüft am 23.10.2026. **Arbeitszweig (aktuell):** `agent/prerelease-sav04-rotation-20261023-1037`, aufgebaut auf dem Manifest- und SAV-04-Dokumentationszweig. Die 44 Anforderungen stammen aus dem geschlossenen, nicht gemergten PR #8 und wurden gegen den aktuellen Hauptzweig abgeglichen. Keine Top-5-Repositories betroffen.

**Status:** CODE = Funktion vorhanden, aber noch nicht insgesamt freigegeben; OFFEN = fehlende Implementierung oder Nachweise; P0-OFFEN = kritisches Risiko; BLOCKED = technische Blockade; ZURUECKGESTELLT = persönliche Endabnahme erst nach vollständiger technischer Prüfung und Kandidaten-Freeze. Kein Gesamt-Release-Gate ist PASS.

| ID | Pflicht | Bezug | Status | Fehlende Umsetzung / Prüfung |
|---|---|---|---|---|
| ARC-01 | Atomare Commands, Effects und Rollback | scripts/core/command_executor.gd | CODE | Abbruch und Zustandsidentität nach Fehler |
| ARC-02 | Idempotenz und Transaktions-ID-Kollisionen | PR #7 | CODE | PR #7 gemergt; Replay und Transaktionskollisionen in Godot erneut testen |
| ARC-03 | Ereignisbus, stabile IDs und UI-Trennung | scripts/core/domain_event_bus.gd | CODE | Negativtest gegen UI-Direktmutation |
| MIS-01 | Missionsregistry, JSON-Schema, Graph | scripts/mission/mission_registry.gd | CODE | Softlocks, Referenzen, Negativfälle |
| MIS-02 | Signal 9909: Start, Wege und Phasen | content/missions/mission_neon_signal_9909.json | CODE | Alle Spielpfade im Godot-Test |
| MIS-03 | Fristen, Teilerfolg, Fehlschlag, Abbruch | scripts/mission/commands | CODE | Folgen nach Langzeitverlauf |
| MIS-04 | Pause, Riss und Fortsetzung | scripts/mission/commands/pause_mission_command.gd | CODE | Laden während Pause, Replay |
| MIS-05 | Qualität, Historie, Wiederaufnahmepunkte | scripts/tests/iteration_c_test_runner.gd | CODE | Migration und Restore in Godot |
| MIS-06 | Transformationen und Folgeaufträge | docs/PROJECT_STATUS.md | OFFEN | Regeln, Code, Positiv-/Negativtest |
| MIS-07 | Missionsarchiv und Filter | docs/PROJECT_STATUS.md | OFFEN | Oberfläche, Tastatur und Speichern |
| WOR-01 | Sechs Orte, sechs Routen und Startort | content/world/city_graph.json | CODE | Schemacheck auf Commit |
| WOR-02 | Eindeutige IDs, Endpunkte, Erreichbarkeit | tools/verify_world.py | CODE | Weltprüfer und zehn Tests auf main vorhanden; Integritätsgate wird hier korrigiert |
| WOR-03 | Reise, Kosten, Zeit und Sperren | docs/PROJECT_STATUS.md | OFFEN | Atomare Commands/Effects |
| WOR-04 | Missionstrigger beim Ortswechsel | docs/PROJECT_STATUS.md | OFFEN | Ereignisse ohne Doppelauslösung |
| WOR-05 | Weltkarte mit 800x600 und Tastatur | docs/PROJECT_STATUS.md | OFFEN | Graybox, Fokus, Vergrößerung |
| WOR-06 | Reisezustand speichern und laden | scripts/core/game_session_state.gd | OFFEN | Roundtrip und alte Saves |
| SAV-01 | Atomarer Speicherstand und SHA-256 | scripts/save/save_service.gd | CODE | Abbruch, volle Platte, Rechte |
| SAV-02 | Save-v1/v2/v3-Migration | scripts/core/game_session_state.gd | CODE | Echte Altversionen testen |
| SAV-03 | Kaputtes JSON/Prüfsumme ablehnen | scripts/save/save_service.gd | CODE | Keine Datenänderung bei Fehler |
| SAV-04 | Sicherung und Wiederherstellung | scripts/save/save_service.gd | P0-CODE-UNGEPRUEFT | Sicherungsrotation auf Arbeitszweig korrigiert; sechs statische und sechs Godot-Regressionsfälle integriert, echte Godot-/Recovery-Tests fehlen |
| UI-01 | Missionstracker-Graybox | scenes/main/main.tscn | CODE | Godot-Bedienprüfung |
| UI-02 | 800x600 bei 175–200 Prozent | docs/TESTING.md | OFFEN | Automatisierte Clipping-Prüfung |
| UI-03 | Tastatur, Fokus und Mausfreiheit | scripts/ui/main.gd | OFFEN | Fokusfolge und Shortcuts |
| UI-04 | Kontrast, Schrift, Farbunabhängigkeit | docs/TESTING.md | OFFEN | Kontrast- und Skalierungsnachweis |
| UI-05 | Grafik, Animation und Rückmeldung | docs/PROJECT_STATUS.md | OFFEN | Finale UI und technische Prüfung |
| SYS-01 | Bunkerbasisverwaltung | docs/PROJECT_STATUS.md | OFFEN | Räume, Energie, Reparatur |
| SYS-02 | Figuren und Beziehungen | docs/PROJECT_STATUS.md | OFFEN | Fähigkeiten, Beziehungen, Folgen |
| SYS-03 | Resonanzsystem | docs/PROJECT_STATUS.md | OFFEN | Regeln und negative Szenarien |
| SYS-04 | Dialoge und private Eingaben | docs/PROJECT_STATUS.md | OFFEN | Datenschutz und Freitextsicherheit |
| SYS-05 | Wirtschaft, Handel und Ressourcen | docs/PROJECT_STATUS.md | OFFEN | Balance, Exploits, Bilanz |
| SYS-06 | Konflikte und Fraktionen | docs/PROJECT_STATUS.md | OFFEN | Eskalation, Gegner, Auswege |
| SYS-07 | Musik- und Medienproduktion | docs/PROJECT_STATUS.md | OFFEN | Produktion, Pfade, Sicherheit |
| SYS-08 | Kampagne und Enden | docs/PROJECT_STATUS.md | OFFEN | Alle Pfade, Softlocks |
| QA-01 | Komplette Spielverläufe und Randfälle | scripts/tests/mission_mass_simulator.gd | CODE | Gesamtspiel-Langzeitläufe |
| QA-02 | Balance und Missbrauchsversuche | docs/TESTING.md | OFFEN | Reproduzierbare Seeds |
| QA-03 | Leistung, Speicher und Stabilität | docs/TESTING.md | OFFEN | Budgets und Belastungstest |
| QA-04 | Python, Shell, JSON, GDScript, CI | .github/workflows/validate.yml | CODE | CI zuletzt grün, aber Manifest wurde vorher neu erzeugt; Gate nach Korrektur prüfen |
| QA-05 | Godot 4.6 Headless-Selbsttests | test.sh / .github/workflows/validate.yml | PASS (23/23, Godot 4.6) | Commit `1044716b07ae2352749d9c9b35b53c972199a4a1`, Actions 39963911354; alle registrierten 23 Engine-Tests bestanden, Import und Fehlergate erfolgreich |
| QA-06 | Negativ- und Regressionstests | tools/tests/test_verify_world.py | CODE | Zehn Weltgraph-Regressionstests vorhanden; weitere Fachtests fehlen |
| OPS-01 | Linux/Windows-Start und Offlinebetrieb | start.sh | OFFEN | Frischinstallation, Start |
| OPS-02 | ZIP, Manifest, Prüfsummen | package.sh | CODE | Manifest darf vor Prüfung nicht neu erzeugt werden; ZIP-Roundtrip fehlt |
| OPS-03 | Version, Changelog, bekannte Fehler | CHANGELOG.md | OFFEN | Versionsabgleich und Release Notes |
| OPS-04 | Grüne Gesamt-CI und SHA-Freeze | .github/workflows/validate.yml | OFFEN | Alle Pflichtgates |
| OPS-05 | Persönliche Kubuntu-/Sicht-Endabnahme | Nutzerfreigabe | ZURUECKGESTELLT | Nur nach technischer Vollständigkeit, grünen Gates und Kandidaten-Freeze |

## Verifizierbare Befunde und Risiken

- `main` `de351d56ca848b1fb8b668a311017663078642bc` hatte am 22.10.2026 einen erfolgreichen GitHub-Actions-Lauf: https://github.com/provoware/GAME2026/actions/runs/39863874960 . **Das alte Manifest-Gate war trotzdem nicht aussagekräftig**, weil `verify.sh` und CI das Manifest unmittelbar vor seiner Kontrolle neu erzeugten.
- Vor dem Paket erfasste `MANIFEST.json` nur 73 statt 75 vorhandener versionierter Dateien. Außerdem waren Prüfsummen von `AGENTS.md`, `CHANGELOG.md`, `docs/PROJECT_STATUS.md` und `verify.sh` veraltet. Die beiden Weltprüfdateien fehlten vollständig.
- `tools/verify_world.py` und zehn Weltgraph-Regressionstests liegen auf `main`. Statische Erreichbarkeit beweist noch keine spielbare Reise.
- **P0-Speicherverlust:** Auf `main` wird eine vorhandene Sicherung vor Abschluss des neuen Speichervorgangs entfernt. Auf dem getrennten SAV-04-Arbeitszweig ist eine Schutzkorrektur mit sechs neuen Godot-Tests implementiert, aber mangels Godot-4.6-Laufzeit **nicht freigegeben**. Weitere Fehler-Injektion und Recovery-Prüfungen fehlen; niemals echte Spielstände als Testdaten verwenden.
- Godot-4.6-Lauf, Missions- und Kampagnenverläufe, Save-/Load-/Migrationstests, 800×600, hohe Skalierung, Tastatur, Balance, Leistung und Erscheinungsbild sind nicht vollständig nachgewiesen.
- `docs/PROJECT_STATUS.md` nennt Version 0.3.0, `tools/build_manifest.py` noch 0.2.0. Vor Release angleichen.

## Nachweisplan und nächste Umsetzung

1. `./verify.sh` kontrolliert das **gespeicherte** Manifest, ohne es zu verändern. Die sieben neuen Regressionen prüfen gültige, manipulierte, fehlende und zusätzliche Dateien sowie den CI-Aufruf. `package.sh` darf für einen bewussten Paketbau weiterhin das Manifest aktualisieren.
2. GitHub-CI auf dem neuen Commit vollständig auswerten; ein früherer grüner Lauf zählt nicht als Nachweis für diesen Commit.
3. Danach P0-Speicher-Backup mit Fehler-Injektion absichern und WORLD-01-Reise, Ressourcen, Zeit, Missionstrigger, Positionszustand und Save-Roundtrip über Commands und Effects umsetzen.

**Freigabe: ROT (1/44 einzeln nachgewiesene Pflichten: QA-05; SAV-04 weiterhin P0 und nicht vollständig freigegeben).** Kein Merge und kein Release. Persönliche Kubuntu-/Sichtabnahme ausschließlich am eingefrorenen Vorrelease-Kandidaten.

## Technischer Nachtrag – 23.10.2026, 15:35 MESZ

- **QA-05 / SAV-04:** Godot-4.6-Laufzeitprüfung auf separatem Zweig `agent/prerelease-godot46-runtime-20261023-1535` ergänzt. SHA-256-verifizierte Engine-Binärdatei, Projektimport und `./test.sh` sind als CI-Schritte definiert. Erst die tatsächlichen Ergebnisse am neuen HEAD dürfen als PASS/FAIL bezeichnet werden.
- **SAV-04 bleibt P0-CODE-UNGEPRUEFT**, bis die sechs vorhandenen Regressionen und alle zwölf Sicherheitsfälle nachgewiesen sind. Die CI-Einrichtung allein ist keine Freigabe.
- **Unabhängig offen:** WORLD-01, vollständige Missionen und Kampagne, 800×600/Skalierung, Tastatur, Speicherung/Migration, Performance, Startbarkeit, Release-Freeze. Keine persönliche Endabnahme vor den technischen Gates.

- **QA-05 Nachtrag:** Ein Godot-Importfehler kann bei Exitcode 0 fälschlich grüne CI erzeugen (reproduziert in Run 39963412124). Der neue `test.sh`-Gate prüft Fehlertexte und mindestens 23 vollständige Tests; der Import-Gate prüft Parse-/Ladefehler. Ein früherer grüner Lauf mit nur 4/4 zählt ausdrücklich **nicht** als PASS. Aktuelle CI erneut auswerten.

## Verifizierter QA-05-Checkpoint – 23.10.2026, 15:46 MESZ

- **Evidenz:** Commit `1044716b07ae2352749d9c9b35b53c972199a4a1`, GitHub Actions https://github.com/provoware/GAME2026/actions/runs/39963911354 – **PASS** `static-validation` (23/23 Python-Tests, Manifest/Syntax/Schemas) und **PASS** `godot-headless` (offizielles Godot 4.6-stable, geprüfte SHA-256, Projektimport, **23/23 tatsächliche Engine-Tests**).
- **Kritischer Befund behoben:** JSON-Parser wandelte Ganzzahlen beim Laden in float um; dadurch schlug der Roundtrip fehl (21/22 auf Commit `d250b3f8983d7b453a136c018aa5f05812333c95`). Typnormalisierung und neuer Ganzzahl-/Bruchwert-Test sind nun tatsächlich grün. Ein zweiter Fehler ließ Scriptfehler mit Exitcode 0 fälschlich als grün erscheinen; Import- und Teststarter prüfen deshalb zusätzlich Fehlerausgabe und Mindesttestzahl.
- **QA-05 (registrierte Godot-Selbsttests): PASS; Vorrelease-Gesamtstatus weiterhin ROT.** SAV-04 bleibt P0 bis zu Fehler-Injektion, Kurzschreib-/Stromausfall-/Recovery-Prüfung, Migrationsfällen und Windows-Vergleich. Alle anderen offenen Pflichtfunktionen und technische Oberflächen-/Gesamttests bleiben offen. Persönliche Endabnahme zurückgestellt.
- **Nächster erlaubter Schritt:** SAVE-T03/T04/T07/T09/T10/T11 in isolierter Testumgebung mit reproduzierbaren Fehlern prüfen, danach WORLD-01-Reise und Save-Roundtrip. Kein Merge/Release.

## SAV-04 – Ergänzender Pflichtnachweis (23.10.2026, 20:33 MESZ)

- **SAV-04 bleibt P0-OFFEN:** Schutz gegen Verlust des letzten gültigen Hauptstands bei gleichzeitigem Aktivierungs- und Rücknahmefehler auf separatem Zweig implementiert; vier zusätzliche Engine-Negativfälle (SAVE-T05/T07a/T07b/T09) registriert.
- **QA-05:** Der bisherige Nachweis 23/23 bezieht sich ausschließlich auf PR #13. Für den neuen Zweig gilt ein verschärftes Minimum von 27 Tests; Ergebnis bis zur tatsächlichen CI **UNGEPRUEFT**.
- **Traceability:** Ausgangs-HEAD `f095970a158ea64628fa3334de6d4643d5ad0aa6` → `scripts/save/save_service.gd` + `scripts/tests/save_service_regression_runner.gd` → `test.sh` → GitHub-CI am endgültigen Commit.
- **BLOCKS:** SAVE-T04/T10/T11/T12 und sämtliche technischen Vorrelease-Gesamtgates. **NEXT:** CI am neuen HEAD, dann isolierte Unterbrechungs-/Recovery-Tests; kein Merge/Release.


### Evidenznachtrag – 23.10.2026, 20:37 MESZ

**SAV-04 Teilnachweis PASS:** Auf Code-HEAD `1356e4811a1a7436dee6e9cebd1bc6f62cb2a0e1` bestanden 27/27 Godot-4.6-Laufzeittests (einschließlich vier zusätzlicher Rücknahme-/SHA-Negativfälle) sowie 23/23 Python-Tests und Manifestprüfung: https://github.com/provoware/GAME2026/actions/runs/40004794570 . **Gesamt-SAV-04 bleibt P0-OFFEN**, da Kurzschreib-, Stromausfall-/Recovery-, Migrations- und Windows-Fälle fehlen. **QA-05:** Laufzeit-Testinfrastruktur und registrierte 27 Fälle am angegebenen Code-HEAD PASS. Alle anderen Pflichtmatrix-Status unverändert. Dokumentationsfolgecommits müssen am finalen HEAD neu geprüft werden.

## SAV-04 – Lesende Recovery-Diagnose (24.10.2026)

**Ausgangs-HEAD:** `186b5cc18daa3cb34c2abb303494c13bf92ea9e0` (offener Entwurfs-PR #14). Neues, getrenntes Paket: `scripts/save/recovery_inspector.gd`, sechs isolierte Engine-Regressionen REC-T01 bis REC-T06 und Mindestgate **33** Engine-Tests. Hauptstand, `.bak`, `.bak.previous` und `.tmp` werden ohne Mutation geprüft; eine gültige `.tmp` wird nicht als bestätigter Stand empfohlen. **Vor CI: UNGEPRUEFT; SAV-04 P0-OFFEN; Vorrelease 1/44.** Die neue Diagnose ersetzt weder vollständige Stromausfall-/Dateisystemtests noch eine geprüfte Wiederherstellung oder Migration. Einzelheiten in `docs/SAVE_RECOVERY_INSPECTION_20261024.md`. Kein Merge/Release, persönliche Abnahme zurückgestellt.

## Verifizierter Engine- und Integritätscheckpoint – 24.10.2026, 01:32 MESZ

**Geprüfter Code-HEAD:** `c7a6e3eeecdb35ea38e43a85b057cbdb8bb672a0`. **GitHub Actions:** https://github.com/provoware/GAME2026/actions/runs/40040205415 (auch Push-Lauf 40040189820). `godot-headless` **PASS: 33/33 tatsächliche Godot-4.6-Laufzeittests**, darunter REC-T01 bis REC-T06; offizielles Godot-Archiv mit SHA-256 verifiziert, Projektimport und Fehlergate erfolgreich. `static-validation` **PASS: 23/23 Python-Regressionen**, Manifest, JSON, GDScript und Shell erfolgreich. GitHub-Laufprotokolle wurden ausgelesen.

**Beweisgrenze:** Die sechs Recovery-Tests zeigen nur die schreibfreie Untersuchung isolierter Zustände, nicht physische Stromausfall- oder Windows-Recovery. **SAV-04 bleibt P0-OFFEN; Gesamt-Vorrelease ROT (1/44).** Dieser Nachtrag ist ein Dokumentationsfolgecommit; dessen endgültiger HEAD benötigt erneut grüne CI.

## SAV-04 – Deterministische Kurzschreib-Injektion (24.10.2026, 06:31 MESZ)

**Ausgangs-HEAD:** `f6319126e9b46708f1826095cca2af5a6ce48f5d` (offener Entwurfs-PR #15). Die produktive Schreiboperation besitzt eine überschreibbare, standardmäßig unveränderte Testnaht `_store_temporary_payload`. Drei neue Godot-Laufzeitfälle SAVE-SHORT-01/02/03 simulieren absichtlich eine halbierte `.tmp`-Datei beim ersten Speichern, mit Hauptstand und mit bereits vorhandener Sicherung. Erwartet: `SAVE-ERR-011`, keine Sicherungsrotation, bestehende Dateien bytegleich, keine verbliebene Test-`.tmp`. Ausschließlich `user://_prerelease_save_tests`.

**Status dieses Arbeitspakets:** IMPLEMENTIERT, GitHub-CI am neuen HEAD **AUSSTEHEND**. Der Teststarter fordert mindestens **36/36** Godot-4.6-Tests; Python-/Manifestprüfung ebenfalls ausstehend. SAV-04 bleibt **P0-OFFEN** und der Vorrelease-Status **ROT (1/44)**. Nicht geprüft: physischer Stromausfall, `fsync`, Windows-Dateisystem, Migrationen und vollständige Spielverläufe. **NEXT:** tatsächliche CI auswerten; danach nicht destruktive Wiederherstellung und Save-v1/v2/v3-Migrationen in isolierten Tests. Keine persönliche Endabnahme, kein Merge/Release.

### Verifizierter SAV-04-Kurzschreib-Checkpoint – 24.10.2026, 06:35 MESZ

**Code-HEAD:** `33218ee0bdd82c3cf80dd578296793692fdd79c6`. [GitHub Actions #40062882575](https://github.com/provoware/GAME2026/actions/runs/40062882575) und [#40062878519](https://github.com/provoware/GAME2026/actions/runs/40062878519) **PASS**: Godot 4.6 **36/36** (einschließlich drei neuer Kurzschreibfälle), Python **23/23**, Manifest/Shell/JSON/GDScript und Godot-Import **PASS**. Der erste Lauf [#40062819523](https://github.com/provoware/GAME2026/actions/runs/40062819523) schlug wegen eines versehentlich entfernten Ausführungsbits von `test.sh` fehl; Bit in `33218ee0bdd82c3cf80dd578296793692fdd79c6` korrigiert und anschließend beide Prüfketten erfolgreich. **Nachweisgrenze:** nur simulierte Kurzschreibvorgänge auf isolierten Testdateien; keine physische Stromausfall-, Windows- oder `fsync`-Freigabe. SAV-04 weiterhin **P0-OFFEN**, Gesamt-Vorrelease **ROT (1/44)**. Nächste Pflicht: nicht destruktive Recovery und Save-v1/v2/v3-Migrationen, dann Gesamtspiel-/UI-/Leistungsgates. Dieser reine Dokumentationsfolgecommit benötigt erneut CI; persönliche Endabnahme zurückgestellt.

## MIG-01 – isoliertes Migrationspaket (24.10.2026, 11:37 MESZ)

**Ausgang:** `3094bd51a4f76a5ebf108e0d8fa6185d4ad6da83` (PR #16). **SAV-02** erhaelt zehn neue, synthetische Godot-Regressionsfaelle: v1/v2/v3 mit SHA-256-Huelle, abgelehnte Versionen 0/4/Text, ungueltige Ressourcen-/Missions-/Historienstrukturen sowie negative Ressourcen. Implementierung: `scripts/core/game_session_state.gd`, `scripts/tests/save_migration_test_runner.gd`, `scripts/tests/headless_test_runner.gd`. `test.sh` verlangt mindestens 46 vollstaendig bestandene Engine-Tests. Vor GitHub-CI: **UNGEPRUEFT**, kein PASS und keine Hochstufung der 44 Freigabepflichten. SAV-04 bleibt P0-OFFEN. Weitere Luecken: historische Original-Saves, Recovery-Kopie, physischer Stromausfall, Windows, Weltreise, 800x600, Tastatur, Kampagne, Performance und Release-Freeze. **NEXT:** CI am neuen SHA; danach Recovery- und Altdatei-Pruefungen. Keine persoenliche Endabnahme.

### MIG-01 – nachgewiesener Code-Checkpoint (24.10.2026, 11:41 MESZ)

**Code-HEAD:** `ac1b6ced849e8233bafd80741a7b1577ce0ee578`; [Push-CI #40082919683](https://github.com/provoware/GAME2026/actions/runs/40082919683) und [PR-CI #40082930812](https://github.com/provoware/GAME2026/actions/runs/40082930812) **PASS**. Godot 4.6-stable **46/46 echte Laufzeittests** einschliesslich zehn MIG-01-Faellen; `static-validation` **PASS** (Manifest/JSON/GDScript/Shell, Weltpruefung, Python). **Nachweisgrenze:** synthetische historische Save-Daten, keine echten Altdateien oder Dateisystem-Unterbrechung. **SAV-02 bleibt CODE mit Teilnachweis; SAV-04 P0-OFFEN; Gesamt-Vorrelease ROT (1/44).** Der folgende Dokumentations-/Manifestcommit benoetigt eigene CI. **NEXT:** isolierte, explizit autorisierte Recovery-Kopie mit Nicht-Ueberschreiben und Negativtests; danach historische v1/v2-Fixtures und Windows-/Stromausfall-Gates. Keine persoenliche Endabnahme, kein Merge/Release.
