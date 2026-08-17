# Visual Polish VI-N – Innenraum-Fokusführung

- Schritt: visuelle Orientierung innerhalb geöffneter Spezialorte vom Ortslabel über Hotspots zur Hauptaktion.
- Präsentation: Hotspots erhalten nach dem Szeneneintritt einen kurzen, ruhigen Kontrastimpuls; die Hauptaktion folgt zeitversetzt und wird dadurch als nächster sinnvoller Bedienpunkt priorisiert.
- Ortscharakter: Casino, Dojo, Schwarzmarkt und Bahnhof behalten ihre eigenen Akzentfarben; die Hauptaktion übernimmt den jeweiligen Ortsakzent auch im Ruhebild stärker.
- Bedienung: Hover- und Fokuszustände brechen die Eintrittsanimation sofort ab, damit direkte Eingaben nie gegen eine laufende Präsentation arbeiten.
- Barrierefreiheit: `prefers-reduced-motion` und `lc09-reduced-motion` deaktivieren sämtliche neuen Bewegungen vollständig.
- Geometrie: keine neuen Maße, Grids, Paddings oder dauerhaften Flächen.
- Kompatibilität: kein Gameplay-, Engine-, Schema- oder Save-Eingriff; Schema 12 / v0170 unverändert.
- Lokale Validierung: `PRUEFEN.sh` **35/35 PASS**, LC11-Engine **12/12 PASS**, 3500-Zug-Langlauf **PASS**, Python-Syntax **PASS**.
- Remote-Qualifikation: ausstehend bis erfolgreichem GitHub-Actions-/Chrome-E2E-Gate des finalen Heads.
