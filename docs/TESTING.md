# Test- und Qualitätssicherungsstrategie

## 1. Testpyramide

### Statische Prüfungen

- JSON-Syntax und Schema;
- semantische Graphprüfung;
- GDScript-Linting;
- Ressourcenreferenzen;
- Manifest-Prüfsummen.

### Unit Tests

Prüfen isolierte Klassen und Invarianten, etwa:

- Statusübergänge;
- Kostenberechnung;
- Rollback;
- Idempotenz;
- Fristen;
- Pfadfilterung.

### Integrationstests

Prüfen mehrere Services gemeinsam:

- Missionsstart mit Kosten;
- Missionssignal und Zielprogress;
- Phasenwechsel;
- Pause durch `Riss`;
- Ergebnisfolgen;
- Save-/Load-Roundtrip.

### Szenario- und Langzeittests

Werden in jeder dritten Iteration oder Nightly-CI ausgeführt. Sie prüfen Massensimulationen, seltene Zustände und Performancegrenzen.

## 2. Aktuelle Selbsttests

Das Missionssystem enthält Tests für:

1. erfolgreichen Missionsstart;
2. abgelehnten Start bei falschem Standort;
3. Phasenwechsel durch Signal;
4. Pfadfilterung;
5. vollständigen Erfolg;
6. Teilerfolg durch Frist;
7. Fehlschlag;
8. Pause und Fortsetzung durch `Riss`;
9. kontrollierten Abbruch;
10. idempotente Commands;
11. Ablehnung einer Transaktions-ID für einen anderen Command;
12. Save-/Load-Roundtrip.

## 3. Kritische Invarianten

Jede Iteration prüft mindestens:

- keine doppelten Belohnungen;
- keine negativen unzulässigen Ressourcen;
- keine Teilbuchung nach Fehler;
- keine unbekannten IDs;
- keine unerreichbaren Pflichtphasen;
- keine erneute Wirkung nach Wiederaufnahme;
- kein beschädigter gültiger Save;
- keine direkte UI-Domainmutation.

## 4. Testdaten

Testmissionen bleiben klein und deterministisch. Zufallsabhängige Tests verwenden feste Seeds. Produktionscontent wird nicht als einziger Testdatensatz verwendet.

## 5. Regression

Jeder behobene Fehler erhält nach Möglichkeit einen Test, der vor der Korrektur fehlschlug. Kritische Regressionen werden im Changelog und gegebenenfalls in `docs/PROJECT_STATUS.md` vermerkt.

## 6. CI

Der Workflow `.github/workflows/validate.yml` führt aus:

- Python- und Shellprüfung;
- Installation von `jsonschema` und `gdtoolkit`;
- `./verify.sh`;
- Godot-Headless-Tests, sobald eine geeignete Godot-Binärdatei im Runner bereitgestellt wird.

## 7. Abnahmekriterien

Ein Fachmodul gilt als stabil, wenn:

- alle P0-Tests bestehen;
- Speicherformat und Migration geprüft sind;
- Fehlermeldungen verständlich sind;
- Tastaturbedienung geprüft ist;
- keine offene kritische technische Schuld besteht;
- Performancebudget eingehalten oder begründet angepasst wurde.
