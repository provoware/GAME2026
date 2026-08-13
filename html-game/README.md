# Gangland 1925 – HTML-Spielstrang

Dieser Ordner dokumentiert den eigenständigen HTML-/Browsergame-Strang parallel zum bestehenden Godot-Fundament.

## Aktueller validierter Stand

- Version: **1.5.0 Cinematic Visual & Motion**
- Runtime: HTML, CSS, Vanilla JavaScript
- Save-Schema: 7
- Offline-first, keine externen Laufzeitabhängigkeiten
- Desktop-Abnahme: 1366 × 768
- Mobile-Abnahme: 390 × 844

## Inhalt der v1.5.0-Iteration

- vollständig lokale SVG-Objektbibliothek für Gebäude, Kampfobjekte und Figuren
- animierte Stadtobjekte: Verkehr, Laternen, Wasser, Boote, Licht und Dunst
- Cinematic-Combat mit Rauch, Licht, Vignette, Ziel- und Trefferreaktion
- thematische Informationsansichten: Lage, Wirtschaft, Bande und Funk
- direkter Schalter zum Pausieren kosmetischer Animationen
- konsolidiertes Noir-/Art-Deco-Designsystem
- responsive Nachoptimierung für Desktop und Mobil

## Validierung

PASS: JavaScript-Syntax, Kernlogik, HTML/Ressourcen, lokaler Server, Chromium-Smoke-Test, Visual-SVG-Audit, Animationstoggle, Informations-Tabs, Desktop, Mobil und Offlineprüfung.

Das vollständige reproduzierbare Release wird aus dem lokalen validierten Releasebaum erzeugt. Die kryptografischen Identitäten stehen in `TRANSFER_STATUS.json`.
