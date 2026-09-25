import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from app.api.routes import market, replay, simulation, ai

app = FastAPI(title="StockSim Python Service")

app.include_router(market.router, prefix="/internal/market", tags=["Market"])
app.include_router(replay.router, prefix="/internal/replay", tags=["Replay"])
app.include_router(simulation.router, prefix="/internal/simulation", tags=["Simulation"])
app.include_router(ai.router, prefix="/internal/ai", tags=["AI Tutor & Trade Analysis"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "stocksim-python"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
