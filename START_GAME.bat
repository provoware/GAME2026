@echo off
setlocal
set "GAME=%~dp0web\index.html"
if not exist "%GAME%" (
  echo FEHLER: web\index.html fehlt.
  pause
  exit /b 1
)
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" start "" "%CHROME%" --new-window "%GAME%" & exit /b 0
set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" start "" "%CHROME%" --new-window "%GAME%" & exit /b 0
start "" "%GAME%"
