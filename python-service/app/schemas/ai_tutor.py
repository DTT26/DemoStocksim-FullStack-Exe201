from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.rag.schema import AskQuestionRequest

class AiTutorResponse(BaseModel):
    success: bool
    intent: Optional[str] = None
    answer: str
    plan: str = "FREE"
    dailyAiUsed: int = 0
    dailyAiLimit: int = 10
    remainingToday: int = 10
    guardrailTriggered: Optional[str] = None
    concept: Optional[str] = None
    framework: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None
    socraticQuestions: Optional[List[str]] = None
    matchedTags: Optional[List[str]] = None
