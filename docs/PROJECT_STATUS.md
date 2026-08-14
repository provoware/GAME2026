# Projektstatus

## Stand

**Browser-Spielstand:** 0.14.0-living-city-08  
**Browser-Schema:** 9  
**Primärplattform:** Google Chrome, offline-first; Chromium nachgelagerte Kompatibilität  
**GitHub-Strang:** `agent/html-gang-map-boss-dynamics`

## LIVING-CITY-08 – Stadtgedächtnis und nachvollziehbare Folgen

### Spieltiefe

- drei Entwicklungsbögen verbinden Entscheidungen über mehrere Orte und Züge;
- wichtige Story-Flags können eine verzögerte Folge mit festem Fälligkeitszug planen;
- Folgen verändern ausschließlich abstrakte Spielwerte wie Chancen, Spannung, Moral, Crewbindung oder Gebietskontrolle;
- Dialoge, Innenraumaktionen, Reisen und Kampfresultate werden in einem gemeinsamen Entscheidungsjournal protokolliert;
- Entwicklungsbogen-Abschlüsse besitzen einmalige Gesamtboni und werden nicht doppelt belohnt.

### Bedienung

- neues **Stadtgedächtnis / Journal** per Taste `J`;
- keine zusätzliche permanente Spalte oder überdeckende Dauerfläche;
- drei kompakte Fortschrittskarten zeigen Entwicklungsbögen;
- offene spätere Folgen zeigen transparent, wann sie wirksam werden;
- Aufgaben-Kompass kann den nächsten Storyschritt empfehlen;
- sichtbarer Tastaturfokus über `:focus-visible`;
- ARIA-Live-Region meldet neu eingetretene späte Folgen.

### Speicher & Architektur

- Browser-Schema 9;
- kanonischer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0140`;
- Migration aus v0130/v0120/v0110/v0100/v090;
- LC08 ausschließlich als additive Schicht über der qualifizierten LC07-Basis;
- zentraler UI-Refresh um LC08 ergänzt;
- keine globale DOM-Beobachtung und keine neue Render-Schleife.
- Chrome-E2E auf einen einzelnen kanonischen Runner ohne globale Selenium-Monkeypatches konsolidiert.

## Lokale Vorvalidierung

- Kern: **52/52 PASS**;
- Revival: **15/15 PASS**;
- LC05: **20/20 PASS**;
- LC06: **19/19 PASS**;
- LC07: **19/19 PASS**;
- LC08: **18/18 PASS**;
- 500-/1000-/1200-/1500-/2000-/2500-Zug-Langläufe: **PASS**;
- UI-, Karten-, Responsive-, Performance-, LC06-, LC07- und LC08-Verträge: **PASS**;
- vollständiges lokales `PRUEFEN.sh`: **23/23 PASS**.

## Fortschritt vor Remote-Abnahme

- Spezifikation / Architektur: **99 %**
- Codeimplementierung: **97 %**
- UI / Spielbarkeit: **98 %**
- Test-/Validierungsinfrastruktur: **99 %**
- gewichteter Gesamtfortschritt: **98 %**

## Nächstes Gate

LC08 wird erst nach erfolgreichem echten Google-Chrome-E2E-Lauf auf dem exakten Remote-Head als qualifiziert betrachtet. Danach folgen Remote-Artefakt-Recheck, deterministisches Release-ZIP und SHA-256-Nachweis.
