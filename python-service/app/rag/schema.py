from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

SourceType = Literal["PRIMARY", "SECONDARY", "AI_GENERATED"]

class KnowledgeDocument(BaseModel):
    id: str
    title: str
    concept: str
    framework: str # 'ICT' | 'PRICE_ACTION' | 'RISK_MANAGEMENT' | 'PSYCHOLOGY'
    content: str
    source: str
    sourceUrl: str
    author: str
    publishedDate: Optional[str] = None
    sourceType: SourceType
    tags: List[str] = []
    language: str = "vi"

class RetrievalResult(BaseModel):
    document: KnowledgeDocument
    score: float
    citationText: str

class AskQuestionRequest(BaseModel):
    question: str
    context: Optional[str] = None
    framework: Optional[str] = None # 'ICT', 'PRICE_ACTION', 'RISK_MANAGEMENT', or None
    symbol: Optional[str] = None

class ConceptExplainRequest(BaseModel):
    concept: str
    framework: Optional[str] = None

class TradeInput(BaseModel):
    tradeId: Optional[str] = "TRD-CUSTOM"
    symbol: str = "BTCUSDT"
    side: Literal["BUY", "SELL", "LONG", "SHORT"] = "BUY"
    entryPrice: float
    exitPrice: Optional[float] = None
    stopLoss: Optional[float] = None
    takeProfit: Optional[float] = None
    quantity: float = 1
    accountBalance: Optional[float] = 10000.0 # 10k USD default
    timeframe: Optional[str] = "15m"
    strategy: Optional[str] = "ICT" # 'ICT' | 'PRICE_ACTION' | 'TECHNICAL_ANALYSIS'
    setupName: Optional[str] = "Liquidity sweep + FVG"
    reason: Optional[str] = "Giá quét thanh khoản đáy phiên sáng rồi xuất hiện FVG tăng"
    entryTime: Optional[str] = None
    exitTime: Optional[str] = None
    historicalHighSinceEntry: Optional[float] = None
    historicalLowSinceEntry: Optional[float] = None

class StrategyComparisonRequest(BaseModel):
    trade: TradeInput
    strategies: List[str] = ["PRICE_ACTION", "ICT"]

class BacktestAssistantRequest(BaseModel):
    strategy: str = "FVG"
    symbol: str = "FPT"
    timeframe: Optional[str] = "15m"
    period: Optional[str] = "2024"
    entryRule: Optional[str] = None
    stopLossRule: Optional[str] = None
    takeProfitRule: Optional[str] = None
    riskPerTrade: Optional[float] = 1.0 # 1%
    maxTradesPerDay: Optional[int] = 3

class TradeInsightsRequest(BaseModel):
    trades: List[TradeInput]
