# Visual Polish VI-AC – Priorisierung mehrerer Vorher→Nachher-Werte

Status: **IMPLEMENTIERT · LOKAL QUALIFIZIERT · REMOTE-QUALIFIKATION AUSSTEHEND**

## Verbesserung
- bei mehreren gleichzeitig sichtbaren Vorher→Nachher-Werten wird die entscheidungsrelevanteste Wirkung visuell priorisiert
- Prioritätslogik: **starke Risiken → starke Vorteile → mittlere Risiken → mittlere Vorteile**
- weniger wichtige Begleitwerte treten nur temporär über Opazität/Sättigung zurück; Informationen bleiben vollständig sichtbar
- die priorisierte Wirkung erhält eine kontraststärkere Kontur ohne zusätzliche Layoutfläche
- bestehende VI-Y-Wirkungsrichtung, VI-Z-Effektstärke sowie VI-AA/VI-AB-Dynamik bleiben erhalten
- keine neue Interaktionsebene, keine neuen Layoutmaße, keine Gameplay-, Schema- oder Save-Änderung

## Vertragsabsicherung
- Präsentationslayer: `web/lc11-visual-polish-6r.css`
- `web/tests/lc11-visual-polish-6ac-contract.test.js` prüft VI-AC-Bezeichner, Prioritätsselektoren, geometrieneutrale Hervorhebung und Interaktionshygiene
- bestehendes `PRUEFEN.sh` führt den Visual-Polish-VI-Vertrag als Prüfschritt 35/35 aus

## Kompatibilität und Hygiene
- Gameplay unverändert
- Browser-Schema **12** unverändert
- Save-Spiegel **v0170** unverändert
- keine ZIP-, `__pycache__`- oder `.pyc`-Dateien vorgesehen
- keine Löschungen vorgesehen
- Branch-Aktualisierung ausschließlich linear und nicht-forciert
