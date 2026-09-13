from fastapi import APIRouter

router = APIRouter()

@router.post("/run")
def run_simulation():
    # TODO: Member 1 - Full auto simulation for backtesting
    return {"message": "Simulation running"}
