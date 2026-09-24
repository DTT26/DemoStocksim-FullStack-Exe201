from typing import Dict, Any, List
from app.rag.schema import TradeInput
from app.rag.retriever import retriever

class StrategyComparator:
    """
    Compares a trade simultaneously under multiple methodologies:
    Price Action (Al Brooks / Bob Volman) vs ICT / Smart Money Concepts (Michael Huddleston).
    Objective comparison with evidence, similarities and differences without claiming superiority.
    """

    def compare(self, trade: TradeInput) -> Dict[str, Any]:
        symbol = trade.symbol
        side = trade.side.upper()
        entry = trade.entryPrice
        sl = trade.stopLoss
        tp = trade.takeProfit

        price_action_view = {
            "frameworkName": "Price Action (Cổ điển & Khách quan)",
            "keyFocus": ["Market Structure (HH/HL hoặc LH/LL)", "Support & Resistance", "Breakout / Retest", "Nến từ chối (Rejection/Pinbar)"],
            "setupInterpretation": (
                f"Dưới lăng kính Price Action, lệnh {side} tại mức giá {entry:,.0f} được nhìn nhận là một nhịp kiểm định "
                f"lại vùng hỗ trợ/kháng cự cũ (Pullback Retest). Trader Price Action tìm kiếm sự tôn trọng của giá tại các ngưỡng cản "
                f"ngang hoặc đường xu hướng, kèm theo nến Pinbar hoặc nến đảo chiều đóng cửa dứt khoát trước khi vào lệnh."
            ),
            "stopLossPlacement": (
                f"Điểm đặt Stop Loss theo Price Action sẽ nằm ngay dưới đáy nến tín hiệu (Signal Bar Low) hoặc dưới đáy "
                f"cấu trúc Higher Low gần nhất (khoảng {sl:,.0f} nếu có)."
            ),
            "takeProfitTarget": (
                f"Mục tiêu lợi nhuận được đo bằng khoảng cách tới đỉnh cản cũ (Previous Swing High/Resistance) hoặc đo lường "
                f"theo nguyên tắc Measured Move (bằng chiều dài nhịp tăng trước đó)."
            ),
            "evidenceRequired": "Thân nến đóng cửa vượt qua cản, khối lượng giao dịch tăng ở nhịp bứt phá và bóng nến từ chối tại nhịp retest."
        }

        ict_view = {
            "frameworkName": "ICT / Smart Money Concepts (Dòng tiền thông minh)",
            "keyFocus": ["Liquidity Pools (BSL / SSL)", "Fair Value Gap (FVG)", "Order Block (OB)", "Market Structure Shift (MSS)"],
            "setupInterpretation": (
                f"Dưới lăng kính ICT, vị thế {side} này được phân tích thông qua sự dịch chuyển của thuật toán IPDA. "
                f"Smart Money thường săn thanh khoản (Liquidity Sweep) tại các đáy cũ trước, sau đó tạo ra một đợt dịch chuyển mạnh "
                f"(Displacement) để lại Fair Value Gap (FVG). Điểm vào lệnh được tối ưu tại vùng Discount khi giá retest lại FVG hoặc Order Block."
            ),
            "stopLossPlacement": (
                f"Điểm đặt Stop Loss theo ICT nằm dưới đáy của cây nến tạo Displacement hoặc dưới đáy của Order Block hợp lệ, "
                f"nơi nếu giá chạm tới thì toàn bộ ý tưởng về dòng tiền thông minh bị vô hiệu hóa."
            ),
            "takeProfitTarget": (
                f"Mục tiêu chốt lời theo ICT nhắm trực diện vào các bể thanh khoản đối diện (Buy-side Liquidity - BSL), "
                f"chẳng hạn như các đỉnh bằng nhau (Equal Highs) hoặc các vùng mất cân bằng chưa được lấp đầy ở khung thời gian lớn hơn."
            ),
            "evidenceRequired": "Sự xuất hiện của cây nến mất cân bằng (Displacement candle), FVG không bị lấp hoàn toàn, và quét thanh khoản rõ rệt."
        }

        similarities = [
            "Cả hai phương pháp đều chú trọng việc chờ đợi giá hồi quy (Retracement / Retest) thay vì mua đuổi giá đỉnh.",
            "Cả hai đều xác định điểm dừng lỗ dựa trên cấu trúc kỹ thuật (Invalidation Point) thay vì số tiền cố định.",
            "Cả hai đều tìm kiếm sự từ chối giá và dịch chuyển dứt khoát tại các vùng giá trị cốt lõi."
        ]

        differences = [
            "Price Action giải thích sự đảo chiều bằng tương quan Cung - Cầu cổ điển và tâm lý đám đông tại các đường hỗ trợ/kháng cự.",
            "ICT giải thích hành vi giá bằng thuật toán gom lệnh và săn thanh khoản (Liquidity Run) của các định chế tài chính lớn.",
            "Price Action thường sử dụng thân nến và râu nến đơn lẻ để xác nhận; ICT yêu cầu chuỗi 3 nến tạo khoảng trống mất cân bằng (FVG) và Order Block."
        ]

        # Retrieve citations for both frameworks
        pa_citations = retriever.retrieve(query="Price Action Market Structure Support Retest", framework="PRICE_ACTION", top_k=2)
        ict_citations = retriever.retrieve(query="ICT Fair Value Gap Liquidity Order Block", framework="ICT", top_k=2)

        sources = []
        for c in pa_citations + ict_citations:
            sources.append({
                "title": c.document.title,
                "framework": c.document.framework,
                "author": c.document.author,
                "source": c.document.source,
                "sourceUrl": c.document.sourceUrl,
                "sourceType": c.document.sourceType
            })

        return {
            "symbol": symbol,
            "side": side,
            "entryPrice": entry,
            "priceAction": price_action_view,
            "ict": ict_view,
            "similarities": similarities,
            "differences": differences,
            "conclusion": (
                "💡 **Kết luận học tập**: Không có phương pháp nào đúng 100% trong mọi điều kiện thị trường. "
                "Cả Price Action và ICT đều cung cấp các góc nhìn logic để bạn quản trị rủi ro và ra quyết định có cơ sở."
            ),
            "sources": sources
        }

strategy_comparator = StrategyComparator()
