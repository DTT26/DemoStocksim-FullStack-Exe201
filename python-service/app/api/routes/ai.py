from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.rag.schema import (
    AskQuestionRequest,
    ConceptExplainRequest,
    TradeInput,
    StudentReflectionRequest,
    StrategyComparisonRequest,
    BacktestAssistantRequest,
    TradeInsightsRequest
)
from app.services.ai_tutor_service import ai_tutor_service
from app.services.trade_analyzer import trade_analyzer
from app.services.strategy_comparator import strategy_comparator
from app.services.journal_pattern_detector import journal_pattern_detector
from app.services.backtest_assistant import backtest_assistant
from app.rag.vector_store import vector_store

router = APIRouter()

@router.post("/ask")
def ask_question(req: AskQuestionRequest):
    return ai_tutor_service.answer_question(req)

@router.post("/explain-concept")
def explain_concept(req: ConceptExplainRequest):
    return ai_tutor_service.explain_concept(req)

@router.post("/analyze-trade")
def analyze_trade(req: TradeInput):
    return trade_analyzer.analyze(req)

@router.post("/review-trade")
def review_trade(req: TradeInput):
    # Review trade produces the comprehensive report
    return trade_analyzer.analyze(req)

@router.post("/submit-reflection")
def submit_reflection(req: StudentReflectionRequest):
    return trade_analyzer.evaluate_reflection(
        trade=req.trade,
        question=req.question or "Nếu thực hiện lại trade này, bạn sẽ thay đổi điều gì?",
        reflection_text=req.reflectionText
    )

@router.post("/compare-strategies")
def compare_strategies(req: StrategyComparisonRequest):
    return strategy_comparator.compare(req.trade)

@router.post("/backtest-assistant")
def backtest_assist(req: BacktestAssistantRequest):
    return backtest_assistant.generate_specification(req)

@router.post("/trade-insights")
def trade_insights(req: TradeInsightsRequest):
    return journal_pattern_detector.analyze_patterns(req.trades)

@router.get("/sources")
def get_sources():
    """Return all verified knowledge documents currently indexed in vector store"""
    sources = []
    for doc in vector_store.documents:
        sources.append({
            "id": doc.id,
            "title": doc.title,
            "concept": doc.concept,
            "framework": doc.framework,
            "source": doc.source,
            "sourceUrl": doc.sourceUrl,
            "author": doc.author,
            "sourceType": doc.sourceType,
            "tags": doc.tags
        })
    return {"count": len(sources), "sources": sources}

@router.get("/learning-progress")
def get_learning_progress():
    # Return default baseline progress for concept mastery
    return {
        "conceptMastery": {
            "Market Structure": 78,
            "Liquidity (BSL / SSL)": 65,
            "Fair Value Gap (FVG)": 72,
            "Risk Management (1-2% Rule)": 88,
            "Trading Psychology & Discipline": 60
        },
        "completedReviews": 12,
        "primaryFocus": "Giảm thiểu vào lệnh sớm (Early Entry) và duy trì tỷ lệ R:R >= 1:1.5"
    }
