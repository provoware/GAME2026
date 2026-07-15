# Content-Erstellung

## 1. Grundsatz

Content bleibt von der Engine- und UI-Logik getrennt. Sichtbare Texte, Definitionen und Referenzen verwenden stabile IDs.

## 2. ID-Konvention

Empfohlenes Format:

```text
bereich.unterbereich.element
```

Beispiele:

```text
mission.neon.signal_9909
phase.neon.signal_9909.access
objective.neon.signal_9909.secure_recording
world.signal_9909.secured
```

IDs werden nach Veröffentlichung nicht ohne Migration geändert.

## 3. Missionen

Eine Mission definiert:

- Metadaten;
- Startvoraussetzungen;
- Startkosten;
- absolute oder relative Fristdefinition;
- Startphase;
- Phasen;
- Lösungswege;
- Pflicht- und optionale Ziele;
- Erfolgs-, Teilerfolgs-, Fehlschlags- und Abbruchfolgen.

## 4. Ziele

Jedes Ziel benötigt:

- eindeutige ID;
- Typ oder passendes Signal;
- Sollwert;
- Kennzeichnung als Pflicht- oder optionales Ziel;
- optional erlaubte Pfade.

Ein Ziel darf nicht gleichzeitig Pfade verlangen, die sich gegenseitig ausschließen.

## 5. Missionssignale

Signale entkoppeln Missionen von anderen Fachmodulen. Ein Signal beschreibt ein eingetretenes Ereignis, beispielsweise:

```text
world.location_entered
dialogue.choice_selected
mission.recording_secured
resonance.riss_invoked
```

Die Mission entscheidet selbst, ob und wie das Signal Fortschritt erzeugt.

## 6. Effects

Aktuell registrierte Effect-Typen:

- `modify_resource`;
- `set_flag`.

Neue Effect-Typen benötigen:

1. eine Effect-Klasse;
2. Factory-Unterstützung;
3. Schemaerweiterung;
4. semantische Validierung;
5. Rollbacktest;
6. Dokumentation.

## 7. Kanonstatus

Inhalte werden nach Herkunft markiert:

- bestätigt;
- wiederholt akzeptiertes Motiv;
- Spieladaption;
- offen oder ungeklärt.

Ungeklärte Inhalte dürfen keine alternativlose Hauptstoryvoraussetzung bilden.

## 8. Prüfung

Nach jeder Contentänderung:

```bash
./verify.sh
```

Fehlerhafte Missionen werden nicht teilweise geladen.
