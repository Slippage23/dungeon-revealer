@echo off
set DM_PASSWORD=admin
cd /d C:\Temp\git\dungeon-revealer
start "Backend" cmd /k "npm run start:server:dev"
timeout /t 3
start "Frontend" cmd /k "npm run start:frontend:dev"
echo Servers starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4000
echo DM Password: admin
