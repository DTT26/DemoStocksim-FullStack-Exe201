import { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Clock, Send, User, AlertCircle, FileText, Check } from 'lucide-react';

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
      <div className="bg-[#111827] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-[#253047] text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Mã: {assignment.symbol || 'FPT'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Bài nộp: {assignment.title}
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Đang tải danh sách bài nộp...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h4 className="text-base font-bold text-slate-300">Chưa có sinh viên nào nộp bài</h4>
              <p className="text-xs text-slate-500 mt-1">Khi sinh viên hoàn thành và bấm nộp bài tập, danh sách sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const isEditing = gradingSubId === sub._id;
              const completedCount = sub.checklistStatus?.filter((c: any) => c.completed).length || 0;
              const totalReqs = assignment.requirements?.length || (sub.checklistStatus?.length || 1);

              return (
                <div 
                  key={sub._id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    sub.status === 'GRADED'
                      ? 'bg-[#121622] border-purple-500/30'
                      : 'bg-[#141a29] border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      {sub.studentId?.picture ? (
                        <img src={sub.studentId.picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                          {sub.studentId?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.studentId?.name || 'Sinh viên'}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{sub.studentId?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">Thời gian nộp:</span>
                        <span className="text-slate-200 font-mono">{new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                      </div>

                      {sub.status === 'GRADED' ? (
                        <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-black text-sm">
                          {sub.score} / 100
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết bài nộp & checklist */}
                  <div className="py-3 space-y-3 text-xs">
                    {/* Checklist breakdown */}
                    <div className="bg-[#0b0e17] p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-slate-300 font-semibold pb-1.5 border-b border-white/5">
                        <span>Checklist sinh viên đã tick hoàn thành:</span>
                        <span className="font-mono text-cyan-400 font-bold">{completedCount} / {totalReqs}</span>
                      </div>
                      <div className="space-y-1.5">
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
                        ) : sub.checklistStatus && sub.checklistStatus.length > 0 ? (
                          sub.checklistStatus.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                c.completed 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}>
                                {c.completed ? '✓' : '✗'}
                              </span>
                              <span className={c.completed ? 'text-slate-200' : 'text-slate-500 line-through'}>
                                Tiêu chí #{i + 1}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">Không có tiêu chí checklist cụ thể</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Nội dung bài phân tích của sinh viên:</span>
                      <p className="bg-[#0b0e17] p-3 rounded-xl border border-white/5 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {sub.content}
                      </p>
                    </div>

                    {sub.feedback && !isEditing && (
                      <div className="pt-2">
                        <span className="text-slate-400 block mb-1">Lời nhận xét đã lưu:</span>
                        <p className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20 text-purple-200 whitespace-pre-wrap">
                          {sub.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form chấm điểm inline */}
                  {isEditing ? (
                    <div className="mt-3 p-4 bg-[#10141f] rounded-xl border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-32">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Điểm số (0-100):</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={gradeInput}
                            onChange={(e) => setGradeInput(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-[#172033] border border-[#253047] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Lời nhận xét / Đánh giá:</label>
                          <input
                            type="text"
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            placeholder="Ví dụ: Phân tích chỉ báo RSI tốt, điểm cắt lỗ hợp lý..."
                            className="w-full px-3 py-1.5 bg-[#172033] border border-[#253047] rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => setGradingSubId(null)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveGrade(sub._id)}
                          disabled={savingGrade}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-md shadow-indigo-600/20"
                        >
                          {savingGrade ? 'Đang lưu...' : 'Lưu điểm & Nhận xét'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleStartGrading(sub)}
                        className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
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
        <div className="px-6 py-3.5 border-t border-[#253047] bg-[#172033]/60 flex justify-end">
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
