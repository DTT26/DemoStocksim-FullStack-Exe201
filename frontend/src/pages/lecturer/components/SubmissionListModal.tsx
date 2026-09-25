import { useState, useEffect } from 'react';
import { 
  X, Award, CheckCircle2, Clock, Send, User, AlertCircle, FileText, Check,
  ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, ExternalLink, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubmissionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

export const SubmissionListModal = ({ isOpen, onClose, assignment }: SubmissionListModalProps) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(100);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSubmissions = async () => {
    if (!assignment?._id) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/assignments/${assignment._id}/submissions`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && assignment?._id) {
      fetchSubmissions();
      setGradingSubId(null);
      setToastMsg(null);
    }
  }, [isOpen, assignment?._id]);

  if (!isOpen || !assignment) return null;

  const handleStartGrading = (sub: any) => {
    setGradingSubId(sub._id);
    setGradeInput(sub.score !== undefined ? sub.score : 85);
    setFeedbackInput(sub.feedback || '');
  };

  const handleSaveGrade = async (subId: string) => {
    if (gradeInput < 0 || gradeInput > 100) {
      setToastMsg({ text: 'Điểm số phải từ 0 đến 100', type: 'error' });
      return;
    }

    setSavingGrade(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/assignments/${assignment._id}/submissions/${subId}/grade`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          score: Number(gradeInput),
          feedback: feedbackInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s => s._id === subId ? data.submission : s));
        setGradingSubId(null);
        setToastMsg({ text: '✅ Đã lưu điểm và gửi nhận xét cho sinh viên thành công!', type: 'success' });
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setToastMsg({ text: err.message || 'Lỗi khi lưu điểm', type: 'error' });
      }
    } catch (e: any) {
      setToastMsg({ text: e.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setSavingGrade(false);
    }
  };

  const totalSubs = submissions.length;
  const gradedSubs = submissions.filter(s => s.status === 'GRADED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-[#253047] text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Mã cổ phiếu: {assignment.symbol || 'FPT'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Đánh giá bài nộp: {assignment.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tổng số bài nộp: <strong className="text-white font-mono">{totalSubs}</strong> • Đã chấm điểm: <strong className="text-emerald-400 font-mono">{gradedSubs}</strong> / {totalSubs}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#253047] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toast */}
        {toastMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
          }`}>
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Đang tải danh sách bài nộp và đối soát bằng chứng giao dịch...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h4 className="text-base font-bold text-slate-300">Chưa có sinh viên nào nộp bài</h4>
              <p className="text-xs text-slate-500 mt-1">Khi sinh viên hoàn thành và bấm nộp bài tập, danh sách sẽ hiển thị tại đây kèm bằng chứng giao dịch thực tế.</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const isEditing = gradingSubId === sub._id;
              const completedCount = sub.checklistStatus?.filter((c: any) => c.completed).length || 0;
              const totalReqs = assignment.requirements?.length || (sub.checklistStatus?.length || 1);
              const evidence = sub.tradingEvidence;
              const isVerified = evidence?.isVerified && evidence?.totalOrders > 0;

              return (
                <div 
                  key={sub._id} 
                  className={`p-6 rounded-2xl border transition-all ${
                    sub.status === 'GRADED'
                      ? 'bg-[#121622] border-purple-500/40'
                      : 'bg-[#141a29] border-white/10'
                  }`}
                >
                  {/* Top Bar: Student info & Submission status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      {sub.studentId?.picture ? (
                        <img src={sub.studentId.picture} alt="" className="w-11 h-11 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-500/30">
                          {sub.studentId?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{sub.studentId?.name || 'Sinh viên'}</h4>
                          {isVerified ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Đã thực hành thật
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Chưa phát hiện lệnh
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{sub.studentId?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">Thời gian nộp:</span>
                        <span className="text-slate-200 font-mono font-medium">{new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                      </div>

                      {sub.status === 'GRADED' ? (
                        <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-black text-base shadow-sm shadow-purple-500/10">
                          {sub.score} / 100
                        </div>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 PHẦN THÔNG TIN RÕ RÀNG */}
                  <div className="py-4 space-y-4">
                    
                    {/* KHỐI 1: STUDENT-REPORTED (Checklist & Bài phân tích của sinh viên) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>1. Báo cáo của sinh viên (Student-Reported)</span>
                        <span className="text-[11px] font-mono text-cyan-400 normal-case font-semibold">
                          Checklist: {completedCount} / {totalReqs} tiêu chí đạt
                        </span>
                      </div>

                      {/* Checklist breakdown */}
                      <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-white/5 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {assignment.requirements && assignment.requirements.length > 0 ? (
                            assignment.requirements.map((req: any, i: number) => {
                              const isDone = sub.checklistStatus?.find((c: any) => c.requirementId === req.id)?.completed;
                              return (
                                <div key={req.id || i} className="flex items-center gap-2">
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    isDone 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  }`}>
                                    {isDone ? '✓' : '✗'}
                                  </span>
                                  <span className={isDone ? 'text-slate-200' : 'text-slate-500 line-through'}>
                                    {req.text}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-slate-500 italic text-xs">Không có tiêu chí checklist cụ thể</span>
                          )}
                        </div>
                      </div>

                      {/* Bài phân tích */}
                      <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-white/5">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                          Nội dung giải trình & lý do vào lệnh:
                        </span>
                        <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {sub.content}
                        </p>
                      </div>
                    </div>

                    {/* KHỐI 2: SYSTEM-VERIFIED TRADING ACTIVITY (Bằng chứng giao dịch xác thực) */}
                    <div className="bg-[#0c101c] rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                              2. Bằng chứng giao dịch xác thực bởi hệ thống (System-Verified)
                            </span>
                          </div>
                          {evidence?.timeWindow && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>Khung giờ bài làm:</span>
                              <span className="text-slate-300">
                                {new Date(evidence.timeWindow.from).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                              </span>
                              <span>→</span>
                              <span className="text-cyan-400 font-semibold">
                                {new Date(evidence.timeWindow.to).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} (Thời điểm nộp)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Link to open Trading Terminal for this stock */}
                        <Link
                          to={`/trade/${assignment.symbol || 'FPT'}`}
                          target="_blank"
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
                        >
                          <span>Mở Trading Terminal ({assignment.symbol || 'FPT'})</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {isVerified ? (
                        <>
                          {/* Metrics summary cards */}
                          {(() => {
                            const currSymbol = evidence.currencySymbol || '₫';
                            const totalFilled = evidence.totalFilledOrders !== undefined ? evidence.totalFilledOrders : evidence.totalOrders;
                            const totalCancelled = evidence.totalCancelledOrders || 0;

                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                                <div className="bg-[#141a29] p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Lệnh khớp (Filled)</span>
                                  <span className="text-white font-mono font-bold text-base mt-0.5 block">{totalFilled} lệnh</span>
                                  {totalCancelled > 0 && (
                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">({totalCancelled} lệnh đã hủy)</span>
                                  )}
                                </div>
                                <div className="bg-[#141a29] p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Mã cổ phiếu</span>
                                  <span className="text-cyan-400 font-mono font-bold text-base mt-0.5 block">{evidence.targetSymbol || assignment.symbol}</span>
                                </div>
                                <div className="bg-[#141a29] p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Kỷ luật Stop Loss</span>
                                  <span className={`font-bold text-sm mt-0.5 block ${evidence.hasStopLoss ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {evidence.hasStopLoss ? '✓ Có cài SL' : '⚠️ Chưa cài SL'}
                                  </span>
                                </div>
                                <div className="bg-[#141a29] p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">P&L thực tế</span>
                                  <span className={`font-mono font-bold text-base mt-0.5 block ${evidence.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {evidence.totalPnL >= 0 ? '+' : ''}{Number(evidence.totalPnL || 0).toLocaleString('vi-VN')} {currSymbol}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Orders table */}
                          <div className="overflow-x-auto rounded-xl border border-white/5">
                            <table className="w-full text-left text-[11px] font-mono">
                              <thead className="bg-[#172033] text-slate-400 uppercase text-[10px]">
                                <tr>
                                  <th className="py-2.5 px-3">Lệnh</th>
                                  <th className="py-2.5 px-3">Mã</th>
                                  <th className="py-2.5 px-3">Khối lượng</th>
                                  <th className="py-2.5 px-3">Giá khớp</th>
                                  <th className="py-2.5 px-3">SL / TP</th>
                                  <th className="py-2.5 px-3">P&L</th>
                                  <th className="py-2.5 px-3">Thời gian</th>
                                  <th className="py-2.5 px-3 text-right">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-slate-300">
                                {evidence.orders.map((ord: any, idx: number) => {
                                  const isBuy = ord.side === 'BUY' || ord.side === 'LONG';
                                  const currSymbol = evidence.currencySymbol || '₫';
                                  const isCancelled = ord.status === 'CANCELLED' || ord.status === 'REJECTED';

                                  return (
                                    <tr key={ord.id || idx} className={`transition-colors ${isCancelled ? 'opacity-60 bg-white/[0.01]' : 'hover:bg-white/[0.02]'}`}>
                                      <td className="py-2.5 px-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          isCancelled 
                                            ? 'bg-slate-700/50 text-slate-400 border border-slate-600'
                                            : isBuy 
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                        }`}>
                                          {isBuy ? 'BUY' : 'SELL'}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 font-bold text-white">{ord.symbol}</td>
                                      <td className="py-2.5 px-3">{Number(ord.quantity).toLocaleString('vi-VN')}</td>
                                      <td className="py-2.5 px-3">{Number(ord.price).toLocaleString('vi-VN')} {currSymbol}</td>
                                      <td className="py-2.5 px-3 text-slate-400">
                                        {ord.stopLoss || ord.takeProfit ? (
                                          <span>
                                            SL: {ord.stopLoss ? `${Number(ord.stopLoss).toLocaleString('vi-VN')} ${currSymbol}` : '-'} | TP: {ord.takeProfit ? `${Number(ord.takeProfit).toLocaleString('vi-VN')} ${currSymbol}` : '-'}
                                          </span>
                                        ) : (
                                          <span className="text-slate-600">-</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        {ord.pnl !== undefined && !isCancelled ? (
                                          <span className={ord.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                            {ord.pnl >= 0 ? '+' : ''}{Number(ord.pnl).toLocaleString('vi-VN')} {currSymbol}
                                          </span>
                                        ) : (
                                          <span className="text-slate-600">-</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                                        {new Date(ord.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(ord.time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                          ord.status === 'FILLED' 
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : ord.status === 'CANCELLED'
                                            ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                            : ord.status === 'OPEN'
                                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                        }`}>
                                          {ord.status === 'FILLED' ? 'KHỚP' : ord.status === 'CANCELLED' ? 'ĐÃ HỦY' : ord.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-sm">Chưa phát hiện lệnh giao dịch nào cho mã {assignment.symbol || 'FPT'}</p>
                            <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
                              Hệ thống không tìm thấy lệnh giao dịch Khớp (FILLED) nào của sinh viên này với mã {assignment.symbol || 'FPT'}. Sinh viên có thể đã chỉ nộp lý thuyết mà chưa thực hành đặt lệnh trên Trading Terminal.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lời nhận xét đã lưu (nếu có và không ở chế độ sửa) */}
                    {sub.feedback && !isEditing && (
                      <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-500/30 text-xs">
                        <span className="text-purple-300 font-bold block mb-1">Lời nhận xét của giảng viên:</span>
                        <p className="text-purple-200 whitespace-pre-wrap leading-relaxed">
                          {sub.feedback}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* KHỐI 3: LECTURER EVALUATION (Form chấm điểm inline) */}
                  {isEditing ? (
                    <div className="mt-4 p-4 bg-[#10141f] rounded-2xl border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        <span>3. Đánh giá & Chấm điểm (Lecturer Evaluation)</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="w-full sm:w-36">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Điểm số (0-100):</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={gradeInput}
                            onChange={(e) => setGradeInput(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#172033] border border-[#253047] rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Lời nhận xét / Đánh giá chi tiết:</label>
                          <input
                            type="text"
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            placeholder="Ví dụ: Phân tích đúng chỉ báo, có kỷ luật SL/TP theo yêu cầu đề bài..."
                            className="w-full px-3 py-2 bg-[#172033] border border-[#253047] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-1">
                        <button
                          onClick={() => setGradingSubId(null)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveGrade(sub._id)}
                          disabled={savingGrade}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{savingGrade ? 'Đang lưu...' : 'Lưu điểm & Nhận xét'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleStartGrading(sub)}
                        className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        <span>{sub.status === 'GRADED' ? 'Sửa điểm & Nhận xét' : 'Chấm điểm bài nộp'}</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#253047] bg-[#172033]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
