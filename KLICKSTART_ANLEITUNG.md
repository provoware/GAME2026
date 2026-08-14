# Klickstart – PPPOPPI Bunkerwahrheit 0.11.1 · LIVING-CITY-05A

## Linux / Kubuntu

1. ZIP vollständig entpacken.
2. `START_GAME.sh` doppelklicken oder im Terminal `./START_GAME.sh` starten.
3. **Google Chrome bevorzugen.** Der Linux-Klickstart nimmt automatisch zuerst Chrome, danach Chromium und nur als Reserve Firefox.

## Windows

`START_GAME.bat` doppelklicken.

## Im Spiel

- **Zug beenden** oben rechts lässt bewusst einen vollständigen Simulationszug verstreichen.
- Auf der Karte zwischen **Gebiete / Druck / Wirtschaft / Ereignisse** umschalten.
- Ort auswählen und **Innenansicht** öffnen, um die lokale Szene und Hotspots zu sehen.
- Im Bereich **Crew** Beziehungen, Moral und Stress beobachten; Reden, Planen oder Sparring verändern die Crew-Chemie.
- Im **Direktor** aktive Aufträge öffnen und das einmalige Briefing entscheiden.
- **Atmosphäre** ist optional und wird erst nach einem Klick lokal im Browser erzeugt; es werden keine Audiodateien aus dem Internet geladen.

## Spielstände

0.11 verwendet den lokalen Speicher `v0110`. Vorhandene Stände aus 0.10/0.9 werden weiter übernommen.

## Technische Prüfung

`./PRUEFEN.sh` führt **16 reproduzierbare Prüfblöcke** aus. Node.js ist nur für diese Entwicklerprüfung erforderlich, nicht zum Spielen.

## Wenn die Oberfläche früher dauerhaft lud

0.11.1 entfernt zwei globale DOM-Beobachter, die zu einer Render-Rückkopplung führen konnten. Wenn ein alter Tab noch hängt, diesen vollständig schließen und das Spiel mit `./START_GAME.sh` neu in Chrome öffnen.
