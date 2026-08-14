# PPPOPPI – Bunkerwahrheit · LIVING-CITY-05

Version **0.11.0-living-city-05** vertieft den stabilisierten 0.10.1-Stand zu einer lebendigeren Stadt- und Figurensimulation. Die bewährten Kern-, Revival- und 04A-Reparaturmodule bleiben erhalten; die neuen Systeme liegen additiv darüber.

## Direkt starten

`web/index.html` in Firefox oder Chrome öffnen oder unter Linux `./START_GAME.sh` ausführen.

## Neu in LIVING-CITY-05

- **Crew-Chemie:** Beziehungen zwischen Crewmitgliedern mit nachvollziehbaren Zuständen von Zerwürfnis bis Verbündet;
- **Moral und Stress** pro Person; Daueraufträge, Verletzungen, Erholung und gemeinsame Erfahrungen verändern beide Werte;
- **Crew-Interaktionen:** Aussprache, gemeinsame Planung und Sparring mit Kosten, Cooldown, Skillpraxis und Beziehungsfolgen;
- **Missionsbriefings:** aktive Director-Aufträge erhalten einmalige strategische Entscheidungen – sicher planen, Tempo erhöhen oder Crew einbinden;
- Entscheidungen verändern Frist, Belohnung, Director-Spannung/Chancen und Crewentwicklung;
- **Innenansichten wichtiger Orte:** Kommandozentrale, Schwarzmarkt, Geisterbahnhof, Neon-Kellerclub, Dojo, Casino, Altstadt und Südhafen plus Fallback-Szenen;
- Innenansichten zeigen Hotspots, Besitzer, Kontrolle, Polizei, Rivalendruck, Betriebe, lokale Unternehmen und Stadtereignisse;
- **optionale synthetische Atmosphäre** per Web Audio – keine externen Audio-Dateien und kein Netzwerkzugriff;
- **Kartenebenen:** Gebiete, Druck, Wirtschaft und Ereignisse lassen sich getrennt betrachten;
- Personendetails wurden um Moral, Stress und individuelle Beziehungen ergänzt;
- der Boss-Entscheidungsbereich warnt vor hohem Crew-Stress und angespannten Beziehungen;
- neuer Speicherstand `v0110` mit Migration aus `v0100`/`v090`.

## Wartbare Architektur

LIVING-CITY-05 ergänzt den bisherigen Stand über vier Fach-/Darstellungsmodule und einen kleinen Speicheradapter:

- `web/lc05-data.js` – Innenräume, Briefingentscheidungen und Atmosphärenprofile;
- `web/lc05-engine.js` – Crew-Beziehungen, Stress/Moral, Briefings und Ortsszenen;
- `web/lc05-bootstrap.js` – additive Save-Migration auf `v0110`;
- `web/lc05-ui.js` – Kartenebenen, Innenansichten, Crew-Chemie und Briefingdialoge;
- `web/lc05.css` – ausschließlich der neue Visual Layer.

Die großen Kernmodule bleiben dadurch weiterhin isoliert und leichter regressionsprüfbar.

## Prüfung

```bash
./PRUEFEN.sh
```

Der lokale Vertrag umfasst **15 Prüfschritte**: 52 Kern-Regressionen, 15 Revival-Regressionen, 20 LIVING-CITY-05-Regressionen, 500-/1000-/1200-Zug-Langläufe sowie UI-, Karten-, Speicher- und Visual-Verträge.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken bleiben abstrahierte fiktionale Spielsysteme ohne reale Handlungsanleitungen.
