# Entwicklungsregeln

1. UI verändert niemals Domainzustand direkt.
2. Jede Zustandsänderung läuft über `GameCommand` und `GameEffect`.
3. Mehrteilige Änderungen sind atomar und rollbackfähig.
4. Jeder Command besitzt eine eindeutige Transaktions-ID.
5. Content referenziert stabile IDs statt sichtbarer Namen.
6. Freitext wird nur als Text gespeichert und nie ausgeführt.
7. Neue Fachmodule erhalten mindestens einen positiven und einen negativen Test.
8. Nach zwei Aufbauiterationen folgt eine Konsolidierungsiteration.
9. Save-Schemaänderungen benötigen Migration oder klaren Versionsabbruch.
10. Keine Fachlogik in Szenenskripten oder ViewModels.
11. Fachmodule koppeln Missionen ausschließlich über registrierte Signale oder Commands an.
12. Missionsfolgen werden niemals direkt aus Welt-, Dialog- oder Figurenskripten geschrieben.
13. Absolute Fristen werden als Zielmonat gespeichert und nach Laden nicht neu berechnet.
14. Teilerfolge, Fehlschläge und Abbrüche müssen explizite Folgeeffekte besitzen.
15. Contentänderungen müssen JSON-Schema und semantische Graphprüfung bestehen.
16. Neue Fachphasen aktualisieren `docs/PROJECT_STATUS.md`, `CHANGELOG.md` und die betroffenen Entwicklerdokumente.
17. Pull Requests enthalten ausgeführte Prüfungen, Save-/Migrationsfolgen und bekannte Einschränkungen.
18. Kritische Datenschutz-, Save- oder Ressourcenfehler stoppen die Iteration sofort.
19. CI-Skripte müssen lokal reproduzierbar bleiben und dürfen keine versteckte Cloudabhängigkeit einführen.
20. Neue Contenttypen benötigen Schema, Semantikprüfung, Positivtest und Negativtest.
