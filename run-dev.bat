@echo off
title Mahakal Classes - Full-Stack Launcher (No Docker)
echo ========================================================
echo   🕉️ MAHAKAL CLASSES - Development Environment
echo   No Docker Required - Native MongoDB & Node.js
echo ========================================================
echo.
echo Starting Backend API (Port 5000)...
start "Mahakal Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 2 >nul

echo Starting Next.js Web App (Port 3000)...
start "Mahakal Web Portal (Port 3000)" cmd /k "cd /d "%~dp0web" && npm run dev"

echo.
echo ========================================================
echo   Services are launching in separate windows!
echo   - Backend REST API: http://localhost:5000/api/v1
echo   - Web Application:  http://localhost:3000
echo ========================================================
echo.
pause
