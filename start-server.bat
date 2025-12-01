@echo off
REM Start Dungeon Revealer Server
REM This script starts the production server on port 3000

cd /d "%~dp0"

echo.
echo ========================================
echo   Dungeon Revealer Server Startup
echo ========================================
echo.
echo Starting server on port 3000...
echo DM Section: http://localhost:3000/dm
echo Player Section: http://localhost:3000
echo.

npm start

pause
