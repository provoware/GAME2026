# Visual Polish VI-M – Karten→Innenraum-Übergang

- Schritt: räumlich klarerer Eintritt aus der Stadtkarte in Innenräume.
- Präsentation: dezenter Modal-/Szeneneintritt, Ortslabel als Orientierungscue, ruhigerer Backdrop.
- Bedienung: die native Dialog-Fokusführung erhält auf der Schließen-Steuerung einen deutlich sichtbaren Fokuszustand; bestehende Fokus-/Schließlogik bleibt unverändert.
- Barrierefreiheit: `prefers-reduced-motion` und `lc09-reduced-motion` deaktivieren alle neuen Bewegungen vollständig.
- Geometrie: keine neuen Maße, Grids, Paddings oder dauerhaften Flächen.
- Kompatibilität: kein Gameplay-, Engine-, Schema- oder Save-Eingriff; Schema 12 / v0170 unverändert.
- Lokale Validierung: `PRUEFEN.sh` **35/35 PASS**, LC11-Engine **12/12 PASS**, 3500-Zug-Langlauf **PASS**, Python-Syntax **PASS**.
- Remote-Qualifikation: nach Fast-Forward-Push über GitHub Actions und echten Google-Chrome-E2E zu bestätigen.
