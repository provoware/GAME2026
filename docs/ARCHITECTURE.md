# Architektur

## 1. Zielbild

Das Spiel verwendet eine geschichtete, datengetriebene Architektur. Die sichtbare Godot-Oberfläche ist eine Präsentationsschicht und nicht Eigentümerin des Spielzustands.

```text
Contentdefinitionen
        ↓
Registries und Validatoren
        ↓
Autoritativer GameSessionState
        ↓
Commands → Requirements → Effects → Transaktion
        ↓
Domain Events und Journal
        ↓
ViewModels
        ↓
Godot-Szenen und Eingabe
```

## 2. Schichten

### Domain

Enthält fachliche Zustände, Definitionen, Invarianten und Effects. Domaincode kennt keine Szenenknoten.

### Application

Orchestriert Commands, Services, Transaktionen, Ereignisse und Speicheroperationen.

### Infrastructure

Lädt JSON-Content, schreibt Speicherstände, berechnet Prüfsummen und stellt Diagnosefunktionen bereit.

### Presentation

Bereitet Zustände über ViewModels auf und verarbeitet Nutzereingaben. Sie darf keine Fachwerte direkt verändern.

### Content

Missionen und später Welt-, Figuren-, Dialog-, Wirtschafts- und Ereignisdaten werden über stabile IDs referenziert.

## 3. Autoritativer Zustand

`GameSessionState` ist die einzige autoritative Laufzeitquelle. Zustandskopien in UI-Knoten sind nur Projektionen und dürfen nicht zurückgeschrieben werden.

Aktuell enthält der Zustand unter anderem:

- Kampagnenmonat;
- Ressourcen;
- Flags;
- Missionsinstanzen;
- ausführte Transaktions-IDs;
- Journal- und Ereignisdaten;
- vorbereitete Erweiterungsfelder für Welt, Figuren und Fähigkeiten.

## 4. Command-/Effect-Muster

Ein Command beschreibt eine beabsichtigte Handlung. Er prüft Vorbedingungen und erzeugt Effects. Effects sind die einzigen Objekte, die Domainzustand verändern.

```text
Command empfangen
→ Transaktions-ID auf Idempotenz prüfen
→ Voraussetzungen validieren
→ Effects erzeugen
→ EffectTransaction starten
→ Effects anwenden
→ Invarianten prüfen
→ commit oder vollständiger rollback
→ Domain Events veröffentlichen
```

### Invarianten

- Ressourcen dürfen nicht unzulässig negativ werden.
- Missionen dürfen nicht doppelt belohnt werden.
- Phasen müssen erreichbar bleiben.
- eine Transaktions-ID darf höchstens einmal wirken.
- Save-Dateien müssen zu Schema und Prüfsumme passen.

## 5. Ereignisse

`DomainEventBus` verteilt abgeschlossene fachliche Ereignisse. Ereignisse lösen keine unkontrollierten Direktänderungen aus, sondern dienen als Kopplungspunkt für Journal, UI und spätere Fachmodule.

## 6. Missionsarchitektur

Missionen werden aus JSON geladen und durch `MissionDefinition` sowie `MissionRegistry` repräsentiert.

Eine Missionsinstanz speichert:

- Status;
- aktuelle Phase;
- gewählten Pfad;
- Zielstände;
- absolute Frist;
- Pausen- und Fehlschlagsgründe;
- besuchte Phasen.

Andere Systeme koppeln Missionen über registrierte Missionssignale an. Dadurch muss beispielsweise ein Weltmodul keine Missionsklasse kennen.

## 7. Speicherung

`SaveService` schreibt atomar:

1. neuen Zustand in eine temporäre Datei;
2. SHA-256-Prüfsumme;
3. Validierung des geschriebenen Inhalts;
4. Austausch der gültigen Datei;
5. Sicherung des vorherigen Stands.

Schemaänderungen erhöhen die Save-Version und benötigen eine explizite Migration.

## 8. Fehlerbehandlung

Fehler werden als `GameResult` und `GameError` transportiert. Ein Fehler enthält mindestens:

- stabilen Fehlercode;
- verständliche Meldung;
- technischen Kontext;
- optionalen Lösungshinweis.

Kernservices werfen keine ungefangenen Fehler in die UI.

## 9. Erweiterungsregeln

Neue Fachmodule müssen:

- eine eigene Registry oder klar begrenzte Definitionen besitzen;
- den autoritativen Zustand erweitern, nicht duplizieren;
- Commands und Effects verwenden;
- Save-Migrationen bereitstellen;
- mindestens einen vertikalen Testablauf besitzen;
- über Domain Events oder definierte Bridges koppeln.
