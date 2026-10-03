from typing import Dict, Any, List
from app.rag.schema import TradeInput
from app.rag.retriever import retriever

class StrategyComparator:
    """
    Compares a trade simultaneously under multiple methodologies:
    Price Action (Al Brooks / Bob Volman) vs ICT / Smart Money Concepts (Michael Huddleston).
    Objective comparison with evidence, similarities and differences without claiming superiority.
    """

    def compare(self, trade: TradeInput, lang: str = "vi") -> Dict[str, Any]:
        symbol = trade.symbol
        side = trade.side.upper()
        entry = trade.entryPrice
        sl = trade.stopLoss
        tp = trade.takeProfit
        is_en = lang == "en"

        entry_fmt = f"{entry:.4f}" if entry < 1 else (f"{entry:,.2f}" if entry < 100 else f"{entry:,.0f}")
        sl_fmt = (f"{sl:.4f}" if sl < 1 else (f"{sl:,.2f}" if sl < 100 else f"{sl:,.0f}")) if sl is not None else ("no SL set" if is_en else "chưa đặt SL")

        if is_en:
            price_action_view = {
                "frameworkName": "Price Action (Classical & Objective)",
                "keyFocus": ["Market Structure (HH/HL or LH/LL)", "Support & Resistance", "Breakout / Retest", "Rejection / Pin Bar"],
                "setupInterpretation": (
                    f"Under the Price Action lens, this {side} position at ${entry_fmt} is viewed as a Pullback Retest of "
                    f"a prior support/resistance zone. Price Action traders seek price acceptance at horizontal or trendline boundaries, "
                    f"requiring a definitive Pinbar or rejection candle close before entering."
                ),
                "stopLossPlacement": (
                    f"Price Action Stop Loss is placed directly beyond the Signal Bar Low or beneath the nearest Higher Low structural swing (approx. ${sl_fmt})."
                ),
                "takeProfitTarget": (
                    f"Profit target is projected to the previous Swing High / major resistance, or calculated using the Measured Move technique."
                ),
                "evidenceRequired": "Decisive candle close past boundary, volume surge on breakout, and clean rejection wick upon retest."
            }

            ict_view = {
                "frameworkName": "ICT / Smart Money Concepts",
                "keyFocus": ["Liquidity Pools (BSL / SSL)", "Fair Value Gap (FVG)", "Order Block (OB)", "Market Structure Shift (MSS)"],
                "setupInterpretation": (
                    f"Under ICT, this {side} position is examined via the IPDA delivery algorithm. "
                    f"Smart Money sweeps resting liquidity at prior swing lows, triggers aggressive Displacement leaving a Fair Value Gap (FVG), "
                    f"and provides optimal trade entry (OTE) in the Discount zone upon an FVG / Order Block retest."
                ),
                "stopLossPlacement": (
                    f"ICT Stop Loss is placed strictly below the displacement swing origin or the valid Order Block invalidation level, "
                    f"beyond which the institutional narrative is invalidated."
                ),
                "takeProfitTarget": (
                    f"ICT target directly targets opposite Buy-side Liquidity (BSL), such as Equal Highs or unmitigated higher-timeframe imbalances."
                ),
                "evidenceRequired": "Displacement impulse candle, unmitigated FVG, and clear prior liquidity sweep."
            }

            similarities = [
                "Both frameworks insist on waiting for a retracement / retest rather than chasing market extremes.",
                "Both establish Stop Loss based on structural invalidation levels rather than arbitrary monetary amounts.",
                "Both demand clear price rejection and decisive displacement at core value zones."
            ]

            differences = [
                "Price Action explains reversals through classical Supply-Demand balance and crowd psychology at static barriers.",
                "ICT attributes price delivery to algorithmic order pairing and institutional liquidity runs.",
                "Price Action uses isolated candlestick patterns; ICT demands a 3-candle sequence creating an imbalance (FVG) and Order Block."
            ]
        else:
            price_action_view = {
                "frameworkName": "Price Action (Cổ điển & Khách quan)",
                "keyFocus": ["Market Structure (HH/HL hoặc LH/LL)", "Support & Resistance", "Breakout / Retest", "Nến từ chối (Rejection/Pinbar)"],
                "setupInterpretation": (
                    f"Dưới lăng kính Price Action, lệnh {side} tại mức giá ${entry_fmt} được nhìn nhận là một nhịp kiểm định "
                    f"lại vùng hỗ trợ/kháng cự cũ (Pullback Retest). Trader Price Action tìm kiếm sự tôn trọng của giá tại các ngưỡng cản "
                    f"ngang hoặc đường xu hướng, kèm theo nến Pinbar hoặc nến đảo chiều đóng cửa dứt khoát trước khi vào lệnh."
                ),
                "stopLossPlacement": (
                    f"Điểm đặt Stop Loss theo Price Action sẽ nằm ngay dưới đáy nến tín hiệu (Signal Bar Low) hoặc dưới đáy "
                    f"cấu trúc Higher Low gần nhất (khoảng ${sl_fmt})."
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

        # Simulated Numerical Setups for visual comparison
        is_buy = side == "BUY" or side == "LONG"
        if is_buy:
            pa_sl = entry * 0.975
            pa_tp = entry * 1.050
            pa_rr = "1:2.0"
            pa_risk_pct = "-2.5%"
            pa_reward_pct = "+5.0%"

            ict_entry = entry * 0.995
            ict_sl = entry * 0.983
            ict_tp = entry * 1.055
            ict_rr = "1:5.0"
            ict_risk_pct = "-1.2%"
            ict_reward_pct = "+6.0%"
        else:
            pa_sl = entry * 1.025
            pa_tp = entry * 0.950
            pa_rr = "1:2.0"
            pa_risk_pct = "-2.5%"
            pa_reward_pct = "+5.0%"

            ict_entry = entry * 1.005
            ict_sl = entry * 1.017
            ict_tp = entry * 0.945
            ict_rr = "1:5.0"
            ict_risk_pct = "-1.2%"
            ict_reward_pct = "+6.0%"

        simulated_setups = {
            "priceAction": {
                "framework": "Price Action",
                "entry": f"${entry_fmt}",
                "stopLoss": f"${pa_sl:,.2f}" if pa_sl < 100 else f"${pa_sl:,.0f}",
                "takeProfit": f"${pa_tp:,.2f}" if pa_tp < 100 else f"${pa_tp:,.0f}",
                "rr": pa_rr,
                "riskPct": pa_risk_pct,
                "rewardPct": pa_reward_pct,
                "rationale": (
                    "Stop Loss under Signal Bar low; Take Profit at adjacent resistance level."
                    if is_en else
                    "Dừng lỗ dưới đáy nến tín hiệu (Signal Bar); Chốt lời tại đỉnh cản kháng cự liền kề."
                )
            },
            "ict": {
                "framework": "ICT / SMC",
                "entry": f"${ict_entry:,.2f}" if ict_entry < 100 else f"${ict_entry:,.0f}",
                "stopLoss": f"${ict_sl:,.2f}" if ict_sl < 100 else f"${ict_sl:,.0f}",
                "takeProfit": f"${ict_tp:,.2f}" if ict_tp < 100 else f"${ict_tp:,.0f}",
                "rr": ict_rr,
                "riskPct": ict_risk_pct,
                "rewardPct": ict_reward_pct,
                "rationale": (
                    "Wait for retracement into Discount FVG for entry; tight Stop Loss below Displacement base; Target opposite BSL liquidity."
                    if is_en else
                    "Chờ giá thoái lui về vùng Discount/FVG để vào lệnh; Stop Loss chặt chẽ dưới rễ nến Displacement; Chốt lời tại bể thanh khoản đối diện BSL."
                )
            }
        }

        # Side-by-side Technical Metric Matrix
        if is_en:
            metric_matrix = [
                {
                    "criterion": "Expected Risk:Reward Ratio",
                    "priceAction": "1:1.8 — 1:2.5 (Realistic & Achievable)",
                    "ict": "1:3.5 — 1:5.0+ (Optimized High Asymmetry)",
                    "badge": "ICT ADVANTAGE"
                },
                {
                    "criterion": "Theoretical Win Rate",
                    "priceAction": "50% — 55% (Higher via barrier support)",
                    "ict": "40% — 48% (Lower, offset by superior R:R)",
                    "badge": "PA ADVANTAGE"
                },
                {
                    "criterion": "Trade Trigger Condition",
                    "priceAction": "Pin Bar / Rejection Bar at Level",
                    "ict": "Retest 50% FVG / Order Block mitigation",
                    "badge": "TECHNICAL"
                },
                {
                    "criterion": "Optimal Timeframe",
                    "priceAction": "M15 — H1 — D1 (Multi-timeframe)",
                    "ict": "M1 — M5 — M15 (Killzone session trading)",
                    "badge": "TIMEFRAME"
                },
                {
                    "criterion": "Signal Frequency",
                    "priceAction": "Frequent / Plentiful setups weekly",
                    "ict": "Highly selective / Demands patient execution",
                    "badge": "FREQUENCY"
                },
                {
                    "criterion": "Execution Learning Curve",
                    "priceAction": "Moderate (Intuitive level recognition)",
                    "ict": "Advanced (Requires liquidity trap discernment)",
                    "badge": "LEARNING"
                }
            ]

            market_regime_advisory = {
                "trending": (
                    "In TRENDING Markets: Prioritize Price Action as Higher Highs / Higher Lows ride momentum swiftly without risk of missing entries due to shallow pullbacks."
                ),
                "ranging": (
                    "In RANGING & Chop Markets: Prioritize ICT / SMC because the framework excels at identifying 2-sided Liquidity Sweeps and avoiding false breakout traps."
                ),
                "recommendation": (
                    "Professional Hybrid Synergy: Use Price Action to establish macro bias and key levels on HTF, and use ICT / SMC for tight Sniper Entry execution on LTF."
                )
            }
        else:
            metric_matrix = [
                {
                    "criterion": "Tỷ lệ R:R kỳ vọng",
                    "priceAction": "1:1.8 — 1:2.5 (Thực tế & Dễ đạt)",
                    "ict": "1:3.5 — 1:5.0+ (Tối ưu biên độ cực lớn)",
                    "badge": "LỢI THẾ ICT"
                },
                {
                    "criterion": "Tỷ lệ thắng lý thuyết (Win Rate)",
                    "priceAction": "50% — 55% (Cao hơn nhờ theo cản)",
                    "ict": "40% — 48% (Thấp hơn nhưng bù lại bằng R:R)",
                    "badge": "LỢI THẾ PA"
                },
                {
                    "criterion": "Điều kiện kích hoạt lệnh (Trigger)",
                    "priceAction": "Nến Pinbar / Nến đảo chiều đóng cản",
                    "ict": "Retest 50% FVG / Khối Order Block",
                    "badge": "KỸ THUẬT"
                },
                {
                    "criterion": "Khung thời gian tối ưu",
                    "priceAction": "M15 — H1 — D1 (Đa khung)",
                    "ict": "M1 — M5 — M15 (Giao dịch phiên Killzone)",
                    "badge": "TIME"
                },
                {
                    "criterion": "Tần suất tín hiệu",
                    "priceAction": "Thường xuyên / Nhiều cơ hội trong tuần",
                    "ict": "Rất chọn lọc / Cần kiên nhẫn cao",
                    "badge": "FREQUENCY"
                },
                {
                    "criterion": "Độ khó thực thi cho sinh viên",
                    "priceAction": "Trung bình (Dễ nhận diện cản hỗ trợ)",
                    "ict": "Nâng cao (Cần đọc bẫy thanh khoản)",
                    "badge": "LEARNING"
                }
            ]

            market_regime_advisory = {
                "trending": (
                    "Khi thị trường có SÓNG MẠNH (Trending Market): Nên ưu tiên Price Action vì mô hình Higher Highs / "
                    "Higher Lows bám xu hướng rất nhanh, không sợ bị lỡ sóng khi giá tăng dốc không kịp hồi quy sâu."
                ),
                "ranging": (
                    "Khi thị trường ĐI NGANG & BẪY GIÁ (Ranging & Manipulation): Nên ưu tiên ICT / SMC vì thuật toán "
                    "chuyên nhận diện các cú quét thanh khoản 2 đầu (Liquidity Sweep) và tránh các bẫy Breakout giả của nhà cái."
                ),
                "recommendation": (
                    "Lời khuyên kết hợp chuyên nghiệp: Dùng Price Action để xác định Cấu trúc vĩ mô trên khung thời gian lớn (HTF Bias), "
                    "và dùng ICT/SMC để tìm điểm bóp Stop Loss siêu chặt (Sniper Entry) trên khung thời gian nhỏ (LTF Execution)."
                )
            }

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
            "simulatedSetups": simulated_setups,
            "metricMatrix": metric_matrix,
            "marketRegimeAdvisory": market_regime_advisory,
            "similarities": similarities,
            "differences": differences,
            "conclusion": (
                "💡 **Key Pedagogical Takeaway**: No single methodology holds a 100% win rate across all market environments. "
                "Both Price Action and ICT offer structured, logical lenses to manage risk and execute with high discipline."
                if is_en else
                "💡 **Kết luận học tập**: Không có phương pháp nào đúng 100% trong mọi điều kiện thị trường. "
                "Cả Price Action và ICT đều cung cấp các góc nhìn logic để bạn quản trị rủi ro và ra quyết định có cơ sở."
            ),
            "sources": sources
        }

strategy_comparator = StrategyComparator()
