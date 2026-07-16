@echo off
title Data Engineering PoC Shutdown

echo ==========================================
echo      STOPPING DATA ENGINEERING POC
echo ==========================================
echo.

echo Stopping Docker Container...
docker stop de_poc_postgres

echo.
echo Please close:
echo - Backend API window
echo - Frontend Dashboard window

echo.
echo Project stopped.
pause