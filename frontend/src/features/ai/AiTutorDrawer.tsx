import { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, GitCompare, 
  Send, ExternalLink, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck, User,
  MessageSquare, Scale, Copy, Check, ChevronRight, Bot, Trash2, RefreshCw,
  PlayCircle, Target, TrendingUp, Lightbulb, Crown, ArrowRight, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService, type AskResponse, type StrategyComparisonData } from '../../services/aiService';
import { subscriptionService, type SubscriptionInfo } from '../../services/subscriptionService';
import { UpgradeProModal } from './UpgradeProModal';
import { STOCKS } from '../market/data';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
  currentPrice?: number;
  timeframe?: string;
  marketContext?: any;
  topOffset?: number;
  onStartBacktestReplay?: (symbol: string, timeframe: string, rules?: {
    strategy: string;
    entryRule: string;
    stopLossRule: string;
    takeProfitRule: string;
    invalidationRule?: string;
  }) => void;
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

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'tutor',
  text: `👋 **Chào bạn! Tôi là AI Trading Tutor của StockSim.**\n\nTôi sẵn sàng hỗ trợ bạn:\n- 📖 Giải thích kiến thức (**ICT/SMC, Price Action, Quản trị vốn 1%-2%**)\n- 🔍 Đọc cấu trúc thị trường theo giá sàn real-time\n- ⚖️ Phân tích, review lệnh thắng/thua.\n\nHãy nhập câu hỏi hoặc chọn các thẻ chủ đề phía trên nhé!`
};

const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*[^*\n]+?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-amber-600 dark:text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#202738] border border-slate-300 dark:border-[#343e57] text-emerald-600 dark:text-emerald-400 font-mono text-[11px] mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return (
        <span key={i} className="text-amber-600 dark:text-amber-300 font-medium">
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
    <div className="space-y-1.5 text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal rule (--- or ***)
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return <hr key={idx} className="border-slate-200 dark:border-[#252c3f] my-2" />;
        }

        // Section Title
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const title = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="pt-2 pb-0.5 text-[13.5px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5 border-b border-slate-200 dark:border-[#252c3f]/70">
              <span className="w-1 h-3.5 rounded-full bg-gradient-to-b from-amber-500 to-amber-600 inline-block shrink-0" />
              <span>{renderInlineStyles(title)}</span>
            </div>
          );
        }

        // Blockquote / Tip / Alert
        if (trimmed.startsWith('> ')) {
          const quote = trimmed.replace(/^>\s*/, '');
          return (
            <div key={idx} className="my-1.5 p-2.5 rounded-lg bg-amber-500/10 border-l-2 border-amber-500 text-amber-800 dark:text-amber-200 text-xs font-medium leading-relaxed">
              {renderInlineStyles(quote)}
            </div>
          );
        }

        // Bullet point (*, -, •)
        if (/^[\*\-•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[\*\-•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 text-[13px] text-slate-800 dark:text-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-xs" />
              <span className="flex-1 text-slate-800 dark:text-slate-100">{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // Numbered list (1., 2., etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 text-[13px] text-slate-800 dark:text-slate-100">
              <span className="min-w-[17px] h-4.5 rounded bg-slate-100 dark:bg-[#232a3b] border border-slate-300 dark:border-[#374158] text-amber-600 dark:text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1 text-slate-800 dark:text-slate-100">{renderInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-800 dark:text-slate-100 text-[13px] leading-relaxed">
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
  currentPrice = 64200,
  timeframe = '15m',
  marketContext,
  topOffset = 48
}: AiTutorDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'compare'>('tutor');
  
  // Chat Q&A State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const { user, login } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchSubscription = async () => {
    if (!user?._id) return;
    try {
      const sub = await subscriptionService.getMySubscription();
      setSubscription(sub);
    } catch (err) {
      console.warn('Could not fetch subscription:', err);
    }
  };

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchSubscription();
    } else if (!user) {
      setSubscription(null);
    }
  }, [isOpen, user?._id]);

  // Load chat history from Database on open
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const loadHistory = async () => {
      try {
        const history = await aiService.getChatHistory();
        if (!isCancelled && history && history.length > 0) {
          setMessages([
            WELCOME_MESSAGE,
            ...history.map(item => ({
              id: item.id,
              sender: item.sender,
              text: item.text,
              data: item.data
            }))
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history from DB:', err);
      }
    };

    loadHistory();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const handleClearChat = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đoạn chat này trong Database không?')) return;
    try {
      await aiService.clearChatHistory();
      setMessages([WELCOME_MESSAGE]);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

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

  // Active Asset & Exchange Selector inside Drawer
  const [activeSymbol, setActiveSymbol] = useState(currentSymbol || 'BTCUSDT');
  const [activePrice, setActivePrice] = useState(currentPrice || 0);
  const prevCurrentSymbolRef = useRef(currentSymbol);

  // Only update activeSymbol when currentSymbol from parent chart actually changes
  useEffect(() => {
    if (currentSymbol && currentSymbol !== prevCurrentSymbolRef.current) {
      prevCurrentSymbolRef.current = currentSymbol;
      setActiveSymbol(currentSymbol);
      if (currentPrice) setActivePrice(currentPrice);
    }
  }, [currentSymbol, currentPrice]);

  // If currentPrice of chart ticks, only update activePrice if activeSymbol matches chart
  useEffect(() => {
    if (currentSymbol && activeSymbol === currentSymbol && currentPrice) {
      setActivePrice(currentPrice);
    }
  }, [currentPrice, activeSymbol, currentSymbol]);

  // Strategy Compare State
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<StrategyComparisonData | null>(null);

  const handleAsk = async (questionText?: string) => {
    if (!user) {
      login();
      return;
    }
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
      // Pass recent conversation context (last 6 messages) for multi-turn conversational memory
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const allStocks = STOCKS.map(s => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        percent: s.percent,
        change: s.change,
        market: s.market,
        exchange: s.exchange
      }));

      const res = await aiService.askQuestion(
        q, 
        undefined, 
        currentSymbol, 
        currentPrice, 
        timeframe, 
        marketContext,
        chatHistory,
        allStocks
      );
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'tutor',
        text: res.answer,
        data: res
      };
      setMessages(prev => [...prev, tutorMsg]);
      fetchSubscription();
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

  const handleRunComparison = async (symOverride?: string, priceOverride?: number) => {
    const sym = symOverride || activeSymbol;
    const price = priceOverride ?? activePrice;
    setCompareLoading(true);
    setCompareError(null);
    try {
      const res = await aiService.compareStrategies({
        symbol: sym,
        side: 'BUY',
        entryPrice: price,
        stopLoss: price * 0.97,
        takeProfit: price * 1.06,
        quantity: 1,
        timeframe: timeframe || '15m'
      });
      setCompareData(res);
    } catch (err: any) {
      console.error(err);
      setCompareError('Không thể tải dữ liệu so sánh chiến lược. Vui lòng bấm thử lại.');
    } finally {
      setCompareLoading(false);
    }
  };

  // Auto-run comparison when switching to compare tab or changing asset
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'compare') {
      if (!compareData || compareData.symbol !== activeSymbol) {
        handleRunComparison(activeSymbol, activePrice);
      }
    }
  }, [isOpen, activeTab, activeSymbol]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{ top: `${topOffset}px`, height: `calc(100vh - ${topOffset}px)` }}
        className="fixed right-0 z-40 w-full sm:w-[540px] md:w-[620px] bg-white dark:bg-[#131722] border-l border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-slate-200 shadow-2xl flex flex-col transform transition-all duration-200 ease-in-out"
      >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d] gap-2">
        {/* Left identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#1e2329] dark:text-white truncate">AI Trading Tutor</h2>
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentSymbol}</span>
              <span>•</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ${currentPrice >= 100 ? currentPrice.toLocaleString('en-US') : currentPrice.toFixed(4)}
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
                {timeframe}
              </span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user && (
            <>
              {subscription?.isPremium ? (
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-purple-500/15 border border-amber-500/35 hover:border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold text-xs whitespace-nowrap shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
                  title={subscription.premiumExpiresAt ? `Tài khoản PRO VIP • Còn ${subscription.remainingToday}/500 lượt hôm nay • Hạn dùng đến: ${new Date(subscription.premiumExpiresAt).toLocaleString('vi-VN')} (Bấm xem chi tiết / gia hạn)` : 'Tài khoản PRO VIP (Bấm xem chi tiết)'}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>PRO</span>
                  <span className="font-mono text-[11px] opacity-85">({subscription.remainingToday}/500)</span>
                  {subscription.premiumExpiresAt && (
                    <span className="hidden sm:inline-flex items-center text-[10px] text-amber-700 dark:text-amber-300 font-normal ml-0.5 border-l border-amber-500/30 pl-1.5 gap-1">
                      <span>HSD:</span>
                      <strong className="font-mono font-medium">{new Date(subscription.premiumExpiresAt).toLocaleDateString('vi-VN')}</strong>
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1a1f2c] text-slate-600 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-[#2b3347] whitespace-nowrap"
                    title="Lượt hỏi AI miễn phí còn lại hôm nay"
                  >
                    <span className="text-slate-400 text-[11px] mr-1">Free:</span>
                    <strong className="text-amber-600 dark:text-amber-400">{subscription ? subscription.remainingToday : 10}</strong>
                    <span className="text-slate-400">/{subscription?.dailyAiLimit || 10}</span>
                  </span>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02]"
                    title="Nâng cấp lên gói PRO 500 lượt/ngày qua PayOS"
                  >
                    <Crown className="w-3.5 h-3.5 shrink-0" />
                    <span>Nâng cấp PRO</span>
                  </button>
                </div>
              )}
              <div className="h-4 w-px bg-slate-200 dark:bg-[#2a2e39] mx-0.5" />
            </>
          )}

          {activeTab === 'tutor' && messages.length > 1 && (
            <button 
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
              title="Xóa lịch sử đoạn chat này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1e2329] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2e39] transition-colors shrink-0 cursor-pointer"
            title="Đóng bảng AI Tutor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f0f3fa] dark:bg-[#181b24] px-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'tutor' 
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-[#1e2329] dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Gia sư AI (Chat)
        </button>
        <button
          onClick={() => {
            setActiveTab('compare');
            if (!compareData) handleRunComparison();
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'compare' 
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-[#1e2329] dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          So sánh Chiến lược
        </button>
      </div>

      {/* Content Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-white dark:bg-[#131722]">
        {/* TAB 1: TUTOR CHAT */}
        {activeTab === 'tutor' && (
          <>
            {/* Quick badges */}
            <div className="bg-[#f8f9fa] dark:bg-[#181b24] p-3 rounded-xl border border-[#e6e8ea] dark:border-[#2a2e39]/80 space-y-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                Khái niệm trọng tâm (Knowledge Base):
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CONCEPTS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleExplainConcept(item.concept, item.framework)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1e222d] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] border border-[#e6e8ea] dark:border-[#2a2e39] hover:border-amber-500/50 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 text-xs font-medium shadow-xs transition-all"
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
                    <div className="flex items-end justify-end gap-2 pl-8">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium px-3.5 py-2 rounded-2xl rounded-tr-sm shadow-sm text-[13px] leading-relaxed">
                        {msg.text}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mb-0.5">
                        <User className="w-3 h-3" />
                      </div>
                    </div>
                  ) : (
                    /* AI TUTOR MESSAGE CARD */
                    <div className="flex items-start gap-2.5 pr-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-purple-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 bg-white dark:bg-[#181d2a]/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#2b3347]/70 rounded-2xl rounded-tl-sm shadow-sm p-3.5 space-y-2">
                        {/* Header: Title, Model Badge, Copy Action */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#252c3f]/70">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                              AI Tutor
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                              Gemini
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#202738] hover:bg-slate-200 dark:hover:bg-[#2a334a] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#374158] text-[10px] transition-colors shadow-2xs"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đã chép</span>
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
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <div>
                              <strong className="text-amber-900 dark:text-amber-200">Lưu ý:</strong> AI đóng vai trò Trợ lý Giáo dục & Phân tích Độc lập, không đưa ra tín hiệu Buy/Sell hay phím lệnh.
                            </div>
                          </div>
                        )}

                        {/* Rendered Formatted Content */}
                        <div>
                          {renderFormattedText(msg.text)}
                        </div>

                        {/* Quota Exceeded Guardrail Callout */}
                        {(msg.data?.guardrailTriggered === 'QUOTA_EXCEEDED' || msg.text?.includes('QUOTA_EXCEEDED') || msg.text?.includes('lượt tương tác AI miễn phí')) && (
                          <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/15 border border-amber-500/40 text-center space-y-2">
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>Mở khóa 500 lượt hỏi AI / ngày với gói PRO</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              Kích hoạt Senior Prop Firm AI Tutor • Đo lường rủi ro quỹ • Quét mã QR PayOS kích hoạt ngay
                            </p>
                            <button
                              onClick={() => setIsUpgradeModalOpen(true)}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer hover:scale-[1.02]"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>Nâng cấp PRO ngay (99.000₫ / 30 ngày)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Verified Sources (Compact) */}
                        {msg.data?.sources && msg.data.sources.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-[#252c3f]/60 space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              Tài liệu đối chiếu:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.data.sources.map((src, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-slate-50 dark:bg-[#202738] border border-slate-200 dark:border-[#2b3347] text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-2xs"
                                >
                                  <span className="text-amber-600 dark:text-amber-300 font-medium">{src.title}</span>
                                  <span className="text-slate-400 dark:text-slate-500">•</span>
                                  <span className="text-slate-600 dark:text-slate-300">{src.author}</span>
                                </span>
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#f8f9fc] dark:bg-[#181d2a] border border-[#e2e8f0] dark:border-[#2b3347] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
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
            {/* Exchange & Symbol Selector Card (Redesigned) */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#181b24] border border-[#e2e8f0] dark:border-[#2a2e39] shadow-sm space-y-3">
              {/* Header Row: Title & Real-time Price Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Chọn Cặp Coin / Cổ phiếu Phân Tích:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Giá Sàn:</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${activePrice >= 100 ? activePrice.toLocaleString('en-US') : activePrice.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Controls Row: Full-width Dropdown + Distinct Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <select
                    value={activeSymbol}
                    onChange={(e) => {
                      const sym = e.target.value;
                      setActiveSymbol(sym);
                      const s = STOCKS.find(item => item.symbol === sym);
                      if (s) {
                        const newPrice = (sym === currentSymbol && currentPrice) ? currentPrice : s.price;
                        setActivePrice(newPrice);
                        handleRunComparison(sym, newPrice);
                      }
                    }}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1e222d] border border-slate-300 dark:border-[#2f3545] hover:border-amber-400 dark:hover:border-amber-500/60 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all pr-8"
                  >
                    {STOCKS.map(s => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol} — {s.exchange} ({s.market})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleRunComparison()}
                  disabled={compareLoading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                  title="Gửi dữ liệu giá thị trường mới nhất để AI đối chiếu lại chiến lược Price Action vs ICT"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${compareLoading ? 'animate-spin' : ''}`} />
                  <span>{compareLoading ? 'Đang phân tích...' : 'Phân tích lại'}</span>
                </button>
              </div>

              {/* Helper Micro-copy */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
                💡 AI sẽ quét giá thị trường hiện tại để đối chiếu song song: vùng cản Cung-Cầu (Price Action) vs Khối Order Block / FVG (ICT/SMC).
              </p>
            </div>

            {/* Loading Indicator */}
            {compareLoading && (
              <div className="p-8 rounded-xl bg-[#f8f9fa] dark:bg-[#181b24] border border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col items-center justify-center space-y-3 text-center">
                <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-semibold text-[#1e2329] dark:text-white">
                  AI đang đối chiếu đa chiều Price Action vs ICT cho {activeSymbol}...
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Đang tính toán vùng cản, điểm quét thanh khoản và tối ưu tỷ lệ Risk:Reward...
                </span>
              </div>
            )}

            {/* Error Message */}
            {compareError && !compareLoading && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
                <span>{compareError}</span>
                <button 
                  onClick={() => handleRunComparison()}
                  className="px-2.5 py-1 rounded bg-red-500 text-white font-semibold text-xs"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Compare Content */}
            {!compareLoading && compareData && (
              <div className="space-y-4">
                {/* Section 1: Framework Perspectives */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#1e2329] dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-500" />
                      1. Góc Nhìn Phân Tích Kỹ Thuật (Dual Perspective)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Cặp: {compareData.symbol} • Vị thế: {compareData.side}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Price Action Card */}
                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {compareData.priceAction.frameworkName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono font-semibold">
                            Cổ điển &amp; Theo Trend
                          </span>
                        </div>
                        <p className="text-[#1e2329] dark:text-slate-300 leading-relaxed text-xs">
                          {compareData.priceAction.setupInterpretation}
                        </p>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-blue-500/10 space-y-1">
                        <div>🛑 <strong>Stop Loss:</strong> {compareData.priceAction.stopLossPlacement}</div>
                        <div>🎯 <strong>Take Profit:</strong> {compareData.priceAction.takeProfitTarget}</div>
                        {compareData.priceAction.evidenceRequired && (
                          <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 pt-0.5">
                            🔎 <em>Xác nhận:</em> {compareData.priceAction.evidenceRequired}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ICT Card */}
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {compareData.ict.frameworkName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono font-semibold">
                            Dòng tiền Thông minh (SMC)
                          </span>
                        </div>
                        <p className="text-[#1e2329] dark:text-slate-300 leading-relaxed text-xs">
                          {compareData.ict.setupInterpretation}
                        </p>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-amber-500/10 space-y-1">
                        <div>🛑 <strong>Stop Loss:</strong> {compareData.ict.stopLossPlacement}</div>
                        <div>🎯 <strong>Take Profit:</strong> {compareData.ict.takeProfitTarget}</div>
                        {compareData.ict.evidenceRequired && (
                          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 pt-0.5">
                            🔎 <em>Xác nhận:</em> {compareData.ict.evidenceRequired}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Simulated Numerical Setups Comparison */}
                {compareData.simulatedSetups && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-[#1e2329] dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-emerald-500" />
                        2. Mô Phỏng Thiết Lập Lệnh Số Học (Simulated Setups)
                      </span>
                      <span className="text-[10px] text-emerald-500 font-mono font-semibold">
                        Giá tham chiếu: ${compareData.entryPrice < 100 ? compareData.entryPrice.toFixed(2) : compareData.entryPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {/* Price Action Setup */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181b24] border border-blue-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                            📊 {compareData.simulatedSetups.priceAction.framework}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            R:R {compareData.simulatedSetups.priceAction.rr}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Entry (Vào)</span>
                            <span className="text-xs font-mono font-bold text-[#1e2329] dark:text-white">
                              {compareData.simulatedSetups.priceAction.entry}
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                            <span className="text-[10px] text-red-500 block">Stop Loss</span>
                            <span className="text-xs font-mono font-bold text-red-500">
                              {compareData.simulatedSetups.priceAction.stopLoss}
                            </span>
                            <span className="text-[9px] text-red-400 block font-mono">
                              -{compareData.simulatedSetups.priceAction.riskPct}%
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <span className="text-[10px] text-emerald-500 block">Take Profit</span>
                            <span className="text-xs font-mono font-bold text-emerald-500">
                              {compareData.simulatedSetups.priceAction.takeProfit}
                            </span>
                            <span className="text-[9px] text-emerald-400 block font-mono">
                              +{compareData.simulatedSetups.priceAction.rewardPct}%
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-blue-500/5 p-2 rounded-lg">
                          💬 {compareData.simulatedSetups.priceAction.rationale}
                        </p>
                      </div>

                      {/* ICT Setup */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181b24] border border-amber-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                            ⚡ {compareData.simulatedSetups.ict.framework}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            R:R {compareData.simulatedSetups.ict.rr} (Tối ưu)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Sniper Entry</span>
                            <span className="text-xs font-mono font-bold text-amber-500">
                              {compareData.simulatedSetups.ict.entry}
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                            <span className="text-[10px] text-red-500 block">Stop Loss (Chặt)</span>
                            <span className="text-xs font-mono font-bold text-red-500">
                              {compareData.simulatedSetups.ict.stopLoss}
                            </span>
                            <span className="text-[9px] text-red-400 block font-mono">
                              -{compareData.simulatedSetups.ict.riskPct}%
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <span className="text-[10px] text-emerald-500 block">Take Profit (BSL)</span>
                            <span className="text-xs font-mono font-bold text-emerald-500">
                              {compareData.simulatedSetups.ict.takeProfit}
                            </span>
                            <span className="text-[9px] text-emerald-400 block font-mono">
                              +{compareData.simulatedSetups.ict.rewardPct}%
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-amber-500/5 p-2 rounded-lg">
                          💬 {compareData.simulatedSetups.ict.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Metric Comparison Matrix */}
                {compareData.metricMatrix && compareData.metricMatrix.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#1e2329] dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      3. Ma Trận So Sánh Chỉ Số Kỹ Thuật (Metric Matrix)
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#181b24]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#1e222d] border-b border-[#e6e8ea] dark:border-[#2a2e39] text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <th className="py-2 px-3">Tiêu chí</th>
                            <th className="py-2 px-3 text-blue-600 dark:text-blue-400">Price Action</th>
                            <th className="py-2 px-3 text-amber-600 dark:text-amber-400">ICT / SMC</th>
                            <th className="py-2 px-2.5 text-center">Đặc tính</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39] text-[11px]">
                          {compareData.metricMatrix.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                              <td className="py-2 px-3 font-semibold text-[#1e2329] dark:text-slate-200">
                                {item.criterion}
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                                {item.priceAction}
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                                {item.ict}
                              </td>
                              <td className="py-2 px-2.5 text-center">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase whitespace-nowrap ${
                                  item.badge.includes('ICT') 
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                    : item.badge.includes('PA')
                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                  {item.badge}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 4: Market Regime Advisory */}
                {compareData.marketRegimeAdvisory && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-indigo-500/20 space-y-2.5">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      4. Lời Khuyên Ứng Dụng Theo Trạng Thái Thị Trường (Market Regime)
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 space-y-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block">
                          📈 Thị trường SÓNG MẠNH (Trending):
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {compareData.marketRegimeAdvisory.trending}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 space-y-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block">
                          🔄 Thị trường ĐI NGANG &amp; BẪY GIÁ (Ranging):
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {compareData.marketRegimeAdvisory.ranging}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] space-y-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        ⚡ Công thức Kết hợp Chuyên nghiệp (Hybrid Synergy):
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        {compareData.marketRegimeAdvisory.recommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 5: Similarities & Differences */}
                <div className="p-3.5 rounded-xl bg-[#f8f9fa] dark:bg-[#181b24] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2.5">
                  <div className="font-bold text-[#1e2329] dark:text-white text-xs flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    5. Điểm Tương Đồng &amp; Khác Biệt Cốt Lõi:
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Tương đồng:</div>
                    {compareData.similarities.map((s, i) => (
                      <div key={i} className="text-slate-600 dark:text-slate-300 pl-2 border-l border-emerald-500/30">• {s}</div>
                    ))}
                  </div>
                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="text-amber-600 dark:text-amber-400 font-semibold">Khác biệt góc nhìn:</div>
                    {compareData.differences.map((d, i) => (
                      <div key={i} className="text-slate-600 dark:text-slate-300 pl-2 border-l border-amber-500/30">• {d}</div>
                    ))}
                  </div>
                </div>

                {/* Section 6: Verified Sources & YouTube Video Lectures */}
                {compareData.sources && compareData.sources.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#f8f9fa] dark:bg-[#181b24] border border-[#e6e8ea] dark:border-[#2a2e39] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#1e2329] dark:text-white flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        6. Tài Liệu Đối Chiếu &amp; Video Bài Giảng Gốc (Verified Citations)
                      </div>
                      <span className="text-[10px] text-cyan-500 font-mono">
                        Academic Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {compareData.sources.map((s, idx) => {
                        const hasLink = s.sourceUrl && s.sourceUrl !== '#' && s.sourceUrl.startsWith('http');
                        const isYouTube = hasLink && (s.sourceUrl.includes('youtube.com') || s.sourceUrl.includes('youtu.be'));
                        return (
                          <a
                            key={idx}
                            href={hasLink ? s.sourceUrl : undefined}
                            target={hasLink ? '_blank' : undefined}
                            rel={hasLink ? 'noopener noreferrer' : undefined}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-all group ${
                              hasLink
                                ? isYouTube
                                  ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/25 hover:border-rose-500/50 text-slate-800 dark:text-slate-200'
                                  : 'bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/25 hover:border-cyan-500/50 text-slate-800 dark:text-slate-200'
                                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-500'
                            }`}
                            title={isYouTube ? `Xem video bài giảng trực tiếp trên YouTube: ${s.source}` : `Tài liệu gốc: ${s.source}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isYouTube ? (
                                <PlayCircle className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                              ) : (
                                <BookOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <span className="font-semibold truncate text-[11px] block group-hover:text-cyan-400">
                                  {s.title}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {s.source} • {s.author}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 uppercase border ${
                              isYouTube
                                ? 'bg-rose-500/15 text-rose-500 dark:text-rose-300 border-rose-500/30'
                                : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                            }`}>
                              {isYouTube ? '▶ VIDEO BÀI GIẢNG' : 'GIÁO TRÌNH'}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 7: AI Coach Conclusion */}
                {compareData.conclusion && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 text-xs text-[#1e2329] dark:text-slate-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {compareData.conclusion}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Input (For Tutor Tab) */}
      {activeTab === 'tutor' && (
        <div className="p-3 border-t border-[#e6e8ea] dark:border-[#252c3f] bg-white/95 dark:bg-[#161a26]/90 backdrop-blur-md">
          {!user ? (
            <div className="py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-[#1a1f2c] border border-slate-200 dark:border-[#262c3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Yêu cầu đăng nhập tài khoản</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Vui lòng đăng nhập để bắt đầu trò chuyện và quản lý lượt hỏi AI.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => login()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02]"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
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
                  placeholder="Nhập câu hỏi bất kỳ (ví dụ: FVG là gì?, tính rủi ro lệnh, review vị thế...)..."
                  className="w-full bg-[#f0f3fa] dark:bg-[#10141f] border border-[#e6e8ea] dark:border-[#2b3347] focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-20 disabled:pointer-events-none text-slate-950 transition-all shadow-sm cursor-pointer"
                  title="Gửi câu hỏi (Nhấn Enter)"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  AI Trading Tutor • Sẵn sàng giải đáp mọi thắc mắc
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-slate-500 bg-[#edf0f5] dark:bg-[#1e2433] px-1.5 py-0.5 rounded border border-[#dce1ea] dark:border-[#2a3246]">
                  Enter ↵
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>

    <UpgradeProModal
      isOpen={isUpgradeModalOpen}
      onClose={() => setIsUpgradeModalOpen(false)}
      currentSubscription={subscription}
      onSuccess={fetchSubscription}
    />
  </>
  );
};
