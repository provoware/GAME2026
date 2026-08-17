# Projektstatus

## Stand

**Browser-Spielstand:** 0.17.6-living-city-11-visual-polish-6  
**Browser-Schema:** 12  
**Primärplattform:** Chrome/Chromium, offline-first  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-11 – Gameplay & Visual Update

### Gameplay

- Casino 9909: Automaten, Jackpot-Töpfe, Sessionwerte, Casino-Aufgaben und 5-Card-Draw-Poker;
- Dojo Ostblock: Kampfsport, Intensität, Rangfortschritt, Stress und Trainingshistorie;
- Eisenladen: Schutzkleidung mit Zustandswert, wirksamer Abnutzung und Wartung;
- Geisterbahnhof: vier Fernziele mit Ticketkosten, Dauer und protokollierter Rückkehr;
- Innenräume werden als progressive Vollansicht dargestellt statt die Hauptoberfläche weiter zu verdichten.

### Design & Animation

- neuer LC11-Visual-Layer mit klarer Ortscodierung;
- animierte Slot-Walzen, Gleisbewegung und dezente Licht-/Sweep-Effekte;
- größere Kartenflächen und bessere visuelle Priorisierung innerhalb der Vollansicht;
- Responsive-Breakpoints für Desktop und schmale Ansichten;
- `prefers-reduced-motion` und vorhandener Ruhemodus schalten Animationen zuverlässig ab.

### Speicher & Architektur

- Schema 12;
- Save-Spiegel `pppoppi-bunkerwahrheit-html-v0170`;
- Migration aus v0160 und älteren Ständen;
- additive LC11-Schicht über LC10;
- keine globale DOM-Beobachtung und keine ungedrosselte Render-Schleife.

## Abnahmestand lokal

- Gesamtvertrag: **35/35 PASS**;
- LC11-Engine: **12/12 PASS**;
- 3500-Zug-Langlauf: **PASS**;
- historische LC03–LC10-Regressionen: **PASS**;
- LC11 UI-/Animations-/v0170-Vertrag: **PASS**.

## Nächstes Remote-Gate

GitHub Actions muss den neuen Commit erneut prüfen. Ein finaler Release-/ZIP-Stand wird erst aus einem erfolgreichen Remote-Artefakt qualifiziert.

### Visual-Polish III
Die Darstellung kommuniziert Bezirksdruck und aktive Ereignisse direkt auf der Karte. Die Schicht bleibt rein präsentational; Schema 12 und Gameplaylogik bleiben unverändert.


### Visual-Polish IV
Die Oberfläche wurde kontraststärker, spürbar klarer gegliedert und in Tabs, KPIs, Formularen, Kartenhilfen und Footer besser lesbar gemacht. Das Hilfe-Dock ordnet sich sauberer ein; Schema 12 und Gameplaylogik bleiben unverändert.


### Visual-Polish V
Die Hauptansicht priorisiert Spielfläche und Entscheidungsklarheit: kompakter Kopfbereich, dominantere Karte, ruhigere Seitenleisten, stärkere Kontrastlogik und eine spielartigere Kampf-/Stadtleben-Inszenierung. Gameplay und Schema 12 bleiben unverändert. Der bisherige Visual-Polish-V-Gesamtvertrag stand bei **34/34 PASS**.

### Visual-Polish VI
Die Stadtkarte erhält eine stärkere räumliche Bühne mit ortsspezifischer Bezirkscodierung, klareren Routen-/Fokuszuständen und hochwertigeren Aktionsflächen. Casino, Training, Schutz und Bahnhof wirken materieller und unterscheidbarer; Innenräume und Kampf erhalten zusätzliche Tiefen-, Licht- und Bühnenebenen. Die Schicht bleibt rein präsentational: **Schema 12, Save-Spiegel v0170 und Gameplaylogik bleiben unverändert**. Der lokale Gesamtvertrag umfasst nun **35/35 Prüfblöcke**.

### Visual-Polish VI-A – Lesbarkeits- und Dichtepass
Die bestehende 0.17.6-Präsentationsschicht wurde gezielt nachgeschärft: Sekundärtexte, Tabs, Fokuszustände, Standort-/Tickerflächen und niedrige Desktop-Höhen sind klarer lesbar. Bei 720–800 px Höhe wird Leerraum reduziert statt Schrift zu verkleinern. Gameplay, Schema 12 und Save-Spiegel v0170 bleiben unverändert. Der bestehende Gesamtvertrag bleibt bei **35/35 PASS** und prüft die neuen Lesbarkeitsmarker mit.

### Visual-Polish VI-B – Aktions-/Entscheidungsleiste
Die rechte Aktionsleiste besitzt jetzt eine deutlichere Entscheidungshierarchie: Gruppenüberschriften werden visuell getrennt, Aktionskarten erhalten größere Trefferflächen, klarere Kosten-Chips, stärkere Hover-/Fokuszustände und besser lesbare Beschreibungen. Die Tabs bleiben auf hohen Desktop-Ansichten im Aktionsbereich sichtbar; bei schmalen Ansichten fällt diese Fixierung bewusst weg. Die Änderung bleibt rein präsentational; Gameplay, Schema 12 und Save-Spiegel v0170 bleiben unverändert.
### Visual-Polish VI-C – Boss-Zentrale
Die linke Boss-Zentrale ist jetzt klar als Lage- und Führungsbereich priorisiert: Entscheidungswerte sind stärker gewichtet, Warnungen als eigener Lageblock gebündelt, der erste Warnhinweis erhält höhere Dringlichkeit und Skills/Details sind kontrastreicher gegliedert. Der aktuelle Standort bleibt auf großen Desktop-Ansichten sichtbar, fällt bei schmaleren Layouts aber bewusst in den normalen Dokumentfluss zurück. Die Änderung ist rein präsentational; Gameplay, Schema 12 und Save-Spiegel v0170 bleiben unverändert.

### Visual-Polish VI-D – Kartenlage
Die zentrale Stadtkarte priorisiert Besitz, Gefahr und Reisewege jetzt klarer: Spieler-, Rivalen- und neutrale Bezirke sind eindeutiger getrennt, Druckstufen und aktive Ereignisse treten gezielt hervor und inaktive Routen werden bewusst zurückgenommen. Fokus- und Auswahlzustände bleiben tastaturlesbar. Die Änderung ist rein präsentational; Gameplay, Schema 12 und Save-Spiegel v0170 bleiben unverändert.
