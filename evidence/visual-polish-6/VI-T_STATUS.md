# Visual Polish VI-T – Status

## Verbesserungsschritt
Visual Polish VI-T verbessert die Icon-/Text-Balance der Innenraum-Aktionskarten, damit Symbol, Titel, Nutzen und Risiko schneller als zusammengehörige Entscheidungseinheit gelesen werden können.

- Icons treten im Ruhezustand bewusst leicht hinter den Titel zurück
- Hover/Fokus hebt Icon und Entscheidungseinheit gemeinsam hervor
- Titel erhalten eine ruhigere, balancierte Zeilenbildung
- Nutzen- und Risikozeilen werden typografisch enger an die Aktion gebunden
- deaktivierte Icons treten klar zurück, Sperrgründe bleiben dominant
- keine neuen Layoutmaße, keine zusätzliche UI-Fläche und keine neue Interaktionsebene
- Reduced Motion bleibt vollständig berücksichtigt

## Kompatibilität
- Gameplay: unverändert
- Engine: unverändert
- Browser-Schema: 12, unverändert
- Save-Spiegel: v0170, unverändert
- keine neue aktive Interaktionsebene
- geometrieneutral; keine neuen Layoutmaße oder Grid-Geometrie

## Vertragsabsicherung
- neuer Präsentationslayer: `web/lc11-visual-polish-6k.css`
- `web/lc11-close-control.css` importiert VI-T vor dem finalen Close-Control-Regelsatz
- `web/tests/lc11-visual-polish-6-contract.test.js` prüft VI-T-Marker, Geometrieneutralität und das Verbot zusätzlicher `pointer-events:auto`-Ebenen

## Lokale Vorqualifikation
- `PRUEFEN.sh`: **35/35 PASS**
- LC11-Engine: **12/12 PASS**
- 3500-Zug-Langlauf: **PASS**
- historische Regressionen, UI-/Visual-Verträge und Python-Syntax: **PASS**

## Implementierungs-Gate
GitHub Actions **#223 / 32054593325: SUCCESS** auf Head `63f856469ba56ca28d842b4634c8e871111600e7`.
- qualifizierter Vertragslauf: **PASS**
- echter Google Chrome Desktop E2E: **PASS**
- Shell-/Browser-JavaScript-/Python-Syntax: **PASS**
- deterministischer Manifest-Neubau: **PASS**
- Paketvalidierung: **PASS**

Implementierungs-Artefakte:
- Source: `9295944990`, `sha256:a1475009f7c15c38370e3207f42a4302dfe61f95edc4dc1acdde0c53e0ac50a5`
- Chrome-E2E: `9295943440`, `sha256:d56d6e1b60c1e121febeaedf3a78313d042eca9740193d1f77a5fae744899a50`

## Dokumentations-Gate
GitHub Actions **#224 / 32054709636: SUCCESS** auf Head `fb470daf44fc4634bb00a65147ea65d63c51c8bb`.
- qualifizierter Vertragslauf: **PASS**
- echter Google Chrome Desktop E2E: **PASS**
- deterministischer Manifest-Neubau: **PASS**
- Paketvalidierung: **PASS**
- Python-Syntax: **PASS**

Remote-Artefakte des dokumentierten Heads:
- Source: `9295986410`, `sha256:3a925d28f04039f9f28aadeb657eb589eb29dbf744dbc8037d9c7f484690fb6a`
- Chrome-E2E: `9295984256`, `sha256:c83463cbf35c4ece1d07b23eb568c3235463bb1b6e7af5c17d9721ede7dd1541`

## Chrome-E2E-Nachhärtung
GitHub Actions **#225 / 32054857720** zeigte ausschließlich im echten Chrome-E2E einen `StaleElementReferenceException`; alle statischen Verträge waren bereits PASS. Das veröffentlichte Fehler-Artefakt zeigte den Fehler nach dynamischem Dialog-Neurendering. `tools/chrome_e2e_lc11.py` wurde deshalb gezielt gehärtet:
- maximal zwei saubere Neuversuche nach transientem StaleElementReference
- vor jedem Retry werden Teil-Checks und Viewport-Nachweise des fehlgeschlagenen Versuchs zurückgerollt
- wiederholtes Versagen nach drei Gesamtversuchen bleibt ein harter Gate-Fehler

Die lokale Revalidierung nach der Härtung blieb **35/35 PASS**, LC11 **12/12 PASS**, 3500-Zug-Langlauf PASS und Python-Syntax PASS.

GitHub Actions **#226 / 32055105203: SUCCESS** auf Head `8511b760a68ec1b6be59998a3b787d9eb5d937a2`.
- qualifizierter Vertragslauf: **PASS**
- echter Google Chrome Desktop E2E: **PASS**
- deterministischer Manifest-Neubau: **PASS**
- Paketvalidierung: **PASS**
- Python-Syntax: **PASS**

Remote-Artefakte des gehärteten Heads:
- Source: `9296121750`, `sha256:579acbcca8376cf953018cb9b48f49b2a6ea97764d5d5d8105068737558b0328`
- Chrome-E2E: `9296119505`, `sha256:445591814872db4abb1230db01b2a0f5a5063d7570a72fc90918e8eee76bbc2c`

## Repository-Hygiene
- keine beabsichtigten Löschungen
- keine `__pycache__`- oder `.pyc`-Dateien hinzugefügt
- keine ZIP-Dateien ins Repository aufgenommen
- Branch bleibt `agent/html-gang-map-boss-dynamics`
- Branch-Aktualisierung sequenziell und nicht-forciert
- PR #6 bleibt Draft, offen und ungemergt

## Abschließendes Head-Gate
Der aktualisierte Statusnachweis wird auf seinem finalen Head erneut vollständig validiert.
