from typing import Dict, Any
from app.rag.schema import BacktestAssistantRequest

class BacktestAssistant:
    """
    Helps students structure disciplined, bias-free backtest specifications
    before running simulations. Never fabricates backtest results.
    """

    def generate_specification(self, req: BacktestAssistantRequest) -> Dict[str, Any]:
        # Formulate strict backtest rules
        entry_rule = req.entryRule or (
            f"1. Xác định cấu trúc khung thời gian cao hơn (HTF Trend).\n"
            f"2. Chờ đợi nhịp quét thanh khoản (Liquidity Sweep) tại đỉnh/đáy phiên.\n"
            f"3. Xuất hiện nến Displacement tạo Fair Value Gap (FVG) hợp lệ.\n"
            f"4. Đặt lệnh Limit tại biên trên của Bullish FVG (hoặc biên dưới Bearish FVG)."
        )

        sl_rule = req.stopLossRule or (
            "Đặt Stop Loss ngoài phạm vi cây nến Displacement tạo FVG (cách râu nến 1-2 bước giá)."
        )

        tp_rule = req.takeProfitRule or (
            "Chốt lời tối thiểu tỷ lệ R:R 1:2 hoặc tại vùng bể thanh khoản đối diện (Old High / Old Low)."
        )

        specification = {
            "strategy": req.strategy,
            "market": req.symbol,
            "timeframe": req.timeframe or "15m",
            "period": req.period or "2024",
            "entryRule": entry_rule,
            "stopLossRule": sl_rule,
            "takeProfitRule": tp_rule,
            "riskPerTrade": f"{req.riskPerTrade or 1.0}% tổng tài khoản",
            "maxTradesPerDay": req.maxTradesPerDay or 3,
            "invalidationRule": "Nếu giá đóng cửa xuyên qua vùng FVG trước khi khớp lệnh, hủy bỏ setup."
        }

        checklist = [
            "Đã ghi nhận đủ ít nhất 30 đến 50 mẫu lệnh trước khi rút ra kết luận thống kê?",
            "Có chụp lại ảnh màn hình (Screenshot) trước và sau khi vào lệnh không?",
            "Có tuân thủ quy định nghỉ giao dịch (Cool-down) nếu dính 2 SL liên tiếp trong ngày không?",
            "Có thay đổi quy tắc giữa chừng khi gặp chuỗi lệnh thua không? (Tuyệt đối không đổi quy tắc giữa test)"
        ]

        return {
            "specification": specification,
            "checklist": checklist,
            "note": (
                "⚠️ **Nguyên tắc khoa học**: AI không tự tạo kết quả backtest giả lập. "
                "Hãy sử dụng tính năng Bar Replay trong sàn giao dịch để kiểm tra từng cây nến và ghi chép trung thực vào Trading Journal."
            )
        }

backtest_assistant = BacktestAssistant()
