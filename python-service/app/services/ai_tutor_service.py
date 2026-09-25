from typing import Dict, Any, List, Optional
import re
from app.rag.retriever import retriever
from app.rag.schema import AskQuestionRequest, ConceptExplainRequest, RetrievalResult
from app.services.llm_client import llm_client

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

        # 1. Guardrail: Refuse Buy/Sell Signals
        if self.is_asking_for_signal(query):
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

        # 3. VIP MODE: If API Key is configured, LLM answers EVERYTHING freely & intelligently!
        if llm_client.is_configured():
            sys_prompt = (
                "Bạn là trợ lý AI Trading Tutor thông minh và toàn năng của nền tảng StockSim.\n"
                "Bạn có quyền truy cập ĐẦY ĐỦ VÀO DATABASE HỆ THỐNG gồm:\n"
                "1. Toàn bộ bảng giá thời gian thực của TẤT CẢ các mã tài sản trên hệ thống (Crypto, Cổ phiếu Mỹ, Hàng hóa Vàng/Dầu, Ngoại hối Forex, Chỉ số).\n"
                "2. Toàn bộ dữ liệu tài khoản của học viên trong Database (Số dư ví, các vị thế/lệnh đang mở LONG/SHORT, lệnh chờ, trạng thái thi Thử Thách Quỹ Prop Firm).\n\n"
                "Quy tắc phản hồi BẮT BUỘC:\n"
                "1. Khi học viên hỏi về GIÁ CỦA BẤT KỲ MÃ NÀO (ví dụ: ETH, BTC, SOL, Vàng XAUUSD, Dầu USOIL, Apple AAPL, Tesla TSLA, v.v.):\n"
                "   - Tra cứu trong [TOÀN BỘ BẢNG GIÁ THỊ TRƯỜNG CỦA HỆ THỐNG] bên dưới.\n"
                "   - Trả lời CHÍNH XÁC mức giá hiện tại, biến động 24h và sàn giao dịch niêm yết mà hệ thống đang có.\n"
                "   - Đưa ra nhận định kỹ thuật hoặc gợi ý ngắn gọn về vùng hỗ trợ/kháng cự hay FVG quanh mức giá đó.\n"
                "2. Khi học viên hỏi về TÀI KHOẢN, SỐ DƯ, VỊ THẾ LỆNH, PNL, BÀI THI QUỸ của mình:\n"
                "   - Đọc dữ liệu từ [DỮ LIỆU TÀI KHOẢN & VỊ THẾ HỌC VIÊN TRONG DATABASE] để trả lời chính xác, phân tích rủi ro và góp ý quản trị vốn.\n"
                "3. Tuyệt đối KHÔNG đưa ra tín hiệu Mua/Bán/Phím lệnh cụ thể (No Buy/Sell signal).\n"
                "4. TRẢ LỜI NGẮN GỌN, CÔ ĐỌNG, ĐI THẲNG VÀO TRỌNG TÂM. Tránh dài dòng, lan man, giải thích súc tích trong 2-4 đoạn hoặc gạch đầu dòng rõ ràng.\n"
                "5. Định dạng Markdown đẹp mắt, gọn gàng, dùng in đậm từ khóa chính.\n"
                "6. DUY TRÌ MẠCH HỘI THOẠI LIÊN TIẾP: Tham chiếu lịch sử hội thoại gần đây để hiểu rõ các câu hỏi tiếp nối và đại từ thay thế."
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

            # 2. Toàn bộ bảng giá thị trường hệ thống có
            all_stocks_str = ""
            if req.allStocks and len(req.allStocks) > 0:
                stock_lines = []
                for s in req.allStocks:
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
                    all_stocks_str = "\n\n📈 [TOÀN BỘ BẢNG GIÁ THỊ TRƯỜNG CỦA HỆ THỐNG]:\n" + "\n".join(stock_lines)

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

            kb_context = ""
            if results:
                kb_context = "\n\nTài liệu tham khảo đối chiếu từ Knowledge Base:\n" + "\n---\n".join([
                    f"• {r.document.title} [{r.document.sourceType}] ({r.document.author}): {r.document.content}"
                    for r in results
                ])

            user_p = (
                f"{chat_history_str}\n\n"
                f"Câu hỏi hiện tại của học viên: {query}"
                f"{current_chart_str}"
                f"{all_stocks_str}"
                f"{user_data_str}"
                f"{kb_context}\n\n"
                "Hãy trả lời súc tích, hoàn chỉnh, chuyên nghiệp và chuẩn xác dựa trên toàn bộ dữ liệu thị trường và database học viên được cung cấp ở trên."
            )
            llm_answer = llm_client.generate_text(sys_prompt, user_p, max_tokens=700)

            if llm_answer:
                return {
                    "answer": llm_answer,
                    "concept": results[0].document.concept if results else "AI Trading Tutor",
                    "framework": results[0].document.framework if results else "VIP_LLM",
                    "sources": citations,
                    "socraticQuestions": [],
                    "guardrailTriggered": None
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

        # 4. OFFLINE MODE: Conversational Greeting or General Assistance Handler
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

        # 4.5 OFFLINE FALLBACK: Asking about live price / exchange data
        lower_q = query.lower()
        if any(w in lower_q for w in ["giá bao nhiêu", "giá hiện tại", "giá đang là", "current price", "mấy đô", "bao nhiêu đô", "giá btc", "giá eth", "giá sàn", "giá vàng"]):
            # Check if user mentioned a specific symbol in allStocks
            target_stock = None
            if req.allStocks:
                for s in req.allStocks:
                    sym = s.get("symbol", "").lower()
                    name = s.get("name", "").lower()
                    clean_sym = sym.replace("usdt", "").replace(".p", "").replace("swap", "").replace(".", "")
                    if (clean_sym and len(clean_sym) >= 3 and clean_sym in lower_q) or (name and name in lower_q):
                        target_stock = s
                        break
            
            p_val = target_stock.get("price") if target_stock else req.currentPrice
            sym_val = target_stock.get("symbol") if target_stock else (req.symbol or "tài sản")
            exch_val = target_stock.get("exchange") if target_stock else "Binance"
            pct_val = target_stock.get("percent") if target_stock else None

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
