# Beitragsrichtlinien

Dieses Repository entwickelt **PPPOPPI – Bunkerwahrheit** schrittweise als datengetriebenes Godot-4-Spiel.

## Entwicklungsfluss

1. Neue Arbeit beginnt auf einem eigenen Branch.
2. Eine Änderung umfasst möglichst genau ein Fachthema oder einen vertikalen Ablauf.
3. Zustandsänderungen laufen ausschließlich über Commands und Effects.
4. Contentänderungen müssen Schema- und Semantikprüfung bestehen.
5. Vor einem Pull Request sind `./verify.sh` und – mit vorhandener Godot-4-Installation – `./test.sh` auszuführen.
6. Pull Requests bleiben zunächst als Draft offen, bis alle Abnahmekriterien erfüllt sind.

## Drei-Iterations-Zyklus

- **Iteration A – Aufbau:** Datenmodell, Kernlogik, positiver und negativer Test.
- **Iteration B – Integration:** Services, Speicherung, UI-Grundfunktion, Integrationsablauf.
- **Iteration C – Konsolidierung:** Regression, Barrierefreiheit, Performance, Dokumentation und Refactoring.

Kritische Fehler wie Datenverlust, ungültige Speicherstände, Ressourcenverdopplung oder Verletzungen von Datenschutzregeln stoppen den Zyklus sofort.

## Branch- und Commitnamen

- Branch: `agent/<kurze-beschreibung>` oder `feature/<kurze-beschreibung>`
- Commit: kurze Imperativ- oder Ergebnisbeschreibung, beispielsweise `Implement mission phase transitions`

## Pull-Request-Anforderungen

Ein Pull Request beschreibt:

- Zweck und Umfang;
- betroffene Systeme;
- neue oder veränderte Datenformate;
- ausgeführte Prüfungen;
- bekannte Einschränkungen;
- Migrationsfolgen;
- Barrierefreiheitsauswirkungen.

## Codekonventionen

- GDScript wird statisch typisiert, soweit Godot dies sinnvoll unterstützt.
- UI-Skripte enthalten keine Fachlogik.
- Stabile IDs werden sichtbaren Namen vorgezogen.
- Fehler werden als strukturierte `GameError`-Objekte zurückgegeben.
- Mehrteilige Änderungen sind atomar und rollbackfähig.
- Freitext wird ausschließlich als Text behandelt und niemals ausgeführt.
- Öffentliche APIs und nicht offensichtliche Invarianten werden dokumentiert.

## Contentkonventionen

- JSON-Dateien müssen UTF-8 und schemafähig sein.
- IDs verwenden Kleinbuchstaben und punktgetrennte Namensräume.
- Pflichtpfade benötigen mindestens einen erreichbaren Abschluss.
- Inhalte mit nicht bestätigtem Kanonstatus werden entsprechend markiert.
- Private Spielereingaben dürfen nur in freigegebenen Kontexten wiederverwendet werden.

## Definition of Done

Eine Änderung ist erst stabil, wenn:

- Parser, Schema und Semantikprüfung bestehen;
- positive und negative Tests vorhanden sind;
- Save/Load für betroffene Daten geprüft ist;
- keine direkte UI-Domainkopplung entstanden ist;
- Dokumentation und Changelog aktualisiert sind;
- Barrierefreiheit für die neue Bedienung geprüft ist.
