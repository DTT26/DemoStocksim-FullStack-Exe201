@echo off
title StockSim - Full Stack Launcher
echo ========================================================
echo   StockSim FullStack Launcher
echo   - Backend:        http://localhost:3000
echo   - Python Service: http://localhost:8000 (AI Tutor)
echo   - Frontend:       http://localhost:5173
echo ========================================================
echo.

echo [1/3] Khoi dong Python AI Service (Port 8000)...
start "StockSim - Python AI Service" cmd /k "cd /d "%~dp0python-service" && if exist "venv\Scripts\python.exe" ("venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload) else (python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload)"

timeout /t 3 /nobreak >nul

echo [2/3] Khoi dong Node.js Backend (Port 3000)...
start "StockSim - Backend API" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Khoi dong React Frontend (Port 5173)...
start "StockSim - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo   Tat ca 3 services da duoc mo trong 3 cua so rieng!
echo   Vui long khong tat cua so "StockSim - Python AI Service".
echo ========================================================
timeout /t 5
