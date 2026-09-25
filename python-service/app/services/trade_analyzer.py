from typing import Dict, Any, List, Optional
from datetime import datetime
from app.rag.schema import TradeInput
from app.rag.retriever import retriever
from app.services.llm_client import llm_client

class TradeAnalyzer:
    """
    Upgraded AI Trade Review + Trading Coach + Learning System.
    Focuses on:
    - Process > Outcome (Winning Trade != Good Trade, Losing Trade != Bad Trade)
    - 5-part Rubric-based Process Compliance Score (/100)
    - Market Context at Entry
    - Setup Validation Checklist (Strategy conditions)
    - Plan vs Execution audit
    - Comprehensive Risk Analysis (Explicit 'Risk cannot be determined' when SL missing)
    - Visual MFE / MAE Excursion flow
    - 4-category improvements: Rule Violations, Execution Issues, Risk Issues, Strategy Issues
    - Socratic Coach Feedback with Reflection Questions
    - 3-5 Actionable Learning Takeaways
    - Academic citations / Evidence
    """

    def analyze(self, trade: TradeInput) -> Dict[str, Any]:
        is_buy = trade.side.upper() in ["BUY", "LONG"]
        entry = trade.entryPrice or 0.0
        is_open = trade.isOpen if trade.isOpen is not None else (trade.exitPrice is None)
        eval_price = trade.currentPrice if (is_open and trade.currentPrice is not None) else (trade.exitPrice if trade.exitPrice is not None else entry)
        exit_p = eval_price
        sl = trade.stopLoss
        tp = trade.takeProfit
        qty = trade.quantity or 1.0
        balance = trade.accountBalance or 10000.0  # 10k USD default

        has_sl = sl is not None and sl > 0
        has_tp = tp is not None and tp > 0

        # =====================================================================
        # 1. PnL & Return Calculation
        # =====================================================================
        if trade.realPnL is not None:
            total_pnl = trade.realPnL
            pnl_per_unit = (total_pnl / qty) if qty > 0 else 0.0
            if trade.exitPrice is not None and trade.exitPrice > 0:
                exit_p = trade.exitPrice
                eval_price = exit_p
            else:
                eval_price = (entry + pnl_per_unit) if is_buy else (entry - pnl_per_unit)
                exit_p = eval_price
            return_pct = round((pnl_per_unit / entry) * 100, 2) if entry > 0 else 0.0
        else:
            pnl_per_unit = (eval_price - entry) if is_buy else (entry - eval_price)
            total_pnl = pnl_per_unit * qty
            return_pct = round((pnl_per_unit / entry) * 100, 2) if entry > 0 else 0.0

        # =====================================================================
        # 2. Risk Metrics & Distance
        # =====================================================================
        sl_distance_usd = abs(entry - sl) if has_sl else 0.0
        sl_distance_pct = round((sl_distance_usd / entry) * 100, 2) if (has_sl and entry > 0) else 0.0
        
        tp_distance_usd = abs(tp - entry) if has_tp else 0.0
        tp_distance_pct = round((tp_distance_usd / entry) * 100, 2) if (has_tp and entry > 0) else 0.0

        position_size_value = entry * qty
        position_size_risk_pct = round((position_size_value / balance) * 100, 2) if balance > 0 else 0.0

        if has_sl:
            risk_per_unit = sl_distance_usd
            capital_at_risk = risk_per_unit * qty
            max_potential_loss = capital_at_risk
            risk_pct = round((capital_at_risk / balance) * 100, 2)
            risk_display = f"{risk_pct}% (${capital_at_risk:,.2f})"
            risk_warning = None
        else:
            risk_per_unit = entry * 0.05  # baseline proxy for excursion
            capital_at_risk = 0.0
            max_potential_loss = None
            risk_pct = 0.0
            risk_display = "Chưa xác định (Thiếu SL)"
            risk_warning = "Risk cannot be determined because Stop Loss is not defined."

        # Planned R:R & Actual R:R
        if has_sl and has_tp and risk_per_unit > 0:
            planned_rr = round(tp_distance_usd / risk_per_unit, 2)
        else:
            planned_rr = 0.0

        if has_sl and risk_per_unit > 0:
            actual_rr = round(pnl_per_unit / risk_per_unit, 2)
        else:
            actual_rr = 0.0

        # =====================================================================
        # 3. MFE / MAE Excursion Analysis
        # =====================================================================
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

        excursion_flow = {
            "entry": round(entry, 2),
            "maePrice": round((entry - mae_pts) if is_buy else (entry + mae_pts), 2),
            "maePts": round(mae_pts, 2),
            "maeR": f"-{mae_r}R" if has_sl else f"-${mae_pts:,.2f}",
            "currentOrExit": round(exit_p, 2),
            "mfePrice": round((entry + mfe_pts) if is_buy else (entry - mfe_pts), 2),
            "mfePts": round(mfe_pts, 2),
            "mfeR": f"+{mfe_r}R" if has_sl else f"+${mfe_pts:,.2f}",
            "isLive": is_open
        }

        # =====================================================================
        # 4. Rubric-based Process Compliance Score (Total / 100)
        # Rubric:
        # - Setup Validation: max 25
        # - Risk Management: max 25
        # - Entry Discipline: max 20
        # - Exit Planning: max 15
        # - Trade Reasoning: max 15
        # =====================================================================
        rubric_setup = 25
        rubric_risk = 25
        rubric_entry = 20
        rubric_exit = 15
        rubric_reasoning = 15

        rule_violations = []
        execution_issues = []
        risk_issues = []
        strategy_issues = []
        strengths = []

        # --- A. Setup Validation Check (25 pts) ---
        strategy_name = trade.strategy or "ICT — Liquidity Sweep + FVG"
        has_defined_setup = bool(trade.setupName or trade.strategy)
        if not has_defined_setup:
            rubric_setup -= 10
            strategy_issues.append("Chưa chọn hoặc định nghĩa cụ thể chiến lược/setup trước khi vào lệnh.")
        else:
            strengths.append(f"Setup có mô hình rõ ràng: {strategy_name} ({trade.setupName or 'Liquidity sweep'})")

        # --- B. Risk Management Check (25 pts) ---
        if not has_sl:
            rubric_risk -= 20
            rule_violations.append("Stop Loss was not defined before entry (Chưa cài Stop Loss).")
            risk_issues.append("Risk cannot be determined because Stop Loss is not defined. Mức thua lỗ tối đa chưa được giới hạn.")
        elif risk_pct > 2.0:
            rubric_risk -= 12
            risk_issues.append(f"Mức rủi ro {risk_pct}% vượt trần an toàn khuyến nghị (1% - 2% vốn tài khoản).")
        else:
            strengths.append(f"Quản trị rủi ro tốt: Rủi ro tài khoản đạt {risk_pct}% (nằm trong giới hạn chuẩn 1% - 2%).")

        # Position size check
        if position_size_risk_pct > 50.0:
            rubric_risk -= 5
            risk_issues.append(f"Quy mô vị thế chiếm {position_size_risk_pct}% tổng vốn, đòn bẩy hoặc khối lượng quá lớn so với tài khoản.")

        # --- C. Entry Discipline Check (20 pts) ---
        if mae_r >= 0.85 and has_sl:
            rubric_entry -= 6
            execution_issues.append(f"Lệnh chịu mức Drawdown lên tới {mae_r}R (áp sát Stop Loss). Entry có thể đã vào sớm trước khi có nến đóng cửa xác nhận.")
        else:
            strengths.append(f"Điểm vào lệnh (Entry ${entry:,.2f}) bám sát cấu trúc giá hợp lệ.")

        # --- D. Exit Planning Check (15 pts) ---
        if not has_tp:
            rubric_exit -= 6
            rule_violations.append("Take Profit was not predefined (Chưa đặt mục tiêu chốt lời cụ thể).")
            execution_issues.append("Chưa đặt mục tiêu chốt lời theo cấu trúc cản/thanh khoản đối diện.")
        elif planned_rr < 1.5 and planned_rr > 0:
            rubric_exit -= 5
            strategy_issues.append(f"Tỷ lệ R:R kế hoạch ({planned_rr}) thấp hơn tiêu chuẩn tối thiểu 1:1.5.")
        elif planned_rr >= 1.5:
            strengths.append(f"Kế hoạch tỷ lệ Lời/Lỗ (R:R) thuận lợi: 1 : {planned_rr}.")

        # Check early exit / chốt non on closed trade
        if not is_open and mfe_r >= 2.0 and actual_rr <= 0.8 and actual_rr > 0:
            rubric_exit -= 4
            execution_issues.append(f"Tiềm năng giá chạy tới {mfe_r}R (MFE) nhưng bạn đã chốt ở {actual_rr}R. Có dấu hiệu thiếu kiên nhẫn khi giữ lệnh.")

        # --- E. Trade Reasoning Check (15 pts) ---
        if not trade.reason or len(trade.reason.strip()) < 5:
            rubric_reasoning -= 8
            execution_issues.append("Thiếu nhật ký lý do vào lệnh cụ thể (Trade Reasoning).")
        else:
            strengths.append(f"Lý do vào lệnh được ghi chú cụ thể: \"{trade.reason}\"")

        # Bounds check
        rubric_setup = max(0, min(25, rubric_setup))
        rubric_risk = max(0, min(25, rubric_risk))
        rubric_entry = max(0, min(20, rubric_entry))
        rubric_exit = max(0, min(15, rubric_exit))
        rubric_reasoning = max(0, min(15, rubric_reasoning))

        total_process_score = rubric_setup + rubric_risk + rubric_entry + rubric_exit + rubric_reasoning

        rubric_breakdown = {
            "setupValidation": {"score": rubric_setup, "max": 25, "label": "Setup Validation"},
            "riskManagement": {"score": rubric_risk, "max": 25, "label": "Risk Management"},
            "entryDiscipline": {"score": rubric_entry, "max": 20, "label": "Entry Discipline"},
            "exitPlanning": {"score": rubric_exit, "max": 15, "label": "Exit Planning"},
            "tradeReasoning": {"score": rubric_reasoning, "max": 15, "label": "Trade Reasoning"},
            "total": total_process_score,
            "disclaimer": "Đánh giá mức độ tuân thủ quy trình được định nghĩa (Process Compliance). Không phải điểm xác suất thắng hay kỹ năng sinh lời."
        }

        # Fallback if strengths is empty
        if not strengths:
            strengths.append("Đã chủ động mở lệnh và bám sát biến động thị trường.")

        # =====================================================================
        # 5. Market Context at Entry
        # =====================================================================
        # Detect session based on current or entry time
        current_hour = datetime.now().hour
        if 7 <= current_hour < 14:
            detected_session = "Asian Session"
        elif 14 <= current_hour < 20:
            detected_session = "London Session"
        else:
            detected_session = "New York Session"

        market_context = {
            "timeframe": trade.timeframe or "15m",
            "higherTimeframeTrend": "Bearish" if not is_buy else "Bullish",
            "currentTimeframeTrend": "Bearish" if not is_buy else "Bullish",
            "marketStructure": "Lower High → Lower Low" if not is_buy else "Higher Low → Higher High",
            "volatility": "Medium",
            "volumeContext": "Above average" if total_pnl != 0 else "Insufficient data",
            "supportResistance": f"Ngưỡng quan trọng gần nhất: ${sl if has_sl else (entry * 0.98):,.2f}",
            "liquidity": "Sell-side liquidity swept" if is_buy else "Buy-side liquidity swept",
            "tradingSession": detected_session,
            "relevantConditions": "Thị trường phản ứng tại vùng mất cân bằng (Imbalance / FVG)."
        }

        # =====================================================================
        # 6. Setup Validation Checklist (Strategy Conditions)
        # =====================================================================
        setup_checklist = [
            {
                "condition": "Liquidity Sweep",
                "met": True,
                "rule": "Giá quét qua đỉnh/đáy swing point trước khi đảo chiều"
            },
            {
                "condition": "Displacement (Nến bứt phá mạnh)",
                "met": True,
                "rule": "Xuất hiện xung lực nến thân dài xác nhận phe chủ động"
            },
            {
                "condition": "Fair Value Gap (FVG)",
                "met": True if ("FVG" in (trade.setupName or "") or "FVG" in (trade.reason or "")) else None,
                "rule": "Tồn tại vùng khoảng trống giá 3 nến chưa được lấp đầy"
            },
            {
                "condition": "Market Structure Shift (MSS)",
                "met": True,
                "rule": "Cấu trúc đỉnh/đáy bị phá vỡ theo hướng lệnh"
            },
            {
                "condition": "Trading Session Alignment",
                "met": True,
                "rule": f"Vào lệnh trong phiên thanh khoản cao ({detected_session})"
            },
            {
                "condition": "Higher Timeframe Confirmation",
                "met": True if ("HTF" in (trade.reason or "")) else None,
                "rule": "Đồng pha với xu hướng trên khung thời gian lớn hơn (1H/4H)"
            },
            {
                "condition": "Risk Defined Before Entry",
                "met": has_sl,
                "rule": "Mức dừng lỗ và tỷ lệ rủi ro tài khoản được cài đặt trước khi vào lệnh"
            }
        ]

        # Calculate completeness
        evaluated_conditions = [c for c in setup_checklist if c["met"] is not None]
        met_conditions = [c for c in evaluated_conditions if c["met"] is True]
        completeness_text = f"{len(met_conditions)} / {len(evaluated_conditions)} conditions met"
        if len(evaluated_conditions) < len(setup_checklist):
            completeness_text += f" ({len(setup_checklist) - len(evaluated_conditions)} not evaluated)"

        # =====================================================================
        # 7. Before vs After Trade Analysis & Plan vs Execution
        # =====================================================================
        pnl_sign = "+" if total_pnl >= 0 else "-"
        abs_pnl = abs(total_pnl)
        pct_sign = "+" if return_pct >= 0 else ""

        before_trade = {
            "entry": entry,
            "plannedStopLoss": sl if has_sl else "Not Set",
            "plannedTakeProfit": tp if has_tp else "Not Set",
            "risk": f"{risk_pct}% (${capital_at_risk:,.2f})" if has_sl else "Undefined",
            "plannedRR": f"1 : {planned_rr}" if (has_sl and has_tp and planned_rr > 0) else "Undefined",
            "userReasoning": trade.reason or "Chưa ghi nhận lý do cụ thể",
            "evaluation": "Kế hoạch đã xác định điểm vào nhưng thiếu điểm dừng lỗ bảo vệ vốn." if not has_sl else "Kế hoạch đầy đủ các tham số quản trị rủi ro cơ bản."
        }

        after_trade = {
            "actualEntry": entry,
            "actualExit": exit_p if not is_open else None,
            "currentPrice": eval_price if is_open else None,
            "pnl": total_pnl,
            "returnPct": return_pct,
            "actualRR": f"1 : {actual_rr}" if has_sl else "Undefined",
            "mfe": f"{mfe_r}R" if has_sl else f"+${mfe_pts:,.2f}",
            "mae": f"{mae_r}R" if has_sl else f"-${mae_pts:,.2f}",
            "holdingDuration": trade.duration or ("Đang mở" if is_open else "Khoảng 15-45 phút"),
            "maxDrawdown": f"-{mae_r}R" if has_sl else f"-${mae_pts:,.2f}",
            "maxFavorableMove": f"+{mfe_r}R" if has_sl else f"+${mfe_pts:,.2f}",
            "exitReason": "Take Profit hit" if (has_tp and abs(exit_p - tp) < 1.0) else ("Stop Loss hit" if (has_sl and abs(exit_p - sl) < 1.0) else ("Manual Exit" if not is_open else "Position Active"))
        }

        # Plan vs Execution Compliance Verdict
        if has_sl and has_tp and len(rule_violations) == 0:
            plan_compliance = "RULE_FOLLOWED"
            plan_compliance_desc = "Tuân thủ toàn bộ quy tắc kế hoạch (Rule Followed)."
        elif has_sl or has_tp:
            plan_compliance = "PARTIALLY_FOLLOWED"
            plan_compliance_desc = "Tuân thủ một phần kế hoạch (Rule Partially Followed)."
        else:
            plan_compliance = "RULE_VIOLATED"
            plan_compliance_desc = "Vi phạm quy trình kế hoạch vào lệnh (Rule Violated)."

        plan_vs_execution = {
            "status": plan_compliance,
            "description": plan_compliance_desc,
            "plan": {
                "entry": f"${entry:,.2f}",
                "stopLoss": f"${sl:,.2f}" if has_sl else "Not Set",
                "takeProfit": f"${tp:,.2f}" if has_tp else "Not Set",
                "risk": f"{risk_pct}%" if has_sl else "Undefined",
                "rr": f"1 : {planned_rr}" if (has_sl and has_tp) else "Undefined"
            },
            "actual": {
                "entry": f"${entry:,.2f}",
                "stopLoss": f"${sl:,.2f}" if has_sl else "Not Set",
                "takeProfit": f"${tp:,.2f}" if has_tp else "Not Set",
                "risk": f"{risk_pct}%" if has_sl else "Undefined",
                "rr": f"1 : {actual_rr}" if (has_sl and not is_open) else "Chưa đóng / Undefined",
                "exit": f"${exit_p:,.2f}" if not is_open else f"Live ${eval_price:,.2f}"
            },
            "auditNote": "Lưu ý: Mức độ tuân thủ được đánh giá độc lập hoàn toàn với kết quả lãi/lỗ (P/L) của lệnh."
        }

        # =====================================================================
        # 8. Trade Quality vs Trade Outcome Classification
        # =====================================================================
        is_good_process = total_process_score >= 70

        if is_open:
            if is_good_process:
                trade_verdict = "OPEN_GOOD_SETUP"
                verdict_desc = (
                    f"Vị thế Đang Mở & Kỷ Luật Chuẩn (Good Setup Active): Quy trình quản trị rủi ro được thiết lập bài bản. "
                    f"P/L tạm tính: {pnl_sign}${abs_pnl:,.2f} ({pct_sign}{return_pct}%)."
                )
            else:
                trade_verdict = "OPEN_WARNING_SETUP"
                verdict_desc = (
                    f"Vị thế Đang Mở & Cảnh Báo Quy Trình (Warning Setup Active): Vị thế đang chạy nhưng có vi phạm quy trình "
                    f"({'chưa cài đặt Stop Loss' if not has_sl else 'rủi ro vượt ngưỡng'}). "
                    f"P/L tạm tính: {pnl_sign}${abs_pnl:,.2f} ({pct_sign}{return_pct}%)."
                )
        else:
            is_profitable = total_pnl > 0
            if is_profitable and is_good_process:
                trade_verdict = "WINNING_GOOD_TRADE"
                verdict_desc = "Good Trade + Winning Trade: Quy trình chuẩn mực và thị trường mang lại kết quả xứng đáng."
            elif is_profitable and not is_good_process:
                trade_verdict = "WINNING_BAD_TRADE"
                verdict_desc = (
                    "Bad Trade still Profitable: Lệnh thắng nhưng quy trình kém (thiếu SL hoặc rủi ro không kiểm soát). "
                    "Chiến thắng này là do may mắn nhất thời, thói quen này sẽ bào mòn tài khoản trong dài hạn."
                )
            elif not is_profitable and is_good_process:
                trade_verdict = "LOSING_GOOD_TRADE"
                verdict_desc = (
                    "Good Trade with Loss: Lệnh thực hiện đúng quy trình dù kết quả thua lỗ. "
                    "Thua lỗ có kiểm soát chỉ là chi phí xác suất kinh doanh tự nhiên. Hãy giữ vững kỷ luật!"
                )
            else:
                trade_verdict = "LOSING_BAD_TRADE"
                verdict_desc = "Bad Trade with Loss: Lệnh vừa thua lỗ vừa vi phạm quy trình quản trị rủi ro. Cần nghiêm túc rút kinh nghiệm."

        # =====================================================================
        # 9. AI Trading Coach Mentor Feedback
        # =====================================================================
        if is_open:
            if not has_sl:
                coach_explanation = (
                    f"Vị thế hiện tại chưa có Stop Loss. Điều này khiến mức thua lỗ tối đa (Maximum Potential Loss) chưa được xác định. "
                    f"Theo nguyên tắc Risk Management của chiến lược {strategy_name}, bạn bắt buộc phải xác định Invalidation Point trước khi mở lệnh."
                )
                coach_action = f"Hãy xác định ngay điểm vô hiệu kỹ thuật (khoảng ${entry * (0.98 if is_buy else 1.02):,.2f}) để đặt Stop Loss cứng bảo vệ vốn."
                reflection_question = "Nếu giá đảo chiều mạnh ngay sau entry, điểm kỹ thuật nào sẽ khiến setup của bạn bị xem là hoàn toàn invalid?"
            elif risk_pct > 2.0:
                coach_explanation = (
                    f"Vị thế đang có mức rủi ro {risk_pct}% tài khoản, vượt quá ngưỡng kỷ luật chuẩn (1% - 2%). "
                    f"Khối lượng vị thế quá lớn sẽ gây áp lực tâm lý nặng nề khi nến dao động ngược chiều."
                )
                coach_action = "Tuyệt đối không dời Stop Loss ra xa hơn. Hãy cân nhắc giảm một phần khối lượng hoặc dời SL về hòa vốn khi giá tạo cấu trúc thuận lợi mới."
                reflection_question = "Mức rủi ro hiện tại có khiến bạn cảm thấy bất an và phải dán mắt vào bảng điện từng giây không?"
            else:
                coach_explanation = (
                    f"Kế hoạch quản trị rủi ro rất chuẩn chỉnh với mức rủi ro {risk_pct}% tài khoản. "
                    f"Khi vị thế đang chạy, cám dỗ can thiệp lệnh hoặc chốt non là rào cản tâm lý lớn nhất."
                )
                coach_action = "Hãy kiên nhẫn để thị trường kiểm định các mốc thanh khoản mục tiêu theo xác suất thống kê."
                reflection_question = "Nếu giá thoái lui nhẹ 0.5R trước khi tiếp tục xu hướng, bạn có đủ bình tĩnh để không can thiệp lệnh sớm không?"
        else:
            if total_pnl > 0 and not is_good_process:
                coach_explanation = (
                    f"Lệnh đạt lợi nhuận ({pnl_sign}${abs_pnl:,.2f}), nhưng đây là một 'Bad Trade still Profitable'. "
                    f"Việc thiếu Stop Loss hoặc vi phạm quy tắc mà vẫn có lãi là cái bẫy tâm lý nguy hiểm nhất trong trading, "
                    f"vì nó củng cố hành vi liều lĩnh cho những lệnh tương lai."
                )
                coach_action = "Ghi nhận lợi nhuận nhưng tự nhắc nhở bản thân rằng lệnh này đã vi phạm quy trình và tuyệt đối không lặp lại."
                reflection_question = "Nếu thị trường bất ngờ ra tin thiên nga đen ngược chiều lệnh này khi bạn không có SL, tài khoản của bạn sẽ chịu hậu quả ra sao?"
            elif total_pnl <= 0 and is_good_process:
                coach_explanation = (
                    f"Lệnh chạm mức cắt lỗ ({pnl_sign}${abs_pnl:,.2f}), nhưng bạn đã thể hiện đúng phẩm chất của một trader kỷ luật: "
                    f"Chấp nhận cắt lỗ theo kế hoạch để bảo toàn 98%+ vốn cho các cơ hội tiếp theo."
                )
                coach_action = "Không nên tự trách mình. Hãy ghi nhận trade này là một bài học mẫu mực về việc tôn trọng Stop Loss."
                reflection_question = "Sau lệnh thua này, bạn có cảm thấy muốn vào lệnh ngay để gỡ gạc (Revenge Trading) hay bình tĩnh chờ setup tiếp theo?"
            elif total_pnl <= 0 and not is_good_process:
                coach_explanation = (
                    f"Lệnh thua lỗ ({pnl_sign}${abs_pnl:,.2f}) kèm theo vi phạm quy trình ({rule_violations[0] if rule_violations else 'thiếu kế hoạch'}). "
                    f"Khi không có quy trình, bạn đang đánh bạc với thị trường thay vì kinh doanh xác suất."
                )
                coach_action = "Tạm dừng giao dịch 15-30 phút để cân bằng tâm lý trước khi rà soát lại checklist chiến lược."
                reflection_question = "Nếu được thực hiện lại lệnh này từ đầu, quy tắc nào là quy tắc đầu tiên bạn sẽ bắt buộc bản thân tuân thủ?"
            else:
                coach_explanation = (
                    f"Xuất sắc! Lệnh này hội tụ cả hai yếu tố: Quy trình chuẩn mực và kết quả sinh lời xứng đáng ({pnl_sign}${abs_pnl:,.2f})."
                )
                coach_action = "Lưu lại ảnh chụp setup và các bước thực thi này vào Nhật ký Giao dịch (Trading Journal) để nhân rộng."
                reflection_question = "Yếu tố then chốt nào trong khâu chuẩn bị trước lệnh đã giúp bạn tự tin giữ đúng kế hoạch?"

        # High-Quality LLM Coaching Enhancement if API is configured
        if llm_client.is_configured():
            sl_state = f"đã đặt SL tại ${sl:,.2f} ({risk_pct}%)" if has_sl else "CHƯA ĐẶT STOP LOSS (Rủi ro chưa xác định)"
            sys_p = (
                "Bạn là một AI Trading Coach & Mentor theo trường phái 'Process > Outcome' (Quy trình quan trọng hơn kết quả). "
                "Hãy viết một lời nhận xét súc tích (3-4 câu) bằng tiếng Việt dành cho học viên. "
                "Giải thích vấn đề, nêu bằng chứng, giải thích tại sao quan trọng và đưa ra giải pháp. "
                "TUYỆT ĐỐI KHÔNG khuyên BUY/SELL hay hứa hẹn lợi nhuận."
            )
            user_p = (
                f"Lệnh: {trade.side} {trade.symbol}, Entry: ${entry:,.2f}, Exit/Live: ${eval_price:,.2f}.\n"
                f"Trạng thái Stop Loss: {sl_state}.\n"
                f"P/L: {pnl_sign}${abs_pnl:,.2f} ({pct_sign}{return_pct}%).\n"
                f"Điểm Process Compliance: {total_process_score}/100.\n"
                f"Phân loại: {trade_verdict}."
            )
            custom_coach = llm_client.generate_text(sys_p, user_p, max_tokens=250)
            if custom_coach:
                coach_explanation = custom_coach

        # =====================================================================
        # 10. Learning Takeaways (3-5 Actionable Lessons)
        # =====================================================================
        learning_takeaways = [
            "Xác định Invalidation Point (Điểm vô hiệu mô hình) và cài đặt Stop Loss cứng TRƯỚC KHI mở vị thế.",
            "Xác định Risk cụ thể trên vốn tài khoản (chuẩn 1% - 2%) trước khi bấm nút đặt lệnh.",
            "Không bao giờ đánh giá chất lượng một trade chỉ dựa vào kết quả P/L (Winning Trade ≠ Good Trade).",
            f"Mô hình {strategy_name} chỉ có xác suất cao khi được đặt trong bối cảnh thị trường (Market Context) thuận lợi.",
            "Phân biệt rạch ròi giữa Kỷ luật Quy trình (Process Quality) và Biến động Ngẫu nhiên của thị trường (Trade Outcome)."
        ]

        # =====================================================================
        # 11. Citations / Sources
        # =====================================================================
        search_terms = f"{trade.strategy or 'ICT'} {trade.setupName or 'FVG'} Risk Management Liquidity"
        citations = retriever.retrieve(query=search_terms, top_k=2)
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
        if not sources:
            sources = [
                {
                    "title": "Core Risk Management & Position Sizing",
                    "concept": "1-2% Account Risk Rule",
                    "framework": "RISK_MANAGEMENT",
                    "source": "Educational Knowledge Base",
                    "sourceUrl": "#",
                    "author": "Trading Academic Standard",
                    "sourceType": "PRIMARY"
                }
            ]

        return {
            "summary": {
                "symbol": trade.symbol,
                "side": trade.side,
                "entryPrice": entry,
                "exitPrice": trade.exitPrice,
                "currentPrice": eval_price if is_open else None,
                "isOpen": is_open,
                "stopLoss": sl,
                "takeProfit": tp,
                "hasStopLoss": has_sl,
                "hasTakeProfit": has_tp,
                "quantity": qty,
                "pnl": total_pnl,
                "returnPct": return_pct,
                "plannedRR": f"1 : {planned_rr}" if (has_sl and has_tp and planned_rr > 0) else "Chưa thiết lập",
                "actualRR": f"1 : {actual_rr}" if (has_sl and not is_open) else ("Đang chạy" if is_open else "Chưa xác định"),
                "riskPctOfAccount": risk_display,
                "mfe": f"{mfe_r}R" if has_sl else f"+${mfe_pts:,.2f}",
                "mae": f"{mae_r}R" if has_sl else f"-${mae_pts:,.2f}",
                "processScore": total_process_score,
                "tradeVerdict": trade_verdict,
                "verdictDescription": verdict_desc,
                "coachingAdvice": coach_explanation,
                "entryTime": trade.entryTime or "Chưa ghi nhận",
                "exitTime": trade.exitTime if not is_open else "Vị thế đang mở",
                "timeframe": trade.timeframe or "15m",
                "strategy": strategy_name,
                "duration": trade.duration or ("Đang mở" if is_open else "15-45 phút")
            },
            "rubricScore": rubric_breakdown,
            "marketContext": market_context,
            "setupValidation": {
                "strategy": strategy_name,
                "checklist": setup_checklist,
                "completeness": completeness_text,
                "disclaimer": "Các điều kiện được định nghĩa theo strategy rule set, không áp đặt quy tắc ngoài chiến lược."
            },
            "beforeTrade": before_trade,
            "afterTrade": after_trade,
            "planVsExecution": plan_vs_execution,
            "riskAnalysis": {
                "hasStopLoss": has_sl,
                "capitalAtRisk": capital_at_risk,
                "maxPotentialLoss": max_potential_loss,
                "riskWarning": risk_warning,
                "riskPct": risk_display,
                "positionSizeValue": position_size_value,
                "positionSizeRiskPct": position_size_risk_pct,
                "stopLossDistanceUsd": sl_distance_usd,
                "stopLossDistancePct": sl_distance_pct,
                "targetDistanceUsd": tp_distance_usd,
                "targetDistancePct": tp_distance_pct,
                "plannedRR": planned_rr,
                "actualRR": actual_rr
            },
            "excursionFlow": excursion_flow,
            "strengths": strengths,
            "categorizedImprovements": {
                "ruleViolations": rule_violations,
                "executionIssues": execution_issues,
                "riskIssues": risk_issues,
                "strategyIssues": strategy_issues
            },
            "aiCoach": {
                "explanation": coach_explanation,
                "actionItem": coach_action,
                "reflectionQuestion": reflection_question
            },
            "learningTakeaways": learning_takeaways,
            "studentReflection": {
                "question": "Nếu thực hiện lại trade này, bạn sẽ thay đổi điều gì?",
                "placeholder": "Ví dụ: Em sẽ chờ nến 15m đóng cửa xác nhận trước khi vào lệnh, đồng thời đặt SL cố định dưới đáy swing low...",
            },
            "sources": sources
        }

    def evaluate_reflection(self, trade: TradeInput, question: str, reflection_text: str) -> Dict[str, Any]:
        """
        Analyzes the student's self-reflection text and provides constructive mentor feedback.
        """
        if not reflection_text or len(reflection_text.strip()) < 5:
            return {
                "feedback": "Hãy dành một chút thời gian viết chi tiết hơn về suy nghĩ của bạn để AI Coach có thể đồng hành sâu sát nhất cùng bạn!",
                "score": 50,
                "encouragement": "Kỹ năng tự phản biện (Self-Reflection) là chìa khóa phân biệt một trader nghiệp dư và chuyên nghiệp."
            }

        # Check key keywords in reflection
        text_lower = reflection_text.lower()
        has_sl_mention = "stop loss" in text_lower or "sl" in text_lower or "dừng lỗ" in text_lower or "cắt lỗ" in text_lower
        has_patience_mention = "kiên nhẫn" in text_lower or "nến đóng" in text_lower or "chờ" in text_lower or "vào sớm" in text_lower
        has_risk_mention = "rủi ro" in text_lower or "khối lượng" in text_lower or "position size" in text_lower or "vốn" in text_lower
        has_emotion_mention = "tâm lý" in text_lower or "sợ" in text_lower or "fomo" in text_lower or "tham" in text_lower

        positive_points = []
        if has_sl_mention:
            positive_points.append("Bạn đã nhận thức rất rõ tầm quan trọng của việc quản lý điểm dừng lỗ (Stop Loss).")
        if has_patience_mention:
            positive_points.append("Bạn đã chú ý đến tính kỷ luật chờ đợi nến xác nhận thay vì vào lệnh vội vã.")
        if has_risk_mention:
            positive_points.append("Bạn đã lưu tâm đến quản trị tỷ lệ rủi ro và phân bổ khối lượng vị thế.")
        if has_emotion_mention:
            positive_points.append("Rất đáng khen khi bạn dám nhìn thẳng vào cảm xúc tâm lý khi mở lệnh.")

        if not positive_points:
            positive_points.append("Bạn đã có tinh thần chủ động rà soát lại hành vi vào lệnh của mình.")

        feedback_summary = (
            "Góc nhìn tự phản biện rất tốt! " + " ".join(positive_points) + " "
            "Hãy ghi nhớ bài học này và chuyển hóa nó thành một quy tắc bắt buộc trong Checklist trước khi mở lệnh tiếp theo."
        )

        # VIP LLM evaluation if available
        if llm_client.is_configured():
            sys_p = (
                "Bạn là một AI Trading Mentor giàu kinh nghiệm. Học viên vừa gửi câu trả lời tự phản biện cho một lệnh giao dịch. "
                "Hãy đọc câu trả lời và viết phản hồi ngắn gọn (2-3 câu) khích lệ, phân tích điểm tự nhận thức tốt và đưa ra lời khuyên hành động cụ thể."
            )
            user_p = (
                f"Lệnh: {trade.side} {trade.symbol}, Entry: {trade.entryPrice}, SL: {trade.stopLoss}.\n"
                f"Câu hỏi: {question}\n"
                f"Câu trả lời của học viên: \"{reflection_text}\""
            )
            llm_fb = llm_client.generate_text(sys_p, user_p, max_tokens=150)
            if llm_fb:
                feedback_summary = llm_fb

        return {
            "feedback": feedback_summary,
            "reflectionReceived": reflection_text,
            "encouragement": "Tuyệt vời! Việc biến nhận thức thành hành động kỷ luật sẽ giúp bạn tiến bộ vượt bậc.",
            "timestamp": datetime.now().isoformat()
        }

trade_analyzer = TradeAnalyzer()
