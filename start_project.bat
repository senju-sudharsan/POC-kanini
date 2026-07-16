@echo off
title Data Engineering PoC Startup

echo ==========================================
echo      DATA ENGINEERING POC STARTUP
echo ==========================================
echo.

echo [1/3] Starting PostgreSQL Container...
docker start de_poc_postgres

echo.
echo [2/3] Starting FastAPI Backend...
start "Backend API" cmd /k "cd /d %~dp0backend && ..\.venv\Scripts\activate && uvicorn app.main:app --reload"

timeout /t 8 /nobreak > nul

echo.
echo [3/3] Starting React Frontend...
start "Frontend Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 10 /nobreak > nul

echo.
echo Opening Dashboard...
start http://localhost:5173

echo Opening API Docs...
start http://127.0.0.1:8000/docs

echo.
echo ==========================================
echo Frontend : http://localhost:5173
echo Backend  : http://127.0.0.1:8000/docs
echo ==========================================

pause