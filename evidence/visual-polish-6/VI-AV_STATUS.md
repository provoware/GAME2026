# Visual Polish VI-AV – Navigationskorridor

Status: IMPLEMENTIERT / LOKAL QUALIFIZIERT / REMOTE-QUALIFIKATION AUSSTEHEND

## Umfang
- bei aktiver Reiseempfehlung tritt nicht empfohlene Straßen-/Bahninfrastruktur kontrolliert zurück
- direkt erreichbare Alternativen bleiben stärker sichtbar als rein sekundäre Infrastruktur
- manuell geplante, aber nicht empfohlene Verbindungen bleiben als Kontext erhalten
- der empfohlene Reiseweg bleibt voll sichtbar; die nächste Etappe behält den stärksten Lime-Fokus
- Bezirksfelder werden leicht beruhigt, Bezirksmarker und Beschriftungen bleiben vollständig lesbar
- stärkere Kontrastdarstellung bei `prefers-contrast: more`
- `prefers-reduced-motion: reduce` ausdrücklich berücksichtigt
- keine neue DOM-Geometrie, keine neue Interaktion, keine Keyframes
- keine Gameplay-, Engine-, Browser-Schema- oder Save-Änderung

## Vertragsabsicherung
- Präsentationslayer: `web/lc11-visual-polish-6w.css`
- finale Importkette: `web/lc11-close-control.css`
- Vertrag: `web/tests/lc11-visual-polish-6av-contract.test.js`
- `PRUEFEN.sh` Prüfblock 35 erweitert

## Repository-Hygiene
- keine beabsichtigten Löschungen
- keine ZIP-, `.pyc`- oder `__pycache__`-Artefakte
- PR #6 bleibt Draft, offen und ungemergt

Remote-Gate und finaler Commit/Tree werden nach erfolgreicher GitHub-Actions-Qualifikation ergänzt.
