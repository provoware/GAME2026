# Sicherheit, Datenschutz und lokale Daten

## 1. Lokaler Betrieb

Das Projekt ist als lokales Einzelspielersystem ausgelegt. Persönliche Spielereingaben sollen ohne ausdrückliche spätere Erweiterung keine Cloud oder externen Analysedienste verwenden.

## 2. Freitext

Freitext wird:

- als UTF-8 normalisiert;
- auf Länge begrenzt;
- als reiner Text gespeichert;
- vor Rich-Text-Ausgabe maskiert;
- niemals als Code, Pfad oder Befehl ausgeführt.

## 3. Speicherstände

- atomarer Schreibvorgang;
- SHA-256-Prüfsumme;
- Sicherung des vorherigen gültigen Stands;
- Versionsprüfung;
- keine unvalidierte Teilmigration.

## 4. Cheat- und Entwicklercodes

Codes werden ausschließlich mit registrierten Definitionen verglichen. Es existiert keine Shell-, Script- oder Ausdrucksauswertung. Spielverändernde Codes markieren den Speicherstand.

## 5. Private Inhalte

Jede persönliche Eingabe erhält Sichtbarkeits- und Wiederverwendungsregeln. Private Inhalte dürfen nicht automatisch in öffentlichen Dialogen, Funkmeldungen oder Gegnerreaktionen erscheinen.

## 6. Meldung von Sicherheitsproblemen

Sicherheitsrelevante Probleme sollten nicht mit realen privaten Beispieldaten dokumentiert werden. Ein Bericht nennt reproduzierbare technische Schritte und verwendet künstliche Testdaten.
