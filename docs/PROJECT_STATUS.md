# Projektstatus

## Stand

**Godot-Paket:** 0.3.0-mission-iteration-c  
**Browser-Spielstand:** 0.8.0-living-city-02  
**Browser-Schema:** 3  
**Primärplattform Browser:** Firefox / Chrome  
**Betrieb:** lokal und offline ohne externe Bibliotheken

## Implementiert

### Stadt und Territorien

- neun Bezirke mit dynamischen Lagewerten;
- echter Bezirksbesitzer statt nur Prozentwert;
- Spieler, neutral oder eine von drei Rivalengangs;
- Gebietsübernahme und Gebietsverlust;
- Besitzer, Besitz und Aufklärung direkt auf der Karte sichtbar.

### Rivalengangs

- **Rote Klingen:** aggressive Expansion;
- **Graue Union:** wirtschaftliche Expansion;
- **Neon-Geister:** verdeckte Unterwanderung;
- eigene Macht, Kasse, Gebiete und letzter KI-Zug;
- strategisch unterschiedliche Zielauswahl und Bezirksfolgen.

### Besitz

- sieben Objekttypen;
- standortabhängige Preise;
- Ausbau bis Stufe 3;
- Verkauf mit dynamischem Rückkaufswert;
- bis zu zwei Crewmitglieder pro Betrieb;
- Personalbonus auf Ertrag und Sicherheit;
- Betriebspersonal steht nicht gleichzeitig im freien Kampfpool;
- laufender Cashflow und Unterhalt.

### Kämpfe

- freie Crew auswählen;
- Kräfteprognose vor Start;
- drei Kampfrunden;
- **Angriff**, **Deckung** oder **Rückzug**;
- Moral, taktischer Vorteil und Verletzungsrisiko;
- Sieg/Niederlage/Rückzug mit wirtschaftlichen und territorialen Folgen;
- erfolgreicher Kampf kann den Bezirksbesitzer real wechseln.

### Boss-Zentrale

- Rang;
- Vermögen;
- Besitz-Cashflow;
- Razzia-Risiko;
- Beitrittschance;
- freie Einsatzcrew;
- durchschnittliche Crewtreue;
- priorisierte Warnhinweise;
- Rohwerte weiterhin ausklappbar.

## Validierung

- JavaScript-Syntax: **PASS**.
- DOM-ID-Abgleich: **PASS**; 63 verwendete Direktreferenzen vorhanden.
- 21/21 Engine-Regressionstests: **PASS**.
- 500-Zug-Stresstest: **PASS**.
- Zustandswerte im Langlauf auf endliche Werte und gültige 0–100-Bereiche geprüft.
- GitHub Actions des Vorgängerstands 0.7.0: Run #78 **PASS**.
- Reale Chromium-Screenshot-E2E konnte in der aktuellen Ausführungsumgebung wegen fehlendem D-Bus nicht sauber beendet werden; deshalb wird keine reale Browser-E2E-Freigabe behauptet.

## Fortschritt bis vollständigem Release

- Spezifikation / Architektur: **74 %**
- Codeimplementierung: **45 %**
- UI / Spielbarkeit: **62 %**
- automatisierte Validierung: **42 %**
- gewichteter Gesamtfortschritt: **55 %**

## Nächster sinnvoller Meilenstein

**LIVING-CITY-03:** Betriebe als Missionsquellen, individuelle Crew-Aufgaben, Ausrüstung, Reisezeit/Routen, Rivalenbeziehungen untereinander und reale Firefox-/Chrome-E2E-Abnahme.
