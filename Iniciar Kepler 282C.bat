@echo off
setlocal EnableExtensions

cd /d "%~dp0"
set "APP_URL=http://localhost:4321"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js no esta instalado o no esta en el PATH.
  echo Instala Node.js 24+ y vuelve a ejecutar este lanzador.
  echo.
  pause
  exit /b 1
)

call :server_ready
if not errorlevel 1 (
  start "" "%APP_URL%"
  exit /b 0
)

echo Iniciando servidor de Kepler-282C...
start "Kepler 282C Server" cmd /k "cd /d ""%~dp0"" && node server.js"

for /l %%I in (1,1,20) do (
  timeout /t 1 /nobreak >nul
  call :server_ready
  if not errorlevel 1 goto open_browser
)

echo.
echo El servidor no respondio a tiempo en %APP_URL%.
echo Revisa la ventana "Kepler 282C Server" para ver el error.
echo.
pause
exit /b 1

:open_browser
start "" "%APP_URL%"
exit /b 0

:server_ready
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing '%APP_URL%' -TimeoutSec 2 ^| Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
exit /b %errorlevel%
