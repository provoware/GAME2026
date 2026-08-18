# Visual Polish VI-AQ – Handlung → verfügbare Aktion / Ort

- Baut additiv auf VI-AP auf.
- Handlungsempfehlungen nennen jetzt eine konkret passende Innenraumaktion.
- Ist eine passende Aktion am aktuellen Ort tatsächlich verfügbar, erscheint `HIER: <Aktion>`.
- Andernfalls erscheint `ORT: <Ort> · <Aktion>` als konkretes Reiseziel.
- Auswahl erfolgt deterministisch anhand der positiven Wirkung auf Sicherheitslage, Ressourcen oder Handlungsfähigkeit.
- Keine zusätzliche Layoutfläche, keine neue Animation, keine Gameplay-, Schema- oder Save-Änderung.
- Vertragsprüfung: `web/tests/lc11-visual-polish-6aq-contract.test.js`.
