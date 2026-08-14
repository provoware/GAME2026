# Google-Chrome-Desktop-E2E – LIVING-CITY-07

## Zweck

Dieser Test prüft das Browser-Spiel in **echtem Google Chrome**. Er ersetzt keine Engine-Tests, sondern ergänzt sie um die reale Bedienoberfläche.

## Geprüfte Bildschirmgrößen

- 1280 × 720
- 1366 × 768
- 1600 × 900

Für jede Größe wird geprüft, dass die Desktop-Hauptansicht keinen Seitenüberlauf erzeugt und Topbar, Arbeitsbereich, Karte, Bossbereich, Aktionsbereich und Footer innerhalb des Viewports bleiben.

## Bedienpfad

1. neues Spiel laden;
2. Hilfe öffnen und sicherstellen, dass sie die Karte nicht überdeckt;
3. Karte per Zoomknopf und Pfeiltaste bedienen;
4. Innenraum des Hauptbunkers öffnen;
5. verzweigten Ortsdialog führen und gespeicherte Folge prüfen;
6. Klangmixer öffnen, Effektregler/Ducking prüfen und Klang ausdrücklich aktivieren;
7. sichtbares Direktziel auswählen und tatsächlich reisen;
8. kanonischen `v0130`-Spielstand speichern und Seite neu laden;
9. im Rivalenbezirk Kampfvorbereitung öffnen, Crew wählen, Entscheidungsvorschau prüfen und Tastaturentscheidung auslösen;
10. mit `G` den nächsten sinnvollen Schritt fokussieren;
11. schwere Chrome-Konsolenfehler ausschließen.

## Evidenz

Der Runner schreibt nach `evidence/chrome-e2e/`:

- `CHROME_E2E_RECEIPT.json`
- Desktop-Screenshots für alle drei Auflösungen
- Screenshot der angedockten Hilfe
- Screenshot Innenraum/Dialog/Folgekette
- Screenshot Klangmixer
- Screenshot Kampfentscheidung

GitHub Actions lädt diese Evidenz als separates Artefakt hoch. Das finale Release wird nur aus einem erfolgreichen Remote-Stand gebaut.
