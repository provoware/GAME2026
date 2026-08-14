# PPPOPPI – Bunkerwahrheit · LIVING-CITY-07

Version **0.13.0-living-city-07** ist die Chrome-Abnahme- und Release-Härtungsrunde auf Basis von 0.12.0. Die Stadt bleibt Chrome-first, offline spielbar und kompakt. LC07 vertieft Folgeketten zwischen Orten, macht alle zwölf Orte individuell interaktiv und führt erstmals eine echte automatisierte **Google-Chrome-Desktop-E2E-Abnahme** ein.

## Direkt starten

Unter Linux `./START_GAME.sh` ausführen. Google Chrome wird bevorzugt, Chromium ist zweite Wahl. Alternativ `web/index.html` direkt in Chrome öffnen.

## Was 0.13.0 neu macht

- **Echter Google-Chrome-E2E-Test:** Start, Layout, Karte, Hilfe, Innenraum, Dialog, Klang, Reise, Speichern/Reload und Kampf werden in Google Chrome automatisiert durchgespielt.
- **Desktop-Sichtprüfung:** 1280×720, 1366×768 und 1600×900 werden auf Seitenüberlauf und sichtbare Hauptbereiche geprüft; Screenshots werden als Nachweis erzeugt.
- **Alle zwölf Orte individuell interaktiv:** die bisher generischen Tunnel-, Archiv-, Fracht- und Dachorte haben eigene Innenraumaktionen.
- **Ortsübergreifende Folgeketten:** Entscheidungen können später zusätzliche Gesprächsoptionen an anderen Orten freischalten.
- **Mehr Ortsdialoge:** Geisterbahnhof, Unterarchiv, Casino und Altstadt besitzen neue Gesprächsketten.
- **Folgen sichtbar:** die letzte wichtige Folge erscheint kompakt im rechten Bedienbereich, ohne die Karte zu verdecken.
- **Audio-Härtung:** zusätzlicher Effektregler, optionales automatisches Absenken bei Dialog/Kampf und kurze lokale UI-Signale.
- **Kampf per Tastatur:** im offenen Kampf stehen `1` Angriff, `2` Deckung und `3` Rückzug zur Verfügung.
- **Keine neuen Render-Schleifen:** die 05B-/06-Performancebasis und der zentrale gedrosselte Refresh bleiben erhalten.

## Tastatur

- `M` – Karte fokussieren
- `H` – Hilfe ein-/ausblenden
- `R` – angebotene Reise starten
- `E` – Zug beenden
- `G` – nächsten sinnvollen Schritt fokussieren
- `I` – Innenraum am aktuellen Ort öffnen
- `K` – Klangmixer öffnen/schließen
- `Alt+1` bis `Alt+8` – sichtbare Spielbereiche direkt wählen
- `WASD` oder Pfeile – Karte bewegen
- `+` / `-` – Karte zoomen
- `Home` oder `0` – Gesamtkarte
- im Kampf: `1` / `2` / `3` – Angriff / Deckung / Rückzug

## Architektur

LC07 ergänzt den Stand additiv über `lc07-data.js`, `lc07-engine.js`, `lc07-bootstrap.js`, `lc07-ui.js` und `lc07.css`. Die Karten-/Responsive-Basis aus 05B bleibt unangetastet. Browser-Schema ist **8**, kanonischer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0130`.

## Prüfen

```bash
./PRUEFEN.sh
```

Der lokale Prüfvertrag umfasst **21 reproduzierbare Blöcke**, darunter 2000-Zug-LC07-Langlauf und statische Prüfung des Chrome-E2E-Runners. In GitHub Actions folgt zusätzlich die echte Google-Chrome-E2E-Abnahme mit Screenshots.

Details: `docs/CHROME_E2E.md`.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken bleiben abstrahierte fiktionale Spielsysteme ohne reale Handlungsanleitungen.
