"""
PROP FIRM RISK TOOL & POSITION SIZING CALCULATOR
Công cụ tính toán rủi ro toán học và phát hiện nguy cơ vi phạm quỹ (Hard Breach) tự động.
"""

import re
from typing import Dict, Any, Optional, Tuple

def parse_number_token(token: str) -> Optional[float]:
    """Chuyển đổi token số như '64k', '63.2k', '2,700', '2700.5' sang float."""
    clean = token.lower().strip().replace(',', '')
    if clean.endswith('k'):
        try:
            return float(clean[:-1]) * 1000
        except ValueError:
            return None
    try:
        return float(clean)
    except ValueError:
        return None

def extract_trade_intent(query: str, active_symbol: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Trích xuất các thông số lệnh từ câu hỏi của học viên:
    Ví dụ: 'Tao chuẩn bị Long BTC ở 64k, SL 63.2k, gõ 2 lot nhé'
    """
    lower = query.lower()

    # 1. Xác định Side
    side = None
    if any(k in lower for k in ["long", "buy", "mua"]):
        side = "LONG"
    elif any(k in lower for k in ["short", "sell", "bán"]):
        side = "SHORT"

    if not side:
        return None

    # 2. Xác định Symbol
    symbol = active_symbol or "BTCUSDT"
    if "btc" in lower or "bitcoin" in lower:
        symbol = "BTCUSDT"
    elif "eth" in lower or "ethereum" in lower:
        symbol = "ETHUSDT"
    elif "xau" in lower or "vàng" in lower or "gold" in lower:
        symbol = "XAUUSD"
    elif "dầu" in lower or "oil" in lower or "usoil" in lower:
        symbol = "USOIL"

    # 3. Trích xuất Entry
    entry = None
    # Mẫu: ở 64k, tại 64k, giá 64000, entry 64k
    entry_match = re.search(r'(?:ở|tại|giá|entry|vào)\s*(\$?[0-9]+(?:\.[0-9]+)?k?)', lower)
    if entry_match:
        entry = parse_number_token(entry_match.group(1).replace('$', ''))

    # 4. Trích xuất Stop Loss (SL)
    sl = None
    # Mẫu: sl 63.2k, stop loss 63200, cắt lỗ 63.2k, sl ở 63k
    sl_match = re.search(r'(?:sl|stop\s*loss|cắt\s*lỗ|dung\s*lo)(?:\s*(?:ở|tại|là|:))?\s*(\$?[0-9]+(?:\.[0-9]+)?k?)', lower)
    if sl_match:
        sl = parse_number_token(sl_match.group(1).replace('$', ''))

    # 5. Trích xuất Khối lượng (Lot / Quantity / Size)
    volume = None
    # Mẫu: 2 lot, gõ 2 lot, đi 2 lot, volume 2, khối lượng 2, 2 btc, gõ 2 nhé
    vol_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:lot|lots|btc|eth|oz|lượng|cổ|hd)', lower)
    if not vol_match:
        vol_match = re.search(r'(?:gõ|đi|vào|đánh|size|khối lượng|volume)\s*([0-9]+(?:\.[0-9]+)?)', lower)
    if vol_match:
        try:
            volume = float(vol_match.group(1))
        except ValueError:
            volume = None

    if entry is not None and sl is not None and volume is not None:
        return {
            "side": side,
            "symbol": symbol,
            "entry": entry,
            "sl": sl,
            "volume": volume
        }
    return None

def evaluate_prop_firm_risk(trade_info: Dict[str, Any], user_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Tính toán chính xác rủi ro số học và kiểm tra vi phạm luật quỹ Prop Firm (Max Daily Drawdown & Overall Drawdown).
    """
    entry = trade_info["entry"]
    sl = trade_info["sl"]
    volume = trade_info["volume"]
    symbol = trade_info["symbol"].upper()
    side = trade_info["side"]

    sl_distance = abs(entry - sl)
    if sl_distance == 0:
        return {"has_error": True, "message": "Khoảng cách Stop Loss không thể bằng 0"}

    # Hệ số quy đổi hợp đồng chuẩn (Contract Multiplier)
    contract_multiplier = 1.0
    if "XAU" in symbol or "GOLD" in symbol:
        contract_multiplier = 100.0 # 1 standard lot vàng = 100 oz (1 giá di chuyển = $100 / lot)
    elif any(f in symbol for f in ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"]):
        contract_multiplier = 100000.0 # 1 standard lot forex = 100,000 units
    elif "BTC" in symbol:
        contract_multiplier = 1.0 # 1 lot BTC = 1 BTC

    potential_loss = volume * sl_distance * (contract_multiplier if "XAU" in symbol else 1.0)
    
    # Đọc dữ liệu tài khoản và quỹ từ Database học viên
    capital = 50000.0
    current_balance = 48500.0
    daily_loss_current = 2000.0
    daily_loss_limit = 2500.0 # 5% của 50k
    has_active_challenge = False

    if user_data:
        challenge = user_data.get("challenge")
        if challenge and challenge.get("status") in ["ACTIVE", "PAUSED"]:
            has_active_challenge = True
            capital = float(challenge.get("capital") or 50000.0)
            current_balance = float(challenge.get("currentBalance") or challenge.get("capital") or 50000.0)
            daily_loss_current = float(challenge.get("dailyLoss") or 0.0)
            daily_loss_limit = capital * 0.05 # Luật chuẩn 5%
        else:
            wallet = user_data.get("wallet", {})
            current_balance = float(wallet.get("balance") or 10000.0)
            capital = current_balance
            daily_loss_limit = capital * 0.05
            daily_loss_current = 0.0

    remaining_daily_drawdown = max(0.0, daily_loss_limit - daily_loss_current)
    if remaining_daily_drawdown <= 0:
        remaining_daily_drawdown = 500.0 # Mặc định an toàn nếu đã cạn limit

    is_hard_breach = potential_loss > remaining_daily_drawdown
    
    # Tính khối lượng tối đa an toàn (Max safe lot size)
    unit_loss = sl_distance * (contract_multiplier if "XAU" in symbol else 1.0)
    max_safe_lot = round(remaining_daily_drawdown / unit_loss, 2) if unit_loss > 0 else 0.01
    recommended_1pct_lot = round((capital * 0.01) / unit_loss, 2) if unit_loss > 0 else 0.01

    formatted_warning = ""
    if is_hard_breach:
        formatted_warning = (
            f"🔴 **CẢNH BÁO VI PHẠM LUẬT QUỸ (HARD BREACH RISK)**\n\n"
            f"> ⚠️ **NGUY CƠ TRƯỢT QUỸ NGAY LẬP TỨC NẾU DÍNH STOP LOSS!**\n\n"
            f"• **Thông số lệnh dự tính**: {side} {volume} Lot {symbol} tại ${entry:,.2f} | SL: ${sl:,.2f} (Khoảng cách: {sl_distance:,.2f} giá).\n"
            f"• **Mức thua lỗ nếu chạm SL**: **-${potential_loss:,.2f}**.\n"
            f"• **Hạn mức Daily Drawdown còn lại hôm nay**: **${remaining_daily_drawdown:,.2f}** (Vốn quỹ: ${capital:,.0f} | Đã lỗ trong ngày: ${daily_loss_current:,.2f}).\n"
            f"• 🚨 **Khoản lỗ tiềm năng (${potential_loss:,.2f}) VƯỢT TRẦN cho phép (${remaining_daily_drawdown:,.2f})**.\n\n"
            f"👉 **Khối lượng tối đa cho phép vào**: Không được vượt quá **{max_safe_lot:.2f} Lot**.\n"
            f"👉 **Khối lượng chuẩn kỷ luật 1% rủi ro**: Nên đi **{recommended_1pct_lot:.2f} Lot** (Mất tối đa ${capital * 0.01:,.2f})."
        )
    else:
        formatted_warning = (
            f"🟢 **THẨM ĐỊNH RỦI RO LỆNH QUỸ (RISK CALCULATOR)**\n\n"
            f"• **Thông số lệnh**: {side} {volume} Lot {symbol} tại ${entry:,.2f} | SL: ${sl:,.2f} (Khoảng cách: {sl_distance:,.2f} giá).\n"
            f"• **Mức thua lỗ nếu chạm SL**: **-${potential_loss:,.2f}** (Chiếm {(potential_loss / capital) * 100:.2f}% tổng vốn quỹ).\n"
            f"• **Hạn mức Daily Drawdown còn lại**: **${remaining_daily_drawdown:,.2f}** (Trạng thái: An toàn trong ngưỡng).\n"
            f"• 🛡️ **Khối lượng khuyến nghị chuẩn 1%**: **{recommended_1pct_lot:.2f} Lot**."
        )

    return {
        "symbol": symbol,
        "side": side,
        "is_hard_breach": is_hard_breach,
        "entry": entry,
        "sl": sl,
        "volume": volume,
        "sl_distance": sl_distance,
        "potential_loss": potential_loss,
        "estimated_loss": potential_loss,
        "remaining_daily_drawdown": remaining_daily_drawdown,
        "remaining_daily_loss": remaining_daily_drawdown,
        "max_safe_lot": max_safe_lot,
        "recommended_1pct_lot": recommended_1pct_lot,
        "formatted_warning": formatted_warning,
        "alert_markdown": formatted_warning,
        "account_balance": current_balance,
        "capital": capital,
        "daily_loss_current": daily_loss_current
    }
