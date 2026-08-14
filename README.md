# PPPOPPI – Bunkerwahrheit · LIVING-CITY-04A

Version **0.10.1-living-city-04a** ist die Karten- und Bedienreparatur des 0.10-Revival-Stands. Sie beseitigt mehrere Sichtbarkeits- und Konsistenzprobleme, ohne die bewährten Fachsysteme zurückzubauen.

## Direkt starten

`web/index.html` in Firefox oder Chrome öffnen oder unter Linux `./START_GAME.sh` ausführen.

## Korrigiert und verbessert

- **Zug beenden** wieder als dauerhaft sichtbare Hauptaktion vorhanden; zusätzlich Tastenkürzel **E**;
- bewusstes Warten löst den vollständigen Zugzyklus aus: autonome Crew, Betriebe, Markt, Maulwürfe, Rivalen, Polizei, Rekrutierung, Stadtereignisse, Missionen und Meilensteine;
- Zugende wird während offenem Kampf oder laufender Pokerrunde gesperrt;
- **Rivalen** wieder als eigener Haupt-Tab mit Strategie, Macht, Kasse, Territorien, letztem KI-Zug und Beziehungen;
- Tabnavigation von verstecktem horizontalem Scrollen auf vollständig sichtbares Raster umgestellt;
- Stadtkarte grafisch neu geordnet: stärkere Gebietsflächen, Besitzer-/Kontrollringe, Bezirksart, Rivalen-/Polizeidruck und Besitzmarker;
- direkt erreichbare Straßen und Bahnlinien deutlich markiert;
- mehrstufige Ziele erhalten eine berechnete Route mit nächstem Halt;
- direkte Reise aus der Kartenleiste möglich;
- Kartenzoom **− / Gesamtkarte / +** ergänzt;
- neuer kanonischer 0.10-Speicherspiegel `v0100`; der bisherige `v090`-Key bleibt für verlustfreie Kompatibilität synchronisiert;
- zusätzlicher Regressionstest verhindert künftig das Verschwinden von Zugsteuerung, Rivalenbereich und Kartenbedienung.

## Wartbare 04A-Reparaturschicht

Die großen, bereits qualifizierten 0.10-Kernmodule `app.js` und `styles.css` bleiben byte-stabil. Die Bedienreparatur liegt additiv in `repair-bootstrap.js`, `repair-04a.js` und `repair-04a.css`. Dadurch ist die Fehlerkorrektur leicht rückbaubar und reduziert das Regressionsrisiko.

## Bestehende Revival-Systeme

Revival Director, dynamische Missionen, Stadtereignisse, Rivalenpolitik, Crew-Daueraufträge, Besitz, Bank/Unternehmensmarkt, Casino, Kampfsport, Ausrüstung, Reisen und taktische Kämpfe bleiben vollständig enthalten.

## Prüfung

```bash
./PRUEFEN.sh
```

Der Prüfvertrag umfasst 52 Kern-Regressionen, 15 Revival-Regressionen, 500- und 1000-Zug-Langläufe, UI-Smoke, statischen UI-Vertrag, Karten-/Bedien-Regression und Revival-Visual-Vertrag.

## Simulationshinweis

Konflikt-, Ausrüstungs-, institutionelle und Stadtoperationsmechaniken sind abstrahierte fiktionale Spielsysteme. Sie dienen ausschließlich dem Gameplay.
