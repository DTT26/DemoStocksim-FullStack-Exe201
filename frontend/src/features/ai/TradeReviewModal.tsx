import { useState, useEffect } from 'react';
import { 
  X, Sparkles, CheckCircle2, AlertTriangle, 
  BookOpen, Target, Compass, Zap,
  TrendingUp, TrendingDown, ShieldAlert, ShieldCheck,
  ArrowRight, Activity, Scale, Clock,
  AlertCircle, Layers, ExternalLink, PlayCircle
} from 'lucide-react';
import { aiService, type TradeReviewData } from '../../services/aiService';

interface TradeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeData: {
    orderId?: string;
    symbol: string;
    side: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
    entryPrice: number;
    currentPrice?: number;
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    quantity: number;
    realPnL?: number;
    isOpen?: boolean;
    timeframe?: string;
    strategy?: string;
    setupName?: string;
    reason?: string;
    entryTime?: string;
    exitTime?: string;
    duration?: string;
  };
}

export const TradeReviewModal = ({
  isOpen,
  onClose,
  tradeData
}: TradeReviewModalProps) => {
  const [review, setReview] = useState<TradeReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONTEXT' | 'RISK' | 'IMPROVEMENTS'>('ALL');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    aiService.analyzeTrade(tradeData)
      .then(res => setReview(res))
      .catch(err => console.error('Failed to load trade review', err))
      .finally(() => setLoading(false));
  }, [isOpen, tradeData]);

  if (!isOpen) return null;

  const isBuy = tradeData.side.toUpperCase() === 'BUY' || tradeData.side.toUpperCase() === 'LONG';
  const isOpenTrade = tradeData.isOpen ?? (tradeData.exitPrice === undefined || tradeData.exitPrice === null);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'OPEN_GOOD_SETUP':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          badgeText: 'Kế hoạch chuẩn chỉnh',
          title: 'ACTIVE POSITION (Đang mở - Setup chuẩn)',
          desc: 'Vị thế đang mở và tuân thủ kỷ luật bài bản. Hãy kiên nhẫn bám sát kế hoạch TP/SL!'
        };
      case 'OPEN_WARNING_SETUP':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          badgeText: 'Cảnh báo rủi ro',
          title: 'ACTIVE POSITION (Đang mở - Cảnh báo rủi ro)',
          desc: 'Vị thế đang mở nhưng có yếu tố vi phạm nguyên tắc (như thiếu Stop Loss hoặc rủi ro quá lớn). Cần xử lý ngay!'
        };
      case 'WINNING_GOOD_TRADE':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          badgeText: 'Lệnh mẫu mực',
          title: 'GOOD TRADE + WINNING TRADE',
          desc: 'Chuẩn quy trình kỷ luật & Thị trường trả lời bằng kết quả xứng đáng.'
        };
      case 'LOSING_GOOD_TRADE':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
          badgeText: 'Kỷ luật chuẩn',
          title: 'GOOD TRADE WITH LOSS (Lệnh chất lượng)',
          desc: 'Kỷ luật cắt lỗ chuẩn xác. Thua lỗ chỉ là chi phí xác suất tự nhiên của thị trường.'
        };
      case 'WINNING_BAD_TRADE':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          badgeText: 'Cảnh báo ảo tưởng',
          title: 'BAD TRADE STILL PROFITABLE (Thắng do may mắn)',
          desc: 'Có lãi nhưng vi phạm nguyên tắc quản trị rủi ro. Tránh lặp lại thói quen xấu này!'
        };
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
          badgeText: 'Cần cải thiện',
          title: 'BAD TRADE WITH LOSS (Vi phạm quy trình)',
          desc: 'Lệnh thiếu kỷ luật dẫn đến kết quả thua lỗ. Cần nghiêm túc xem xét các điểm cải thiện bên dưới.'
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const entryPrice = review?.summary.entryPrice ?? tradeData.entryPrice;
  const exitPrice = review?.summary.exitPrice ?? tradeData.exitPrice;
  const currentPrice = review?.summary.currentPrice ?? tradeData.currentPrice ?? entryPrice;
  const pnl = review?.summary.pnl ?? tradeData.realPnL ?? 0;
  const returnPct = review?.summary.returnPct ?? (entryPrice > 0 && tradeData.quantity > 0 ? Number(((pnl / (entryPrice * tradeData.quantity)) * 100).toFixed(2)) : 0);
  const isProfit = pnl >= 0;
  const effectiveExitPrice = isOpenTrade ? currentPrice : (exitPrice ?? entryPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#10141d] border border-[#232838] text-slate-200 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        
        {/* ================================================================ */}
        {/* 1. Header: AI Trade Review & Trading Coach                       */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#232838] bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AI Trade Review &amp; Trading Coach
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#202533] text-slate-200 border border-[#2e3448]">
                    {tradeData.symbol}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {tradeData.side.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                    isOpenTrade 
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                      : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpenTrade ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'}`}></span>
                    {isOpenTrade ? 'VỊ THẾ ĐANG MỞ' : 'LỆNH ĐÃ ĐÓNG'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Hệ thống Huấn luyện &amp; Đánh giá Quy trình (Process &gt; Outcome)</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/90 font-medium">Winning Trade ≠ Good Trade</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real PnL badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shadow-sm ${
              isProfit 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
            }`}>
              <span>{isProfit ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] opacity-85">({isProfit ? '+' : ''}{returnPct}%)</span>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Trade Execution Data Strip (Dữ liệu vào/kết thúc thực tế của lệnh) */}
        {/* ================================================================ */}
        <div className="px-5 py-2.5 bg-[#0e121a] border-b border-[#232838] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Entry:</span>
              <span className="font-mono font-bold text-white">
                ${entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">{isOpenTrade ? 'Current:' : 'Exit:'}</span>
              <span className="font-mono font-bold text-white">
                ${effectiveExitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Khối lượng:</span>
              <span className="font-mono font-semibold text-slate-200">
                {tradeData.quantity} {tradeData.symbol.replace(/USDT$/, '')}
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Stop Loss:</span>
              <span className={`font-mono font-semibold ${tradeData.stopLoss ? 'text-rose-400' : 'text-slate-500 italic'}`}>
                {tradeData.stopLoss ? `$${tradeData.stopLoss.toLocaleString('en-US')}` : 'Not Set'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Take Profit:</span>
              <span className={`font-mono font-semibold ${tradeData.takeProfit ? 'text-emerald-400' : 'text-slate-500 italic'}`}>
                {tradeData.takeProfit ? `$${tradeData.takeProfit.toLocaleString('en-US')}` : 'Not Set'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-[#181d29] text-cyan-300 border border-cyan-500/20 font-medium">
              {review?.summary.strategy || tradeData.strategy || 'ICT — Liquidity + FVG'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#181d29] text-slate-300 font-mono">
              {review?.summary.timeframe || tradeData.timeframe || '15m'}
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              {review?.summary.duration || tradeData.duration || '15-45 phút'}
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Navigation Tabs (Cho phép xem tất cả hoặc lọc gọn gàng)         */}
        {/* ================================================================ */}
        <div className="px-5 py-2 bg-[#121622] border-b border-[#232838] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ALL', label: 'Tất Cả (Toàn Diện)' },
            { id: 'CONTEXT', label: '1. Bối Cảnh & Setup' },
            { id: 'RISK', label: '2. Quản Trị Rủi Ro & MFE/MAE' },
            { id: 'IMPROVEMENTS', label: '3. Đánh Giá & Bài Học' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c2130]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================ */}
        {/* Main Content Area                                                */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs custom-scrollbar">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="relative w-12 h-12 mx-auto">
                <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
              </div>
              <p className="text-slate-200 font-semibold text-sm">Đang kiểm toán quy trình &amp; bối cảnh lệnh...</p>
              <p className="text-xs text-slate-500">Đối chiếu Rubric tuân thủ, tính toán MFE/MAE và bối cảnh Market Context</p>
            </div>
          ) : review ? (
            <>
              {/* ============================================================ */}
              {/* TOP: Process Compliance Score Banner (Rubric 5 tiêu chí)    */}
              {/* ============================================================ */}
              {(() => {
                const badge = getVerdictBadge(review.summary.tradeVerdict);
                const scoreStyle = getScoreColor(review.summary.processScore);
                const rubric = review.rubricScore;

                return (
                  <div className={`p-4 rounded-xl border flex flex-col gap-3 ${badge.bg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`}></span>
                          <span className="font-bold text-sm tracking-wide text-white">{badge.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white border border-white/20">
                            Process &gt; Outcome
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                          {review.summary.verdictDescription}
                        </p>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 shrink-0">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          PROCESS COMPLIANCE SCORE
                        </div>
                        <div className={`mt-1 px-3 py-1 rounded-xl border flex items-baseline gap-1 ${scoreStyle}`}>
                          <span className="text-2xl font-black font-mono tracking-tight">{review.summary.processScore}</span>
                          <span className="text-xs text-slate-400 font-bold">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Rubric Breakdown Bar */}
                    {rubric && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>Chi tiết Rubric đánh giá quy trình:</span>
                          <span className="text-[10px] text-slate-400 italic">Không đánh giá dựa trên thắng hay thua</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between">
                            <span className="text-slate-400">1. Setup Validation:</span>
                            <span className="font-mono font-bold text-cyan-300">{rubric.setupValidation.score}/{rubric.setupValidation.max}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between">
                            <span className="text-slate-400">2. Risk Management:</span>
                            <span className={`font-mono font-bold ${rubric.riskManagement.score < 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {rubric.riskManagement.score}/{rubric.riskManagement.max}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between">
                            <span className="text-slate-400">3. Entry Discipline:</span>
                            <span className="font-mono font-bold text-slate-200">{rubric.entryDiscipline.score}/{rubric.entryDiscipline.max}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between">
                            <span className="text-slate-400">4. Exit Planning:</span>
                            <span className="font-mono font-bold text-slate-200">{rubric.exitPlanning.score}/{rubric.exitPlanning.max}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between col-span-2 sm:col-span-1">
                            <span className="text-slate-400">5. Trade Reasoning:</span>
                            <span className="font-mono font-bold text-amber-300">{rubric.tradeReasoning.score}/{rubric.tradeReasoning.max}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ============================================================ */}
              {/* VIP AI Trading Coach Mentor Card                             */}
              {/* ============================================================ */}
              <div className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-[#161a25] to-indigo-500/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-2">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400"></div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                      GÓP Ý TỪ AI TRADING COACH (MENTOR TƯ DUY)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic hidden sm:inline">
                    Process-First Mentorship • Khách quan &amp; Bằng chứng
                  </span>
                </div>
                <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed pl-1">
                  {review.aiCoach?.explanation || review.summary.coachingAdvice || review.summary.verdictDescription}
                </p>
                {review.aiCoach?.actionItem && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Hành động khắc phục:</strong> {review.aiCoach.actionItem}
                    </div>
                  </div>
                )}
                {review.aiCoach?.reflectionQuestion && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-2 text-xs text-indigo-200">
                    <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-300">Câu hỏi gợi mở tư duy (Reflection Question):</strong> {review.aiCoach.reflectionQuestion}
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* TAB 1: BỐI CẢNH & SETUP (Market Context & Setup Validation)   */}
              {/* ============================================================ */}
              {(activeTab === 'ALL' || activeTab === 'CONTEXT') && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-[#232838]">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    1. Bối Cảnh Thị Trường &amp; Thẩm Định Setup (Market Context &amp; Setup Validation)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Card 1: Market Context */}
                    <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#232838]">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-cyan-400" /> Bối Cảnh Thị Trường (Market Context)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Tại thời điểm Entry</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Higher Timeframe (1H/4H):</span>
                          <span className="font-semibold text-slate-200">{review.marketContext.higherTimeframeTrend || 'Bearish'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Current Timeframe ({review.marketContext.timeframe}):</span>
                          <span className="font-semibold text-slate-200">{review.marketContext.currentTimeframeTrend || 'Bearish'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Market Structure:</span>
                          <span className="font-semibold text-slate-200">{review.marketContext.marketStructure || 'Lower High → Lower Low'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Trading Session:</span>
                          <span className="font-semibold text-cyan-300">{review.marketContext.tradingSession || 'London Session'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Thanh khoản (Liquidity):</span>
                          <span className="font-semibold text-slate-200">{review.marketContext.liquidity || 'Sell-side swept'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#191e2b] border border-[#232838]">
                          <span className="text-[10px] text-slate-400 block">Biến động (Volatility) &amp; Khối lượng:</span>
                          <span className="font-semibold text-slate-200">{review.marketContext.volatility || 'Medium'} • {review.marketContext.volumeContext || 'Above average'}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 pt-1.5 border-t border-[#232838] flex items-center justify-between">
                        <span>Cản then chốt: <strong className="text-slate-300">{review.marketContext.supportResistance}</strong></span>
                      </div>
                    </div>

                    {/* Card 2: Setup Validation Checklist */}
                    <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#232838]">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Thẩm Định Điều Kiện Setup (Setup Validation)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                          {review.setupValidation?.completeness || '6 / 8 conditions'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {review.setupValidation?.checklist.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#191e2b] border border-[#232838] flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-200">{item.condition}</div>
                              <div className="text-[10px] text-slate-400">{item.rule}</div>
                            </div>
                            <div className="shrink-0 pt-0.5">
                              {item.met === true ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                  ✓ Đạt
                                </span>
                              ) : item.met === false ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                                  ✗ Vi phạm
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/30 text-slate-400 text-[10px] font-semibold border border-slate-600/30">
                                  Not evaluated
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-[#232838]">
                        * Điều kiện được thẩm định theo quy tắc chiến lược {review.summary.strategy}, không tự áp đặt điều kiện ngoài chiến lược.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: QUẢN TRỊ RỦI RO & MFE/MAE (Risk & Excursion Pathway)   */}
              {/* ============================================================ */}
              {(activeTab === 'ALL' || activeTab === 'RISK') && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-[#232838]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    2. Phân Tích Rủi Ro &amp; Đường Giá Thực Tế (Risk Analysis &amp; MFE / MAE)
                  </div>

                  {/* Warning banner if Stop Loss is missing */}
                  {!review.riskAnalysis?.hasStopLoss && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/35 flex items-start gap-3 text-rose-200">
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-rose-300 text-xs block">CẢNH BÁO RỦI RO CỐT LÕI:</strong>
                        <p className="text-xs text-rose-200 leading-relaxed font-semibold">
                          Risk cannot be determined because Stop Loss is not defined. (Mức rủi ro không thể xác định vì chưa đặt Stop Loss).
                        </p>
                        <p className="text-[11px] text-rose-300/80">
                          Thả nổi vị thế mà không có điểm Invalidation Point cứng sẽ khiến tài khoản đối mặt với nguy cơ thua lỗ không giới hạn khi thị trường xuất hiện nến giật mạnh.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4 Risk Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#141822] border border-[#232838] flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Tỷ lệ Risk : Reward</span>
                      <div className="my-1 font-mono font-bold text-white text-base">
                        {review.summary.plannedRR === 'Chưa thiết lập' ? (
                          <span className="text-amber-400 text-xs flex items-center gap-1 font-sans">
                            <AlertTriangle className="w-3 h-3" /> Chưa đặt
                          </span>
                        ) : (
                          review.summary.plannedRR
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">
                        {review.summary.isOpen ? 'Đang chạy' : `Thực tế: ${review.summary.actualRR}`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141822] border border-[#232838] flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Capital at Risk (Mức Lỗ Tối Đa)</span>
                      <div className="my-1 font-mono font-bold text-base">
                        {review.riskAnalysis?.hasStopLoss ? (
                          <span className="text-emerald-400">${review.riskAnalysis.maxPotentialLoss?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-rose-400 text-xs font-sans">Chưa xác định</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {review.riskAnalysis?.hasStopLoss ? `Rủi ro: ${review.summary.riskPctOfAccount}` : 'Thiếu SL bảo vệ vốn'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141822] border border-[#232838] flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Khoảng cách Stop Loss</span>
                      <div className="my-1 font-mono font-bold text-rose-400 text-base">
                        {review.riskAnalysis?.hasStopLoss ? (
                          <span>${review.riskAnalysis.stopLossDistanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({review.riskAnalysis.stopLossDistancePct}%)</span>
                        ) : (
                          <span className="text-slate-500 text-xs font-sans italic">Not Defined</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">Khoảng cách từ Entry</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141822] border border-[#232838] flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Quy mô vị thế (Position Size)</span>
                      <div className="my-1 font-mono font-bold text-cyan-300 text-base">
                        ${review.riskAnalysis?.positionSizeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Chiếm {review.riskAnalysis?.positionSizeRiskPct}% vốn tài khoản
                      </span>
                    </div>
                  </div>

                  {/* Sơ Đồ Quỹ Đạo Biên Độ Giá & Drawdown (MFE / MAE Price Excursion) */}
                  {review.excursionFlow && (() => {
                    const isShort = tradeData.side?.toLowerCase() === 'sell';
                    const entryPrice = review.excursionFlow.entry;
                    const maePrice = review.excursionFlow.maePrice;
                    const maePts = review.excursionFlow.maePts;
                    const mfePrice = review.excursionFlow.mfePrice;
                    const mfePts = review.excursionFlow.mfePts;
                    const currentOrExitPrice = review.excursionFlow.currentOrExit;
                    const isLive = review.excursionFlow.isLive;

                    // Point movement in trader's direction (positive = profit, negative = loss)
                    const actualPts = isShort ? (entryPrice - currentOrExitPrice) : (currentOrExitPrice - entryPrice);
                    const capturePct = mfePts > 0 
                      ? Math.max(0, Math.min(100, Math.round((actualPts / mfePts) * 100))) 
                      : 0;

                    // Calculate bar proportions (0 to 100)
                    const maxScale = Math.max(maePts, mfePts, Math.abs(actualPts), 1);
                    const maeWidthPct = maePts > 0 ? Math.min(100, Math.max(15, (maePts / maxScale) * 100)) : 0;
                    const mfeWidthPct = mfePts > 0 ? Math.min(100, Math.max(20, (mfePts / maxScale) * 100)) : 0;

                    // Pin position on the right (favorable) or left (adverse)
                    const pinOnFavorable = actualPts >= 0;
                    const pinPct = pinOnFavorable 
                      ? (mfePts > 0 ? Math.min(100, Math.max(5, (actualPts / mfePts) * 100)) : 5)
                      : (maePts > 0 ? Math.min(100, Math.max(5, (Math.abs(actualPts) / maePts) * 100)) : 5);

                    // Normalized display strings
                    const cleanMfeStr = review.summary.mfe?.startsWith('+') ? review.summary.mfe : `+${review.summary.mfe || '$0.00'}`;
                    const cleanMaeStr = review.summary.mae || '$0.00';

                    return (
                      <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-4">
                        {/* Title & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#232838] gap-2">
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-cyan-400" /> Thước Đo Biên Độ Giá &amp; Drawdown (MFE / MAE Excursion)
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Đo lường mức lãi tiềm năng cao nhất (MFE) vs mức sụt giảm sâu nhất (MAE) trong suốt vòng đời lệnh.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              isShort 
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' 
                                : 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                            }`}>
                              {isShort ? 'LỆNH BÁN (SHORT) — GIÁ GIẢM LÀ CÓ LÃI' : 'LỆNH MUA (LONG) — GIÁ TĂNG LÀ CÓ LÃI'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shrink-0">
                              {isLive ? 'VỊ THẾ LIVE' : 'LỆNH ĐÃ ĐÓNG'}
                            </span>
                          </div>
                        </div>

                        {/* TRỰC QUAN HÓA 1: THƯỚC ĐO BIÊN ĐỘ ĐỐI XỨNG (MFE / MAE DUAL GAUGE) */}
                        <div className="rounded-xl bg-[#0d111a] border border-[#202738] p-4 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-amber-400 flex items-center gap-1">
                              ◀ VÙNG SỤT GIẢM (MAE DRAWDOWN)
                            </span>
                            <span className="text-slate-300 font-mono text-[10px] bg-[#161c28] px-2 py-0.5 rounded border border-slate-700/60">
                              MỐC VÀO LỆNH (ENTRY: ${entryPrice.toLocaleString('en-US')})
                            </span>
                            <span className="text-cyan-400 flex items-center gap-1">
                              VÙNG LÃI TỐI ĐA (MFE PROFIT) ▶
                            </span>
                          </div>

                          {/* Dual-side Progress Bar */}
                          <div className="grid grid-cols-2 gap-1 items-center relative py-2">
                            {/* Left Half: Adverse (MAE) */}
                            <div className="flex justify-end items-center h-7 rounded-l-lg bg-[#181d28] border-y border-l border-slate-700/40 px-1 relative overflow-hidden">
                              {maePts > 0 ? (
                                <div 
                                  className="h-5 rounded bg-gradient-to-l from-amber-500/40 to-rose-500/60 border border-amber-500/50 flex items-center justify-start px-2 text-[10px] font-mono text-amber-200 font-bold transition-all"
                                  style={{ width: `${maeWidthPct}%` }}
                                >
                                  -{maePts.toFixed(2)} pts
                                </div>
                              ) : (
                                <div className="text-[10px] text-emerald-400 font-semibold px-2 flex items-center gap-1">
                                  <span>✓ 0 pts Drawdown (Không bị lỗ)</span>
                                </div>
                              )}
                            </div>

                            {/* Center Line Indicator */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400 -translate-x-1/2 z-10 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>

                            {/* Right Half: Favorable (MFE) */}
                            <div className="flex justify-start items-center h-7 rounded-r-lg bg-[#181d28] border-y border-r border-slate-700/40 px-1 relative overflow-hidden">
                              {mfePts > 0 ? (
                                <div 
                                  className="h-5 rounded bg-gradient-to-r from-cyan-500/40 via-teal-500/50 to-emerald-500/60 border border-cyan-500/50 flex items-center justify-end px-2 text-[10px] font-mono text-cyan-200 font-bold transition-all relative"
                                  style={{ width: `${mfeWidthPct}%` }}
                                >
                                  +{mfePts.toFixed(2)} pts ({cleanMfeStr})

                                  {/* Pin marker for Current / Exit Price */}
                                  {pinOnFavorable && (
                                    <div 
                                      className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center z-20"
                                      style={{ left: `${pinPct}%` }}
                                    >
                                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-black shadow-md">
                                        {isLive ? 'LIVE' : 'EXIT'}
                                      </span>
                                      <div className="w-1.5 h-1.5 rotate-45 bg-emerald-500 -mt-0.5"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 italic px-2">
                                  Chưa bứt phá thuận lợi
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Gauge Footnotes */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span className="font-mono text-amber-300">
                              Đáy giá bất lợi: <strong>${maePrice.toLocaleString('en-US')}</strong> ({cleanMaeStr})
                            </span>
                            <span className="text-slate-400">
                              Mức giữ lãi hiện tại: <strong className={capturePct >= 70 ? 'text-emerald-400' : 'text-amber-300'}>{capturePct}% của đỉnh sóng</strong>
                            </span>
                            <span className="font-mono text-cyan-300">
                              Đỉnh giá có lợi: <strong>${mfePrice.toLocaleString('en-US')}</strong> ({cleanMfeStr})
                            </span>
                          </div>
                        </div>

                        {/* TRỰC QUAN HÓA 2: LỘ TRÌNH 4 BƯỚC DIỄN BIẾN LỆNH (4-STEP MILESTONES) */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Diễn Biến Lệnh Theo Trình Tự Thực Tế:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {/* Step 1: Entry */}
                            <div className="p-3 rounded-lg bg-[#161b26] border border-slate-700/60 relative flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-slate-400">1. ĐIỂM VÀO (ENTRY)</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">GỐC</span>
                                </div>
                                <div className="font-mono text-sm font-bold text-white mt-1.5">
                                  ${entryPrice.toLocaleString('en-US')}
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                                Mở vị thế {isShort ? 'BÁN (Sell)' : 'MUA (Buy)'}. Mốc quy chiếu 0.00 PnL.
                              </p>
                            </div>

                            {/* Step 2: MAE Drawdown */}
                            <div className={`p-3 rounded-lg border relative flex flex-col justify-between ${
                              maePts === 0 
                                ? 'bg-[#0f1d18] border-emerald-500/30' 
                                : 'bg-[#211612] border-amber-500/40'
                            }`}>
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-extrabold ${maePts === 0 ? 'text-emerald-300' : 'text-amber-400'}`}>
                                    2. SỤT GIẢM (MAE)
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    maePts === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {maePts === 0 ? 'AN TOÀN' : 'RỦI RO'}
                                  </span>
                                </div>
                                <div className="font-mono text-sm font-bold text-white mt-1.5">
                                  ${maePrice.toLocaleString('en-US')}
                                </div>
                                <div className="text-[11px] font-mono font-semibold text-amber-400 mt-0.5">
                                  {maePts > 0 ? `-${maePts.toFixed(2)} pts (${cleanMaeStr})` : '$0.00 Drawdown'}
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                                {maePts === 0 
                                  ? 'Vào lệnh cực chuẩn, giá không hề kéo âm.' 
                                  : 'Mức giật ngược sâu nhất mà bạn phải gồng chịu.'}
                              </p>
                            </div>

                            {/* Step 3: MFE Peak Profit */}
                            <div className="p-3 rounded-lg bg-[#0e1f29] border border-cyan-500/40 relative flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-cyan-300">
                                    3. ĐỈNH LÃI (MFE)
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                                    TIỀM NĂNG
                                  </span>
                                </div>
                                <div className="font-mono text-sm font-bold text-white mt-1.5">
                                  ${mfePrice.toLocaleString('en-US')}
                                </div>
                                <div className="text-[11px] font-mono font-semibold text-cyan-300 mt-0.5">
                                  +{mfePts.toFixed(2)} pts ({cleanMfeStr})
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                                {mfePts > 0 
                                  ? 'Mức lợi nhuận tối đa thị trường từng đem lại cho bạn.' 
                                  : 'Chưa có nhịp sóng thuận lợi rõ ràng.'}
                              </p>
                            </div>

                            {/* Step 4: Current / Exit */}
                            <div className={`p-3 rounded-lg border relative flex flex-col justify-between ${
                              isProfit 
                                ? 'bg-[#0f241a] border-emerald-500/50' 
                                : 'bg-[#291118] border-rose-500/50'
                            }`}>
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-extrabold ${isProfit ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    4. {isLive ? 'HIỆN TẠI (LIVE)' : 'THOÁT LỆNH'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    isProfit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }`}>
                                    THỰC TẾ
                                  </span>
                                </div>
                                <div className="font-mono text-sm font-bold text-white mt-1.5">
                                  ${currentOrExitPrice.toLocaleString('en-US')}
                                </div>
                                <div className={`text-[11px] font-mono font-bold mt-0.5 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isProfit ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfit ? '+' : ''}{returnPct}%)
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                                {isProfit 
                                  ? `Đang giữ lại được ${capturePct}% từ đỉnh MFE cao nhất.` 
                                  : 'Lệnh đã trượt khỏi vùng có lãi.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Phân Tích Ý Nghĩa Thực Chiến (Actionable Insights) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                          <div className="p-3 rounded-lg bg-[#181d2a] border border-[#262f44] space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                                Đánh Giá Tận Dụng Lợi Nhuận (MFE):
                              </span>
                              <span className="font-mono font-bold text-cyan-300 text-[11px]">{cleanMfeStr}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {review.excursionFlow.mfePts > 0 ? (
                                isProfit ? (
                                  <>Vị thế từng đạt đỉnh lãi tối đa <strong className="text-cyan-300">{cleanMfeStr}</strong> và bạn đã giữ lại được <strong className="text-emerald-400">{capturePct}%</strong> tiềm năng sóng. {capturePct >= 70 ? 'Đây là hiệu suất chốt/giữ lệnh rất xuất sắc.' : 'Cân nhắc dời Trailing Stop để khóa bớt lợi nhuận khi giá gần đỉnh.'}</>
                                ) : (
                                  <>Giá từng chạy đúng hướng cho mức lãi <strong className="text-cyan-300">{cleanMfeStr}</strong> nhưng bạn để mất toàn bộ lợi nhuận và quay về thua lỗ. Bài học: Luôn kéo SL về Breakeven (hòa vốn) khi lệnh đã đi đúng kỳ vọng.</>
                                )
                              ) : (
                                <>Chưa xuất hiện nhịp bứt phá thuận lợi rõ rệt sau khi mở vị thế.</>
                              )}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#181d2a] border border-[#262f44] space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                Đánh Giá Áp Lực Sụt Giảm (MAE):
                              </span>
                              <span className="font-mono font-bold text-amber-300 text-[11px]">{cleanMaeStr}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {review.excursionFlow.maePts === 0 ? (
                                <>Điểm vào lệnh (Entry) <strong className="text-emerald-400">cực kỳ chuẩn xác</strong> — giá không hề bị giật ngược vào vùng âm (Drawdown = 0). Bạn không phải chịu bất kỳ áp lực tâm lý nào khi gồng lệnh.</>
                              ) : (
                                <>Lệnh từng bị giật ngược âm tối đa <strong className="text-amber-300">{cleanMaeStr}</strong>. Kiểm tra xem điểm vào có bị sớm (fomo) hay không để tối ưu điểm mở lệnh an toàn hơn.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plan vs Execution Table */}
                  {review.planVsExecution && (
                    <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#232838]">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-cyan-400" /> Kế Hoạch vs Thực Thi (Plan vs Execution)
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          review.planVsExecution.status === 'RULE_FOLLOWED' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : review.planVsExecution.status === 'PARTIALLY_FOLLOWED'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {review.planVsExecution.description}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#232838] text-slate-400 text-[11px]">
                              <th className="py-2 px-3">Tham số</th>
                              <th className="py-2 px-3 text-cyan-300">Kế Hoạch (Plan)</th>
                              <th className="py-2 px-3 text-amber-300">Thực Tế (Actual)</th>
                              <th className="py-2 px-3 text-right">Đánh Giá Tuân Thủ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#232838]/60 font-mono">
                            <tr>
                              <td className="py-2 px-3 text-slate-400 font-sans">Entry Price</td>
                              <td className="py-2 px-3 text-white">{review.planVsExecution.plan.entry}</td>
                              <td className="py-2 px-3 text-white">{review.planVsExecution.actual.entry}</td>
                              <td className="py-2 px-3 text-right font-sans text-emerald-400 font-semibold">✓ Khớp chuẩn</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-400 font-sans">Stop Loss</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.plan.stopLoss}</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.actual.stopLoss}</td>
                              <td className="py-2 px-3 text-right font-sans">
                                {review.planVsExecution.actual.stopLoss !== 'Not Set' ? (
                                  <span className="text-emerald-400 font-semibold">✓ Đã cài đặt</span>
                                ) : (
                                  <span className="text-rose-400 font-semibold">✗ Vi phạm (Thiếu SL)</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-400 font-sans">Take Profit</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.plan.takeProfit}</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.actual.takeProfit}</td>
                              <td className="py-2 px-3 text-right font-sans">
                                {review.planVsExecution.actual.takeProfit !== 'Not Set' ? (
                                  <span className="text-emerald-400 font-semibold">✓ Đã cài đặt</span>
                                ) : (
                                  <span className="text-amber-400 font-semibold">⚠ Chưa đặt TP cố định</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-400 font-sans">Risk Quản Trị</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.plan.risk}</td>
                              <td className="py-2 px-3 text-slate-300">{review.planVsExecution.actual.risk}</td>
                              <td className="py-2 px-3 text-right font-sans">
                                {review.planVsExecution.actual.risk !== 'Undefined' ? (
                                  <span className="text-emerald-400 font-semibold">✓ Kiểm soát tốt</span>
                                ) : (
                                  <span className="text-rose-400 font-semibold">✗ Không thể xác định</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="text-[10px] text-slate-500 italic pt-1 border-t border-[#232838]">
                        * {review.planVsExecution.auditNote}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 3: ĐÁNH GIÁ & BÀI HỌC (Done Well, Categorized Issues)    */}
              {/* ============================================================ */}
              {(activeTab === 'ALL' || activeTab === 'IMPROVEMENTS') && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-[#232838]">
                    <Zap className="w-4 h-4 text-amber-400" />
                    3. Đánh Giá Thực Thi &amp; Bài Học Rút Ra (What Was Done Well &amp; Needs Improvement)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Điểm Làm Tốt */}
                    <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-3">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-[#232838]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Điểm Đã Làm Tốt (Evidence-Based Strengths)
                      </div>
                      <div className="space-y-2 pl-1">
                        {review.strengths && review.strengths.length > 0 ? (
                          review.strengths.map((s, idx) => (
                            <div key={idx} className="text-slate-200 text-xs flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <span className="leading-relaxed">{s}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 italic">Vào lệnh đúng nhịp phiên thị trường</div>
                        )}
                      </div>
                    </div>

                    {/* Điểm Cần Cải Thiện (Phân theo 4 nhóm) */}
                    <div className="p-4 rounded-xl bg-[#141822] border border-[#232838] space-y-3">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-[#232838]">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Hành Động Cải Thiện (Categorized Improvement Issues)
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {/* A. Rule Violations */}
                        {review.categorizedImprovements?.ruleViolations && review.categorizedImprovements.ruleViolations.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 space-y-1">
                            <span className="font-bold text-rose-300 flex items-center gap-1 text-[11px]">
                              <ShieldAlert className="w-3 h-3" /> A. Rule Violations (Vi phạm nguyên tắc):
                            </span>
                            {review.categorizedImprovements.ruleViolations.map((v, i) => (
                              <div key={i} className="text-rose-200 text-[11px] pl-3 flex items-start gap-1">
                                <span>•</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* B. Risk Issues */}
                        {review.categorizedImprovements?.riskIssues && review.categorizedImprovements.riskIssues.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1">
                            <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                              <AlertCircle className="w-3 h-3" /> B. Risk Issues (Vấn đề quản trị rủi ro):
                            </span>
                            {review.categorizedImprovements.riskIssues.map((v, i) => (
                              <div key={i} className="text-amber-200 text-[11px] pl-3 flex items-start gap-1">
                                <span>•</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* C. Execution Issues */}
                        {review.categorizedImprovements?.executionIssues && review.categorizedImprovements.executionIssues.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-[#1a202e] border border-[#2d3448] space-y-1">
                            <span className="font-bold text-slate-300 flex items-center gap-1 text-[11px]">
                              <Activity className="w-3 h-3 text-cyan-400" /> C. Execution Issues (Vấn đề thực thi):
                            </span>
                            {review.categorizedImprovements.executionIssues.map((v, i) => (
                              <div key={i} className="text-slate-300 text-[11px] pl-3 flex items-start gap-1">
                                <span>•</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* D. Strategy Issues */}
                        {review.categorizedImprovements?.strategyIssues && review.categorizedImprovements.strategyIssues.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-[#1a202e] border border-[#2d3448] space-y-1">
                            <span className="font-bold text-slate-300 flex items-center gap-1 text-[11px]">
                              <Compass className="w-3 h-3 text-indigo-400" /> D. Strategy Issues (Vấn đề chiến lược):
                            </span>
                            {review.categorizedImprovements.strategyIssues.map((v, i) => (
                              <div key={i} className="text-slate-300 text-[11px] pl-3 flex items-start gap-1">
                                <span>•</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3-5 Actionable Learning Takeaways */}
                  {review.learningTakeaways && review.learningTakeaways.length > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#141a27] via-[#161a25] to-[#141a27] border border-cyan-500/30 space-y-2.5">
                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 pb-1 border-b border-[#232838]">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Bài Học Đúc Kết Cho Sinh Viên (Learning Takeaways)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {review.learningTakeaways.map((takeaway, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[#191f2d] border border-[#262e42] flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-slate-200 leading-relaxed">{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* ============================================================ */}
              {/* SOURCES / EVIDENCE (Tài liệu kiểm chứng đối chiếu)           */}
              {/* ============================================================ */}
              {review.sources && review.sources.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#131620] border border-[#232838] space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pb-1 border-b border-[#232838]/60">
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tài liệu kiểm chứng đối chiếu (Evidence &amp; Academic Sources):</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Primary / Secondary Academic Verified • Nhấp vào để xem nguồn gốc
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {review.sources.map((s, idx) => {
                      const hasLink = s.sourceUrl && s.sourceUrl !== '#' && s.sourceUrl.startsWith('http');
                      const isYouTube = hasLink && (s.sourceUrl.includes('youtube.com') || s.sourceUrl.includes('youtu.be'));
                      return (
                        <a
                          key={idx}
                          href={hasLink ? s.sourceUrl : undefined}
                          target={hasLink ? '_blank' : undefined}
                          rel={hasLink ? 'noopener noreferrer' : undefined}
                          className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg border text-xs transition-all group ${
                            hasLink 
                              ? isYouTube
                                ? 'bg-[#191418] hover:bg-rose-500/15 border-rose-500/25 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 cursor-pointer shadow-sm'
                                : 'bg-[#181d29] hover:bg-cyan-500/15 border-[#282f42] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 cursor-pointer shadow-sm'
                              : 'bg-[#181d29] border-[#282f42] text-slate-400 cursor-default'
                          }`}
                          title={isYouTube ? `Nhấp để xem video bài giảng trực tiếp trên YouTube: ${s.source}` : `Tài liệu gốc: ${s.source} (${s.author})`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isYouTube ? (
                              <PlayCircle className="w-4 h-4 text-rose-400 group-hover:text-rose-300 shrink-0" />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-white group-hover:text-cyan-100 truncate text-[11px] sm:text-xs block">
                                {s.title}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {s.source}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                              isYouTube 
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            }`}>
                              {isYouTube ? '▶ VIDEO BÀI GIẢNG' : (s.sourceType || 'TÀI LIỆU GỐC')}
                            </span>
                            {hasLink && (
                              <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isYouTube ? 'text-rose-400 group-hover:text-rose-300' : 'text-slate-500 group-hover:text-cyan-300'}`} />
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">Không có dữ liệu phân tích lệnh này</div>
          )}
        </div>
      </div>
    </div>
  );
};
