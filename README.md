# PPPOPPI – Bunkerwahrheit · LIVING-CITY-08

Version **0.14.0-living-city-08**, Schema **9**. LC08 baut auf der Chrome-first LC07-Basis auf und vertieft vor allem **Zusammenhang, Nachvollziehbarkeit und langfristige Folgen** statt die Oberfläche mit weiteren Dauerbereichen zu überladen.

## Direkt starten

Unter Linux `./START_GAME.sh` ausführen. Google Chrome wird bevorzugt. Alternativ `web/index.html` direkt im Browser öffnen. Das Spiel bleibt offline-first und benötigt für den normalen Spielbetrieb keinen Server.

## Was LC08 erweitert

- **Stadtgedächtnis:** wichtige Entscheidungen werden als nachvollziehbare Kette gespeichert.
- **Verzögerte Folgen:** bestimmte Entscheidungen wirken erst mehrere Züge später erneut und verändern Chancen, Spannung, Moral, Beziehungen oder lokale Kontrolle.
- **Drei Entwicklungsbögen:** Führungsstil, Stadtrouten und Crew-Zusammenhalt besitzen mehrstufige Ziele mit sichtbarem Fortschritt und Abschlusswirkung.
- **Entscheidungsjournal:** per `J` öffnet sich eine kompakte Übersicht über Ursache → spätere Folge, ohne die Hauptansicht dauerhaft zu vergrößern.
- **Bessere Aufgabenführung:** der Aufgaben-Kompass kann den nächsten sinnvollen Schritt eines Entwicklungsbogens priorisieren.
- **Reise-, Innenraum-, Dialog- und Kampfnachweise:** diese Ereignisse werden im Journal zusammengeführt.
- **Barrierefreiheits-Politur:** einheitliche `:focus-visible`-Kennzeichnung, ARIA-Live-Hinweise für späte Folgen und reale Chrome-Prüfung sichtbarer Bedienelemente.
- **Save-Spiegel `v0140`:** Migration aus `v0130`, `v0120`, `v0110`, `v0100` und `v090`.

## Tastatur

`M` Karte · `H` Hilfe · `R` Reise · `E` Zugende · `G` nächster Schritt · `I` Innenraum · `K` Klang · **`J` Stadtgedächtnis/Journal** · `Alt+1–8` Bereiche · WASD/Pfeile bewegen · `+/-` zoomen · Kampf `1/2/3`.

## Architektur

LC08 bleibt additiv: `lc08-data.js`, `lc08-engine.js`, `lc08-bootstrap.js`, `lc08-ui.js`, `lc08.css` und eigene Tests. Qualifizierte Kern- und LC07-Schichten werden nicht unnötig umgeschrieben. Der zentrale `ui-refresh.js` aktualisiert LC08 mit, ohne globale `MutationObserver` oder Render-Schleifen einzuführen.

## Prüfung

```bash
./PRUEFEN.sh
```

Der lokale Vertrag umfasst **23 reproduzierbare Blöcke** einschließlich aller bisherigen Regressionen, LC08-Engine-Test, **2500-Zug-Langlauf**, Stadtgedächtnis-/Journalvertrag und Python-Syntaxprüfung des echten Chrome-E2E-Runners.

## Simulationshinweis

Konflikt-, institutionelle und Stadtoperationsmechaniken sind abstrahierte fiktionale Spielsysteme. Sie liefern keine realweltlichen Handlungsanleitungen.
