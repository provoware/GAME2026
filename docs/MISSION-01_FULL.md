# MISSION-01 – Professionelle Missionsarchitektur

## 1. Ziel

MISSION-01 bildet Aufträge, Hauptmissionen, Figurenaufgaben und emergente Weltaufgaben als datengetriebene, speicherbare Zustandsautomaten ab.

Eine Mission besteht nicht bloß aus einer Aufgabenliste. Sie verbindet:

- Weltzustände,
- Orte und Reisen,
- Figuren und Fähigkeiten,
- Dialoge und Wissen,
- Resonanz und Bunkerregeln,
- Ressourcen und Handel,
- alternative Lösungswege,
- Teilerfolge,
- öffentliche und langfristige Folgen.

## 2. Verbindlicher Ablauf

```text
Verfügbarkeit berechnen
→ Mission anbieten
→ Annahmebedingungen prüfen
→ Startkosten atomar reservieren oder buchen
→ Missionsinstanz erzeugen
→ Ziele und Phasen fortschreiben
→ Folgen unmittelbar protokollieren
→ Ergebnis bestimmen
→ Belohnungen und Konsequenzen atomar anwenden
→ Weltreaktion vorbereiten
→ Mission archivieren
```

## 3. Missionsarten

- Hauptstorymission
- Bunkerauftrag
- Figurenmission
- Fraktionsauftrag
- Wirtschaftsauftrag
- Transportauftrag
- Recherchemission
- Resonanz- oder Rekonstruktionsaufgabe
- zeitlich begrenztes Weltereignis
- geheime Anomaliemission

## 4. Missionsstatus

```text
LOCKED
AVAILABLE
ACTIVE
PAUSED
COMPLETED
PARTIAL_SUCCESS
FAILED
CANCELLED
TRANSFORMED
```

`TRANSFORMED` wird verwendet, wenn aus einer ursprünglichen Mission durch eine Entscheidung eine andere Aufgabe entsteht. Dadurch bleiben Verlauf und Herkunft erhalten.

## 5. Zieltypen

### 5.1 Zählerziel

Beispiel: drei Quellen sichern.

### 5.2 Zustandsziel

Beispiel: Werkstatt wieder aktivieren.

### 5.3 Ortsziel

Beispiel: Neon-Kellerclub erreichen.

### 5.4 Dialogziel

Beispiel: Aussage veröffentlichen oder zurückhalten.

### 5.5 Schutz- oder Vermeidungsziel

Beispiel: öffentliche Aufmerksamkeit unter einem Grenzwert halten.

### 5.6 Beziehungsziel

Beispiel: Zustimmung einer Figur erhalten. Solche Ziele dürfen keine versteckte Zwangsloyalität erzeugen.

### 5.7 Informationsziel

Beispiel: zwei widersprüchliche Quellen verbinden.

### 5.8 Produktionsziel

Beispiel: eine Aufnahme im Studio fertigstellen.

## 6. Pflicht- und optionale Ziele

Pflichtziele bestimmen den grundsätzlichen Abschluss. Optionale Ziele beeinflussen:

- Ergebnisqualität,
- Belohnung,
- Systemdruck,
- Beziehungen,
- Weltreaktionen,
- spätere Dialoge.

Optionale Ziele dürfen nicht als angeblich freiwillig markiert sein, wenn ihr Fehlen die Mission faktisch vollständig scheitern lässt.

## 7. Phasen und Verzweigungen

Eine vollständige Mission kann mehrere Phasen besitzen:

```text
PREPARATION
INFILTRATION
ACTION
EXTRACTION
AFTERMATH
```

Jede Phase besitzt eigene:

- Ziele,
- erlaubte Orte,
- Dialoge,
- Fristen,
- Abbruchbedingungen,
- Übergänge.

Verzweigungen werden durch stabile Pfad-IDs gespeichert, etwa:

```text
path.quiet_entry
path.public_distraction
path.system_rift
```

## 8. Ergebnisse

Eine Mission kann enden als:

- voller Erfolg,
- stiller Erfolg,
- Erfolg mit öffentlicher Eskalation,
- Teilerfolg,
- Ziel gerettet, Beweis verloren,
- Mission abgebrochen, Gruppe geschützt,
- Fehlschlag mit Folgeauftrag,
- Transformation in neue Mission.

Ein Fehlschlag soll in der Regel neue Konsequenzen erzeugen und nicht lediglich Inhalt entfernen.

## 9. Fristen

Fristen werden als absolute Monats- oder Aktionsindizes gespeichert:

```text
due_month_index = 14
```

Nicht speichern:

```text
noch drei Monate
```

Speichern und Laden darf eine Frist nicht neu berechnen oder verlängern.

## 10. Determinismus

Zufällige Missionsfolgen verwenden einen eigenen Zufallsstream. Bereits vorbereitete Ergebnisse werden gespeichert. Neuladen darf keine neue Belohnung oder andere Gegnerlage erzeugen.

## 11. Integration

### Welt

- Orte freischalten oder sperren
- temporäre Orte erzeugen
- Routen und Kontrollen verändern

### Bunker

- Räume, Energie und Produktionsaufträge nutzen
- Angriffe oder Reparaturfolgen erzeugen

### Figuren

- Verfügbarkeit, Wissen, Belastung und Fähigkeiten prüfen
- persönliche Folgen und Kommentare erzeugen

### Resonanz

- Riss und Stabilisierung ermöglichen
- Mission in einen sicheren Rückzug transformieren

### Dialog

- Missionspfade über Entscheidungen verändern
- Versprechen und Aussagen speichern

### Wirtschaft

- Startkosten, Belohnungen, Kredite und Marktfolgen atomar verarbeiten

## 12. Datenschutz

Persönliche Spielereingaben dürfen nur dann Missionsbestandteil werden, wenn Sichtbarkeit und Wiederverwendungsrechte passen. Eine private Erinnerung darf nicht automatisch Missionsbeweis oder öffentliche Aussage werden.

## 13. Fehler- und Softlockschutz

Jede Hauptmission benötigt:

- mindestens einen garantierten Fortschrittsweg,
- eine Ausweichmöglichkeit bei Figurenunverfügbarkeit,
- eine Fortsetzung nach Teil- oder Fehlschlag,
- eine Prüfung auf unerreichbare Ziele,
- eine klare Wiederaufnahme nach Unterbrechung.

## 14. Iterationsplan

### Iteration A – Fundament

Bereits begonnen und im Referenzcode enthalten:

- MissionDefinition
- MissionInstanceState
- MissionRegistry
- Startvoraussetzungen
- Startkosten
- Ziele und Fortschritt
- Abschlussbelohnungen
- Command-/Effect-Ausführung
- Speicherung
- Selbsttests

### Iteration B – Integration

Als Nächstes:

- Missionsphasen
- Fristen
- Pfadentscheidungen
- Abbruch und Pause
- Teil- und Fehlschlagergebnisse
- Welt-, Dialog-, Figuren- und Wirtschaftsbrücken
- Missionstracker-UI

### Iteration C – Konsolidierung

Danach:

- Graph- und Softlockanalyse
- vollständige Regression
- Determinismus- und Save-Migrationstests
- Massensimulation
- Barrierefreiheit
- Performance
- Dokumentation
- Status `STABLE`

## 15. Akzeptanzkriterien

MISSION-01 gilt erst als stabil, wenn:

1. Missionen ausschließlich über stabile IDs referenziert werden.
2. Start, Fortschritt und Abschluss atomar sind.
3. doppelte Commands keine doppelte Belohnung erzeugen.
4. aktive Missionen vollständig gespeichert werden.
5. Fristen nach Laden identisch bleiben.
6. jeder Hauptpfad erreichbar ist.
7. alternative und partielle Ergebnisse unterstützt werden.
8. Missionsfehlschläge die Kampagne nicht willkürlich beenden.
9. private Inhalte ihre Rechte behalten.
10. alle P0-Tests und die dritte Konsolidierungsiteration bestanden sind.


## 13. Implementierungsstand 0.2.0

Die Integrationsiteration setzt inzwischen produktiv um:

- mehrstufige Phasen;
- alternative Pfade;
- pfadabhängige Ziele;
- neutrale Fachsignale;
- absolute Monatsfristen;
- Teilerfolg, Fehlschlag und Abbruch;
- sichere Pause und Fortsetzung;
- Riss-Unterbrechung;
- JSON-Schema, Graphprüfung und elf Selbsttests.

Die folgende Konsolidierungsiteration ergänzt Missionstransformationen, Ergebnisqualität, Archivhistorie, Massensimulation und vollständige Barrierefreiheitsabnahme.
