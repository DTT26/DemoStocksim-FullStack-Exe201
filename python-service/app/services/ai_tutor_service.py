from typing import Dict, Any, List, Optional
import re
from app.rag.retriever import retriever
from app.rag.schema import AskQuestionRequest, ConceptExplainRequest, RetrievalResult
from app.services.llm_client import llm_client
from app.services.market_context_helper import (
    check_strict_signal_guardrail,
    extract_relevant_stocks,
    classify_user_intent,
    get_all_methods_overview,
    SYMBOL_ALIASES
)
from app.services.prop_firm_risk_tool import (
    extract_trade_intent,
    evaluate_prop_firm_risk
)
from app.services.trading_methods_registry import (
    route_query_to_method,
    TradingMethod
)
from app.services.time_helper import (
    get_current_time_context,
    is_time_query
)

SIGNAL_KEYWORDS = [
  "có nên mua", "có nên bán", "buy hay sell", "mua hay bán", 
  "nên vào lệnh không", "target bao nhiêu", "phím hàng", "kèo", "cho kèo",
  "should i buy", "should i sell", "buy or sell"
]

GREETING_KEYWORDS = [
  "hi", "hello", "chào", "xin chào", "hey", "halo", "alo", "chào bạn", "bạn là ai", 
  "who are you", "giới thiệu", "bạn làm được gì", "hướng dẫn", "bắt đầu", "help"
]

class AiTutorService:
    """
    AI Trading Tutor Service.
    Enforces educational integrity:
    1. Welcomes user and handles assistance requests intelligently.
    2. Rejects buy/sell signal requests and redirects to objective reasoning.
    3. If API Key is present: Answers any question with full LLM intelligence.
       If RAG documents match, enriches LLM with Ground Truth and citations.
    4. If no API Key: Answers from verified local Knowledge Base documents
       with framework-specific Socratic questions.
    """

    def is_asking_for_signal(self, text: str) -> bool:
        lower = text.lower()
        return any(kw in lower for kw in SIGNAL_KEYWORDS)

    def is_greeting(self, text: str) -> bool:
        cleaned = re.sub(r'[^\w\s]', '', text.lower()).strip()
        words = cleaned.split()
        if len(words) <= 3 and any(kw in cleaned for kw in GREETING_KEYWORDS):
            return True
        return False

    def is_assistance_request(self, text: str) -> bool:
        lower = text.lower().strip()
        phrases = [
            "giúp tôi", "giúp đỡ", "hỗ trợ tôi", "bạn làm được gì", 
            "bạn có thể làm gì", "chỉ tôi", "dạy tôi", "help me", 
            "bạn có thể giúp", "hướng dẫn tôi", "giúp được gì"
        ]
        return any(p in lower for p in phrases)

    def get_socratic_questions(self, doc) -> List[str]:
        concept = doc.concept
        framework = doc.framework.upper()

        if framework == "PSYCHOLOGY":
            return [
                "Lần gần nhất bạn cảm thấy FOMO hoặc muốn giao dịch trả thù (Revenge Trading) là trong bối cảnh nào?",
                "Bạn thường ghi chép lại lý do vào lệnh vào nhật ký trước khi vào lệnh hay sau khi lệnh đã đóng?",
                "Sau 2 lệnh thua liên tiếp, kế hoạch nghỉ giải lao (Cool-down) của bạn được thực hiện ra sao?"
            ]
        elif framework == "RISK_MANAGEMENT":
            return [
                "Khối lượng vị thế (Position Size) hiện tại của bạn có đảm bảo mức rủi ro không vượt quá 2% tổng tài khoản không?",
                "Tỷ lệ Risk:Reward (R:R) tối thiểu mà bạn kiên quyết yêu cầu trước khi bấm nút mở vị thế là bao nhiêu?",
                "Khi thị trường biến động mạnh, bạn có bao giờ nới lỏng hoặc dời Stop Loss ra xa hơn không?"
            ]
        elif "LIQUIDITY" in concept.upper():
            return [
                "Vùng thanh khoản (BSL/SSL) bạn vừa quan sát là đỉnh/đáy của phiên hôm nay hay khung ngày?",
                "Sau khi giá quét qua vùng đỉnh/đáy cũ, nến phản ứng có xuất hiện râu từ chối (Rejection) rõ ràng không?",
                "Điểm dừng lỗ kỹ thuật của bạn có nằm an toàn phía ngoài cây nến quét thanh khoản không?"
            ]
        else: # Technical setups: FVG, Order Block, Market Structure, Breakout
            return [
                f"Đặc điểm nào của cây nến tại vùng {concept} giúp bạn xác nhận độ tin cậy của setup này?",
                f"Trong setup {concept}, điểm Invalidation (Stop Loss) vô hiệu hóa toàn bộ cấu trúc nằm ở đâu?",
                "Nếu giá đi ngược 1R so với dự kiến, kế hoạch quản trị rủi ro dự phòng của bạn là gì?"
            ]

    def answer_question(self, req: AskQuestionRequest) -> Dict[str, Any]:
        query = req.question.strip()

        # 1. Kích hoạt Strict Signal Guardrail trước mọi luồng xử lý (kể cả khi có LLM)
        # Ngăn chặn hoàn toàn prompt injection hoặc yêu cầu phím lệnh trực tiếp
        strict_guard = check_strict_signal_guardrail(query, req.symbol)
        if strict_guard:
            return strict_guard

        # Static Guardrail for Buy/Sell signals (khi không có LLM)
        if not llm_client.is_configured() and self.is_asking_for_signal(query):
            symbol = req.symbol or "cổ phiếu này"
            return {
                "answer": (
                    f"⚠️ **Nguyên tắc hệ thống**: AI hoạt động như một Trợ lý Giáo dục & Phân tích Độc lập, "
                    f"tuyệt đối không đưa ra khuyến nghị Mua (Buy) / Bán (Sell) hay phím lệnh giao dịch cho {symbol}.\n\n"
                    f"Thay vào đó, tôi có thể hỗ trợ bạn bóc tách các yếu tố kỹ thuật đang ủng hộ hoặc phản đối "
                    f"một vị thế dựa trên phương pháp Price Action hoặc ICT/SMC để bạn tự đưa ra quyết định độc lập."
                ),
                "reasoning": "Quyết định vào lệnh phải do chính trader chịu trách nhiệm dựa trên kế hoạch và tỷ lệ rủi ro định trước.",
                "sources": [],
                "socraticQuestions": [],
                "guardrailTriggered": "NO_BUY_SELL_SIGNAL"
            }

        # 2. Retrieve relevant verified knowledge documents from Knowledge Base
        results: List[RetrievalResult] = retriever.retrieve(
            query=query,
            framework=req.framework,
            top_k=3
        )

        citations = []
        if results:
            for r in results:
                citations.append({
                    "title": r.document.title,
                    "concept": r.document.concept,
                    "framework": r.document.framework,
                    "source": r.document.source,
                    "sourceUrl": r.document.sourceUrl,
                    "author": r.document.author,
                    "sourceType": r.document.sourceType,
                    "score": r.score
                })

        # Function Calling / Risk Tool: Tự động tính toán Position Sizing & Kiểm tra vi phạm quỹ
        trade_intent = extract_trade_intent(query, active_symbol=req.symbol)
        risk_eval = evaluate_prop_firm_risk(trade_intent, req.userData or {}) if trade_intent else None

        # Real-time Clock & Trading Sessions (Giờ Việt Nam, UTC, New York, Session & Killzones)
        time_ctx = get_current_time_context()

        # 3. VIP MODE: Senior Prop Firm Funded Trader & ICT/SMC Coach Engine
        if llm_client.is_configured():
            active_method = route_query_to_method(
                query,
                has_positions=bool(req.userData and req.userData.get("positions"))
            )
            intent_guidance = active_method.to_prompt_text()

            # Dynamic Risk Tool Prompt Injection
            risk_tool_instruction = ""
            if risk_eval:
                risk_tool_instruction = (
                    "\n\n==================================================\n"
                    "⚡ FUNCTION CALLING: KẾT QUẢ ĐO LƯỜNG VỊ THẾ & RỦI RO QUỸ (PROP FIRM RISK TOOL)\n"
                    "==================================================\n"
                    "Hệ thống đã tự động chạy Function Calling / Risk Tool tính toán vị thế của học viên với kết quả sau:\n"
                    f"- Mã: {risk_eval['symbol']} | Lệnh: {risk_eval['side']} | Entry: ${risk_eval['entry']:,.2f} | SL: ${risk_eval['sl']:,.2f}\n"
                    f"- Khoảng cách SL: {risk_eval['sl_distance']:,.2f} giá\n"
                    f"- Khối lượng dự kiến: {risk_eval['volume']} lot\n"
                    f"- Thua lỗ ước tính nếu dính SL: ${risk_eval['estimated_loss']:,.2f}\n"
                    f"- Giới hạn Daily Loss còn lại trong ngày: ${risk_eval['remaining_daily_loss']:,.2f} (Số dư ví: ${risk_eval['account_balance']:,.2f})\n"
                    f"- Có vi phạm luật quỹ (Hard Breach) không: {'CÓ (NGUY HIỂM CỰC ĐỘ - TRƯỢT QUỸ NGAY LẬP TỨC)' if risk_eval['is_hard_breach'] else 'KHÔNG'}\n"
                    f"- Khối lượng tối đa cho phép để không vi phạm quỹ: {risk_eval['max_safe_lot']} lot\n"
                    f"- Khối lượng khuyến nghị chuẩn 1% rủi ro: {risk_eval['recommended_1pct_lot']} lot\n\n"
                    "QUY TẮC BẮT BUỘC KHI CÓ KẾT QUẢ RỦI RO:\n"
                    "1. KHÔNG nói đạo lý chung chung 'hãy quản lý vốn 1%'. Phải dùng chính xác các con số cụ thể đã tính toán ở trên.\n"
                    "2. Nếu có vi phạm luật quỹ (is_hard_breach = True), BẮT BUỘC đưa khối cảnh báo to rõ lên ngay ĐẦU TIÊN của câu trả lời:\n"
                    "   🔴 **CẢNH BÁO VI PHẠM LUẬT QUỸ (HARD BREACH RISK)**\n"
                    f"   - Đi {risk_eval['volume']} lot với SL này, nếu thua bạn mất ${risk_eval['estimated_loss']:,.2f}.\n"
                    f"   - Daily Drawdown còn lại hôm nay của bạn chỉ là ${risk_eval['remaining_daily_loss']:,.2f}. Lệnh này dính SL đồng nghĩa **TRƯỢT QUỸ NGAY LẬP TỨC**.\n"
                    f"   - Khối lượng tối đa cho phép vào: **Không quá {risk_eval['max_safe_lot']} lot**.\n"
                    "3. Sau đó phân tích ngắn gọn lý do kỹ thuật hoặc hướng dẫn đặt lệnh kỷ luật theo quy định quỹ."
                )

            time_prompt_section = (
                "\n\n==================================================\n"
                "🕒 THỜI GIAN THỰC TẾ HỆ THỐNG & PHIÊN GIAO DỊCH (REAL-TIME CLOCK):\n"
                "==================================================\n"
                f"- Giờ Việt Nam (Chuẩn chính hệ thống): {time_ctx['vn_time']}\n"
                f"- Giờ Quốc tế (UTC): {time_ctx['utc_time']}\n"
                f"- Giờ New York (Wall Street): {time_ctx['ny_time']}\n"
                f"- Phiên thị trường hiện tại: {time_ctx['active_session']}\n"
                f"- Trạng thái Killzone ICT: {time_ctx['active_killzone']}"
            )

            sys_prompt = (
                "Bạn là Senior Prop Firm Funded Trader & AI Trading Coach của nền tảng StockSim.\n"
                "Bạn phân tích thị trường với tư duy của một trader chuyên nghiệp theo phương pháp ICT, SMC (Smart Money Concepts) và Price Action thuần túy.\n\n"
                "Bạn có quyền truy cập ĐẦY ĐỦ VÀO DATABASE HỆ THỐNG gồm:\n"
                "1. Bảng giá thời gian thực của các mã tài sản trên hệ thống liên quan đến câu hỏi (Crypto, Cổ phiếu Mỹ, Hàng hóa Vàng/Dầu, Ngoại hối Forex, Chỉ số).\n"
                "2. Toàn bộ dữ liệu tài khoản của học viên trong Database (Số dư ví, các vị thế/lệnh đang mở LONG/SHORT, lệnh chờ, trạng thái thi Thử Thách Quỹ Prop Firm).\n\n"
                "==================================================\n"
                "PHƯƠNG PHÁP ĐƯỢC KÍCH HOẠT CHO CÂU HỎI HIỆN TẠI:\n"
                "==================================================\n"
                f"{intent_guidance}\n\n"
                "YÊU CẦU BẮT BUỘC:\n"
                "1. Tuân thủ nghiêm ngặt các mục trong [Các yếu tố bắt buộc phân tích] và [Quy chuẩn phản hồi] của phương pháp trên.\n"
                "2. Khi học viên hỏi về GIÁ CỦA BẤT KỲ MÃ NÀO: Tra cứu trong [BẢNG GIÁ THỊ TRƯỜNG LIÊN QUAN] để trả lời chính xác giá thực và biến động 24h.\n"
                "3. Khi học viên hỏi về TÀI KHOẢN/LỆNH: Tra cứu trong [DỮ LIỆU TÀI KHOẢN & VỊ THẾ HỌC VIÊN TRONG DATABASE].\n"
                "4. Tuyệt đối KHÔNG đưa ra tín hiệu Mua/Bán/Phím lệnh cụ thể (No Buy/Sell signal). Nếu học viên hỏi có nên vào lệnh hay không, áp dụng Phương Pháp 20 [NO-TRADE ANALYSIS / WAIT FOR CONFIRMATION] và chỉ rõ các điều kiện còn thiếu.\n"
                "5. TRẢ LỜI NGẮN GỌN, CÔ ĐỌNG, ĐI THẲNG VÀO TRỌNG TÂM, in đậm các mốc giá và POI quan trọng.\n"
                "6. DUY TRÌ MẠCH HỘI THOẠI LIÊN TIẾP: Tham chiếu lịch sử hội thoại gần đây để hiểu rõ các câu hỏi tiếp nối và đại từ thay thế.\n"
                "7. QUY TẮC PHẢN HỒI THỜI GIAN & HỘI THOẠI ĐỜI THƯỜNG:\n"
                "   - Khi học viên hỏi về thời gian/giờ giấc (ví dụ: 'giờ mấy giờ rồi em', 'bây giờ là mấy giờ', 'hôm nay ngày mấy', 'đang là phiên nào'):\n"
                "     + BẮT BUỘC trả lời chính xác theo [Giờ Việt Nam (UTC+7)] làm mốc giờ chuẩn mặc định của học viên.\n"
                "     + Cung cấp thêm giờ UTC và phiên giao dịch hiện tại nếu có ý nghĩa trong trading.\n"
                "     + Trả lời tự nhiên, thân thiện, lễ phép và đi thẳng vào câu hỏi.\n"
                "     + TUYỆT ĐỐI KHÔNG tự tiện chèn câu phân tích biểu đồ không liên quan (như 'Quay trở lại với bối cảnh thị trường BTCUSDT...') khi học viên KHÔNG hỏi về mã đó!"
                f"{time_prompt_section}"
                f"{risk_tool_instruction}\n\n"
                "==================================================\n"
                "QUY TẮC TRẢ LỜI CHỐNG NÓI CHUNG CHUNG (ANTI-GENERIC RESPONSE RULE)\n"
                "==================================================\n"
                "Tuyệt đối TRÁNH những câu nói sáo rỗng vô nghĩa như: 'BTC đang tăng', 'Xu hướng đang mạnh', 'Nên cân nhắc Long', 'Đặt SL dưới hỗ trợ', 'Hãy chờ xác nhận'.\n"
                "Mọi câu trả lời phân tích phải tuân theo chuỗi lập luận chặt chẽ:\n"
                "• CÁI GÌ (WHAT): Hiện tượng nến/thị trường cụ thể đang diễn ra.\n"
                "• Ở ĐÂU (WHERE): Mức giá, vùng POI, mốc FVG, đỉnh/đáy thanh khoản chính xác.\n"
                "• TẠI SAO (WHY): Động cơ của Dòng tiền thông minh (Smart Money) / Liquidity Sweep.\n"
                "• BẰNG CHỨNG (EVIDENCE): Nến Displacement, Volume, Thân nến đóng qua cản.\n"
                "• ĐIỀU GÌ VÔ HIỆU HÓA (INVALIDATION): Mức giá cụ thể mà nếu chạm vào thì luận điểm bị HỦY BỎ.\n"
                "• YẾU TỐ CÒN CHƯA RÕ (UNKNOWN): Điều kiện cần chờ thị trường xác nhận thêm."
            )
            
            chat_history_str = ""
            if req.chatHistory and len(req.chatHistory) > 0:
                history_lines = []
                for turn in req.chatHistory[-6:]:
                    sender = turn.get("sender") or turn.get("role")
                    role_label = "Học viên" if sender == "user" else "AI Tutor"
                    msg_text = str(turn.get("text", "")).strip()
                    if msg_text:
                        if len(msg_text) > 400:
                            msg_text = msg_text[:400] + "..."
                        history_lines.append(f"{role_label}: {msg_text}")
                    if history_lines:
                        chat_history_str = "\n\n💬 [LỊCH SỬ HỘI THOẠI GẦN ĐÂY ĐỂ TRẢ LỜI LIÊN TIẾP]:\n" + "\n".join(history_lines)

            # 1. Mã hiện tại đang xem trên biểu đồ
            current_chart_str = ""
            if req.symbol or req.currentPrice is not None:
                market_lines = []
                if req.symbol:
                    market_lines.append(f"- Mã tài sản đang mở biểu đồ: {req.symbol}")
                if req.currentPrice is not None:
                    formatted_p = f"{req.currentPrice:,.4f}".rstrip('0').rstrip('.') if req.currentPrice < 1 else f"{req.currentPrice:,.2f}"
                    market_lines.append(f"- Giá thị trường thực tế: ${formatted_p}")
                if req.timeframe:
                    market_lines.append(f"- Khung thời gian biểu đồ người dùng đang xem: {req.timeframe}")
                if req.marketContext:
                    mc = req.marketContext
                    if mc.get("change24h") is not None:
                        market_lines.append(f"- Biến động 24h: {mc.get('change24h')}%")
                    if mc.get("exchange"):
                        market_lines.append(f"- Sàn giao dịch: {mc.get('exchange')}")
                current_chart_str = "\n\n📊 [BIỂU ĐỒ ĐANG XEM]:\n" + "\n".join(market_lines)

            # 2. Bảng giá lọc thông minh (chỉ nạp 3-5 mã liên quan, chống tràn token & giảm độ trễ)
            all_stocks_str = ""
            relevant_stocks = extract_relevant_stocks(
                query=query,
                chat_history=req.chatHistory,
                active_symbol=req.symbol,
                all_stocks=req.allStocks
            )
            if relevant_stocks:
                stock_lines = []
                for s in relevant_stocks:
                    sym = s.get("symbol", "")
                    name = s.get("name", sym)
                    p = s.get("price")
                    pct = s.get("percent")
                    exch = s.get("exchange", "")
                    mkt = s.get("market", "")
                    if sym and p is not None:
                        p_fmt = f"${p:,.4f}".rstrip('0').rstrip('.') if p < 1 else f"${p:,.2f}"
                        pct_fmt = f" ({pct:+.2f}%)" if pct is not None else ""
                        stock_lines.append(f"• {sym} ({name} - {exch} [{mkt}]): {p_fmt}{pct_fmt}")
                if stock_lines:
                    all_stocks_str = "\n\n📈 [BẢNG GIÁ THỊ TRƯỜNG LIÊN QUAN]:\n" + "\n".join(stock_lines)

            # 3. Dữ liệu tài khoản & vị thế của học viên trong Database
            user_data_str = ""
            if req.userData:
                ud = req.userData
                ud_lines = []
                wallet = ud.get("wallet", {})
                if wallet:
                    ud_lines.append(f"- Ví tiền: Tổng số dư ${wallet.get('balance', 0):,.2f} | Khả dụng: ${wallet.get('availableBalance', 0):,.2f}")
                positions = ud.get("positions", [])
                if positions:
                    pos_items = []
                    for pos in positions:
                        pos_items.append(f"{pos.get('side')} {pos.get('symbol')} (Entry: ${pos.get('entryPrice')}, x{pos.get('leverage')}, Qty: {pos.get('quantity')}, TP: {pos.get('tp') or 'Chưa đặt'}, SL: {pos.get('sl') or 'Chưa đặt'})")
                    ud_lines.append(f"- Vị thế đang mở ({len(positions)} vị thế): " + "; ".join(pos_items))
                else:
                    ud_lines.append("- Vị thế đang mở: Hiện không có vị thế mở nào.")
                
                challenge = ud.get("challenge")
                if challenge:
                    ud_lines.append(f"- Thử thách Quỹ Cấp Vốn: Cấp {challenge.get('level')}, Trạng thái: {challenge.get('status')}, Vốn ban đầu: ${challenge.get('capital', 0):,.0f}, Lợi nhuận: ${challenge.get('totalProfit', 0):,.2f}, Lỗ ngày: ${challenge.get('dailyLoss', 0):,.2f}, Drawdown: ${challenge.get('maxLoss', 0):,.2f}")
                
                if ud_lines:
                    user_data_str = "\n\n👤 [DỮ LIỆU TÀI KHOẢN & VỊ THẾ HỌC VIÊN TRONG DATABASE]:\n" + "\n".join(ud_lines)

            risk_context = ""
            if risk_eval:
                risk_context = f"\n\n🚨 [KẾT QUẢ ĐO LƯỜNG VỊ THẾ TỰ ĐỘNG - FUNCTION CALLING RISK TOOL]:\n{risk_eval['alert_markdown']}"

            kb_context = ""
            if results:
                kb_context = "\n\nTài liệu tham khảo đối chiếu từ Knowledge Base:\n" + "\n---\n".join([
                    f"• {r.document.title} [{r.document.sourceType}] ({r.document.author}): {r.document.content}"
                    for r in results
                ])

            if is_time_query(query):
                user_p = (
                    f"{chat_history_str}\n\n"
                    f"Câu hỏi hiện tại của học viên: {query}\n\n"
                    f"🕒 [DỮ LIỆU ĐỒNG HỒ THỜI GIAN THỰC CỦA HỆ THỐNG]:\n"
                    f"- Giờ Việt Nam (UTC+7): {time_ctx['vn_time']}\n"
                    f"- Giờ Quốc tế: {time_ctx['utc_time']}\n"
                    f"- Giờ New York: {time_ctx['ny_time']}\n"
                    f"- Phiên giao dịch hiện tại: {time_ctx['active_session']}\n"
                    f"- Trạng thái Killzone ICT: {time_ctx['active_killzone']}\n\n"
                    "Hãy trả lời trực tiếp, chính xác Giờ Việt Nam cho học viên một cách thân thiện và súc tích. "
                    "Vì học viên chỉ hỏi về thời gian/giờ giấc, TUYỆT ĐỐI KHÔNG tự tiện chèn thêm phân tích biểu đồ mã tài sản vào câu trả lời."
                )
            else:
                user_p = (
                    f"{chat_history_str}\n\n"
                    f"Câu hỏi hiện tại của học viên: {query}"
                    f"{risk_context}"
                    f"{current_chart_str}"
                    f"{all_stocks_str}"
                    f"{user_data_str}"
                    f"{kb_context}\n\n"
                    "Hãy trả lời súc tích, hoàn chỉnh, chuyên nghiệp và chuẩn xác dựa trên toàn bộ dữ liệu thị trường và database học viên được cung cấp ở trên."
                )
            llm_answer = llm_client.generate_text(sys_prompt, user_p, max_tokens=1500)

            if llm_answer:
                # Nếu có rủi ro vi phạm quỹ Hard Breach, đảm bảo khối cảnh báo ở đầu bài
                if risk_eval and risk_eval.get("is_hard_breach"):
                    if "🔴" not in llm_answer and "HARD BREACH" not in llm_answer.upper():
                        llm_answer = f"{risk_eval['alert_markdown']}\n\n---\n\n{llm_answer}"

                return {
                    "answer": llm_answer,
                    "concept": results[0].document.concept if results else ("Session Timing & Real-time Clock" if is_time_query(query) else ("Prop Firm Risk Management" if risk_eval else "AI Trading Tutor")),
                    "framework": results[0].document.framework if results else "VIP_LLM",
                    "sources": citations,
                    "socraticQuestions": [],
                    "guardrailTriggered": "HARD_BREACH_ALERT" if (risk_eval and risk_eval.get("is_hard_breach")) else None
                }
            elif llm_client.last_error and any(code in llm_client.last_error for code in ["401", "403"]):
                return {
                    "answer": (
                        f"⚠️ **Key AI trong file `.env` bị Google từ chối cấp quyền:**\n\n"
                        f"> 🔴 **Mã lỗi từ Google**: `{llm_client.last_error}`\n\n"
                        f"**Nguyên nhân:** Project hoặc Token này bị hạn chế quyền truy cập API (`PERMISSION_DENIED`).\n\n"
                        f"**Cách xử lý:**\n"
                        f"1. Vào: https://aistudio.google.com/app/apikey bằng một tài khoản Gmail khác\n"
                        f"2. Bấm **'Create API key'** và dán vào `GEMINI_API_KEY=` trong file `python-service/.env`"
                    ),
                    "concept": "Lỗi phân quyền API Key",
                    "framework": "CONFIG_ERROR",
                    "sources": citations,
                    "socraticQuestions": [
                        "Bạn có muốn đổi sang key từ một Gmail khác không?",
                        "Hoặc dùng key OpenAI (bắt đầu bằng sk-...) vào file .env."
                    ],
                    "guardrailTriggered": "API_KEY_ERROR"
                }

        # 4. OFFLINE / TOOL FALLBACK: Nếu có tính toán rủi ro lệnh hoặc gửi ảnh chart
        if risk_eval:
            return {
                "answer": risk_eval["alert_markdown"],
                "concept": "Position Sizing & Prop Firm Risk Alert",
                "framework": "RISK_MANAGEMENT",
                "sources": citations,
                "socraticQuestions": [
                    f"Nếu bạn giảm khối lượng xuống {risk_eval['max_safe_lot']} lot, mức thua lỗ tối đa là bao nhiêu đô?",
                    "Quy tắc quản lý rủi ro của bạn cho phép mất tối đa bao nhiêu % tài khoản trên mỗi lệnh?"
                ],
                "guardrailTriggered": "HARD_BREACH_ALERT" if risk_eval["is_hard_breach"] else None
            }

        # 4.1 OFFLINE REAL-TIME CLOCK & SESSION HANDLER
        if is_time_query(query):
            return {
                "answer": (
                    f"⏰ **Bây giờ là: {time_ctx['vn_short']}**\n\n"
                    f"📅 **Ngày:** {time_ctx['vn_date']} *(Giờ Việt Nam, UTC+7)*\n"
                    f"🌐 **Giờ Quốc tế:** {time_ctx['utc_time']}\n"
                    f"🏙️ **Giờ New York:** {time_ctx['ny_time']}\n\n"
                    f"🏛️ **Phiên giao dịch:** {time_ctx['active_session']}\n"
                    f"🎯 **Killzone ICT:** {time_ctx['active_killzone']}"
                ),
                "concept": "Session Timing & Real-time Clock",
                "framework": "ICT",
                "sources": [],
                "socraticQuestions": [
                    "Bạn thường giao dịch vào phiên nào trong ngày: Phiên London hay Phiên New York?",
                    "Theo bạn, tại sao phiên Á thường có biên độ đi ngang (Asian Range) và ít thanh khoản hơn phiên Âu/Mỹ?"
                ],
                "guardrailTriggered": None
            }

        # 4.2 OFFLINE MODE: Conversational Greeting or General Assistance Handler
        if self.is_greeting(query) or self.is_assistance_request(query):
            return {
                "answer": (
                    f"👋 **Dạ chắc chắn rồi! Tôi luôn sẵn sàng đồng hành và hỗ trợ bạn.**\n\n"
                    f"Tôi là **AI Trading Tutor & Trade Review Assistant**, chuyên hỗ trợ sinh viên học và thực hành giao dịch chứng khoán:\n\n"
                    f"1. 📚 **Giải thích kiến thức & Chiến lược trading**:\n"
                    f"   - **ICT / Smart Money Concepts**: *Fair Value Gap (FVG)*, *Liquidity Pools (BSL/SSL)*, *Order Block*, *Optimal Trade Entry (OTE)*...\n"
                    f"   - **Price Action Cổ điển**: *Cấu trúc thị trường (HH/HL/LH/LL)*, *Breakout & Retest*, *Nến từ chối (Pinbar)*...\n"
                    f"   - **Quản trị vốn & Rủi ro**: *Quy tắc 1%-2%*, *Tỷ lệ Risk:Reward (R:R)*, *Chỉ số MAE & MFE*...\n"
                    f"   - **Tâm lý & Kỷ luật**: *Kiểm soát FOMO*, *Chống giao dịch trả thù (Revenge Trading)*, *Nhật ký giao dịch*.\n\n"
                    f"2. 🔍 **Đánh giá & Review lệnh giao dịch**:\n"
                    f"   - Phân tích xem lệnh bạn vừa đánh là **Good Trade** (đúng quy trình) hay **Bad Trade**.\n"
                    f"   - Bạn có thể bấm nút **'✨ AI Review'** trong bảng Lịch sử lệnh để tôi chấm điểm lệnh đó nhé!\n\n"
                    f"3. ⚖️ **So sánh đa phương pháp & Lập kế hoạch Backtest**.\n\n"
                    f"👉 **Bạn muốn bắt đầu tìm hiểu về khái niệm nào trước, hay cần hỗ trợ phân tích điều gì?**"
                ),
                "concept": "Trợ lý Gia sư AI",
                "framework": "TUTOR_SYSTEM",
                "sources": [],
                "socraticQuestions": [
                    "Bạn đang muốn học phương pháp nào hôm nay: ICT (Smart Money) hay Price Action cổ điển?",
                    "Mục tiêu trading quan trọng nhất của bạn trong tuần này là gì: Tỷ lệ thắng hay Kỷ luật tuân thủ Stop Loss?"
                ],
                "guardrailTriggered": None
            }

        # 4.5 OFFLINE CONTEXTUAL FALLBACK: Live Price & Follow-up Analysis for previously mentioned asset/exchange
        lower_q = query.lower()
        
        # Resolve contextual asset & exchange from immediate previous turn or active chart
        context_symbol = None
        context_exchange = None
        context_price = None
        context_percent = None

        if req.chatHistory:
            for turn in reversed(req.chatHistory):
                txt = str(turn.get("text", ""))
                txt_upper = txt.upper()
                
                # Match symbol aliases accurately using centralized helper
                for s_candidate, aliases in SYMBOL_ALIASES.items():
                    if any(a in f" {txt_upper} " for a in aliases):
                        context_symbol = s_candidate
                        break

                for exch in ["BINGX", "BINANCE", "OANDA", "HOSE"]:
                    if exch in txt_upper:
                        context_exchange = exch
                        break

                price_match = re.search(r'\$([0-9,]+(?:\.[0-9]+)?)', txt)
                if price_match:
                    try:
                        context_price = float(price_match.group(1).replace(',', ''))
                    except ValueError:
                        pass

                # Stop as soon as we identify the asset discussed in the most recent message!
                if context_symbol:
                    break

        if not context_symbol:
            context_symbol = req.symbol or "BTCUSDT"
        if not context_exchange:
            context_exchange = "BINANCE"
        if context_price is None:
            context_price = req.currentPrice

        # Check if user mentioned a specific symbol in the current question
        target_stock = None
        if req.allStocks:
            for s in req.allStocks:
                sym = s.get("symbol", "").lower()
                name = s.get("name", "").lower()
                clean_sym = sym.replace("usdt", "").replace(".p", "").replace("swap", "").replace(".", "")
                if (clean_sym and len(clean_sym) >= 3 and clean_sym in lower_q) or (name and name in lower_q):
                    target_stock = s
                    context_symbol = s.get("symbol", context_symbol)
                    context_exchange = s.get("exchange", context_exchange)
                    context_price = s.get("price", context_price)
                    context_percent = s.get("percent", context_percent)
                    break
            if not target_stock:
                for s in req.allStocks:
                    if s.get("symbol", "").upper() == context_symbol.upper():
                        target_stock = s
                        context_price = s.get("price", context_price)
                        context_percent = s.get("percent", context_percent)
                        context_exchange = s.get("exchange", context_exchange)
                        break

        # Case A: User asks about live price
        if any(w in lower_q for w in ["giá bao nhiêu", "giá hiện tại", "giá đang là", "current price", "mấy đô", "bao nhiêu đô", "giá btc", "giá eth", "giá sàn", "giá vàng"]):
            p_val = context_price
            sym_val = context_symbol
            exch_val = context_exchange
            pct_val = context_percent

            if p_val is not None:
                formatted_p = f"{p_val:,.4f}".rstrip('0').rstrip('.') if p_val < 1 else f"{p_val:,.2f}"
                pct_str = f" (Biến động 24h: {pct_val:+.2f}%)" if pct_val is not None else ""
                tf_info = f" trên khung `{req.timeframe}`" if req.timeframe and not target_stock else ""
                return {
                    "answer": (
                        f"📊 **Dữ liệu thời gian thực từ sàn {exch_val}:**\n\n"
                        f"- **Mã giao dịch**: `{sym_val}`\n"
                        f"- **Giá thị trường hiện tại**: **`${formatted_p}`**{pct_str}{tf_info}\n\n"
                        f"> 💡 **Phân tích kỹ thuật gợi ý**: Quanh mốc giá **`${formatted_p}`**, bạn hãy quan sát các vùng mất cân bằng cung cầu (FVG) hoặc các đỉnh/đáy cũ (Liquidity Pools) trên biểu đồ để xác định vùng phản ứng tiềm năng thay vì vào lệnh theo cảm xúc FOMO nhé!"
                    ),
                    "concept": "Realtime Market Price",
                    "framework": "MARKET_DATA",
                    "sources": citations,
                    "socraticQuestions": [
                        f"Mức giá ${formatted_p} hiện tại đang nằm gần vùng hỗ trợ hay kháng cự quan trọng nào?",
                        "Nếu thị trường xuất hiện nến đảo chiều tại vùng này, tỷ lệ R:R dự kiến của bạn là bao nhiêu?"
                    ],
                    "guardrailTriggered": None
                }

        # Case B: Follow-up question asking for analysis of the mentioned asset / exchange ("phân tích sàn đó", "phân tích mã đó", "phân tích nó")
        if any(w in lower_q for w in ["phân tích sàn đó", "sàn đó", "mã đó", "coin đó", "phân tích nó", "phân tích con đó", "phân tích tiếp", "đánh giá nó", "nhận định", "xu hướng thế nào", "phân tích thử"]):
            p_val = context_price
            sym_val = context_symbol
            exch_val = context_exchange
            formatted_p = f"${p_val:,.2f}" if p_val else "vùng giá hiện tại"

            return {
                "answer": (
                    f"🔎 **Phân tích kỹ thuật nối tiếp cho `{sym_val}` trên sàn {exch_val}:**\n\n"
                    f"Tiếp nối câu hỏi của bạn về mức giá **{formatted_p}**, dưới đây là góc nhìn cấu trúc kỹ thuật theo phương pháp ICT & Price Action:\n\n"
                    f"1. 🏛️ **Đặc tính sàn {exch_val} & Thanh khoản**:\n"
                    f"   - Cặp `{sym_val}` trên sàn **{exch_val}** có thanh khoản dồi dào, spread hẹp và phản ứng nhạy với các tin tức vĩ mô.\n"
                    f"   - Smart Money thường xuyên tạo các bẫy quét thanh khoản (*Liquidity Sweeps*) tại các vùng đỉnh/đáy phiên Á hoặc phiên Âu trước khi mở sóng chính.\n\n"
                    f"2. 📉 **Vùng Cung - Cầu & Cấu trúc thị trường**:\n"
                    f"   - **Vùng Kháng cự (BSL)**: Quan sát vùng đỉnh cũ gần nhất. Nếu xuất hiện nến từ chối (Rejection Wick / SFP), đó là dấu hiệu cạn kiệt lực mua.\n"
                    f"   - **Vùng Hỗ trợ (FVG / SSL)**: Chú ý các khoảng mất cân bằng Fair Value Gap khung H1/H4 phía dưới mốc {formatted_p} để đón phản ứng giá hồi phục.\n\n"
                    f"3. 🛡️ **Chiến lược khuyến nghị**:\n"
                    f"   - Kiên nhẫn chờ xác nhận tín hiệu đóng nến thay vì vào lệnh sớm đón đầu.\n"
                    f"   - Đặt Stop Loss tuyệt đối ngoài vùng vô hiệu hóa (Invalidation Point) và giới hạn rủi ro tối đa 1-2% tài khoản."
                ),
                "concept": f"Technical Analysis {sym_val}",
                "framework": "ICT_SMC",
                "sources": citations,
                "socraticQuestions": [
                    f"Trên biểu đồ {sym_val}, bạn có thấy xuất hiện mô hình nến đảo chiều nào ở khung H1 không?",
                    "Nếu mở vị thế tại đây, tỷ lệ Risk:Reward (R:R) mục tiêu của bạn là bao nhiêu (tối thiểu 1:2)?"
                ],
                "guardrailTriggered": None
            }

        # 5. OFFLINE FALLBACK MODE (When no API Key is provided)
        if results:
            primary_doc = results[0].document
            answer_text = (
                f"### Khái niệm: {primary_doc.concept} ({primary_doc.framework})\n\n"
                f"{primary_doc.content}\n\n"
                f"> 💡 **Lưu ý cốt lõi**: Trong phương pháp {primary_doc.framework}, "
                f"đây là công cụ dùng để định vị xác suất thị trường, **không phải quy luật chắc chắn đảm bảo lợi nhuận 100%**."
            )
            return {
                "answer": answer_text,
                "concept": primary_doc.concept,
                "framework": primary_doc.framework,
                "sources": citations,
                "socraticQuestions": self.get_socratic_questions(primary_doc),
                "guardrailTriggered": None
            }

        return {
            "answer": (
                f"👋 **Dạ được chứ! Tôi sẵn sàng giải đáp kiến thức cho bạn.**\n\n"
                f"Tôi có thể giải thích chi tiết, cung cấp tài liệu kiểm chứng (Tier 1 & Tier 2) và đưa ra câu hỏi phản biện về các chủ đề sau:\n\n"
                f"1. 📚 **Phương pháp ICT / Smart Money Concepts**:\n"
                f"   - *Fair Value Gap (FVG)*, *Khối lệnh (Order Block)*, *Quét thanh khoản (Liquidity Sweep)*, *Optimal Trade Entry (OTE)*, *Market Structure Shift (MSS)*...\n\n"
                f"2. 📈 **Phương pháp Price Action Cổ điển**:\n"
                f"   - *Cấu trúc thị trường (Higher High / Higher Low)*, *Breakout & Retest*, *Nến từ chối (Pinbar Rejection)*...\n\n"
                f"3. 🛡️ **Quản trị rủi ro & Tâm lý giao dịch**:\n"
                f"   - *Quy tắc quản trị vốn 1%-2%*, *Tỷ lệ Risk:Reward (R:R)*, *Chỉ số Drawdown MAE & MFE*, *Kiểm soát FOMO & Trả thù thị trường*...\n\n"
                f"👉 **Bạn muốn tìm hiểu chi tiết về khái niệm nào trước? Hãy gõ tên chủ đề bạn quan tâm nhé!**"
            ),
            "concept": "Knowledge Base Scope",
            "framework": "TUTOR_SYSTEM",
            "sources": [],
            "socraticQuestions": [
                "Bạn muốn tìm hiểu về ICT (Smart Money) hay Price Action cổ điển trước?",
                "Bạn đã có quy tắc quản trị rủi ro cố định cho mỗi lệnh giao dịch chưa?"
            ],
            "guardrailTriggered": "INSUFFICIENT_KNOWLEDGE"
        }

    def explain_concept(self, req: ConceptExplainRequest) -> Dict[str, Any]:
        ask_req = AskQuestionRequest(
            question=req.concept,
            framework=req.framework
        )
        return self.answer_question(ask_req)

ai_tutor_service = AiTutorService()
