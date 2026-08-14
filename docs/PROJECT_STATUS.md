# Projektstatus

## Stand

**Godot-Paket:** 0.3.0-mission-iteration-c  
**Browser-Spielstand:** 0.7.0-html-city-economy-combat  
**Primärplattform Browser:** Firefox / Chrome  
**Primärplattform Godot:** Linux

## Browser implementiert

### Stadt und Karte

- neun interaktive Bezirke;
- Kontrolle, Rivalen, Polizei, Unruhe und Aufklärung;
- Kartenmarker für Besitz und Aufklärung;
- responsive SVG-Karte mit Tastaturauswahl.

### Boss und Gang

- dynamische Boss-Werte und Profile;
- Rangsystem mit fünf Stufen;
- Boss-Zentrale mit Vermögen, Cashflow, Risiko, Rekrutierung und Crew-Bereitschaft;
- zufällige Rekrutierung;
- Loyalität, Verletzungen und mögliche Abgänge.

### Handlungen und Wirtschaft

- 13 Handlungsoptionen in drei Gruppen;
- kurzfristige Einnahmeaktionen;
- sieben kaufbare Besitzarten;
- standortabhängige Preise;
- Unterhalt und Nettoertrag;
- Portfolioübersicht und laufender Besitz-Cashflow;
- Besitzboni für verschiedene Systeme.

### Kampf

- Erfolgsprognose vor Konfliktaktionen;
- Berechnung aus Crew-, Boss- und Bezirkswerten;
- unterschiedliche Sieg- und Rückzugsfolgen;
- animierte Kampfdarstellung mit Kräftevergleich, drei Phasen und Ergebnis.

### Simulation und Speicherung

- autonome Rivalenbewegungen;
- dynamischer Polizeidruck;
- lokale Speicherung über `localStorage`;
- Übernahme des Browserstands 0.6.0;
- Chronik mit bis zu 100 Meldungen.

## Validierung

- **13/13 Browser-Engine-Tests PASS**;
- JavaScript-Syntaxprüfung PASS;
- DOM-ID-Abgleich PASS;
- **500-Zug-Simulation PASS**;
- keine ungültigen `NaN`-/`Infinity`-Zustände im Langlauf.

## Noch offen

- individuelle rivalisierende Gruppen mit eigenen Strategien;
- echte Wegfindung und Reisezeit;
- Gebäudeinnenräume;
- Besitz ausbauen und verkaufen;
- Crew-Mitglieder Betrieben zuweisen;
- persönliche Aufgaben und Beziehungen;
- taktische Mehrentscheidungs-Kämpfe;
- vollständige Firefox-/Chrome-End-to-End-Abnahme;
- finale Kampagne, Audio und Art-Pipeline.

## Fortschritt

- Spezifikation und Architektur: **69 %**
- Codeimplementierung: **36 %**
- Validierungs- und Testinfrastruktur: **32 %**
- UI-/Spielbarkeitsprototyp: **57 %**
- gewichteter Gesamtfortschritt bis zu einem getesteten Release: **48 %**

## Nächster Meilenstein

**LIVING-CITY-02**

1. individuelle Rivalengruppen mit Strategieprofilen und Bezirkszielen;
2. Besitz ausbauen, verkaufen und zuweisen;
3. Betriebe als Ereignis- und Missionsquellen nutzen;
4. persönliche Crew-Aufgaben ergänzen;
5. Kämpfe um Crew-Auswahl und Rückzugsentscheidung erweitern;
6. Routen und Reisezeit integrieren;
7. Browser-End-to-End-Abnahme automatisieren.
