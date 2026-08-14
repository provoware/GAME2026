# Changelog

## 0.11.2-living-city-05b

- Hilfe vom blockierenden Modal in ein nicht überdeckendes Karten-Dock verlagert
- Karteninformationen und Reisebedienung aus der Kartenfläche in eine eigene Kommandoleiste verschoben
- direkt erreichbare Ziele permanent sichtbar gemacht
- freies Maus-Panning, Mausrad-Zoom und zentrierbaren Kartenviewport ergänzt
- Kartensteuerung per WASD/Pfeilen, +/−, Home/0 sowie M/H/R ergänzt
- oberes Aufgaben-Dashboard mit nächster Aufgabe, Standort, Reise und Warnstatus ergänzt
- responsive Layoutarchitektur für breit, mittel, kompakt und mobil neu geordnet
- Container-Query für den Kartenarbeitsbereich ergänzt
- Chrome-/Performance-Härtung ohne globale MutationObserver erhalten
- neuer LC05B-Vertrag gegen überdeckende Hilfe, fehlende Reisebedienung und starres Layout ergänzt

## 0.11.0-living-city-05

- Crew-Beziehungsnetz mit Paarwert, Spannung, gemeinsamen Erfahrungen und verständlichen Zuständen ergänzt
- Moral und Stress pro Crewmitglied eingeführt
- autonome Stress-/Moralentwicklung im Zugzyklus ergänzt
- Crew-Interaktionen Aussprache, Planung und Sparring mit Cooldown und Skillpraxis eingeführt
- gemeinsame Kämpfe verändern Crewbindung und Belastung
- verwaiste Beziehungsdaten ausgeschiedener Crew werden automatisch entfernt
- strategische Missionsbriefings mit drei Entscheidungen und realen Folgen eingeführt
- Director-Modifikatoren für Briefingfolgen dauerhaft und abklingend modelliert
- acht individuelle Innenansichten wichtiger Orte plus Fallback-Szenen ergänzt
- Ortsszenen zeigen Hotspots, lokale Wirtschaft, Gebietsstatus und Stadtereignisse
- optionale lokale Web-Audio-Atmosphäre ohne externe Dateien ergänzt
- Kartenebenen Gebiete, Druck, Wirtschaft und Ereignisse ergänzt
- Personendetails um Moral, Stress und Beziehungen erweitert
- Boss-Warnungen um Crew-Stress und Beziehungskonflikte erweitert
- Speicherkey `v0110` mit Migration aus `v0100` und `v090` eingeführt
- 20 neue Engine-Regressionen inklusive 1200-Zug-Langlauf und separater LC05-Modul-/Visual-Vertrag ergänzt

## 0.10.1-living-city-04a

- fehlenden sichtbaren **Zug beenden**-Button wieder eingeführt
- manuellen Zugabschluss mit vollständigem Simulationszyklus implementiert
- Zugende während Kampf/offener Pokerrunde gesperrt
- Rivalen-Haupttab mit Strategien, Macht, Kasse, Territorien und Beziehungen wiederhergestellt
- Haupttabs als sichtbares Raster statt horizontal versteckter Navigation
- Stadtkarte mit Besitzerflächen, Kontrollringen, Bezirksicons sowie Rivalen-/Polizeidruck überarbeitet
- direkt erreichbare Straßen-/Bahnlinien und ausgewählte Verbindung visuell getrennt
- mehrstufige Routenplanung mit nächstem Halt ergänzt
- direkte Reiseleiste und Kartenzoom ergänzt
- Speicherkey auf `v0100` korrigiert, Migration aus `v090` und älteren Ständen erhalten
- UI-Smoke auf finale Revival-Engine umgestellt
- statischen UI-Vertrag auf finale Engine-Schicht korrigiert
- neuen Karten-/Bedien-Regressionstest ergänzt

## 0.10.0-living-city-04

- Revival Director als additive, getrennte Modulschicht eingeführt
- zustandsabhängige Missionsangebote ergänzt
- bis zu drei aktive Aufträge mit Fortschritt, Frist, Erfolg und Fehlschlag
- Folgeaufträge und dynamische Missionsketten implementiert
- Missionsziele für Gebiete, Kampf, Firmenentwicklung, Depotwert, Crewskills, autonome Zyklen, Netzwerke und Reisen
- zeitlich begrenzte Stadtereignisse mit sichtbaren Kartenmarkern ergänzt
- Stadtphasen Nacht, Morgengrauen, Tag und Abend mit visueller Atmosphäre umgesetzt
- Rivalenbeziehungen zwischen allen drei Gangs von Krieg bis Pakt ergänzt
- Rivalenkrieg beeinflusst Ressourcen und KI-Zielwahl
- Prestige- und Karriere-Meilensteinsystem eingeführt
- neuer Direktor-Tab und kompakter Stadtpuls-Streifen über der Karte
- Kampf- und Kartenvisualisierung mit zusätzlichem atmosphärischem Feedback erweitert
- Browser-Schema auf 5 angehoben; Migration älterer Browserstände erhalten
- 52 bestehende Kern-Regressionstests unverändert beibehalten
- 15 zusätzliche Revival-Regressionstests ergänzt
- zusätzliche deterministische 1000-Zug-Director-Massensimulation ergänzt
- Event-Invariante gehärtet: höchstens zwei aktive Stadtereignisse gleichzeitig

## 0.9.0-living-city-03

- 12 Bezirke mit Casino 9909, Altstadt und Südhafen
- Bahnreisen vom Geisterbahnhof in entfernte Stadtteile
- Personenkarten mit Biografie, 7 Skills, XP, Karriere, Ausrüstung und Status
- autonome dauerhafte Crewaufträge mit Ziel und Fortschritt
- Skillaufbau durch Handlungen, Entscheidungen, Kämpfe und autonome Arbeit
- Bankkonto und lokaler Aktienmarkt mit Anteilskauf/-verkauf
- dynamische Firmenentwicklung, Kursverlauf, Depotwert und Dividenden
- institutionelles Informationsnetz mit sechs Institutionen und Risikowerten
- drei Rivalengangs und echte Gebietsbesitzer vertieft
- Kampf-HUD mit Crewbeiträgen, Gelände, Moral, Deckung, Vorteil und Verletzungsrisiko
- 5-Card-Draw-Poker mit Halten/Ziehen/Showdown
- drei visuell getrennte Spielautomaten
- Schutz-/Taktikausrüstung und Dojo mit fünf Kampfsportarten
- abstrakte wiederkehrende Stadtoperationen und fiktive Rivalen-Spezialaufträge als reine Spielwerte
- Engine-Testumfang auf 52 Fälle inklusive 500-Zug-Stresstest erhöht
- UI-Smoke-Test für Start-Render, Karte, Panels und Autosave ergänzt
