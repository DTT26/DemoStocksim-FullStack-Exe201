import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, AlertTriangle, CheckCircle2, TrendingUp, 
  ShieldCheck, ExternalLink, Bookmark, BarChart3, Search, Compass
} from 'lucide-react';
import { aiService, type KnowledgeSource } from '../../services/aiService';
import { TradeReviewModal } from './TradeReviewModal';

export const AiLearningDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [savedReviews, setSavedReviews] = useState<any[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  
  // Selected review for modal
  const [selectedReviewTrade, setSelectedReviewTrade] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      aiService.getTradeInsights(),
      aiService.getSources(),
      aiService.getSavedReviews()
    ]).then(([ins, src, revs]) => {
      setInsights(ins);
      if (src && src.sources) setSources(src.sources);
      if (revs && Array.isArray(revs)) setSavedReviews(revs);
    }).catch(err => {
      console.error('Failed to load learning dashboard', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredSources = sources.filter(s => 
    s.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
    s.concept.toLowerCase().includes(searchDoc.toLowerCase()) ||
    s.framework.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#181b24] via-[#1e222d] to-[#181b24] border border-[#2a2e39]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Trading Tutor & Learning Progress</h1>
          </div>
          <p className="text-xs text-slate-400">
            Theo dõi tiến trình hấp thu kiến thức, rà soát thói quen giao dịch và kiểm toán quy trình ra quyết định.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-4 py-2 rounded-xl bg-[#131722] border border-[#2a2e39] text-center">
            <span className="text-[10px] text-slate-400 block">Tổng lệnh đã Review</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {insights?.totalTrades || savedReviews.length || 12}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#131722] border border-[#2a2e39] text-center">
            <span className="text-[10px] text-slate-400 block">Tỷ lệ R:R Trung bình</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {insights?.statistics?.averageRR || '1 : 1.45'}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#131722] border border-[#2a2e39] text-center">
            <span className="text-[10px] text-slate-400 block">Rủi ro Trung bình</span>
            <span className="text-lg font-bold font-mono text-blue-400">
              {insights?.statistics?.averageRisk || '1.5%'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Mastery + Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concept Mastery Card */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-[#2a2e39] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Mức Độ Thuần Thục Khái Niệm (Concept Mastery)</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Theo dõi tiến độ
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {insights?.conceptMastery ? (
              Object.entries(insights.conceptMastery).map(([concept, pct]: [string, any]) => (
                <div key={concept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{concept}</span>
                    <span className="font-mono text-amber-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1e222d] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Đang tải biểu đồ năng lực...</div>
            )}
          </div>
        </div>

        {/* Behavioral Pattern Detector (Common Mistakes) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-[#2a2e39] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Nhận Diện Thói Quen Cần Khắc Phục</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
              Pattern Detector
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {insights?.commonMistakes && insights.commonMistakes.length > 0 ? (
              insights.commonMistakes.map((m: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[#181b24] border border-[#2a2e39] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      {m.issue}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">
                        {m.count} lần
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{m.advice}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-[#181b24] text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                Không phát hiện thói quen tiêu cực nào nghiêm trọng. Kỷ luật giao dịch đang được duy trì tốt!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified External Knowledge Base Library */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-[#2a2e39] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Thư Viện Tri Thức Kiểm Duyệt (Knowledge Base Directory)</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
              {sources.length} tài liệu
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchDoc}
              onChange={e => setSearchDoc(e.target.value)}
              placeholder="Tìm theo concept, ICT, Price Action..."
              className="bg-[#181b24] border border-[#2a2e39] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredSources.map((doc, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#181b24] border border-[#2a2e39] space-y-2 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    doc.sourceType === 'PRIMARY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {doc.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{doc.framework}</span>
                </div>
                <div className="font-bold text-white leading-snug">{doc.title}</div>
                <div className="text-[11px] text-slate-400">
                  Tác giả: <strong className="text-slate-200">{doc.author}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2e39] flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[180px]">{doc.source}</span>
                {doc.sourceUrl && (
                  <a 
                    href={doc.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    Xem <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Reviews History */}
      {savedReviews.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#131722] border border-[#2a2e39] space-y-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Lịch Sử Phiếu Đánh Giá Lệnh Đã Lưu</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2a2e39] text-slate-400 text-[10px] uppercase">
                  <th className="pb-2">Thời gian</th>
                  <th className="pb-2">Cổ phiếu</th>
                  <th className="pb-2">Vị thế</th>
                  <th className="pb-2">Giá vào</th>
                  <th className="pb-2">Đánh giá Quy trình</th>
                  <th className="pb-2">Điểm</th>
                  <th className="pb-2 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]">
                {savedReviews.map((rev, i) => (
                  <tr key={i} className="hover:bg-[#181b24] transition-colors">
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2.5 font-bold text-white">{rev.symbol}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rev.side.includes('BUY') || rev.side.includes('LONG') 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {rev.side}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{rev.entryPrice?.toLocaleString()} đ</td>
                    <td className="py-2.5 text-slate-300">{rev.verdictDescription || rev.tradeVerdict}</td>
                    <td className="py-2.5 font-mono font-bold text-amber-400">{rev.processScore}/100</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setSelectedReviewTrade({
                          symbol: rev.symbol,
                          side: rev.side,
                          entryPrice: rev.entryPrice,
                          exitPrice: rev.exitPrice,
                          stopLoss: rev.stopLoss,
                          takeProfit: rev.takeProfit,
                          quantity: 100
                        })}
                        className="px-2.5 py-1 rounded bg-[#2a2e39] hover:bg-amber-500/20 hover:text-amber-300 text-[11px] transition-colors"
                      >
                        Xem lại
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal if clicked */}
      {selectedReviewTrade && (
        <TradeReviewModal
          isOpen={true}
          onClose={() => setSelectedReviewTrade(null)}
          tradeData={selectedReviewTrade}
        />
      )}
    </div>
  );
};
