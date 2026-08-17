# Visual Polish VI-N – Innenraum-Fokusführung

- Schritt: visuelle Orientierung innerhalb geöffneter Spezialorte vom Ortslabel über Hotspots zur Hauptaktion.
- Präsentation: Hotspots erhalten nach dem Szeneneintritt einen kurzen, ruhigen Kontrastimpuls; die Hauptaktion folgt zeitversetzt und wird dadurch als nächster sinnvoller Bedienpunkt priorisiert.
- Ortscharakter: Casino, Dojo, Schwarzmarkt und Bahnhof behalten ihre eigenen Akzentfarben; die Hauptaktion übernimmt den jeweiligen Ortsakzent auch im Ruhebild stärker.
- Bedienung: Hover- und Fokuszustände brechen die Eintrittsanimation sofort ab, damit direkte Eingaben nie gegen eine laufende Präsentation arbeiten.
- Barrierefreiheit: `prefers-reduced-motion` und `lc09-reduced-motion` deaktivieren sämtliche neuen Bewegungen vollständig.
- Geometrie: keine neuen Maße, Grids, Paddings oder dauerhaften Flächen.
- Kompatibilität: kein Gameplay-, Engine-, Schema- oder Save-Eingriff; Schema 12 / v0170 unverändert.
- Lokale Validierung: `PRUEFEN.sh` **35/35 PASS**, LC11-Engine **12/12 PASS**, 3500-Zug-Langlauf **PASS**, Python-Syntax **PASS**.
- Remote-Implementierungsqualifikation: GitHub Actions **#195 / 32029645103 SUCCESS** auf Head `25e182593a734499dda2d107589de65135ea5f98`; echter Google-Chrome-Desktop-E2E, Vertragslauf, Manifest-Neubau, Paketvalidierung und Python-Syntax **PASS**.
- Implementierungsartefakte: Source `9288399839` (`sha256:5eb52c6591c80cbe0e5cbbd8c6b6247c9db21bba5726760e61d6e4591c530376`), Chrome-E2E `9288397500` (`sha256:de03f5069006b47d37f8e2881b218e82a6af9cbacb1e54ccd4c4cf839c308f00`).
- Dieser Nachweis-Commit ändert ausschließlich die Statusdokumentation und wird als finaler Branch-Head erneut durch dasselbe Remote-Gate qualifiziert.
