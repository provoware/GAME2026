# Visual Polish VI-X – Echte Vorher-Nachher-Werte

## Ziel
Nach einer erfolgreichen Innenraumaktion die tatsächlich betroffenen Kernwerte direkt im vorhandenen Coach als Vorher→Nachher-Vergleich zeigen, ohne neue UI-Fläche, Gameplay-, Schema- oder Save-Änderung.

## Umsetzung
- neuer rein präsentationaler Layer `web/lc11-visual-polish-6o.css`
- `performInteriorAction()` erzeugt einen ausschließlich transienten `receipt` mit Vorher-/Nachher-Snapshot der von der Aktion direkt betroffenen Kernwerte
- der Beleg wird weder im Engine-State noch im Browser-Save gespeichert und verändert keine Berechnung
- die bestehende post-bubble UI-Härtung ergänzt den vorhandenen Coach ausschließlich um tatsächlich veränderte Werte, z. B. `Chancen 0→4`, `Ø Stress 18%→16%` oder `Bargeld 500 €→465 €`
- Ergebnis, Kosten und Vorher→Nachher-Werte bleiben in derselben Rückmeldungsfläche; keine neue Interaktionsebene
- Reduced Motion deaktiviert die neue Delta-Einblendung vollständig
- Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert

## Vertragsabsicherung
- `web/tests/lc06-engine.test.js` prüft den transienten Beleg funktional und bestätigt, dass Schema/Version unverändert bleiben und `receipt` nicht exportiert wird
- `web/tests/lc11-visual-polish-6-contract.test.js` prüft Layer, Importreihenfolge, Engine-Receipt-Nutzung durch die vorhandene Browser-Härtung, Vorher-/Nachher-Markup, Geometrieneutralität, Reduced Motion und Interaktionshygiene

## Lokale Qualifikation
- `PRUEFEN.sh`: **35/35 PASS**
- LIVING-CITY-06 Engine: **20/20 PASS**
- LIVING-CITY-11 Engine: **12/12 PASS**, einschließlich 3500-Zug-Langlauf
- JavaScript-/Python-/Vertragsprüfpfad: **PASS**

## Remote-Qualifikation
Die konkrete GitHub-Actions-/Chrome-E2E-Qualifikation wird nach dem validierten Fast-Forward im PR-Nachweis geführt.

## Hygiene
Keine ZIP-, `__pycache__`- oder `.pyc`-Dateien aufnehmen; keine unbeabsichtigten Löschungen. PR #6 bleibt Draft und ungemergt.
