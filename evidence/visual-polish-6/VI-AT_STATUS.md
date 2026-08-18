# Visual Polish VI-AT – Empfehlung → Zielbezirk → Reiseweg

Status: remote qualifiziert.

- Bestehende Handlungsempfehlung wird mit dem kürzesten vorhandenen Straßen-/Bahnweg zum empfohlenen Ziel verknüpft.
- Empfohlener Reiseweg: cyan; nächste Etappe: lime. Bahn bleibt durch kürzeres Strichmuster unterscheidbar.
- Keine neue Kartenfläche, keine Animation, keine Gameplay-, Schema- oder Save-Änderung.
- Route wird nach Karten-Neurender und Coach-Aktualisierung deterministisch neu markiert.
- Vertragsprüfung: `web/tests/lc11-visual-polish-6at-contract.test.js`.
- Lokale Vollprüfung: `PRUEFEN.sh` 35/35 PASS; LIVING-CITY-11 12/12 PASS inklusive 3500-Zug-Langlauf.
- Implementierungs-Gate: GitHub Actions #352 / 32176580005 SUCCESS.
- Finaler Head-Gate wird nach diesem reinen Statuscommit erneut ausgeführt.
