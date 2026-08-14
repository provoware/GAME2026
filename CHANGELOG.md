# Changelog

## 0.7.0-html-city-economy-combat

- Browser-Handlungen von 7 auf 13 erweitert und in drei Gruppen strukturiert
- Stadtökonomie mit 7 kaufbaren Objektarten ergänzt
- standortabhängige Kaufpreise, Unterhalt und Nettoertrag implementiert
- Portfolioübersicht und laufender Besitz-Cashflow ergänzt
- Boss-Zentrale mit Vermögen, Cashflow, Risiko, Rekrutierung und Crew-Bereitschaft erweitert
- Boss-Rangsystem ergänzt
- Kampfprognose aus Crew-, Boss- und Bezirkswerten implementiert
- animierte Kampfdarstellung mit Kräftevergleich, Phasen und Ergebnis ergänzt
- Kartenmarker für Besitz und Aufklärung ergänzt
- Browserzustand auf Schema 2 / Version 0.7.0 erweitert
- Engine-Regressionssuite auf 13 Tests erweitert
- 500-Zug-Simulation und DOM-ID-Prüfung erfolgreich ausgeführt

## 0.6.0-html-city-dynamics

- eigenständig spielbare HTML-Browserfassung unter `web/` ergänzt
- Bunker-Ring auf neun visuell verbundene Bezirke erweitert
- skalierende interaktive SVG-Stadtkarte mit Kontrolle, Rivalen- und Polizeidruck implementiert
- Boss-Werte Respekt, Furcht, Loyalität, Einfluss, Fahndung und Bekanntheit eingeführt
- Boss-Profil wird nun aus tatsächlichem Verhalten und Folgen abgeleitet
- sieben Bezirksaktionen mit Ressourcen-, Ruf-, Kontroll- und Fahndungseffekten ergänzt
- zufällige Gang-Rekrutierung abhängig von Boss-Stil, Bezirk, Kontrolle und Fahndung umgesetzt
- Gangmitglieder mit Rolle, Merkmal, Macht, Loyalität, Herkunft und Verletzungsstatus ergänzt
- autonome Rivalenbewegungen und dynamischen Polizeidruck eingebaut
- passive Gebietseinnahmen und lokale Bezirksökonomie ergänzt
- lokale automatische Speicherung über `localStorage` integriert
- dreigeteilte responsive Oberfläche mit Kartenpriorität, Tabs und progressiver Informationsdichte umgesetzt
- Tastaturbedienung der Kartenorte und `prefers-reduced-motion` berücksichtigt
- sechs deterministische Browser-Engine-Tests ergänzt

## 0.3.0-mission-iteration-c

- Zustands- und Missionsschema auf Version 3 erweitert
- automatische Migration bestehender v1-/v2-Speicherstände ergänzt
- Ergebnisqualität mit den Graden NONE, FRAGMENT, BRONZE, SILVER und GOLD implementiert
- optionale und pfadabhängige Ziele in die Qualitätsberechnung aufgenommen
- unveränderliche Missionshistorie für alle terminalen Ergebnisse ergänzt
- sichere Wiederaufnahmepunkte beim Start, Phasenwechsel und bei Unterbrechungen eingeführt
- kontrollierten Restore-Command mit Journal- und Domain-Event-Anbindung ergänzt
- Abschluss, Teilerfolg, Fehlschlag und Abbruch einheitlich bewertet und archiviert
- vier zusätzliche Iteration-C-Regressionsprüfungen ergänzt
- deterministische Massensimulation mit 120 vollständigen Missionsdurchläufen ergänzt

## 0.2.0-mission-iteration-b

- Missionsdefinition auf mehrstufige Phasen erweitert
- alternative Lösungswege und pfadabhängige Ziele ergänzt
- neutrale Missionssignale für spätere Fachmodule eingeführt
- absolute Monatsfristen implementiert
- Teilerfolg und Fehlschlag bei Fristablauf umgesetzt
- Missionspause, Fortsetzung und Riss-Unterbrechung ergänzt
- kontrollierten Missionsabbruch mit Folgeeffekten implementiert
- Zustandsformat auf Version 2 erweitert und Migration vorbereitet
- Missionstracker-Graybox mit Tastaturfokus ergänzt
- Selbsttests von fünf auf elf Fälle erweitert
- JSON-Schema und semantische Missionsgraphprüfung ergänzt
- GDScript-Linting und automatische Formatierung eingerichtet
- Manifest- und ZIP-Erzeugung automatisiert

## 0.1.0-foundation-mission

- Godot-Projektgerüst angelegt
- Compatibility Renderer aktiviert
- Command-/Effect-Architektur implementiert
- idempotente Transaktionsverarbeitung ergänzt
- MissionRegistry und Missionsdefinitionen implementiert
- Missionsstart, Fortschritt, Abschluss und Belohnungen implementiert
- atomare Save-/Load-Funktion ergänzt
- vertikalen Missionstest und Selbsttests hinzugefügt
