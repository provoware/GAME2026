# PPPOPPI – Bunkerwahrheit · LIVING-CITY-06

Version **0.12.0-living-city-06** baut auf der qualifizierten Chrome-first Kartenbasis 0.11.2 auf. Der Schwerpunkt liegt auf besserer Spielführung, interaktiven Orten, nachvollziehbaren Konsequenzen, lokaler Klangsteuerung und einer klarer inszenierten Kampfoberfläche.

## Direkt starten

Unter Linux `./START_GAME.sh` ausführen. Google Chrome wird bevorzugt, Chromium ist zweite Wahl. Alternativ `web/index.html` direkt in Chrome öffnen.

## Was 0.12.0 neu macht

- **Aufgaben-Kompass im oberen Dashboard:** zeigt aus dem tatsächlichen Spielzustand immer den nächsten sinnvollen Schritt.
- **Coach-Hinweise ohne Kartenüberdeckung:** kurze Hinweise erscheinen im Layoutfluss oberhalb des Arbeitsbereichs und können ausgeblendet werden.
- **Interaktive Innenräume:** lokale Aktionen besitzen Kosten, Cooldowns und Auswirkungen auf Chancen, Spannung, Moral, Stress, Skills, Kontrolle oder Vorrat.
- **Mehrstufige Dialoge:** Gespräche verzweigen über mehrere Entscheidungen; Ergebnisse werden im Spielstand gespeichert und wirken auf abstrakte Spielwerte.
- **Sound-/Musikmixer:** Gesamtlautstärke, Musik und Atmosphäre getrennt regelbar; vier lokale Klangprofile, vollständig im Browser erzeugt.
- **Kampfentscheidungshilfe:** aktive Kämpfe zeigen eine verständliche Empfehlung und Vorschau für Angriff, Deckung oder Rückzug.
- **Keine neuen Render-Schleifen:** LC06 nutzt weiterhin den zentralen `requestAnimationFrame`-gedrosselten Refresh.
- **Crew-Aktionen ohne Vollseiten-Neuladen:** alte `location.reload()`-Stelle entfernt.

## Tastatur

- `M` – Karte fokussieren
- `H` – Hilfe ein-/ausblenden
- `R` – angebotene Reise starten
- `E` – Zug beenden
- `G` – nächsten sinnvollen Schritt fokussieren
- `I` – Innenraum am aktuellen Ort öffnen
- `K` – Klangmixer öffnen/schließen
- `Alt+1` bis `Alt+9` – sichtbare Spielbereiche direkt wählen
- `WASD` oder Pfeile – Karte bewegen
- `+` / `-` – Karte zoomen
- `Home` oder `0` – Gesamtkarte

## Architektur

LC06 ergänzt den Stand additiv über `lc06-data.js`, `lc06-engine.js`, `lc06-bootstrap.js`, `lc06-ui.js` und `lc06.css`. Die 05B-Karten-/Responsive-Schicht bleibt erhalten. Browser-Schema ist **7**, kanonischer Save-Spiegel `pppoppi-bunkerwahrheit-html-v0120`.

## Prüfung

```bash
./PRUEFEN.sh
```

Der Prüfvertrag umfasst **19 reproduzierbare Blöcke**: alle bisherigen Regressionen und Langläufe plus LC06-Engine-Test mit 1500-Zug-Langlauf sowie einen eigenen Führungs-/Innenraum-/Dialog-/Klang-/Kampf-Vertrag.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken bleiben abstrahierte fiktionale Spielsysteme ohne reale Handlungsanleitungen.
