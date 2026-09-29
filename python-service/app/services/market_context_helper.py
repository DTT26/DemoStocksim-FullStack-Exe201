import re
from typing import Dict, Any, List, Optional, Tuple

# ==========================================
# 1. BẢNG MÃ & TỪ KHÓA ĐỒNG NGHĨA (SYMBOL ALIASES)
# ==========================================
SYMBOL_ALIASES: Dict[str, List[str]] = {
    "XAUUSD": ["XAUUSD", "VÀNG", "GOLD", " XAU "],
    "XAGUSD": ["XAGUSD", "BẠC", "SILVER"],
    "USOIL": ["USOIL", "DẦU", " OIL ", "WTI", "DẦU THÔ"],
    "BRENT": ["BRENT", "DẦU BRENT", "BRENT OIL"],
    "NGAS": ["NGAS", "KHÍ TỰ NHIÊN", "NATURAL GAS", " GAS "],
    "COPPER": ["COPPER", "ĐỒNG"],
    "PLATINUM": ["PLATINUM", "BẠCH KIM"],
    "DXY": ["DXY", "DOLLAR INDEX", "SỨC MẠNH USD", "CHỈ SỐ USD"],
    "BTCUSDT": ["BTCUSDT", " BTC ", "BITCOIN"],
    "ETHUSDT": ["ETHUSDT", " ETH ", "ETHEREUM"],
    "BNBUSDT": ["BNBUSDT", " BNB "],
    "SOLUSDT": ["SOLUSDT", " SOL ", "SOLANA"],
    "XRPUSDT": ["XRPUSDT", " XRP ", "RIPPLE"],
    "DOGEUSDT": ["DOGEUSDT", " DOGE ", "DOGECOIN"],
    "SUIUSDT": ["SUIUSDT", " SUI "],
    "NEARUSDT": ["NEARUSDT", " NEAR "],
    "AVAXUSDT": ["AVAXUSDT", " AVAX "],
    "APTUSDT": ["APTUSDT", " APT "],
    "ARBUSDT": ["ARBUSDT", " ARB ", "ARBITRUM"],
    "OPUSDT": ["OPUSDT", " OP ", "OPTIMISM"],
    "TIAUSDT": ["TIAUSDT", " TIA ", "CELESTIA"],
    "TONUSDT": ["TONUSDT", " TON ", "TONCOIN"],
    "INJUSDT": ["INJUSDT", " INJ ", "INJECTIVE"],
    "EURUSD": ["EURUSD", "EUR/USD", "EURO"],
    "GBPUSD": ["GBPUSD", "GBP/USD", "BẢNG ANH"],
    "USDJPY": ["USDJPY", "USD/JPY", "YEN NHẬT"],
    "GBPJPY": ["GBPJPY", "GBP/JPY", "GUPPY"],
    "EURJPY": ["EURJPY", "EUR/JPY"],
    "AUDUSD": ["AUDUSD", "AUD/USD", "ĐÔ LA ÚC"],
    "USDCAD": ["USDCAD", "USD/CAD"],
    "USDCHF": ["USDCHF", "USD/CHF"],
    "AAPL": ["AAPL", "APPLE"],
    "MSFT": ["MSFT", "MICROSOFT"],
    "TSLA": ["TSLA", "TESLA"],
    "NVDA": ["NVDA", "NVIDIA"],
    "GOOGL": ["GOOGL", "GOOGLE", "ALPHABET"],
    "AMZN": ["AMZN", "AMAZON"],
    "META": ["META", "FACEBOOK"],
    "AMD": ["AMD"],
    "COIN": ["COIN", "COINBASE"],
    "SPX": ["SPX", "S&P 500", "S&P500"],
    "NDX": ["NDX", "NASDAQ", "NASDAQ 100"],
    "DJI": ["DJI", "DOW JONES", "DOW 30"],
    "JP225": ["JP225", "NIKKEI", "NIKKEI 225"],
}

# ==========================================
# 2. SIGNAL GUARDRAIL KEYWORDS (CHỐNG PHÍM LỆNH & PROMPT INJECTION)
# ==========================================
STRICT_SIGNAL_PATTERNS = [
    r"phím\s*(hàng|kèo|lệnh)",
    r"cho\s*(kèo|lệnh|tín hiệu)\s*(ăn|chắc|đi)",
    r"mua\s*hay\s*bán\s*(ngay|luôn|bây giờ)",
    r"buy\s*hay\s*sell\s*(ngay|luôn|bây giờ)",
    r"bấm\s*(buy|sell|long|short)\s*(được chưa|chưa)",
    r"bỏ\s*qua\s*(mọi\s*quy\s*tắc|hướng dẫn).*phím",
    r"give\s*me\s*a\s*(buy|sell)\s*signal",
    r"should\s*i\s*(buy|sell)\s*now",
    r"buy\s*or\s*sell\s*now"
]

def check_strict_signal_guardrail(query: str, symbol: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Kiểm tra và ngăn chặn các yêu cầu phím kèo / tín hiệu tài chính tuyệt đối (Prompt Injection).
    """
    lower = query.lower()
    for pattern in STRICT_SIGNAL_PATTERNS:
        if re.search(pattern, lower):
            target = symbol or "mã này"
            return {
                "answer": (
                    f"⚠️ **Nguyên tắc hệ thống**: AI hoạt động như một Trợ lý Giáo dục & Phân tích Độc lập, "
                    f"tuyệt đối không đưa ra khuyến nghị Mua (Buy) / Bán (Sell) hay phím lệnh giao dịch trực tiếp cho {target}.\n\n"
                    f"Thay vào đó, tôi có thể hỗ trợ bạn bóc tách các yếu tố kỹ thuật (HTF Context, Liquidity Sweep, FVG/OB) "
                    f"để bạn tự thẩm định và đưa ra quyết định độc lập."
                ),
                "reasoning": "Quyết định vào lệnh phải do chính trader chịu trách nhiệm dựa trên kế hoạch và tỷ lệ rủi ro định trước.",
                "sources": [],
                "socraticQuestions": [
                    "Bạn đã xác định được điểm dừng lỗ (Invalidation level) nếu thị trường đi ngược lại chưa?",
                    "Tỷ lệ Risk:Reward (R:R) tối thiểu trong kế hoạch của bạn là bao nhiêu?"
                ],
                "guardrailTriggered": "NO_BUY_SELL_SIGNAL"
            }
    return None

# ==========================================
# 3. LỌC BẢNG GIÁ THÔNG MINH (CHỐNG TRÀN TOKEN & ĐỘ TRỄ)
# ==========================================
def extract_relevant_stocks(
    query: str,
    chat_history: Optional[List[Dict[str, Any]]] = None,
    active_symbol: Optional[str] = None,
    all_stocks: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Lọc chỉ lấy tối đa 3-5 mã liên quan trực tiếp đến câu hỏi hoặc biểu đồ người dùng đang xem.
    Giúp giảm 90% số lượng token nạp vào LLM Context.
    """
    if not all_stocks:
        return []

    needed_symbols = set()

    # 1. Luôn thêm mã đang mở trên biểu đồ
    if active_symbol:
        clean_active = active_symbol.upper().replace(".P", "").replace(".SWAP", "")
        needed_symbols.add(clean_active)
        needed_symbols.add(active_symbol)

    # 2. Quét câu hỏi hiện tại và lịch sử gần nhất để tìm mã được nhắc tới
    search_corpus = query.upper()
    if chat_history and len(chat_history) > 0:
        for turn in chat_history[-3:]:
            search_corpus += " " + str(turn.get("text", "")).upper()

    for sym, aliases in SYMBOL_ALIASES.items():
        if any(f" {a.strip()} " in f" {search_corpus} " for a in aliases):
            needed_symbols.add(sym)

    # 3. Nếu người dùng hỏi tổng quan thị trường ("thị trường chung", "bảng giá"):
    # Thêm 4 mã tiêu chuẩn đại diện: BTCUSDT, XAUUSD, SPX, DXY
    general_market_keywords = ["thị trường", "tổng quan", "bảng giá", "market", "overview"]
    if any(kw in query.lower() for kw in general_market_keywords) and len(needed_symbols) <= 1:
        needed_symbols.update(["BTCUSDT", "XAUUSD", "SPX", "DXY"])

    # 4. Trích xuất từ all_stocks (giới hạn tối đa 5 mã)
    filtered = []
    for s in all_stocks:
        sym = s.get("symbol", "")
        clean_s = sym.upper().replace(".P", "").replace(".SWAP", "")
        if sym in needed_symbols or clean_s in needed_symbols:
            filtered.append(s)
            if len(filtered) >= 5:
                break

    return filtered

# ==========================================
# 4. HỆ THỐNG 21 PHƯƠNG PHÁP GIAO DỊCH (SẴN SÀNG SCALE LÊN 50 PHƯƠNG PHÁP)
# ==========================================
from app.services.trading_methods_registry import (
    TRADING_METHODS_REGISTRY,
    route_query_to_method,
    list_all_method_names,
    TradingMethod
)

def get_all_methods_overview() -> str:
    """
    Trả về danh sách tổng quan 50 phương pháp giao dịch chuyên sâu của hệ thống.
    """
    lines = ["DANH MỤC 50 PHƯƠNG PHÁP GIAO DỊCH CHUYÊN SÂU CỦA HỆ THỐNG:"]
    for mid in sorted(TRADING_METHODS_REGISTRY.keys()):
        m = TRADING_METHODS_REGISTRY[mid]
        lines.append(f"{m.id}. {m.name}")
    return "\n".join(lines)

def classify_user_intent(query: str, has_positions: bool = False) -> Tuple[str, str]:
    """
    Tự động phân loại câu hỏi vào đúng 1 trong 21 phương pháp trong Registry
    và trả về mã code cùng toàn bộ chỉ dẫn phân tích kỹ thuật chi tiết của phương pháp đó.
    """
    active_method: TradingMethod = route_query_to_method(query, has_positions=has_positions)
    return active_method.code, active_method.to_prompt_text()
