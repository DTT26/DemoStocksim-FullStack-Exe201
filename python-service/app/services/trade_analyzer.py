from typing import Dict, Any, List, Optional
from app.rag.schema import TradeInput
from app.rag.retriever import retriever
from app.services.llm_client import llm_client

class TradeAnalyzer:
    """
    Evaluates individual student trades with quantitative metrics,
    process-first assessment (Good Trade vs Winning Trade),
    MFE/MAE analysis, and Socratic reflection.
    """

    def analyze(self, trade: TradeInput) -> Dict[str, Any]:
        is_buy = trade.side.upper() in ["BUY", "LONG"]
        entry = trade.entryPrice
        exit_p = trade.exitPrice or entry
        sl = trade.stopLoss
        tp = trade.takeProfit
        qty = trade.quantity
        balance = trade.accountBalance or 10000.0 # 10k USD default

        # 1. Quantitative Calculation
        pnl_per_unit = (exit_p - entry) if is_buy else (entry - exit_p)
        total_pnl = pnl_per_unit * qty
        return_pct = round((pnl_per_unit / entry) * 100, 2) if entry > 0 else 0.0

        # Risk amount and Risk % of account
        if sl:
            risk_per_unit = abs(entry - sl)
            planned_risk_amount = risk_per_unit * qty
            risk_pct = round((planned_risk_amount / balance) * 100, 2)
        else:
            risk_per_unit = entry * 0.05 # Default 5% assumed if no SL
            planned_risk_amount = risk_per_unit * qty
            risk_pct = round((planned_risk_amount / balance) * 100, 2)

        # Planned R:R and Actual R:R
        if sl and tp and risk_per_unit > 0:
            reward_per_unit = abs(tp - entry)
            planned_rr = round(reward_per_unit / risk_per_unit, 2)
        else:
            planned_rr = 0.0

        if risk_per_unit > 0:
            actual_rr = round(pnl_per_unit / risk_per_unit, 2)
        else:
            actual_rr = 0.0

        # Maximum Favorable Excursion (MFE) & Maximum Adverse Excursion (MAE)
        high_since = trade.historicalHighSinceEntry or max(entry, exit_p)
        low_since = trade.historicalLowSinceEntry or min(entry, exit_p)

        if is_buy:
            mfe_pts = max(0.0, high_since - entry)
            mae_pts = max(0.0, entry - low_since)
        else:
            mfe_pts = max(0.0, entry - low_since)
            mae_pts = max(0.0, high_since - entry)

        mfe_r = round(mfe_pts / risk_per_unit, 2) if risk_per_unit > 0 else 0.0
        mae_r = round(mae_pts / risk_per_unit, 2) if risk_per_unit > 0 else 0.0

        # 2. Process Quality Assessment
        setup_score = 80
        risk_score = 90
        rule_score = 85
        execution_score = 80

        rule_flags = []
        strengths = []
        improvements = []

        # Check Stop Loss rule
        if not sl:
            risk_score -= 40
            rule_flags.append("Không đặt Stop Loss cụ thể trước khi vào lệnh")
            improvements.append("Cần xác định điểm Invalidation Point và đặt lệnh Stop Loss cứng trước khi vào lệnh")
        elif risk_pct > 2.0:
            risk_score -= 25
            rule_flags.append(f"Mức rủi ro {risk_pct}% vượt quá trần an toàn khuyến nghị (1% - 2%)")
            improvements.append("Cần giảm khối lượng (Position Size) để đưa rủi ro về mức an toàn dưới 2% tổng tài khoản")
        else:
            strengths.append(f"Quản trị rủi ro tốt: Mức rủi ro đạt {risk_pct}% tài khoản (nằm trong giới hạn chuẩn 1%-2%)")

        # Check Risk:Reward
        if planned_rr > 0 and planned_rr < 1.5:
            setup_score -= 15
            rule_flags.append(f"Tỷ lệ R:R kế hoạch ({planned_rr}) thấp hơn chuẩn tối thiểu 1:1.5")
            improvements.append("Nên chọn lọc các setup có khoảng trống tới cản đối diện cho phép R:R tối thiểu 1:1.5 hoặc 1:2")
        elif planned_rr >= 1.5:
            strengths.append(f"Tỷ lệ R:R kế hoạch tốt (1 : {planned_rr})")

        # Check MFE vs Exit (Chốt non)
        if mfe_r >= 2.0 and actual_rr <= 0.8 and actual_rr > 0:
            execution_score -= 20
            improvements.append(f"Lệnh có tiềm năng đạt tới {mfe_r}R (MFE) nhưng bạn đã chốt ở {actual_rr}R. Có dấu hiệu thiếu kiên nhẫn khi giữ lệnh.")

        # Check MAE (Drawdown stress)
        if mae_r >= 0.85:
            improvements.append(f"Lệnh chịu mức drawdown lên tới {mae_r}R (rất sát Stop Loss). Điểm Entry có thể đã vào hơi sớm trước khi có tín hiệu nến xác nhận.")

        overall_process_score = round((setup_score * 0.3) + (risk_score * 0.3) + (rule_score * 0.2) + (execution_score * 0.2))

        # Categorize: Good Trade vs Winning Trade
        is_profitable = total_pnl > 0
        is_good_process = overall_process_score >= 75

        if is_profitable and is_good_process:
            trade_verdict = "WINNING_GOOD_TRADE"
            verdict_desc = "Lệnh Thắng & Kỷ Luật Tốt (Good Trade + Winning Trade): Bạn đã tuân thủ kế hoạch và thị trường trả thưởng xứng đáng."
        elif is_profitable and not is_good_process:
            trade_verdict = "WINNING_BAD_TRADE"
            verdict_desc = "Lệnh Thắng nhưng Vi Phạm Quy Trình (Bad Trade still Profitable): Lệnh có lãi nhưng vi phạm nguyên tắc quản trị. Tránh ảo tưởng vì thói quen này sẽ gây lỗ nặng trong dài hạn."
        elif not is_profitable and is_good_process:
            trade_verdict = "LOSING_GOOD_TRADE"
            verdict_desc = "Lệnh Thua nhưng Kỷ Luật Chuẩn (Good Trade with Loss): Đây là một lệnh chất lượng! Thua lỗ chỉ là chi phí kinh doanh bình thường của xác suất khi bạn đã kiểm soát rủi ro tuyệt đối."
        else:
            trade_verdict = "LOSING_BAD_TRADE"
            verdict_desc = "Lệnh Thua và Vi Phạm Quy Trình (Bad Trade with Loss): Lệnh thiếu kỷ luật dẫn đến kết quả tiêu cực. Cần nghiêm túc xem xét lại các điểm cải thiện bên dưới."

        # VIP LLM Coaching Advice if API Key is configured
        if llm_client.is_configured():
            sys_p = (
                "Bạn là một AI Trading Coach chuyên gia đánh giá lệnh theo tư duy 'Process > Outcome' "
                "(Quy trình quan trọng hơn kết quả). Hãy viết 1 đoạn nhận xét đúc kết súc tích (2-3 câu) "
                "bằng tiếng Việt gửi đến học viên để rèn luyện kỷ luật tâm lý."
            )
            user_p = (
                f"Lệnh: {trade.side} {trade.symbol} tại {entry:,.0f}, thoát tại {exit_p:,.0f}.\n"
                f"R:R kế hoạch: 1:{planned_rr}, R:R thực tế: 1:{actual_rr}, Rủi ro vốn: {risk_pct}%.\n"
                f"MFE (tiềm năng tối đa): {mfe_r}R, MAE (drawdown chịu đựng): {mae_r}R.\n"
                f"Đánh giá phân loại: {verdict_desc}\n"
                f"Điểm quy trình: {overall_process_score}/100."
            )
            custom_coaching = llm_client.generate_text(sys_p, user_p, max_tokens=250)
            if custom_coaching:
                verdict_desc = f"{verdict_desc}\n\n💡 **Góp ý từ AI Coach**: {custom_coaching}"

        # 3. Retrieve relevant educational citations from KB
        search_terms = f"{trade.strategy or 'ICT'} {trade.setupName or 'FVG'} {trade.reason or ''} Risk Management"
        citations = retriever.retrieve(query=search_terms, top_k=3)
        sources = [
            {
                "title": c.document.title,
                "concept": c.document.concept,
                "framework": c.document.framework,
                "source": c.document.source,
                "sourceUrl": c.document.sourceUrl,
                "author": c.document.author,
                "sourceType": c.document.sourceType
            }
            for c in citations
        ]

        # 4. Generate Socratic Questions for Student Reflection
        socratic_questions = [
            f"Tại thời điểm vào lệnh tại giá {entry:,.0f}, cây nến vào lệnh đã đóng cửa hay bạn vào lệnh khi nến vẫn đang chạy?",
            f"Nếu thị trường không có phản ứng tăng mà giảm xuyên qua {sl:,.0f} nếu có, lý do kỹ thuật nào sẽ vô hiệu hóa setup này?",
            f"Mức rủi ro {risk_pct}% cho lệnh này có khiến bạn cảm thấy lo lắng hay phải nhìn màn hình liên tục không?",
            "Nếu bạn gặp 3 lệnh liên tiếp bị Stop Loss với setup tương tự, bạn sẽ dừng lại hay tiếp tục giao dịch?"
        ]

        return {
            "summary": {
                "symbol": trade.symbol,
                "side": trade.side,
                "entryPrice": entry,
                "exitPrice": exit_p,
                "stopLoss": sl,
                "takeProfit": tp,
                "quantity": qty,
                "pnl": total_pnl,
                "returnPct": return_pct,
                "plannedRR": f"1 : {planned_rr}" if planned_rr else "Chưa đặt",
                "actualRR": f"1 : {actual_rr}",
                "riskPctOfAccount": f"{risk_pct}%",
                "mfe": f"{mfe_r}R",
                "mae": f"{mae_r}R",
                "processScore": overall_process_score,
                "tradeVerdict": trade_verdict,
                "verdictDescription": verdict_desc
            },
            "marketContext": {
                "timeframe": trade.timeframe or "15m",
                "trend": "Đang trong nhịp kiểm định vùng thanh khoản phiên",
                "supportResistance": f"Ngưỡng hỗ trợ gần nhất quanh vùng {sl or entry * 0.98:,.0f}",
                "volumeObservation": "Khối lượng nến xác nhận cần được đối chiếu trên biểu đồ trước khi vào lệnh"
            },
            "setupQuality": {
                "strategy": trade.strategy or "ICT / SMC",
                "setupName": trade.setupName or "Liquidity Sweep + FVG",
                "reasonGiven": trade.reason or "Chưa ghi nhận ghi chú",
                "score": setup_score
            },
            "entryAnalysis": {
                "entryPrice": entry,
                "assessment": f"Entry tại {entry:,.0f}. " + ("Đã có vùng bảo vệ SL tương đối an toàn." if sl else "Nguy hiểm vì thiếu SL.")
            },
            "stopLossAnalysis": {
                "stopLoss": sl,
                "riskAmount": planned_risk_amount,
                "riskPct": f"{risk_pct}%",
                "comment": "Theo framework quản trị rủi ro, vị trí SL cần đặt ngoài vùng cấu trúc swing point, tránh đặt quá sát gây dính quét nến."
            },
            "takeProfitAnalysis": {
                "takeProfit": tp,
                "plannedReward": abs((tp or entry) - entry) * qty,
                "comment": f"Mục tiêu TP đem lại tỷ lệ R:R 1:{planned_rr}." if planned_rr else "Chưa đặt Take Profit cố định."
            },
            "excursionAnalysis": {
                "mfe": f"{mfe_r}R",
                "mae": f"{mae_r}R",
                "drawdownRisk": "Cao (áp lực tâm lý)" if mae_r > 0.8 else "Kiểm soát tốt",
                "exitEfficiency": "Tốt" if actual_rr >= mfe_r * 0.7 else "Có thể tối ưu thêm quy tắc gồng lãi"
            },
            "strengths": strengths,
            "improvements": improvements,
            "ruleViolations": rule_flags,
            "socraticQuestions": socratic_questions,
            "sources": sources
        }

trade_analyzer = TradeAnalyzer()
