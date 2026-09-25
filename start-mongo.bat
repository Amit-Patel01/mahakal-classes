@echo off
title Mahakal Classes - MongoDB Server (No Docker)
echo ========================================================
echo   🕉️ MAHAKAL CLASSES - Local MongoDB Server Runner
echo   Mode: Native Windows MongoDB (No Docker)
echo ========================================================

set "MONGO_PATH="
if exist "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" set "MONGO_PATH=C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe"
if not defined MONGO_PATH (
  if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" set "MONGO_PATH=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
)
if not defined MONGO_PATH (
  if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" set "MONGO_PATH=C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
)
if not defined MONGO_PATH (
  where mongod >nul 2>nul
  if %ERRORLEVEL% EQU 0 set "MONGO_PATH=mongod"
)

if not defined MONGO_PATH (
  echo [ERROR] mongod.exe was not found in Program Files or system PATH!
  echo Please install MongoDB or set MongoDB Atlas URL in backend\.env
  pause
  exit /b 1
)

set "DB_PATH=%~dp0data\db"
if not exist "%DB_PATH%" (
  mkdir "%DB_PATH%"
)

echo [INFO] Using MongoDB executable: "%MONGO_PATH%"
echo [INFO] Database Storage Path:    "%DB_PATH%"
echo [INFO] Port: 27018 (Avoiding conflict with standard 27017 service)
echo [INFO] Replica Set: rs0 (Required for Prisma ORM)
echo.
echo Starting MongoDB... Leave this window open while developing.
echo.

"%MONGO_PATH%" --dbpath "%DB_PATH%" --port 27018 --replSet rs0
pause
