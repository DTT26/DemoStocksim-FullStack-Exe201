# Stock Market Simulation Platform (StockSim)

This is an educational stock-market simulation platform designed for students to practice stock investing using virtual money and historical stock-market data.

## Project Structure
- `frontend/`: React + Vite + TypeScript application for the user interface (Port 5173).
- `backend/`: Node.js + Express + TypeScript API handling authentication, portfolio, wallet (Port 3000).
- `python-service/`: Python FastAPI service handling AI Tutor, RAG, Strategy, PayOS (Port 8000).

## Cách chạy dự án (Tránh lỗi kết nối AI cổng 8000)

Hệ thống cần cả 3 dịch vụ cùng chạy:

### Cách 1: Chạy tự động (Khuyên dùng trên Windows)
- Nhấp đúp vào file `start-all.bat` ở thư mục gốc để tự động mở cả 3 dịch vụ trong 3 cửa sổ terminal riêng biệt.
- Hoặc nếu chỉ muốn bật riêng AI service: Nhấp đúp vào `start-ai.bat`.

### Cách 2: Chạy thủ công từng Terminal
1. **Python AI Service (Cổng 8000)**:
   ```bash
   cd python-service
   .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Backend (Cổng 3000)**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Frontend (Cổng 5173)**:
   ```bash
   cd frontend
   npm run dev
   ```

## Important Note
This system is strictly for educational simulation and does NOT support real-money trading, real broker connections, or live exchange order matching.

