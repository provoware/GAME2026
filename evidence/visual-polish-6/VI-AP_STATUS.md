# Visual Polish VI-AP – Handlungsempfehlungs-Priorität

## Ziel
Zeitliche Dringlichkeit und Konsequenz werden ohne zusätzliche Layoutfläche in eine unmittelbar lesbare Handlungsreihenfolge übersetzt.

## Umsetzung
- Hauptfolge: `JETZT ZUERST` plus gruppenspezifische Empfehlung.
- Sekundärfolgen: `DANACH`, `ALS NÄCHSTES` oder `EINPLANEN` gemäß bestehender Dringlichkeit.
- Sicherheitslage → `Druck senken`.
- Handlungsfähigkeit → `Optionen sichern`.
- Ressourcen → `Reserven sichern`.
- Semantik über `data-action-priority`, `data-action-priority-label`, `data-action-recommendation` und erweitertes `aria-label`.
- Präsentation ausschließlich über bestehende Overlay-Fläche; keine neuen Layoutmaße und keine Animation.
- Gameplay, Browser-Schema 12 und Save-Spiegel v0170 unverändert.

## Validierung
- lokale JavaScript-Syntaxprüfung: PASS
- lokaler VI-AP-Vertrag: PASS
- VI-AP in Prüfblock 35 von `PRUEFEN.sh` aufgenommen
- Implementierungs-Gate GitHub Actions #332 / 32153971520: SUCCESS
- Chrome-E2E-Artefakt des Implementierungs-Gates: 9330917044
- finales Head-Gate: im PR-Nachweis dokumentiert

## Repository-Hygiene
- linearer, nicht-forcierter Branch-Fortschritt
- keine unbeabsichtigten Löschungen
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien aufgenommen
- `main` bleibt unverändert; PR #6 bleibt Draft und ungemergt
