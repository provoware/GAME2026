# Änderungsverlauf

## 0.16.0-living-city-10 – LIVING-CITY-10

- Bezirksdynamik mit Druck, Stabilität, Chancen und Momentum ergänzt.
- Deterministische Crew-Eigeninitiativen mit drei nachvollziehbaren Reaktionswegen ergänzt.
- Stadtlage als progressive Detailansicht per `L` ergänzt.
- Stadttrend-Historie und Journal-Verknüpfung für Ursachen/Folgen ergänzt.
- Stadt-Puls liest Crew-Stress und Moral jetzt aus der kanonischen Crewstruktur.
- Save-Spiegel auf v0160 / Schema 11 erweitert.
- 3000-Zug-Langlauf und LC10-Vertragsprüfung ergänzt.

# Änderungsprotokoll

## 0.14.0-living-city-08 – LIVING-CITY-08

- Stadtgedächtnis mit dauerhaftem Entscheidungsjournal eingeführt;
- drei mehrstufige Entwicklungsbögen für Führungsstil, Stadtrouten und Crew-Zusammenhalt ergänzt;
- verzögerte Konsequenzen lassen ausgewählte Entscheidungen mehrere Züge später erneut wirken;
- Ursache/Folge-Ketten werden mit Zugnummer, Kategorie, Quelle und Detail nachvollziehbar protokolliert;
- Reise-, Innenraum-, Dialog- und Kampfergebnisse fließen in dasselbe Journal ein;
- Aufgaben-Kompass kann den nächsten offenen Story-/Entwicklungsschritt priorisieren;
- Journal per Taste `J` als progressive Detailansicht statt zusätzlicher Dauerfläche;
- globale `:focus-visible`-Politur und ARIA-Live-Hinweis für späte Folgen ergänzt;
- Browser-Schema 9 und Save-Spiegel `v0140` mit Abwärtsmigration eingeführt;
- echter Chrome-E2E-Pfad um Journal, v0140 und Fokus-/ARIA-Basis erweitert;
- Chrome-E2E auf einen kanonischen Runner ohne globale Selenium-Monkeypatches konsolidiert; veraltete Wrapper-Implementierung entfernt;
- LC08-Engine-Regressionssatz mit 18 Tests und 2500-Zug-Langlauf ergänzt;
- lokaler Gesamtvertrag auf 23/23 Prüfblöcke erweitert.

## 0.13.0-living-city-07 – LIVING-CITY-07

- echte Google-Chrome-Desktop-E2E-Abnahme über Selenium/ChromeDriver eingeführt;
- Desktopgrößen 1280×720, 1366×768 und 1600×900 werden automatisiert auf Layout-Fit und Seitenüberlauf geprüft;
- E2E prüft Hilfe ohne Kartenüberdeckung, Zoom/Pan, Innenraum/Dialog, Klang, Direktreise, v0130-Speichern/Reload und Kampf;
- Screenshot- und JSON-Evidenz als GitHub-Actions-Artefakt ergänzt;
- alle zwölf Orte besitzen nun eigene Innenraumaktionen;
- neue Dialogketten für Geisterbahnhof, Unterarchiv, Casino und Altstadt ergänzt;
- ortsübergreifende Story-Flags/Folgeketten mit bedingten Dialogoptionen eingeführt;
- Audio um Effektlautstärke, Ducking und kurze lokale UI-Signale gehärtet;
- Kampf-Tastatur 1/2/3 für Angriff/Deckung/Rückzug ergänzt;
- Browser-Schema 8 und Save-Spiegel `v0130` mit Abwärtsmigration eingeführt;
- LC07-Engine-Langlauf auf 2000 Züge erweitert;
- lokaler Prüfvertrag auf 21/21 Blöcke erweitert.

## 0.12.0-living-city-06 – LIVING-CITY-06

- Aufgaben-Kompass und nicht überdeckende Coach-Leiste ergänzt.
- Interaktive Innenraumaktionen mit Kosten, Cooldowns und Effektvorschau eingeführt.
- Mehrstufige Ortsdialoge mit gespeicherten Konsequenzen ergänzt.
- Lokalen Sound-/Musikmixer mit vier Profilen und getrennten Reglern eingebaut.
- Kampfoberfläche um Entscheidungshilfe und stärkere visuelle Hierarchie erweitert.
- Schema 7 und Save-Spiegel `v0120` mit Abwärtsmigration eingeführt.
- Vollseiten-Reload nach Crewinteraktionen entfernt.
- Neuer LC06-Engine-Langlauf (1500 Züge) und eigener Integrationsvertrag.
- Vollständige lokale Prüfung: 19/19 PASS.

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
