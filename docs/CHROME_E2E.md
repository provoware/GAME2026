# Google-Chrome-Desktop-E2E – LIVING-CITY-10

## Zweck

Die Release-Abnahme prüft das reale Browser-Spiel in **Google Chrome** zusätzlich zu den deterministischen Engine- und Vertragstests. Der qualifizierte LC09-Browserpfad bleibt erhalten; `tools/chrome_e2e_lc10.py` erweitert ihn um LC10-spezifische Prüfungen.

## Bildschirmgrößen

- 1280 × 720
- 1366 × 768
- 1600 × 900

Geprüft werden Seitenüberlauf, Hauptbereiche und eine praktisch nutzbare Kartenfläche.

## Reale Bedienpfade

Der Browserlauf prüft unter anderem:

1. Laden und Versions-/Schema-Vertrag;
2. Hilfe ohne Kartenüberdeckung;
3. sichtbaren Kartenzoom und Pfeiltasten-Pan;
4. Innenraum, Dialog und gespeicherte Folge;
5. Stadtgedächtnis per `J`;
6. Klangmixer ohne unerwünschtes Autoplay;
7. reale Reise;
8. Speichern und Reload;
9. Kampfvorbereitung und Tastatur `1/2/3`;
10. Aufgaben-Kompass per `G`;
11. LC10 **Stadtlage** mit zwölf Bezirken;
12. `v0160`, Schema 11, Druck-/Momentum-Auswertung sowie Crew-Stress/Moral.

## Evidenz

GitHub Actions lädt Screenshots und `CHROME_E2E_RECEIPT.json` als separates LC10-Evidenzartefakt hoch. Ein fehlgeschlagener realer Browserpfad blockiert das Release auch dann, wenn alle statischen Tests grün sind.
