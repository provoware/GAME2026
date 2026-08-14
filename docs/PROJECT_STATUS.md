# Projektstatus

## Stand

**Godot-Paket:** 0.3.0-mission-iteration-c  
**Browser-Spielstand:** 0.6.0-html-city-dynamics  
**Primärplattform Browser:** Firefox / Chrome  
**Primärplattform Godot:** Linux  
**Sekundärplattform:** Windows

## Implementiert

### Fundament

- strukturierte Ergebnisse und Fehler;
- Command-/Effect-Verarbeitung im Godot-Strang;
- atomarer Rollback und idempotente Transaktionen;
- Domain-Event-Bus und autoritativer Sitzungszustand;
- atomare Speicherung mit SHA-256 im Godot-Strang;
- lokaler Browser-Spielstand über `localStorage` in der HTML-Fassung.

### Missionen – Iteration A bis C

- JSON-basierte Missionsregistry und striktes Schema;
- mehrstufige Phasen und alternative Lösungswege;
- pfadabhängige Ziele und neutrale Missionssignale;
- absolute Fristen, Erfolg, Teilerfolg, Fehlschlag und Abbruch;
- Ergebnisqualität und Missionshistorie;
- sichere Wiederaufnahmepunkte;
- 15 automatisierte Selbsttests und Massensimulation.

### Welt und Karte

- kanonischer datengetriebener Bunker-Ring im Godot-Strang;
- Browserkarte auf neun Bezirke erweitert;
- interaktive skalierende SVG-Karte;
- Bezirkswerte für Kontrolle, Rivalen, Polizei und Unruhe;
- visuelle Verbindungen und selektierbare Bezirke;
- Tastaturauswahl der Kartenorte;
- responsive Kartenpriorität für Desktop und schmalere Ansichten.

### Boss- und Gangdynamik

- Boss-Werte Respekt, Furcht, Loyalität, Einfluss, Fahndung und Bekanntheit;
- jede Boss-Tat verändert mehrere miteinander verbundene Werte;
- automatisch abgeleitete Boss-Profile wie Straßenpatron, Eiserne Hand oder Netzwerker;
- sieben spielbare Aktionen mit unterschiedlichen Kosten und Folgen;
- zufällige Gang-Rekrutierung abhängig von Ruf, Einfluss, Bezirkskontrolle und Fahndung;
- Gangmitglieder mit Rolle, Merkmal, Macht, Loyalität und Herkunft;
- Verletzungen, Loyalitätsentwicklung und mögliche Abgänge;
- Gangstärke als aggregierter Spielwert.

### Stadtsimulation

- passive Einnahmen aus kontrollierten Bezirken;
- autonome Rivalenbewegungen;
- lokaler Polizeidruck und Razzienrisiko;
- Wechselwirkung zwischen Fahndung, Bezirk, Kontrolle und Ressourcen;
- Ereignischronik mit maximal 80 Meldungen.

### Bedienung und Darstellung

- modernes Drei-Bereich-Dashboard: Boss / Karte / Bezirk;
- Kartenbereich als visuelles Zentrum;
- Tabs für Bezirk, Gang und Chronik zur Reduktion der Informationsdichte;
- große Statuswerte, kompakte Detailanzeigen und eindeutige Aktionskarten;
- reduzierte Animationen über `prefers-reduced-motion`;
- lokale Hilfe direkt im Spiel.

### Validierung

- sechs deterministische Browser-Engine-Tests;
- Syntaxprüfung der Browser-JavaScript-Dateien;
- bestehende Godot-/Schema-/Missionsprüfungen bleiben erhalten.

## Noch nicht implementiert

- vollständige Missionseinbindung in die HTML-Stadtsimulation;
- mehrere rivalisierende Gangs mit individuellen Persönlichkeiten und Territorien;
- echte Wegfindung und Reisezeit auf der Browserkarte;
- Gebäudeinnenräume und szenische Bezirksansichten;
- vollständige Figurenbeziehungen und persönliche Aufgaben der Gangmitglieder;
- langfristige Karriereleiter des Bosses;
- Händler-, Ausrüstungs- und Produktionssystem;
- Kampfsequenzen mit Vorschau und taktischen Entscheidungen;
- Audio, Musik, Art-Pipeline und finale Kampagne;
- vollständige Browser-End-to-End-Abnahme in Firefox und Chrome.

## Fortschritt

- Spezifikation und Architektur: **65 %**
- Codeimplementierung: **28 %**
- Validierungs- und Testinfrastruktur: **25 %**
- UI-/Spielbarkeitsprototyp: **46 %**
- gewichteter Gesamtfortschritt bis zu einem getesteten Release: **43 %**

Die Werte beschreiben den gesamten Weg bis zu einem vollständigen, getesteten Release und nicht nur den sichtbaren Quellcodeumfang.

## Nächster Meilenstein

**LIVING-CITY-01 – Rivalen, Missionen und dauerhafte Konsequenzen**

1. drei eigenständige rivalisierende Gangs mit Strategieprofilen;
2. Bezirksereignisse, die sich sichtbar auf der Karte ausbreiten;
3. Missionen direkt aus Bezirk, Gangmitglied und Boss-Profil erzeugen;
4. persönliche Gang-Aufgaben und Beziehungseffekte;
5. Reise-/Positionssystem in der HTML-Fassung mit echten Routen;
6. automatisierte Simulation über mindestens 500 Züge;
7. Firefox-/Chrome-E2E-Prüfung für Karte, Autosave, Rekrutierung und responsive Oberfläche.
