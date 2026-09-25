import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, CheckCircle2, User, PlayCircle, 
  Send, Award, AlertCircle, FileText, Check, Clock, TrendingUp
} from 'lucide-react';
import { MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentAssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form submission state
  const [analysisContent, setAnalysisContent] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // 1. Lấy thông tin bài tập
      let assData: any = null;
      try {
        const assRes = await fetch(`${apiUrl}/assignments/${id}`, {
          credentials: 'include',
          headers
        });
        if (assRes.ok) {
          assData = await assRes.json();
        }
      } catch (e) {
        console.warn('Backend fetch assignment error:', e);
      }

      // Fallback sang mock data nếu không tìm thấy trên backend
      if (!assData) {
        assData = MOCK_ASSIGNMENTS.find(a => a.id === id);
      }

      setAssignment(assData);

      // 2. Lấy thông tin bài nộp của sinh viên nếu có
      try {
        const subRes = await fetch(`${apiUrl}/assignments/${id}/submission`, {
          credentials: 'include',
          headers
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData) {
            setSubmission(subData);
            setAnalysisContent(subData.content || '');
            if (subData.checklistStatus && Array.isArray(subData.checklistStatus)) {
              const map: Record<string, boolean> = {};
              subData.checklistStatus.forEach((item: any) => {
                map[item.requirementId] = item.completed;
              });
              setChecklist(map);
            }
          }
        }
      } catch (e) {
        console.warn('Backend fetch submission error:', e);
      }

      // Khởi tạo checklist nếu chưa có
      const reqList = (assData && assData.requirements && assData.requirements.length > 0)
        ? assData.requirements
        : [
            { id: 'r1', text: 'Quan sát và áp dụng chỉ báo MACD trên biểu đồ' },
            { id: 'r2', text: 'Quan sát và áp dụng chỉ báo RSI trên biểu đồ' },
            { id: 'r3', text: 'Viết nhận định tóm tắt về xu hướng giá' },
            { id: 'r4', text: 'Thực hành đặt lệnh Mua (Limit BUY) trên Trading Terminal' },
            { id: 'r5', text: 'Thiết lập mức Cắt lỗ (Stop Loss) an toàn cho lệnh' }
          ];

      setChecklist(prev => {
        const init: Record<string, boolean> = { ...prev };
        reqList.forEach((r: any) => {
          if (init[r.id] === undefined) {
            init[r.id] = false;
          }
        });
        return init;
      });

    } catch (err) {
      console.error('Failed to load assignment', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const toggleChecklist = (reqId: string) => {
    setChecklist(prev => ({
      ...prev,
      [reqId]: !prev[reqId]
    }));
  };

  const rawReqs = (assignment?.requirements && assignment.requirements.length > 0)
    ? assignment.requirements
    : [
        { id: 'r1', text: 'Quan sát và áp dụng chỉ báo MACD trên biểu đồ' },
        { id: 'r2', text: 'Quan sát và áp dụng chỉ báo RSI trên biểu đồ' },
        { id: 'r3', text: 'Viết nhận định tóm tắt về xu hướng giá' },
        { id: 'r4', text: 'Thực hành đặt lệnh Mua (Limit BUY) trên Trading Terminal' },
        { id: 'r5', text: 'Thiết lập mức Cắt lỗ (Stop Loss) an toàn cho lệnh' }
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisContent.trim()) {
      setToastMsg({ text: 'Vui lòng nhập nội dung phân tích / giải trình lệnh giao dịch', type: 'error' });
      return;
    }

    setSubmitting(true);
    setToastMsg(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');

      const checklistPayload = rawReqs.map((req: any) => ({
        requirementId: req.id,
        completed: !!checklist[req.id]
      }));

      const res = await fetch(`${apiUrl}/assignments/${id}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          content: analysisContent,
          checklistStatus: checklistPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission);
        setToastMsg({ text: '🎉 Nộp bài tập thành công! Giảng viên sẽ chấm điểm bài làm của bạn.', type: 'success' });
      } else {
        const err = await res.json().catch(() => ({}));
        setToastMsg({ text: err.message || 'Lỗi khi nộp bài tập', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Đang tải thông tin bài tập...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy bài tập</h2>
        <p>Bài tập này có thể đã bị gỡ bỏ hoặc bạn không có quyền truy cập.</p>
        <Link to="/student/assignments" className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Quay lại danh sách bài tập
        </Link>
      </div>
    );
  }

  const totalReqs = rawReqs.length;
  const completedReqs = rawReqs.filter((r: any) => checklist[r.id]).length;
  const progressPercent = Math.min(100, Math.round((completedReqs / totalReqs) * 100));

  const isGraded = submission?.status === 'GRADED';
  const isSubmitted = submission?.status === 'SUBMITTED' || isGraded;

  const targetSymbol = (assignment.symbol || 'FPT').toLowerCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/student/assignments" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#172033] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {assignment.title}
              </h1>
              {isGraded ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Đã chấm điểm: {submission.score}đ
                </span>
              ) : isSubmitted ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã nộp bài
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Đang làm
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mã cổ phiếu trọng tâm: <strong className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">{assignment.symbol || 'FPT'}</strong>
            </p>
          </div>
        </div>

        <Link
          to={`/trade/${targetSymbol}`}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Mở Trading Terminal ({assignment.symbol || 'FPT'})</span>
        </Link>
      </div>

      {/* Thông báo kết quả / Toast */}
      {toastMsg && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
        }`}>
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Banner kết quả chấm điểm nếu đã Graded */}
      {isGraded && (
        <div className="bg-gradient-to-r from-purple-50 via-amber-50/50 to-amber-50 dark:from-purple-950/40 dark:via-[#172033] dark:to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl text-slate-800 dark:text-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kết Quả Đánh Giá Của Giảng Viên</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chấm bởi: <strong className="text-slate-800 dark:text-slate-200">{submission.gradedBy?.name || 'Giảng viên phụ trách'}</strong> vào ngày {new Date(submission.gradedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="text-right bg-amber-500/10 border border-amber-500/30 px-5 py-2 rounded-2xl">
              <span className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold block uppercase tracking-wider">Điểm số</span>
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{submission.score} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ 100</span></span>
            </div>
          </div>
          {submission.feedback && (
            <div className="pt-4 text-sm leading-relaxed">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block mb-1">Lời nhận xét:</span>
              <p className="text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 whitespace-pre-wrap">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột chính bên trái: Hướng dẫn, Checklist & Form nộp bài */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hướng dẫn đề bài */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-lg transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Yêu cầu & Hướng dẫn làm bài</span>
            </h2>
            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-[#172033]/60 p-4 rounded-xl border border-slate-200 dark:border-[#253047]">
              {assignment.instructions || assignment.description || 'Vui lòng thực hiện theo các yêu cầu trong checklist và giao dịch trên màn hình Trading Terminal.'}
            </div>
          </div>

          {/* Checklist tiêu chí */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] overflow-hidden shadow-sm dark:shadow-lg transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-[#253047] flex justify-between items-center bg-slate-50/50 dark:bg-[#172033]/50">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Checklist yêu cầu bài tập</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Đánh dấu vào các mục bạn đã thực hiện hoàn thành</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                {completedReqs} / {totalReqs} ({progressPercent}%)
              </span>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-[#253047]">
              {rawReqs.map((req: any) => {
                const isChecked = !!checklist[req.id];
                return (
                  <div 
                    key={req.id} 
                    onClick={() => toggleChecklist(req.id)}
                    className="p-4 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-[#172033]/60 transition-colors cursor-pointer select-none"
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isChecked 
                        ? 'border-emerald-500 bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-white/5 text-transparent hover:border-indigo-400'
                    }`}>
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <p className={`text-sm font-medium transition-colors ${
                      isChecked ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {req.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form nộp bài tập */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-lg space-y-4 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Bài làm & Phân tích của sinh viên</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Nội dung phân tích kỹ thuật, lý do vào lệnh & chiến lược quản trị rủi ro:
                </label>
                <textarea
                  rows={6}
                  value={analysisContent}
                  onChange={(e) => setAnalysisContent(e.target.value)}
                  placeholder="Ví dụ: Dựa trên chỉ báo RSI chạm vùng quá bán 28 và đường MACD chuẩn bị cắt lên Signal line tại khung H1, tôi đã lên kế hoạch đặt lệnh Mua Limit giá 135.500 VND..."
                  className="w-full p-4 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isSubmitted && submission?.submittedAt ? (
                    <span>Đã nộp bài lúc: <strong className="text-slate-800 dark:text-slate-200">{new Date(submission.submittedAt).toLocaleString('vi-VN')}</strong></span>
                  ) : (
                    <span>Chưa gửi bài nộp</span>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0088ff] hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Đang gửi...' : isSubmitted ? 'Cập nhật bài nộp' : 'Nộp bài tập'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Cột thông tin phụ bên phải */}
        <div className="space-y-6">
          
          {/* Hộp thông tin Assignment Info */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-lg space-y-5 transition-colors">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#253047] pb-3">
              Thông Tin Bài Tập
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Kỳ thi mô phỏng:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {assignment.simulationId?.name || assignment.simulation || 'Vietnam Stock Challenge'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Giảng viên phụ trách:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {assignment.createdBy?.name || assignment.lecturer || 'TS. Nguyễn Văn A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Hạn nộp bài (Deadline):</span>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold font-mono">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{new Date(assignment.deadline).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Mã cổ phiếu thực hành:</span>
                <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-bold font-mono rounded border border-cyan-200 dark:border-cyan-500/30 inline-block">
                  {assignment.symbol || 'FPT'}
                </span>
              </div>
            </div>

            {/* Thanh tiến độ */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#253047]">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Tiến độ hoàn thành:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-[#253047] rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hộp hành động mở Trading Terminal */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/40 dark:via-[#111827] dark:to-[#111827] rounded-2xl border border-indigo-200 dark:border-indigo-500/30 p-6 shadow-sm dark:shadow-xl text-center space-y-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Thực hành trên sàn giả lập</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mở Trading Terminal với mã <strong className="text-cyan-600 dark:text-cyan-400">{assignment.symbol || 'FPT'}</strong> để áp dụng chỉ báo kỹ thuật và đặt lệnh thị trường.
              </p>
            </div>
            <Link 
              to={`/trade/${targetSymbol}`} 
              className="block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
            >
              Mở Trading Terminal ({assignment.symbol || 'FPT'})
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
