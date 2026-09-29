from fastapi import APIRouter, Depends, Request
from app.rag.schema import AskQuestionRequest, ConceptExplainRequest
from app.services.ai_tutor_service import ai_tutor_service
from app.api.v1.auth_deps import get_optional_user_id

router = APIRouter()

@router.post("/ask")
def ask_ai_tutor(req: AskQuestionRequest, user_id: str = Depends(get_optional_user_id)):
    """
    POST /api/v1/ai-tutor/ask
    Full AI Tutor endpoint with user authentication, subscription quota tracking,
    scoring-based intent routing, and tiered prompting.
    """
    if not req.userId:
        req.userId = user_id
    return ai_tutor_service.answer_question(req)

@router.post("/explain-concept")
def explain_concept(req: ConceptExplainRequest):
    """
    POST /api/v1/ai-tutor/explain-concept
    Explains concepts with grounded citations from the knowledge base.
    """
    return ai_tutor_service.explain_concept(req)
