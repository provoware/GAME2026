# Projektstatus

## Stand

**Browser-Spielstand:** 0.13.0-living-city-07  
**Browser-Schema:** 8  
**Primärplattform:** Google Chrome, offline-first; Chromium als Reserve  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-07 – Chrome-Abnahme, Folgeketten und Release-Härtung

### Echte Chrome-Abnahme

- GitHub-Runner auf `ubuntu-22.04` festgelegt, statt wechselndem `ubuntu-latest`;
- echter Google-Chrome-Browser + passender ChromeDriver;
- Selenium 4.46.0 fest im Workflow versioniert;
- automatische Desktopabnahme für 1280×720, 1366×768 und 1600×900;
- Prüfung gegen horizontales/vertikales Seitenüberlaufen der Desktop-Hauptansicht;
- Screenshots und maschinenlesbarer `CHROME_E2E_RECEIPT.json` als Evidenz;
- E2E-Bedienpfad: Laden → Hilfe → Zoom/Pan → Innenraum/Dialog → Klang → Reise → Speichern/Reload → Kampf → Aufgabenfokus.

### Folgeketten & Innenräume

- alle zwölf Stadtorte besitzen mindestens zwei explizite lokale Innenraumaktionen;
- neue mehrstufige Gespräche am Geisterbahnhof, Unterarchiv, Casino und in der Altstadt;
- frühere Dialogentscheidungen werden als Story-Flags gespeichert;
- spätere Dialogoptionen können diese Flags voraussetzen und dadurch reale Folgeketten bilden;
- wichtige Folgen werden in einer kurzen Historie gespeichert und im Bedienbereich sichtbar gemacht.

### Klang & Kampf

- Audiomixer erweitert um Effektlautstärke und optionales Ducking bei Dialog/Kampf;
- kurze synthetische UI-Signale bleiben lokal und benötigen keine externen Dateien;
- kein Autoplay: Klang bleibt standardmäßig aus und wird erst nach Nutzeraktion aktiviert;
- Kampfentscheidungen zusätzlich per `1`/`2`/`3` bedienbar.

### Speicher & Performance

- Browser-Schema 8;
- Save-Spiegel `pppoppi-bunkerwahrheit-html-v0130` mit Migration aus `v0120`, `v0110`, `v0100` und `v090`;
- keine neuen globalen DOM-Beobachter;
- 05B-Karten-/Responsive-Schicht bleibt additiv erhalten;
- zentraler `requestAnimationFrame`-Refresh aktualisiert nun auch LC07.

## Vorvalidierung

- Kern-Regressionen: **52/52 PASS**;
- Revival-Regressionen: **15/15 PASS**;
- LIVING-CITY-05: **20/20 PASS**;
- LIVING-CITY-06: **19/19 PASS**;
- LIVING-CITY-07: **19/19 PASS**;
- 500-/1000-/1200-/1500-/2000-Zug-Langläufe: **PASS**;
- UI-Smoke und finaler statischer UI-Vertrag: **PASS**;
- Karten-/Bedien-, Chrome-/Performance- und 05B-Responsive-Verträge: **PASS**;
- LC06- und LC07-Integrationsverträge: **PASS**;
- vollständiges lokales `PRUEFEN.sh`: **21/21 PASS**.

## Fortschritt vor Remote-Chrome-Abnahme

- Spezifikation / Architektur: **97 %**
- Codeimplementierung: **93 %**
- UI / Spielbarkeit: **97 %**
- Test-/Validierungsinfrastruktur: **98 %**
- gewichteter Gesamtfortschritt: **96 %**

## Nächster Gate

GitHub Actions muss den neuen **echten Google-Chrome-E2E-Test** auf dem exakten LC07-Commit bestehen. Erst danach wird das finale 0.13.0-Release aus dem Remote-Artefakt gebaut.
