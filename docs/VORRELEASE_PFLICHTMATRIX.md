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
| QA-05 | Godot 4.6 Headless-Selbsttests | test.sh / .github/workflows/validate.yml | IN_PRUEFUNG | Neuer CI-Auftrag mit SHA-256-verifizierter Godot 4.6; tatsächliche CI-Tests und Fehlermeldungen noch auswerten |
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

**Freigabe: ROT (0/44 vollständig abgeschlossene Release-Pflichten; SAV-04-Code nicht runtime-geprüft).** Kein Merge und kein Release. Persönliche Kubuntu-/Sichtabnahme ausschließlich am eingefrorenen Vorrelease-Kandidaten.

## Technischer Nachtrag – 23.10.2026, 15:35 MESZ

- **QA-05 / SAV-04:** Godot-4.6-Laufzeitprüfung auf separatem Zweig `agent/prerelease-godot46-runtime-20261023-1535` ergänzt. SHA-256-verifizierte Engine-Binärdatei, Projektimport und `./test.sh` sind als CI-Schritte definiert. Erst die tatsächlichen Ergebnisse am neuen HEAD dürfen als PASS/FAIL bezeichnet werden.
- **SAV-04 bleibt P0-CODE-UNGEPRUEFT**, bis die sechs vorhandenen Regressionen und alle zwölf Sicherheitsfälle nachgewiesen sind. Die CI-Einrichtung allein ist keine Freigabe.
- **Unabhängig offen:** WORLD-01, vollständige Missionen und Kampagne, 800×600/Skalierung, Tastatur, Speicherung/Migration, Performance, Startbarkeit, Release-Freeze. Keine persönliche Endabnahme vor den technischen Gates.

- **QA-05 Nachtrag:** Ein Godot-Importfehler kann bei Exitcode 0 fälschlich grüne CI erzeugen (reproduziert in Run 39963412124). Der neue `test.sh`-Gate prüft Fehlertexte und mindestens 23 vollständige Tests; der Import-Gate prüft Parse-/Ladefehler. Ein früherer grüner Lauf mit nur 4/4 zählt ausdrücklich **nicht** als PASS. Aktuelle CI erneut auswerten.
