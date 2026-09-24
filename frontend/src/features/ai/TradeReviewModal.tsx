import { useState, useEffect } from 'react';
import { 
  X, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, 
  BookOpen, ExternalLink, Bookmark, ShieldAlert, Award
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
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    quantity: number;
    timeframe?: string;
    strategy?: string;
    setupName?: string;
    reason?: string;
  };
}

export const TradeReviewModal = ({
  isOpen,
  onClose,
  tradeData
}: TradeReviewModalProps) => {
  const [review, setReview] = useState<TradeReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNote, setUserNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSavedSuccess(false);

    aiService.analyzeTrade(tradeData)
      .then(res => setReview(res))
      .catch(err => console.error('Failed to load trade review', err))
      .finally(() => setLoading(false));
  }, [isOpen, tradeData]);

  if (!isOpen) return null;

  const handleSaveToJournal = async () => {
    try {
      await aiService.reviewTrade({
        ...tradeData,
        userNotes: userNote
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving review to journal', err);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'WINNING_GOOD_TRADE':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          title: '✅ GOOD TRADE + WINNING TRADE',
          desc: 'Chuẩn quy trình & Có lợi nhuận'
        };
      case 'LOSING_GOOD_TRADE':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          title: '🛡️ GOOD TRADE WITH LOSS (Lệnh chất lượng)',
          desc: 'Kỷ luật chuẩn xác. Thua lỗ là chi phí xác suất tự nhiên.'
        };
      case 'WINNING_BAD_TRADE':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          title: '⚠️ BAD TRADE STILL PROFITABLE (Cảnh báo ảo tưởng)',
          desc: 'Có lãi nhưng vi phạm nguyên tắc quản trị. Tránh lặp lại thói quen này!'
        };
      default:
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          title: '❌ BAD TRADE WITH LOSS (Cần cải thiện)',
          desc: 'Lệnh thiếu kỷ luật dẫn đến kết quả tiêu cực.'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131722] border border-[#2a2e39] text-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e39] bg-[#1e222d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Báo Cáo Phân Tích Lệnh (AI Trade Review)
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {tradeData.symbol} • {tradeData.side}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Đánh giá Quy trình & Kỷ luật theo chuẩn mực học thuật</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
              <p className="text-slate-300 font-semibold text-sm">Đang phân tích 11 hạng mục chất lượng lệnh...</p>
              <p className="text-xs text-slate-500">Tính toán R:R, MAE/MFE và đối chiếu tài liệu kiểm duyệt</p>
            </div>
          ) : review ? (
            <>
              {/* Verdict Banner (Process Over Outcome) */}
              {(() => {
                const badge = getVerdictBadge(review.summary.tradeVerdict);
                return (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${badge.bg}`}>
                    <div>
                      <div className="font-bold text-sm tracking-wide">{badge.title}</div>
                      <div className="text-xs opacity-90 mt-0.5">{review.summary.verdictDescription}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Điểm Quy Trình (Process)</div>
                      <div className="text-xl font-bold font-mono text-white">
                        {review.summary.processScore}<span className="text-xs text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39]">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tỷ lệ Risk:Reward</span>
                  <div className="font-mono font-bold text-white text-sm">
                    {review.summary.plannedRR}
                  </div>
                  <span className="text-[10px] text-slate-500">Thực tế: {review.summary.actualRR}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39]">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Mức rủi ro (% Vốn)</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    {review.summary.riskPctOfAccount}
                  </div>
                  <span className="text-[10px] text-slate-500">Chuẩn an toàn: 1% - 2%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39]">
                  <span className="text-[10px] text-slate-400 block mb-0.5">MFE (Tiềm năng lãi tối đa)</span>
                  <div className="font-mono font-bold text-blue-400 text-sm">
                    {review.summary.mfe}
                  </div>
                  <span className="text-[10px] text-slate-500">Mức giá thuận lợi nhất</span>
                </div>
                <div className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39]">
                  <span className="text-[10px] text-slate-400 block mb-0.5">MAE (Drawdown chịu đựng)</span>
                  <div className="font-mono font-bold text-amber-400 text-sm">
                    {review.summary.mae}
                  </div>
                  <span className="text-[10px] text-slate-500">{review.excursionAnalysis.drawdownRisk}</span>
                </div>
              </div>

              {/* 11-Part Detailed Review Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Setup & Context */}
                  <div className="p-4 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      1. Bối cảnh & Chất lượng Setup
                    </div>
                    <div className="text-slate-300 space-y-1">
                      <div>• <strong>Chiến lược:</strong> {review.setupQuality.strategy} - {review.setupQuality.setupName}</div>
                      <div>• <strong>Lý do vào lệnh:</strong> {review.setupQuality.reasonGiven}</div>
                      <div>• <strong>Khung thời gian:</strong> {review.marketContext.timeframe}</div>
                      <div className="text-slate-400 text-[11px] pt-1 border-t border-[#2a2e39]">
                        {review.marketContext.trend} | {review.marketContext.supportResistance}
                      </div>
                    </div>
                  </div>

                  {/* Entry & Risk Analysis */}
                  <div className="p-4 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      2. Đánh giá Điểm Vào & Dừng Lỗ
                    </div>
                    <div className="text-slate-300 space-y-1">
                      <div>• <strong>Điểm Entry:</strong> {review.entryAnalysis.assessment}</div>
                      <div>• <strong>Stop Loss:</strong> {review.stopLossAnalysis.comment}</div>
                      <div>• <strong>Take Profit:</strong> {review.takeProfitAnalysis.comment}</div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="p-4 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-3">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Điểm làm tốt:
                      </div>
                      <div className="space-y-1 pl-1">
                        {review.strengths.map((s, idx) => (
                          <div key={idx} className="text-slate-300">• {s}</div>
                        ))}
                      </div>
                    </div>
                    {review.improvements.length > 0 && (
                      <div className="pt-2 border-t border-[#2a2e39]">
                        <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Điểm cần cải thiện:
                        </div>
                        <div className="space-y-1 pl-1">
                          {review.improvements.map((imp, idx) => (
                            <div key={idx} className="text-slate-300">• {imp}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Socratic Questions */}
                  <div className="p-4 rounded-xl bg-[#181b24] border border-amber-500/20 space-y-2.5">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Câu hỏi phản biện cho Nhật ký (Questions for Trader):
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Hãy tự suy ngẫm và trả lời các câu hỏi sau để ghi nhận vào nhật ký học tập:
                    </p>
                    <div className="space-y-2">
                      {review.socraticQuestions.map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-slate-300 leading-snug">
                          <span className="font-mono text-amber-400 font-bold mr-1.5">{idx + 1}.</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Sources */}
                  <div className="p-4 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      Tài liệu kiểm chứng & Nguồn học tập:
                    </div>
                    <div className="space-y-1.5">
                      {review.sources.map((src, i) => (
                        <div key={i} className="p-2.5 rounded bg-[#1e222d] border border-[#2a2e39] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {src.sourceType}
                            </span>
                            <span className="text-[10px] text-slate-400">Tác giả: <strong>{src.author}</strong></span>
                          </div>
                          <div className="font-semibold text-white">{src.title}</div>
                          {src.sourceUrl && (
                            <a 
                              href={src.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1"
                            >
                              Xem tài liệu <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User Note & Save to Journal */}
                  <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Ghi chú cá nhân vào Trading Journal:
                    </label>
                    <textarea 
                      value={userNote}
                      onChange={e => setUserNote(e.target.value)}
                      placeholder="Ghi lại cảm xúc lúc vào lệnh, lý do chốt lời hoặc bài học rút ra..."
                      rows={2}
                      className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                    <div className="flex items-center justify-between pt-1">
                      {savedSuccess ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu vào Nhật ký!
                        </span>
                      ) : <span />}
                      <button
                        onClick={handleSaveToJournal}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" /> Lưu Phiếu Review Lệnh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">Không có dữ liệu phân tích</div>
          )}
        </div>
      </div>
    </div>
  );
};
