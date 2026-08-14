# Google-Chrome-Desktop-E2E – LIVING-CITY-08

## Zweck

Der Runner prüft das reale Browser-Spiel in **Google Chrome** und ergänzt die deterministischen Engine-Tests um tatsächliche DOM-, Layout-, Tastatur- und Speicherpfade.
Er besteht aus **einem kanonischen Runner** (`tools/chrome_e2e.py`), fragt dynamische DOM-Elemente nach Renderwechseln neu ab und verwendet keine globalen Selenium-Monkeypatches.

## Bildschirmgrößen

- 1280 × 720
- 1366 × 768
- 1600 × 900

Für jede Größe werden Seitenüberlauf, Hauptbereiche und eine nutzbare Kartenfläche geprüft.

## Bedienpfad

1. LC08 / Schema 9 frisch laden;
2. Hilfe öffnen und Kartenüberdeckung ausschließen;
3. sichtbaren Kartenzoom und Pfeiltasten-Pan prüfen;
4. Innenraum öffnen und verzweigten Ortsdialog ausführen;
5. gespeicherte Folge sichtbar machen;
6. **Journal per `J` öffnen**, drei Entwicklungsbögen und Journalzeilen prüfen;
7. Klangmixer ohne Autoplay öffnen und aktivieren;
8. reale Reise zum Rivalenbezirk durchführen;
9. kanonischen **v0140**-Spielstand speichern und Reload prüfen;
10. Kampfvorbereitung, Vorschau und Tastatur `1/2/3` prüfen;
11. mit `G` den Aufgaben-Kompass fokussieren;
12. sichtbare Buttons auf zugängliche Benennung und ARIA-Live-Basis prüfen;
13. schwere Chrome-Konsolenfehler ausschließen.

## Evidenz

`evidence/chrome-e2e/` enthält Receipt und Screenshots, darunter:

- drei Desktopansichten;
- Hilfe-Dock;
- Innenraum/Dialog/Folge;
- **decision_journal.png**;
- Klangmixer;
- Kampfentscheidung.

Ein finales Release darf nur aus einem erfolgreichen Remote-Stand gebaut werden.
