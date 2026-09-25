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

---

## PROVOWARE GLOBAL DEVELOPMENT CONTRACT

Dieser globale Kern gilt zusätzlich zu den projektspezifischen Regeln. Bei Sicherheits- oder Nachvollziehbarkeitskonflikten hat er Vorrang; lokale Regeln dürfen ihn verschärfen, nicht stillschweigend abschwächen.

- **Frozen Current Plan:** Laufenden freigegebenen Plan nicht durch neue Ideen erweitern; Neues in die nächste Iteration einordnen.
- **Conflict Gate:** Unterbrechen nur bei nachgewiesenem Konflikt mit Planvoraussetzung, Sicherheit, Ausgangs-SHA, Scope oder Invariant.
- **Single Writer:** Pro produktivem Scope nur ein autorisierter Executor; Analyse/Planung/Prüfung dürfen parallel lesen.
- **SHA + Scope:** Vor Mutation HEAD und erlaubten/verbotenen Scope prüfen; keine stillen Nebenrefactorings.
- **Evidence:** Kein PASS ohne echten Test; Evidence muss zum geprüften HEAD gehören.
- **Controlled Evidence Lab:** Echte Mutationen, Fehler-Injektion und Recovery-Tests nur in isolierten Testbereichen; Produktivdaten bleiben geschützt.
- **Next Queue:** Neue Anforderungen/Findings append-only erfassen und Beziehungen wie BLOCKS, REQUIRES, SUPERSEDES, DUPLICATE oder CONFLICTS dokumentieren.
- **Statusklarheit:** OBSERVED/SUSPECTED/REPRODUCED/CONFIRMED/DISPROVED nicht vermischen.
- **Recovery Key:** Nach Abbruch oder Agentenwechsel müssen Stand, Ziel, Frozen Plan, Scope, Findings, Gates und nächster erlaubter Schritt ohne alten Chat rekonstruierbar sein.
- **Traceability:** Requirement/Decision → Finding → Plan → Change → Test/Evidence → Gate/Checkpoint nachvollziehbar halten.
- **Negativtests:** Schutzmechanismen absichtlich gegen falschen SHA, zweiten Writer, Scope-Verstoß und unbelegtes PASS testen.
- **Sichtbarer Fortschritt:** Längere Prüfungen mit Schritt, Fortschritt, Ergebnis und Ampelstatus darstellen.

Leitsatz: **Kein Agent muss sich erinnern. Kein Agent darf raten. Keine Änderung verliert ihren Ursprung. Kein PASS existiert ohne Evidence.**
