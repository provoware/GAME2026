# GAME2026 – Vorrelease-Pflichtmatrix

Referenz: Hauptzweig `40939ec86afd53bc29e81d4d4e16d792805dca82`, geprüft am 22.10.2026.
Arbeitszweig: `agent/prerelease-world-graph-20261021`. Keine Freigabe, kein Merge, kein Release.

**Statusregel:** CODE bedeutet lediglich Quellcode vorhanden; OFFEN bedeutet fehlende Funktion oder fehlenden Nachweis; BLOCKED bedeutet eine konkret belegte Blockade. PASS ist nur mit protokolliertem Test am identischen Commit erlaubt. Persönliche Abnahmen erfolgen ausschließlich nach allen technischen Prüfungen und dem Einfrieren des Kandidaten.

| ID | Verbindliche Pflicht | Vorhandener Bezug | Status | Fehlender Nachweis / Arbeit |
|---|---|---|---|---|
| ARC-01 | Atomare Commands, Effects und Rollback | scripts/core/command_executor.gd | CODE | Abbruch und Zustandsidentität nach Fehler |
| ARC-02 | Idempotenz und Transaktions-ID-Kollisionen | PR #7 | OFFEN | Kollisionen, Replay und Mehrfachbuchungen |
| ARC-03 | Ereignisbus, stabile IDs und UI-Trennung | scripts/core/domain_event_bus.gd | CODE | Negativtest gegen UI-Direktmutation |
| MIS-01 | Missionsregistry, JSON-Schema, Graph | scripts/mission/mission_registry.gd | CODE | Softlocks, Referenzen, Negativfälle |
| MIS-02 | Signal 9909: Start, Wege und Phasen | content/missions/mission_neon_signal_9909.json | CODE | Alle Spielpfade im Godot-Test |
| MIS-03 | Fristen, Teilerfolg, Fehlschlag, Abbruch | scripts/mission/commands | CODE | Folgen nach Langzeitverlauf |
| MIS-04 | Pause, Riss und Fortsetzung | scripts/mission/commands/pause_mission_command.gd | CODE | Laden während Pause, Replay |
| MIS-05 | Qualität, Historie, Wiederaufnahmepunkte | scripts/tests/iteration_c_test_runner.gd | CODE | Migration und Restore in Godot |
| MIS-06 | Transformationen und Folgeaufträge | docs/PROJECT_STATUS.md | OFFEN | Regeln, Code, Positiv-/Negativtest |
| MIS-07 | Missionsarchiv und Filter | docs/PROJECT_STATUS.md | OFFEN | Oberfläche, Tastatur und Speichern |
| WOR-01 | Sechs Orte, sechs Routen und Startort | content/world/city_graph.json | CODE | Schemacheck auf Commit |
| WOR-02 | Eindeutige IDs, Endpunkte, Erreichbarkeit | tools/verify_world.py | CODE | CI und Regressionen auf Commit |
| WOR-03 | Reise, Kosten, Zeit und Sperren | docs/PROJECT_STATUS.md | OFFEN | Atomare Commands/Effects |
| WOR-04 | Missionstrigger beim Ortswechsel | docs/PROJECT_STATUS.md | OFFEN | Ereignisse ohne Doppelauslösung |
| WOR-05 | Weltkarte mit 800x600 und Tastatur | docs/PROJECT_STATUS.md | OFFEN | Graybox, Fokus, Vergrößerung |
| WOR-06 | Reisezustand speichern und laden | scripts/core/game_session_state.gd | OFFEN | Roundtrip und alte Saves |
| SAV-01 | Atomarer Speicherstand und SHA-256 | scripts/save/save_service.gd | CODE | Abbruch, volle Platte, Rechte |
| SAV-02 | Save-v1/v2/v3-Migration | scripts/core/game_session_state.gd | CODE | Echte Altversionen testen |
| SAV-03 | Kaputtes JSON/Prüfsumme ablehnen | scripts/save/save_service.gd | CODE | Keine Datenänderung bei Fehler |
| SAV-04 | Sicherung und Wiederherstellung | scripts/save/save_service.gd | OFFEN | Isolierter Recovery-Test |
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
| QA-04 | Python, Shell, JSON, GDScript, CI | .github/workflows/validate.yml | CODE | Grüne Gates auf Kandidaten-SHA |
| QA-05 | Godot 4.6 Headless-Selbsttests | test.sh | BLOCKED | Godot-4.6-Binärdatei nötig |
| QA-06 | Negativ- und Regressionstests | tools/tests/test_verify_world.py | BLOCKED | GitHub-Schreibblockade für Testdatei |
| OPS-01 | Linux/Windows-Start und Offlinebetrieb | start.sh | OFFEN | Frischinstallation, Start |
| OPS-02 | ZIP, Manifest, Prüfsummen | package.sh | CODE | Entpacken, Hash-Roundtrip |
| OPS-03 | Version, Changelog, bekannte Fehler | CHANGELOG.md | OFFEN | Versionsabgleich und Release Notes |
| OPS-04 | Grüne Gesamt-CI und SHA-Freeze | .github/workflows/validate.yml | OFFEN | Alle Pflichtgates |
| OPS-05 | Persönliche Kubuntu-/Sicht-Endabnahme | Nutzerfreigabe | BLOCKED | Erst nach technischem Freeze |

## Tatsächliche Nachweise und Blockaden

- Baseline: `main` HEAD `40939ec86afd53bc29e81d4d4e16d792805dca82`.
- Vorhandene Weltdefinition: sechs Orte, sechs Routen; strukturelle Erreichbarkeit ist **keine** spielbare Reise.
- `tools/verify_world.py` ergänzt statische ID-, Endpunkt- und Erreichbarkeitsprüfung. Isolierter lokaler Prüflauf mit aus dem Repositoryinhalt nachgebildeter Welt und entsprechendem Schema: PASS; **kein Nachweis am GitHub-HEAD**.
- `tools/tests/test_verify_world.py`: zehn isolierte Tests lokal PASS; GitHub-Dateischreibvorgang für diese Datei am 22.10.2026 durch Sicherheitsprüfung blockiert. **Nicht als CI-PASS werten.**
- `verify.sh` ruft die Weltprüfung und Testentdeckung auf. Bis Testdatei auf GitHub ist, gilt das Regressionsgate als **BLOCKED**; die Testentdeckung allein kann null Tests als erfolgreich melden und darf nicht als Nachweis dienen.
- Offene Arbeiten an `PR #7` (Transaktionsschutz) und `PR #6` (separater UI-Bereich) nicht duplizieren.
- Godot-4.6-Lauf, vollständige Spielverläufe, Speicherung und 800×600/Skalierung bleiben offen.

## Nächstes unabhängiges Pflichtpaket

1. Weltprüfer gegen echten Repositorystand in CI laufen lassen, Fehler beheben und konkreten Commit nachweisen.
2. Testdatei nur über zulässige GitHub-Schreibwege ergänzen, anschließend sicherstellen, dass tatsächlich **zehn** Tests ausgeführt werden.
3. WORLD-01: Reisekosten, Zeit, Positionswechsel und Save-/Load-Roundtrip über Commands und Effects implementieren.

**Freigabegate: ROT.** Technische Fertigstellung und persönliche Endabnahme stehen aus.
