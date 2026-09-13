from fastapi import APIRouter

router = APIRouter()

@router.post("/load")
def load_market_data():
    # TODO: Member 1 - Implement logic to load external market data (e.g. from Vnstock or CSV)
    return {"message": "Market data load initiated"}
