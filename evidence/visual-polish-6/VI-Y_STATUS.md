# Visual Polish VI-Y – Semantische Wirkungsrichtung

## Ziel
Vorher→Nachher-Werte nach Innenraumaktionen sollen sofort als vorteilhaft, neutral oder nachteilig erfassbar sein, ohne zusätzliche UI-Fläche, Gameplay-, Schema- oder Save-Änderung.

## Umsetzung
- neuer rein präsentationaler Layer `web/lc11-visual-polish-6p.css`
- `lc11-browser-hardening.js` klassifiziert reale Deltas metrikspezifisch: mehr Chancen/Kontrolle/Moral/Vorrat/Bargeld = vorteilhaft; weniger Spannung/Polizeidruck/Rivalendruck/Stress = vorteilhaft
- `data-impact="benefit|risk|neutral"` steuert die Darstellung
- Vorteil, Nachteil und Neutralität unterscheiden sich nicht nur farblich, sondern zusätzlich über solid/dashed/dotted Linienstile
- `aria-label` nennt die Wirkungsrichtung auch für assistive Technik
- keine neue Interaktionsebene und keine Layoutmaße
- Browser-Schema 12 und Save-Spiegel v0170 bleiben unverändert

## Validierung
- Vertragscheck erweitert um VI-Y-Layer, Importreihenfolge, Impact-Klassifikation, Geometrieneutralität und Interaktionshygiene
- lokale Gesamtvalidierung über `PRUEFEN.sh`

## Hygiene
Keine ZIP-, `__pycache__`- oder `.pyc`-Dateien; keine unbeabsichtigten Löschungen. PR #6 bleibt Draft und ungemergt.
