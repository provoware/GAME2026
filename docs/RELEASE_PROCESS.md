# Release- und Paketprozess

## 1. Versionsmodell

Aktuell wird ein semantisch angelehntes Schema verwendet:

```text
MAJOR.MINOR.PATCH-entwicklungskennung
```

Beispiel:

```text
0.2.0-mission-iteration-b
```

## 2. Releasekandidat

Vor einem Releasekandidaten müssen:

- alle vorgesehenen Fachphasen mindestens `INTEGRATED` sein;
- alle P0-Prüfungen bestehen;
- Save-Migrationen dokumentiert sein;
- Changelog und Projektstatus aktuell sein;
- offene kritische Fehler geschlossen sein;
- Manifest neu erzeugt sein.

## 3. Lokale Freigabe

```bash
./verify.sh
./test.sh
./package.sh
```

Anschließend ZIP entpacken und Start aus einem frischen Verzeichnis prüfen.

## 4. GitHub-Freigabe

1. Releasebranch oder stabilen Hauptbranch prüfen.
2. Versionsnummer in Manifest-Generator und Changelog angleichen.
3. Tag erstellen.
4. ZIP als Releaseartefakt anhängen.
5. bekannte Einschränkungen in Release Notes nennen.

## 5. Save-Kompatibilität

Jede Releasebeschreibung nennt:

- aktuelle Save-Version;
- unterstützte Ausgangsversionen;
- automatische Migrationen;
- nicht migrierbare Änderungen;
- Backupempfehlung.

## 6. Rücknahme

Ein Release wird zurückgezogen oder ersetzt, wenn:

- Speicherstände beschädigt werden;
- Ressourcen dupliziert oder verloren werden;
- private Spielereingaben falsch sichtbar werden;
- das Projekt auf unterstützten Systemen nicht startet;
- zentrale Missionen unerreichbar sind.
