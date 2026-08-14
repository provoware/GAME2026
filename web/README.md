# Browserfassung 0.9.0 – LIVING-CITY-03

Offline spielbare HTML-/CSS-/JavaScript-Fassung ohne externe Bibliotheken.

## Architektur

- `data.js` – Stadt, Aktionen, Firmen, Institutionen, Casino, Ausrüstung, Kampfsport, Crewprofile;
- `engine.js` – deterministische Fachlogik und Speicherung kompatibler Zustände;
- `app.js` – Darstellung, Interaktion und Autosave;
- `styles.css` – responsive moderne Oberfläche und Animationen;
- `tests/engine.test.js` – 52 Engine-/Regressions-/Langlauftests;
- `tests/ui-smoke.test.js` – DOM-freier Start-/Render-Smoke-Test.

## Kernsysteme

Crewmitglieder besitzen Kampf, Tarnung, Geschäft, Sozial, Analyse, Fahren und Ausdauer. XP entsteht aus passenden Entscheidungen und Tätigkeiten; Training ist nur ein zusätzlicher Weg. Daueraufträge laufen autonom bei jedem Spielzug weiter.

Der Unternehmensmarkt berechnet Kurse aus lokaler Kontrolle, Unruhe, Polizei, Gebietsbesitz, eigenen Betrieben, Unternehmensumsatz, Momentum und Volatilität. Dividenden werden periodisch aus Kurs, Entwicklung und Unternehmensrate berechnet.

Maulwürfe sind abstrakte Risikopositionen in Polizei, Verwaltung, Bank, Bahn, Klinik oder Hafenlogistik. Casino, Straßenoperationen und Auftragsjobs bleiben vollständig fiktive Simulationsmechaniken.
