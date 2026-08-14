@echo off
setlocal
set "GAME=%~dp0web\index.html"
if not exist "%GAME%" (
  echo FEHLER: web\index.html fehlt.
  pause
  exit /b 1
)
start "" "%GAME%"
