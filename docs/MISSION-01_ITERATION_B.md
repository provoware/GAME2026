# MISSION-01 – Iteration B: Integrationsbericht

## 1. Ziel

Iteration B verbindet das Missionsfundament mit zukünftigen Welt-, Dialog-, Figuren-, Wirtschafts- und Resonanzsystemen, ohne direkte Abhängigkeiten zwischen diesen Fachmodulen zu erzeugen.

## 2. Zentrale Architekturentscheidung: Missionssignale

Fachmodule veröffentlichen neutrale, stabile Signale:

```text
world.location_entered
dialogue.choice_selected
character.ability_used
economy.resource_delivered
resonance.riss_invoked
```

`ApplyMissionSignalCommand` prüft aktive Missionsziele und erzeugt ausschließlich die notwendigen Missionseffekte. Dadurch bleibt die Missionslogik zentralisiert und testbar.

## 3. Phasenmodell

Eine Mission besitzt:

- eine definierte Startphase;
- eine oder mehrere Folgephasen;
- phasenbezogene Ziele;
- Start- und Abschlusseffekte;
- optional pfadabhängige Folgephasen.

Der Contentbuild blockiert:

- unbekannte Folgephasen;
- doppelte IDs;
- unerreichbare Phasen;
- zyklische Phasen;
- Phasen ohne Pflichtziel.

## 4. Alternative Lösungswege

Ein Lösungsweg besitzt:

- stabile Pfad-ID;
- Anforderungen;
- Auswahlfolgen;
- pfadgebundene Missionsziele.

Nach der Auswahl kann kein widersprüchlicher zweiter Pfad gewählt werden. Ziele eines anderen Pfads werden technisch blockiert und verändern den Zustand nicht.

## 5. Absolute Fristen

Beim Missionsstart wird aus dem aktuellen Monatsindex und dem definierten Abstand ein absoluter Zielmonat erzeugt:

```text
deadline_month = started_month + offset_months
```

Speichern und Laden berechnet die Frist nicht erneut.

## 6. Ergebnismodelle

Unterstützt werden:

- `COMPLETED` – voller Erfolg;
- `PARTIAL_SUCCESS` – definierte Mindestquote erreicht;
- `FAILED` – Frist oder Bedingung ohne Mindestfortschritt verfehlt;
- `CANCELLED` – bewusster Abbruch mit transparenten Folgen.

Jedes Ergebnis besitzt eigene datengetriebene Effekte.

## 7. Pause und Riss

`resonance.riss_invoked` kann eine aktive Mission sicher pausieren. Während der Pause werden keine Missionsziele fortgeschrieben. Ob eine Pause die Frist verlängert, wird pro Mission ausdrücklich festgelegt. Die Beispielmission verwendet eine weiterlaufende absolute Frist.

## 8. Speicherformat

Der Kampagnenzustand wurde auf Version 2 erweitert um:

- aktuellen Standort;
- verfügbare Figuren;
- freigeschaltete Fähigkeiten;
- aktuelle Missionsphase;
- absolute Frist;
- besuchte Phasen;
- Pausengrund und Pausenzeitpunkt;
- Fehlschlagsgründe.

Version-1-Zustände werden mit sicheren Standardwerten eingelesen.

## 9. Automatisierte Prüfungen

Die Selbsttests prüfen:

1. Missionsstart;
2. Standortvoraussetzung;
3. Phasenwechsel durch Signal;
4. Pfadfilterung;
5. vollen Erfolg;
6. Teilerfolg;
7. Fehlschlag;
8. Riss-Pause und Fortsetzung;
9. Abbruchfolgen;
10. Idempotenz;
11. Save-/Load-Roundtrip.

## 10. Abnahme

Iteration B ist abgenommen, wenn:

- GDScript ohne Parser- oder Lintfehler geprüft wird;
- das Missions-JSON das Schema erfüllt;
- der Missionsgraph erreichbar und azyklisch ist;
- das Paketmanifest stimmt;
- die Godot-Selbsttests auf dem Zielsystem 11/11 bestehen.
