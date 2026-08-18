# Visual Polish VI-Z – Stärke der Wertveränderung

## Ziel
Vorher→Nachher-Werte nach Innenraumaktionen sollen zusätzlich zur Wirkungsrichtung auch nach Effektstärke sofort erfassbar sein, ohne zusätzliche UI-Fläche, Gameplay-, Schema- oder Save-Änderung.

## Umsetzung
- neuer rein präsentationaler Layer `web/lc11-visual-polish-6q.css`
- `lc11-browser-hardening.js` klassifiziert reale Deltas metrikspezifisch als `none|small|medium|strong`
- Geld, Vorrat sowie Score-/Prozentwerte nutzen passende Schwellen statt einer pauschalen Einheitsgrenze
- kleine, mittlere und starke Änderungen unterscheiden sich über Intensität, Liniengewicht und Hervorhebung des Nachher-Werts
- `aria-label` nennt zusätzlich `keine`, `kleine`, `mittlere` oder `starke Veränderung`
- keine neue Interaktionsebene und keine Layoutmaße
- Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert

## Lokale Validierung
- `PRUEFEN.sh`: **35/35 PASS**
- LIVING-CITY-06 Engine: **20/20 PASS**
- LIVING-CITY-11 Engine: **12/12 PASS**, einschließlich 3500-Zug-Langlauf
- Vertragscheck, JavaScript-Syntax und Interaktionshygiene: **PASS**

## Remote-Qualifikation des Implementierungs-Heads
- Head: `4506286d682c8526998c403de5e1aba3fb3241b1`
- Tree: `c03eb840eb80aa572c25735a31c2c3e892634329`
- GitHub Actions #250 / Run `32080085466`: **SUCCESS**
- echter Google-Chrome-Desktop-E2E: **PASS**
- qualifizierter Vertragslauf: **PASS**
- Shell-/Browser-JavaScript-/Python-Syntax: **PASS**
- deterministischer Manifest-Neubau und Paketvalidierung: **PASS**
- Source-Artefakt: `9304822104`, Digest `sha256:bbff28224eea79a277ac7e1b5840a7147daecd496db426994ea773ad5436d8d2`
- Chrome-E2E-Artefakt: `9304820264`, Digest `sha256:b110d760b6dbd0358f71e49ed06ced65c2c2d4dd474e8ac85fe86e3f722e4a3c`

## Hygiene
Keine ZIP-, `__pycache__`- oder `.pyc`-Dateien aufgenommen; keine unbeabsichtigten Löschungen. Branch-Aktualisierung nicht-forciert und Fast-Forward. PR #6 bleibt Draft und ungemergt.
