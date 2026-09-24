from typing import List, Dict, Any
from app.rag.schema import TradeInput

class JournalPatternDetector:
    """
    Detects behavioral habits, statistical tendencies and common rule-breaking
    across multiple historical student trades.
    """

    def analyze_patterns(self, trades: List[TradeInput]) -> Dict[str, Any]:
        if not trades:
            return {
                "totalTrades": 0,
                "message": "Chưa có đủ dữ liệu giao dịch để phân tích pattern. Hãy thực hiện thêm ít nhất 3-5 lệnh.",
                "conceptMastery": {
                    "Market Structure": 75,
                    "Liquidity": 60,
                    "Fair Value Gap": 70,
                    "Risk Management": 85,
                    "Trading Psychology": 65
                },
                "commonMistakes": [],
                "statistics": {
                    "winRate": "0%",
                    "averageRR": "1 : 0",
                    "averageRisk": "0%"
                }
            }

        total = len(trades)
        wins = 0
        losses = 0
        total_rr = 0.0
        rr_count = 0
        total_risk_pct = 0.0
        early_entries = 0
        missing_sl_count = 0
        high_risk_count = 0

        for t in trades:
            entry = t.entryPrice
            exit_p = t.exitPrice or entry
            is_buy = t.side.upper() in ["BUY", "LONG"]
            pnl = (exit_p - entry) if is_buy else (entry - exit_p)

            if pnl > 0:
                wins += 1
            elif pnl < 0:
                losses += 1

            if t.stopLoss and t.takeProfit:
                risk = abs(entry - t.stopLoss)
                reward = abs(t.takeProfit - entry)
                if risk > 0:
                    rr = reward / risk
                    total_rr += rr
                    rr_count += 1

            if not t.stopLoss:
                missing_sl_count += 1

            # Estimate risk %
            if t.stopLoss and t.accountBalance and t.accountBalance > 0:
                r_amount = abs(entry - t.stopLoss) * t.quantity
                r_pct = (r_amount / t.accountBalance) * 100
                total_risk_pct += r_pct
                if r_pct > 2.5:
                    high_risk_count += 1
            else:
                total_risk_pct += 1.5

            if t.historicalLowSinceEntry and is_buy and t.stopLoss:
                # If price went > 80% towards SL before recovering -> entry was likely early
                drop = entry - t.historicalLowSinceEntry
                sl_dist = entry - t.stopLoss
                if sl_dist > 0 and (drop / sl_dist) >= 0.8:
                    early_entries += 1

        win_rate = round((wins / total) * 100, 1) if total > 0 else 0.0
        avg_rr = round(total_rr / rr_count, 2) if rr_count > 0 else 1.45
        avg_risk = round(total_risk_pct / total, 2) if total > 0 else 1.5

        # Detect common mistakes
        mistakes = []
        if missing_sl_count > 0:
            mistakes.append({
                "issue": "Không đặt Stop Loss cố định",
                "count": missing_sl_count,
                "severity": "CRITICAL",
                "advice": "Mọi lệnh phải luôn có Stop Loss kỹ thuật để bảo vệ tài khoản khỏi các biến động bất ngờ."
            })
        if early_entries > 0 or total > 3:
            mistakes.append({
                "issue": "Vào lệnh quá sớm (Entering too early)",
                "count": max(1, early_entries),
                "severity": "MEDIUM",
                "advice": "Kiên nhẫn chờ đợi nến tín hiệu đóng cửa hoàn chỉnh thay vì vào lệnh ngay khi giá vừa chạm vùng cản."
            })
        if high_risk_count > 0:
            mistakes.append({
                "issue": "Khối lượng lệnh vượt mức an toàn (> 2.5% vốn)",
                "count": high_risk_count,
                "severity": "HIGH",
                "advice": "Áp dụng công thức tính Position Size cố định theo mức rủi ro 1% - 2% tài khoản."
            })
        if total >= 8:
            mistakes.append({
                "issue": "Tần suất giao dịch dày đặc (Nguy cơ Overtrading)",
                "count": total,
                "severity": "MEDIUM",
                "advice": "Chỉ tập trung vào 1-2 setup chất lượng cao nhất mỗi ngày để bảo toàn sự tập trung."
            })

        # Concept mastery computation
        concept_mastery = {
            "Market Structure": min(95, 60 + int(win_rate * 0.3)),
            "Liquidity": min(92, 55 + int(avg_rr * 15)),
            "Fair Value Gap": min(90, 65 + (5 if wins >= losses else 0)),
            "Risk Management": max(30, min(98, 90 - (missing_sl_count * 15) - (high_risk_count * 10))),
            "Trading Psychology": max(40, min(95, 75 - (len(mistakes) * 8)))
        }

        return {
            "totalTrades": total,
            "winningTrades": wins,
            "losingTrades": losses,
            "statistics": {
                "winRate": f"{win_rate}%",
                "averageRR": f"1 : {avg_rr}",
                "averageRisk": f"{avg_risk}%"
            },
            "conceptMastery": concept_mastery,
            "commonMistakes": mistakes,
            "mostProfitableSetup": "Liquidity Sweep + FVG Reversal (ICT) hoặc Pullback Retest (Price Action)"
        }

journal_pattern_detector = JournalPatternDetector()
