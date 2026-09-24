import { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, GitCompare, Compass, 
  Send, ExternalLink, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck, User,
  MessageSquare, Scale, Copy, Check, ChevronRight, Bot
} from 'lucide-react';
import { aiService, type AskResponse, type StrategyComparisonData } from '../../services/aiService';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
  currentPrice?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  data?: AskResponse;
}

const QUICK_CONCEPTS = [
  { label: 'Fair Value Gap (FVG)', concept: 'Fair Value Gap', framework: 'ICT' },
  { label: 'Liquidity Pools (BSL/SSL)', concept: 'Liquidity', framework: 'ICT' },
  { label: 'Market Structure (HH/HL)', concept: 'Market Structure', framework: 'PRICE_ACTION' },
  { label: 'Order Block & Breaker', concept: 'Order Block', framework: 'ICT' },
  { label: 'Quản trị rủi ro 1%-2%', concept: 'Position Size', framework: 'RISK_MANAGEMENT' },
  { label: 'FOMO & Giao dịch trả thù', concept: 'Trading Psychology', framework: 'PSYCHOLOGY' }
];

const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*[^*\n]+?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#202738] border border-[#343e57] text-emerald-300 font-mono text-xs mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return (
        <span key={i} className="text-amber-200/90 font-medium">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-[14.5px] leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal rule (--- or ***)
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return <hr key={idx} className="border-[#252c3f] my-2.5" />;
        }

        // Section Title
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const title = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="pt-2 pb-1 text-[15px] font-bold text-amber-300 flex items-center gap-2 border-b border-[#252c3f]">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 inline-block shrink-0" />
              <span>{renderInlineStyles(title)}</span>
            </div>
          );
        }

        // Blockquote / Tip / Alert
        if (trimmed.startsWith('> ')) {
          const quote = trimmed.replace(/^>\s*/, '');
          return (
            <div key={idx} className="my-2 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-400 text-amber-200/90 text-[13.5px] font-medium leading-relaxed shadow-sm">
              {renderInlineStyles(quote)}
            </div>
          );
        }

        // Bullet point (*, -, •)
        if (/^[\*\-•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[\*\-•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm shadow-amber-400/50" />
              <span className="flex-1">{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // Numbered list (1., 2., etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1.5">
              <span className="min-w-[20px] h-5 rounded-full bg-[#232a3b] border border-[#374158] text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1">{renderInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-200 leading-relaxed">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AiTutorDrawer = ({
  isOpen,
  onClose,
  currentSymbol = 'BTCUSDT',
  currentPrice = 64200
}: AiTutorDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'compare' | 'backtest'>('tutor');
  
  // Chat Q&A State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `👋 **Xin chào! Tôi là AI Trading Tutor & Trade Review Assistant.**\n\nTôi sẵn sàng hỗ trợ bạn:\n- 📖 Giải thích các khái niệm học thuật (**ICT / SMC, Price Action, Quản trị vốn 1%-2%**)\n- 🔍 Đánh giá quy trình vào lệnh (**Process > Outcome**, đo lường MFE & MAE)\n- ⚖️ So sánh đa phương pháp phân tích.\n\nBạn có thể chọn nhanh các thẻ chủ đề phía trên hoặc nhập câu hỏi trực tiếp bên dưới nhé!`
    }
  ]);

  // Auto-scroll anchor to keep the latest question and answer comfortably in view
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (activeTab === 'tutor' && chatContainerRef.current && lastUserMsgRef.current && messages.length > 1) {
      const container = chatContainerRef.current;
      const target = lastUserMsgRef.current;
      const targetTop = target.offsetTop - container.offsetTop - 16;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
    }
  }, [messages.length, activeTab]);

  // Strategy Compare State
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<StrategyComparisonData | null>(null);

  // Backtest State
  const [backtestSpec, setBacktestSpec] = useState<any | null>(null);
  const [btStrategy, setBtStrategy] = useState('FVG Rebalance (ICT)');
  const [btTimeframe, setBtTimeframe] = useState('15m');

  if (!isOpen) return null;

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || query).trim();
    if (!q) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiService.askQuestion(q, undefined, currentSymbol);
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'tutor',
        text: res.answer,
        data: res
      };
      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        {
          id: String(Date.now() + 1),
          sender: 'tutor',
          text: '⚠️ Không thể kết nối tới AI Service. Vui lòng đảm bảo `python-service` đang chạy trên cổng 8000.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainConcept = async (concept: string, framework: string) => {
    const promptText = `Giải thích về khái niệm ${concept} (${framework})`;
    handleAsk(promptText);
  };

  const handleRunComparison = async () => {
    setCompareLoading(true);
    try {
      const res = await aiService.compareStrategies({
        symbol: currentSymbol,
        side: 'BUY',
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.97,
        takeProfit: currentPrice * 1.06,
        quantity: 100,
        timeframe: '15m'
      });
      setCompareData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleGenerateBacktest = async () => {
    try {
      const res = await aiService.getBacktestSpec({
        strategy: btStrategy,
        symbol: currentSymbol,
        timeframe: btTimeframe,
        period: '2024'
      });
      setBacktestSpec(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[620px] bg-[#131722] border-l border-[#2a2e39] text-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#1e222d]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Trading Tutor
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30 font-semibold">
                Online
              </span>
            </h2>
            <p className="text-xs text-slate-400">Trợ lý Giáo dục & Đánh giá Quyết định Giao dịch</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a2e39] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2e39] bg-[#181b24] px-3 text-sm font-medium">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'tutor' 
              ? 'border-amber-400 text-amber-400 font-semibold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Gia sư AI (Chat)
        </button>
        <button
          onClick={() => {
            setActiveTab('compare');
            if (!compareData) handleRunComparison();
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'compare' 
              ? 'border-amber-400 text-amber-400 font-semibold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          So sánh Chiến lược
        </button>
        <button
          onClick={() => {
            setActiveTab('backtest');
            if (!backtestSpec) handleGenerateBacktest();
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'backtest' 
              ? 'border-amber-400 text-amber-400 font-semibold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Kế hoạch Backtest
        </button>
      </div>

      {/* Content Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {/* TAB 1: TUTOR CHAT */}
        {activeTab === 'tutor' && (
          <>
            {/* Quick badges */}
            <div className="bg-[#181b24] p-3.5 rounded-xl border border-[#2a2e39]/80 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                Khái niệm trọng tâm (Knowledge Base):
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CONCEPTS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleExplainConcept(item.concept, item.framework)}
                    className="px-3 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-5 pt-2">
              {messages.map((msg, idx) => {
                const isLastUserMsg = msg.sender === 'user' && idx >= messages.length - 2;
                return (
                  <div 
                    key={msg.id}
                    ref={isLastUserMsg ? lastUserMsgRef : null}
                    className="space-y-1.5 scroll-mt-3"
                  >
                  {msg.sender === 'user' ? (
                    /* USER MESSAGE */
                    <div className="flex items-end justify-end gap-2.5 pl-8">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md shadow-amber-500/20 text-[14.5px] leading-relaxed">
                        {msg.text}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mb-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    /* AI TUTOR MESSAGE CARD */
                    <div className="flex items-start gap-2.5 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-amber-500/10">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-gradient-to-b from-[#181d2a] to-[#121622] text-slate-100 border border-[#2b3347] rounded-2xl rounded-tl-sm shadow-xl shadow-black/25 p-4 space-y-3.5">
                        {/* Header: Title, Model Badge, Copy Action */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#252c3f]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              AI Trading Tutor
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Gemini VIP
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#202738] hover:bg-[#2a334a] text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Guardrail alert if user asked for buy/sell */}
                        {msg.data?.guardrailTriggered === 'NO_BUY_SELL_SIGNAL' && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-200">Nguyên tắc hệ thống:</strong> AI hoạt động như một Trợ lý Giáo dục & Phân tích Độc lập, không đưa ra tín hiệu Buy/Sell hay phím lệnh giao dịch.
                            </div>
                          </div>
                        )}

                        {/* Rendered Formatted Content */}
                        <div className="pt-0.5">
                          {renderFormattedText(msg.text)}
                        </div>

                        {/* Socratic Questions */}
                        {msg.data?.socraticQuestions && msg.data.socraticQuestions.length > 0 && (
                          <div className="pt-3 border-t border-[#252c3f] space-y-2">
                            <div className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 uppercase tracking-wide">
                              <HelpCircle className="w-4 h-4 text-amber-400" />
                              Gợi ý câu hỏi tự vấn cho bạn:
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {msg.data.socraticQuestions.map((sq, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => handleAsk(sq)}
                                  className="p-3 rounded-xl bg-[#1b2130] hover:bg-[#222a3d] border border-[#2d364c] hover:border-amber-500/40 text-[13.5px] text-slate-200 cursor-pointer flex items-center justify-between gap-3 transition-all group shadow-sm"
                                  title="Bấm để trao đổi sâu hơn"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className="min-w-[20px] h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-snug group-hover:text-amber-200 transition-colors">{sq}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verified Sources */}
                        {msg.data?.sources && msg.data.sources.length > 0 && (
                          <div className="pt-3 border-t border-[#252c3f] space-y-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Tài liệu đối chiếu xác thực:
                            </div>
                            <div className="space-y-2">
                              {msg.data.sources.map((src, i) => (
                                <div 
                                  key={i}
                                  className="p-3 rounded-xl bg-[#1b2130] border border-[#2d364c] hover:border-[#3d4966] transition-colors flex flex-col gap-1.5 text-xs shadow-sm"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      src.sourceType === 'PRIMARY' 
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                    }`}>
                                      {src.sourceType === 'PRIMARY' ? 'TIER 1 • PRIMARY' : 'TIER 2 • SECONDARY'}
                                    </span>
                                    <span className="text-slate-400 text-xs">Tác giả: <strong className="text-slate-200">{src.author}</strong></span>
                                  </div>
                                  <div className="font-semibold text-white text-[13.5px]">{src.title}</div>
                                  <div className="text-slate-400 text-xs flex items-center justify-between mt-0.5">
                                    <span>{src.source}</span>
                                    {src.sourceUrl && (
                                      <a 
                                        href={src.sourceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 font-medium"
                                      >
                                        Xem tài liệu gốc <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#181d2a] border border-[#2b3347] flex items-center gap-2.5 text-slate-300 text-sm shadow-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>AI đang phân tích và chuẩn bị câu trả lời...</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: STRATEGY COMPARISON */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#181b24] border border-[#2a2e39] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Cặp tài sản phân tích:</span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {currentSymbol} <span className="text-xs font-mono text-emerald-400">{currentPrice.toLocaleString()} đ</span>
                </div>
              </div>
              <button
                onClick={handleRunComparison}
                disabled={compareLoading}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {compareLoading ? 'Đang so sánh...' : 'Phân tích lại'}
              </button>
            </div>

            {compareData && (
              <div className="space-y-3">
                {/* 2 Frameworks Side by Side / Stacked */}
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {compareData.priceAction.frameworkName}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{compareData.priceAction.setupInterpretation}</p>
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-blue-500/10 space-y-1">
                    <div>🛑 <strong>Stop Loss:</strong> {compareData.priceAction.stopLossPlacement}</div>
                    <div>🎯 <strong>Take Profit:</strong> {compareData.priceAction.takeProfitTarget}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {compareData.ict.frameworkName}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{compareData.ict.setupInterpretation}</p>
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-amber-500/10 space-y-1">
                    <div>🛑 <strong>Stop Loss:</strong> {compareData.ict.stopLossPlacement}</div>
                    <div>🎯 <strong>Take Profit:</strong> {compareData.ict.takeProfitTarget}</div>
                  </div>
                </div>

                {/* Similarities & Differences */}
                <div className="p-3.5 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-2.5">
                  <div className="font-bold text-white text-xs">Điểm tương đồng & Khác biệt:</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-emerald-400 font-semibold">Tương đồng:</div>
                    {compareData.similarities.map((s, i) => (
                      <div key={i} className="text-slate-300 pl-2 border-l border-emerald-500/30">• {s}</div>
                    ))}
                  </div>
                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="text-amber-400 font-semibold">Khác biệt góc nhìn:</div>
                    {compareData.differences.map((d, i) => (
                      <div key={i} className="text-slate-300 pl-2 border-l border-amber-500/30">• {d}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BACKTEST ASSISTANT */}
        {activeTab === 'backtest' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-3">
              <div className="text-xs font-bold text-white">Cấu hình Chiến lược Backtest:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Chiến lược:</label>
                  <select 
                    value={btStrategy} 
                    onChange={e => setBtStrategy(e.target.value)}
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="FVG Rebalance (ICT)">FVG Rebalance (ICT)</option>
                    <option value="Order Block & MSS (ICT)">Order Block & MSS (ICT)</option>
                    <option value="Breakout Retest (Price Action)">Breakout Retest (Price Action)</option>
                    <option value="Pinbar Rejection at Support">Pinbar Rejection at Support</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Timeframe:</label>
                  <select 
                    value={btTimeframe} 
                    onChange={e => setBtTimeframe(e.target.value)}
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="5m">5 Phút (M5)</option>
                    <option value="15m">15 Phút (M15)</option>
                    <option value="1H">1 Giờ (H1)</option>
                    <option value="D">1 Ngày (Daily)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGenerateBacktest}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                Thiết kế Đặc tả Kế hoạch Backtest
              </button>
            </div>

            {backtestSpec && (
              <div className="p-3.5 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Bảng Đặc Tả Quy Tắc Giao Dịch</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Rủi ro: {backtestSpec.specification.riskPerTrade}
                  </span>
                </div>
                
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded bg-[#1e222d] border border-[#2a2e39]">
                    <strong className="text-amber-400 block mb-0.5">1. Quy tắc Vào lệnh (Entry Rules):</strong>
                    <div className="whitespace-pre-line leading-relaxed text-slate-300">{backtestSpec.specification.entryRule}</div>
                  </div>
                  <div className="p-2 rounded bg-[#1e222d] border border-[#2a2e39]">
                    <strong className="text-red-400 block mb-0.5">2. Điểm Dừng Lỗ (Stop Loss & Invalidation):</strong>
                    <div className="leading-relaxed">{backtestSpec.specification.stopLossRule}</div>
                  </div>
                  <div className="p-2 rounded bg-[#1e222d] border border-[#2a2e39]">
                    <strong className="text-emerald-400 block mb-0.5">3. Chốt Lời (Take Profit Target):</strong>
                    <div className="leading-relaxed">{backtestSpec.specification.takeProfitRule}</div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="pt-2 border-t border-[#2a2e39] space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300">Checklist Kiểm định Khách quan:</div>
                  {backtestSpec.checklist.map((c: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <span className="text-amber-400">□</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-amber-300/80 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  {backtestSpec.note}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Input (For Tutor Tab) */}
      {activeTab === 'tutor' && (
        <div className="p-4 border-t border-[#252c3f] bg-[#161a26]/90 backdrop-blur-md">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập câu hỏi bất kỳ (ví dụ: FVG là gì?, phân tích tâm lý FOMO, review lệnh...)..."
              className="w-full bg-[#10141f] border border-[#2b3347] focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-20 disabled:pointer-events-none text-slate-950 transition-all shadow-md shadow-amber-500/20"
              title="Gửi câu hỏi (Nhấn Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Trading Tutor • Sẵn sàng giải đáp mọi thắc mắc
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-slate-500 bg-[#1e2433] px-1.5 py-0.5 rounded border border-[#2a3246]">
              Enter ↵
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
