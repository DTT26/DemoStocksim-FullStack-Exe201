from fastapi import FastAPI
from app.api.routes import market, replay, simulation

app = FastAPI(title="StockSim Python Service")

app.include_router(market.router, prefix="/internal/market", tags=["Market"])
app.include_router(replay.router, prefix="/internal/replay", tags=["Replay"])
app.include_router(simulation.router, prefix="/internal/simulation", tags=["Simulation"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "stocksim-python"}
