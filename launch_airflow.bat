@echo off
title Airflow Startup

cd /d %~dp0airflow

docker compose up -d

echo.
echo Airflow Started
echo URL: http://localhost:8080
echo.

pause