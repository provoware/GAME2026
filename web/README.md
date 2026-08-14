# Browserfassung 0.10.0 · LIVING-CITY-04

Die Browserfassung läuft lokal über `index.html` und benötigt keine externen Bibliotheken.

## Architektur

- `data.js` – qualifizierter 0.9-Kerndatenstand;
- `revival-data.js` – additive Missionstemplates, Stadtereignisse und Meilensteine;
- `engine.js` – qualifizierte 0.9-Fachlogik;
- `revival-missions.js` – Missionen und Auftragsketten;
- `revival-world.js` – Stadtereignisse, Rivalenbeziehungen, Prestige und Meilensteine;
- `revival-engine.js` – kleiner Kompositionskern, der die Revival-Module auf die Basis-Engine legt;
- `app.js` – qualifizierte Kernoberfläche;
- `revival-ui.js` – additive Director-Ansicht und Kartenfeedback;
- `styles.css` – Kernlayout;
- `revival.css` – Stadtphasen, Director-Komponenten und zusätzliche Animationen.

## Revival Director

Der Director erstellt Aufträge aus dem tatsächlichen Zustand. Ein Auftrag speichert Ausgangswert, Zielwert, Frist, Belohnung und optional einen Folgeauftrag. Dadurch können sich Gebietsausbau, Crewentwicklung, Unternehmenswachstum oder Reisen zu kleinen dynamischen Ketten verbinden.

Aktive Stadtereignisse sind zeitlich begrenzt, auf der SVG-Karte sichtbar und verändern lokale oder globale Werte. Rivalenbeziehungen laufen parallel von offenem Krieg bis Pakt und beeinflussen die Rivalen-KI.

## Bedienung

Der neue Tab **Direktor** zeigt aktive Missionen, neue Gelegenheiten, Stadtereignisse, Rivalenbeziehungen und Karriere-Meilensteine. Der kompakte Stadtpuls-Streifen oberhalb der Karte zeigt Stadtphase, Schlagzeile, Spannung und Chancen ohne zusätzlichen Informationsstapel.

## Prüfung

```bash
node web/tests/engine.test.js
node web/tests/revival-engine.test.js
node web/tests/director-simulation.test.js
node web/tests/ui-smoke.test.js
node web/tests/static-ui.test.js
node web/tests/revival-contract.test.js
```
