from typing import Dict, Any
from app.rag.schema import BacktestAssistantRequest

class BacktestAssistant:
    """
    Helps students structure disciplined, bias-free backtest specifications
    before running simulations. Never fabricates backtest results.
    """

    def generate_specification(self, req: BacktestAssistantRequest) -> Dict[str, Any]:
        strat = (req.strategy or "").lower()

        if "order block" in strat or "mss" in strat:
            entry_rule = req.entryRule or (
                "1. Xác định xu hướng khung lớn (HTF Bias) và đánh dấu đỉnh/đáy quan trọng.\n"
                "2. Chờ giá phá vỡ cấu trúc thị trường (Market Structure Shift - MSS) tạo đỉnh cao hơn hoặc đáy thấp hơn.\n"
                "3. Xác định khối Order Block (cây nến ngược chiều cuối cùng trước cú đẩy mạnh).\n"
                "4. Đặt lệnh Limit tại vùng mở cửa (Open) hoặc 50% Mean Threshold của khối Order Block."
            )
            sl_rule = req.stopLossRule or "Đặt Stop Loss cách râu nến xa nhất của Order Block 1-2 bước giá."
            tp_rule = req.takeProfitRule or "Chốt lời tại Bể thanh khoản (BSL/SSL) kế tiếp, tỷ lệ R:R kỳ vọng tối thiểu 1:2.5 đến 1:3.5."
            invalidation_rule = "Nếu giá đóng cửa (nến thân) vượt quá biên ngoài của Order Block, setup bị vô hiệu."
        elif "breakout" in strat or "retest" in strat:
            entry_rule = req.entryRule or (
                "1. Xác định ngưỡng Kháng cự hoặc Hỗ trợ mạnh có ít nhất 2 lần chạm trước đó.\n"
                "2. Chờ đợi cây nến Breakout với thân nến dài và khối lượng tăng đột biến vượt cản dứt khoát.\n"
                "3. Chờ giá hồi quy (Pullback Retest) kiểm tra lại ngưỡng cản vừa bị phá (Role Reversal).\n"
                "4. Vào lệnh khi xuất hiện nến xác nhận cùng chiều (Bullish/Bearish Confirmation Bar) tại vùng Retest."
            )
            sl_rule = req.stopLossRule or "Đặt Stop Loss dưới đáy nhịp hồi quy (đối với lệnh Mua) hoặc trên đỉnh nhịp hồi quy (đối với lệnh Bán)."
            tp_rule = req.takeProfitRule or "Chốt lời tại cản tiếp theo trên biểu đồ hoặc chốt tỷ lệ cố định R:R 1:2.0."
            invalidation_rule = "Nếu giá quay đầu đóng nến thụt sâu trở lại bên trong vùng cản cũ (Fakeout), lập tức hủy setup."
        elif "pinbar" in strat:
            entry_rule = req.entryRule or (
                "1. Xác định vùng Hỗ trợ/Kháng cự then chốt trên khung thời gian giao dịch.\n"
                "2. Xuất hiện nến Pinbar chuẩn: Râu nến dài gấp tối thiểu 2-3 lần thân nến, đâm thủng cản rồi rút chân dứt khoát.\n"
                "3. Đặt lệnh Buy Stop / Sell Stop cách đỉnh/đáy nến Pinbar 1 tick giá (hoặc vào lệnh ngay khi nến đóng cửa)."
            )
            sl_rule = req.stopLossRule or "Đặt Stop Loss cách chóp râu nến Pinbar 2-3 bước giá (vùng Invalidation tuyệt đối)."
            tp_rule = req.takeProfitRule or "Chốt lời tại đỉnh swing high liền kề (với lệnh Mua) hoặc tối thiểu R:R 1:2.0."
            invalidation_rule = "Nếu nến tiếp theo phá vỡ chóp râu nến Pinbar trước khi kích hoạt lệnh, setup bị hủy."
        else:
            # Default: FVG Rebalance (ICT)
            entry_rule = req.entryRule or (
                "1. Xác định cấu trúc khung thời gian cao hơn (HTF Trend & Liquidity Bias).\n"
                "2. Chờ đợi nhịp quét thanh khoản (Liquidity Sweep) tại đỉnh/đáy phiên Á hoặc đỉnh/đáy cũ.\n"
                "3. Xuất hiện nến Displacement tạo khoảng trống Fair Value Gap (FVG 3 nến) hợp lệ.\n"
                "4. Đặt lệnh Limit tại biên trên hoặc 50% Consequent Encroachment (CE) của FVG."
            )
            sl_rule = req.stopLossRule or "Đặt Stop Loss ngoài phạm vi cây nến Displacement tạo FVG (cách râu nến 1-2 bước giá)."
            tp_rule = req.takeProfitRule or "Chốt lời tối thiểu tỷ lệ R:R 1:2.0 hoặc tại vùng bể thanh khoản đối diện (Old High / Old Low)."
            invalidation_rule = "Nếu giá đóng nến xuyên qua 50% thân FVG trước khi khớp lệnh, hủy bỏ setup."

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
            "invalidationRule": invalidation_rule
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
