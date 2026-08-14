# Klickstart – PPPOPPI Bunkerwahrheit 0.13.0 · LIVING-CITY-07

## Linux / Kubuntu

1. ZIP vollständig entpacken.
2. `START_GAME.sh` doppelklicken bzw. ausführen.
3. Der Starter öffnet bevorzugt **Google Chrome**, danach Chromium. Firefox bleibt nur Reserve.

## Was du zuerst siehst

- **Oben im Aufgaben-Dashboard** steht der wichtigste nächste Schritt.
- **G** setzt den Tastaturfokus direkt auf diese Empfehlung.
- **Hilfe** liegt neben/unter der Karte und verdeckt sie nicht.
- **I** öffnet den Innenraum des aktuellen Ortes.
- Entscheidungen aus Gesprächen können später an anderen Orten neue Antworten freischalten.
- Die letzte wichtige Folge wird kompakt angezeigt, ohne die Karte zu überlagern.
- **K** öffnet den Klangmixer. Gesamt, Musik, Atmosphäre und Effekte sind getrennt regelbar.
- Im Kampf wird eine Empfehlung hervorgehoben; `1`, `2`, `3` wählen Angriff, Deckung oder Rückzug.

## Karte & Reise

- Bezirk anklicken oder Direktziel oberhalb der Karte wählen.
- `R` startet die aktuell angebotene direkte Reise.
- Maus ziehen / WASD / Pfeile = Karte verschieben.
- Mausrad oder `+`/`-` = zoomen.
- `Home` oder `0` = Gesamtkarte.
- `M` = Kartenfokus.

## Technische Prüfung

`./PRUEFEN.sh` führt **21 reproduzierbare lokale Prüfblöcke** aus. Node.js/Python werden nur für Entwicklerprüfungen benötigt, nicht zum Spielen.

Auf GitHub läuft zusätzlich ein echter Google-Chrome-Test. Er öffnet das Spiel automatisiert, bedient die wichtigsten Wege und erstellt Screenshots bei 1280×720, 1366×768 und 1600×900.
