@echo off

echo ========================================
echo Data Engineering PoC Health Check
echo ========================================
echo.

echo Checking Docker...
docker ps

echo.
echo Checking Backend...
curl http://127.0.0.1:8000/docs

echo.
echo Checking Frontend...
echo Open:
echo http://localhost:5173

echo.
pause