from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ReplayStartRequest(BaseModel):
    simulationId: str
    studentId: str
    startDate: str
    symbols: List[str]

@router.post("/start")
def start_replay(req: ReplayStartRequest):
    # TODO: Member 1 - Initialize replay session logic
    return {"message": "Replay started", "sessionId": "mock_session_id"}

@router.post("/next")
def next_bar(sessionId: str):
    # TODO: Member 1 - Advance time by 1 bar and return the NEW price. 
    # NEVER EXPOSE FUTURE DATA IN THIS ENDPOINT.
    return {"message": "Advanced 1 bar", "currentDate": "2024-03-16", "data": {}}

@router.post("/pause")
def pause_replay(sessionId: str):
    return {"message": "Paused"}

@router.post("/resume")
def resume_replay(sessionId: str, speed: float = 1.0):
    return {"message": "Resumed"}

@router.get("/state/{sessionId}")
def get_replay_state(sessionId: str):
    return {"sessionId": sessionId, "currentDate": "2024-03-16", "status": "playing"}
