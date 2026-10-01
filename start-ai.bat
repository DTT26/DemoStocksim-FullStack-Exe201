@echo off
title StockSim - Python AI Service (Port 8000)
cd /d "%~dp0python-service"
echo ========================================================
echo   StockSim Python AI Service (FastAPI)
echo   Endpoint: http://127.0.0.1:8000
echo ========================================================
echo.

if exist "venv\Scripts\python.exe" (
    echo [INFO] Dang khoi dong bang Virtualenv...
    "venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo [INFO] Virtualenv khong ton tai, dung Python he thong...
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)

pause
