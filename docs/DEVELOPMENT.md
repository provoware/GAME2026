# Entwicklungsumgebung und Arbeitsablauf

## 1. Voraussetzungen

Empfohlen:

- Linux oder Windows;
- Godot 4.6.x;
- Python 3.12 oder neuer;
- Bash für die mitgelieferten Skripte;
- `jsonschema` für die Contentprüfung;
- optional `gdtoolkit` für `gdlint` und `gdformat`;
- `zip` für Releasepakete.

Python-Abhängigkeiten:

```bash
python3 -m pip install --user jsonschema gdtoolkit
```

## 2. Projektstart

```bash
chmod +x start.sh
./start.sh
```

Das Startskript sucht in dieser Reihenfolge:

1. `godot4` im PATH;
2. `godot` im PATH;
3. lokale Godot-Binärdateien unter `tools/`.

## 3. Schnelle Prüfung

```bash
./verify.sh
```

Die Prüfung umfasst:

- JSON-Syntax;
- Missionsschema;
- Missionsgraphen;
- IDs und Referenzen;
- doppelte `class_name`-Definitionen;
- Godot-Ressourcenpfade;
- Manifest-Prüfsummen;
- optional GDScript-Linting.

## 4. Godot-Selbsttests

```bash
./test.sh
```

Die Tests laufen headless und prüfen den vertikalen Missionsablauf. Ohne Godot-Binärdatei kann nur die statische Prüfung ausgeführt werden.

## 5. Paketierung

```bash
./package.sh
```

Der Befehl:

1. formatiert GDScript, sofern `gdformat` verfügbar ist;
2. erzeugt `MANIFEST.json` neu;
3. führt die vollständige Verifikation aus;
4. erstellt ein ZIP ohne Cache-, Git- oder Python-Artefakte.

## 6. Neue GDScript-Klasse

1. Klasse in den passenden Fachordner einordnen.
2. Verantwortlichkeit auf ein System begrenzen.
3. `class_name` nur verwenden, wenn die Klasse global benötigt wird.
4. keine UI-Abhängigkeit in Domain- oder Applicationcode aufnehmen.
5. positiven und negativen Test ergänzen.
6. Manifest aktualisieren.

## 7. Neue Mission

1. JSON-Datei unter `content/missions/` anlegen.
2. stabile Missions-, Phasen-, Pfad- und Ziel-IDs vergeben.
3. Pflichtziele und mindestens einen Abschluss definieren.
4. nur registrierte Effects verwenden.
5. `./verify.sh` ausführen.
6. mindestens einen Selbsttest oder Szenariotest ergänzen.

## 8. Fehlersuche

### Projekt startet nicht

- `./verify.sh` ausführen;
- Godot-Version kontrollieren;
- `project.godot` und Hauptszene prüfen;
- Schreibrechte des Benutzerverzeichnisses prüfen.

### Mission lädt nicht

- JSON-Syntax;
- Schemafehler;
- doppelte IDs;
- unbekannte Folgephase;
- zyklischer Graph;
- unbekannter Effect.

### Save wird abgelehnt

- Save-Version;
- Prüfsumme;
- fehlende Migrationsstufe;
- ungültige Missionsreferenz;
- unvollständige atomare Transaktion.

## 9. Debug-Grundsätze

- reproduzierbare Seeds verwenden;
- Fehlerzustände nicht durch manuelle Dateiedits verschleiern;
- Transaktions-ID und Domain Events protokollieren;
- Save vor und nach einer problematischen Handlung vergleichen;
- reduzierte vertikale Testfälle bevorzugen.

## 10. Iterationsablauf

### Aufbauiteration

Kernmodell, Standardfall, typischer Fehlerfall, kurze Tests.

### Integrationsiteration

Services, Speicherung, UI-Grundfunktion und vollständiger Spielablauf.

### Konsolidierungsiteration

Regression, Performance, Barrierefreiheit, Dokumentation, Migration und Refactoring.
