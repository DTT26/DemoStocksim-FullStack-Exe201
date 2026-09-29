import re
import unicodedata
from typing import Dict, Any, List, Tuple

def strip_accents(text: str) -> str:
    """
    Normalizes Vietnamese text:
    - Lowercase
    - Removes Vietnamese accents / diacritics
    - Trims whitespace
    - Normalizes multiple spaces to a single space
    """
    if not text:
        return ""
    text = text.lower().strip()
    # Normalize unicode to decomposed form (NFD)
    nfkd_form = unicodedata.normalize('NFKD', text)
    # Remove all combining diacritical marks
    no_accents = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    # Specific Vietnamese characters like đ -> d
    no_accents = no_accents.replace('đ', 'd').replace('Đ', 'd')
    # Collapse multiple whitespaces
    normalized = re.sub(r'\s+', ' ', no_accents).strip()
    return normalized

# Tag definitions for High-Level Question Types (NOT the 50 trading methods)
INTENT_TAGS: Dict[str, List[str]] = {
    "LIQUIDITY_ANALYSIS": [
        "buy side liquidity", "sell side liquidity", "external range liquidity",
        "internal range liquidity", "liquidity sweep", "quet thanh khoan",
        "lay thanh khoan", "vung thanh khoan", "thanh khoan", "liquidity",
        "bsl", "ssl", "erl", "irl", "sweep", "pool"
    ],
    "MARKET_STRUCTURE": [
        "market structure", "cau truc thi truong", "change of character",
        "market structure shift", "break of structure", "pha vo cau truc",
        "dao chieu xu huong", "choch", "mss", "bos", "higher high", "higher low",
        "lower high", "lower low", "dinh day", "xu huong thi truong"
    ],
    "FVG_ORDER_BLOCK": [
        "fair value gap", "order block", "khoi lenh", "khoang trong gia",
        "mitigate", "mitigation", "fvg", "ob", "breaker block", "rejection block",
        "khoi order block", "gap gia", "imbalance", "mat can bang"
    ],
    "MULTI_TIMEFRAME": [
        "multi timeframe", "da khung thoi gian", "khung lon khung nho",
        "htf to ltf", "htf", "mtf", "ltf", "khung h4", "khung d1",
        "khung h1", "khung m15", "khung m5", "khung m1", "dong pha khung"
    ],
    "POSITION_SIZING": [
        "position sizing", "tinh khoi luong", "khoi luong vao lenh",
        "tinh lot", "bao nhieu lot", "lot size", "size lenh", "di bao nhieu lot",
        "quan ly khoi luong", "lot"
    ],
    "RISK_MANAGEMENT": [
        "risk management", "quan tri rui ro", "quan ly rui ro", "hard breach",
        "vi pham quy", "daily drawdown", "max loss", "lo toi da", "ti le rui ro",
        "quy tac 1%", "quy tac 2%", "1% rui ro", "2% rui ro", "drawdown",
        "risk per trade", "muc rui ro"
    ],
    "ENTRY_ANALYSIS": [
        "diem vao lenh", "entry context", "optimal trade entry", "xac nhan entry",
        "trigger vao lenh", "tin hieu vao", "tim entry", "ote", "entry",
        "vung mua", "vung ban", "mo vi the", "vao lenh o dau"
    ],
    "EXIT_ANALYSIS": [
        "diem chot loi", "diem dung lo", "take profit", "stop loss",
        "target o dau", "chot loi o dau", "sl o dau", "tp o dau",
        "keo sl", "trailing stop", "dong vi the", "exit"
    ],
    "TRADE_IDEA_ANALYSIS": [
        "ke hoach giao dich", "trade setup", "trade idea", "y tuong giao dich",
        "kich ban giao dich", "setup nay", "phan tich setup", "y tuong trade",
        "ke hoach vao lenh"
    ],
    "EXISTING_POSITION_REVIEW": [
        "vi the dang mo", "lenh dang chay", "dang hold", "dang giu lenh",
        "co nen cat lo", "co nen giu tiep", "vi the hien tai", "lenh hien tai",
        "xu ly vi the", "dang bi am", "dang co lai", "go vi the"
    ],
    "TRADE_MANAGEMENT": [
        "quan ly lenh", "trade management", "dinh doan vi the", "chot loi tung phan",
        "partial tp", "breakeven", "hoa von", "doi stop loss", "quan tri vi the"
    ],
    "PRICE_ACTION": [
        "price action", "hanh dong gia", "nen rut rau", "pinbar", "engulfing",
        "nen nhan chim", "inside bar", "mo hinh nen", "khang cu ho tro",
        "supply demand", "cung cau"
    ],
    "ICT_SMC_CONCEPT": [
        "smart money concepts", "inner circle trader", "dong tien thong minh",
        "killzone", "judas swing", "silver bullet", "power of 3", "amd",
        "macro time", "ict", "smc", "smart money"
    ],
    "TRADE_JOURNAL": [
        "nhat ky giao dich", "trade journal", "ghi chep lenh", "lich su giao dich",
        "thong ke lenh", "danh gia sai lam", "loi tam ly", "fomo", "revenge trade"
    ],
    "BACKTEST_HISTORICAL": [
        "backtest", "du lieu qua khu", "lich su gia", "kiem chung chien luoc",
        "thong ke backtest", "test lai", "du lieu lich su"
    ],
    "BAR_REPLAY": [
        "bar replay", "che do replay", "tua lai nen", "phat lai nen",
        "replay bieu do", "mo phong qua khu"
    ],
    "SETUP_COMPARISON": [
        "so sanh setup", "setup nao tot hon", "so sanh chien luoc", "compare strategy",
        "lua chon setup", "khac biet giua"
    ],
    "LEARNING_EDUCATIONAL": [
        "giai thich", "khai niem", "la gi", "dinh nghia", "huong dan",
        "hoc trade", "tai sao lai", "nguyen ly", "y nghia cua"
    ],
    "NO_TRADE": [
        "dung ngoai quan sat", "co nen vao khong", "khi nao khong nen trade",
        "thi truong xau", "khong ro rang", "cho xac nhan", "wait for confirmation",
        "no trade"
    ],
    "MARKET_ANALYSIS": [
        "phan tich thi truong", "xu huong hien tai", "thi truong the nao",
        "nhan dinh", "goc nhin", "tong quan", "dien bien gia", "bien dong"
    ]
}

def route_question_intent(question: str) -> Dict[str, Any]:
    """
    Scoring-based question intent router:
    - Normalizes question using strip_accents
    - Matches tags using word boundaries \\b
    - Scores each tag match by len(tag) ** 1.5 (longer specific phrases beat generic keywords)
    - Returns structured result with intent, confidence, matchedTags, and scores
    """
    normalized_q = strip_accents(question)
    
    if not normalized_q:
        return {
            "intent": "GENERAL_TRADING",
            "confidence": 0.0,
            "matchedTags": [],
            "scores": {}
        }

    scores: Dict[str, float] = {}
    matched_tags_by_intent: Dict[str, List[str]] = {}

    for intent, tags in INTENT_TAGS.items():
        intent_score = 0.0
        matched = []
        for tag in tags:
            tag_norm = strip_accents(tag)
            # Use regex word boundaries to avoid substring false positives
            pattern = rf"\b{re.escape(tag_norm)}\b"
            if re.search(pattern, normalized_q):
                # Weight: longer phrases earn exponentially more points
                weight = len(tag_norm) ** 1.5
                intent_score += weight
                matched.append(tag)
        
        if intent_score > 0:
            scores[intent] = round(intent_score, 2)
            matched_tags_by_intent[intent] = matched

    if not scores:
        return {
            "intent": "GENERAL_TRADING",
            "confidence": 0.5,
            "matchedTags": [],
            "scores": {}
        }

    # Sort intents by score descending
    sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_intent, best_score = sorted_intents[0]
    total_score = sum(scores.values())

    # Confidence calculation: ratio of best score to total score, bounded
    confidence = round(min(0.99, max(0.55, best_score / total_score if total_score > 0 else 0.5)), 2)

    return {
        "intent": best_intent,
        "confidence": confidence,
        "matchedTags": matched_tags_by_intent.get(best_intent, []),
        "scores": scores
    }
