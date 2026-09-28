import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  FileText, 
  Building, 
  Phone, 
  User, 
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LecturerApplication {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  experience: string;
  linkedinOrPortfolio?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

interface LecturerRegistrationCardProps {
  user: any;
  onRefreshUser?: () => Promise<void>;
}

export const LecturerRegistrationCard = ({ user, onRefreshUser }: LecturerRegistrationCardProps) => {
  const [application, setApplication] = useState<LecturerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    university: user?.university || '',
    department: user?.department || '',
    experience: '',
    linkedinOrPortfolio: ''
  });

  const fetchApplication = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/lecturer-applications/my`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      }
    } catch (err) {
      console.warn('Error fetching lecturer application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
        university: user.university || prev.university,
        department: user.department || prev.department,
      }));
      fetchApplication();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.experience.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Kinh nghiệm/Lý do.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/lecturer-applications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: '🎉 Đã gửi hồ sơ đăng ký thành công! Ban Quản trị sẽ xét duyệt trong thời gian sớm nhất.' });
        setApplication(data.application);
        setShowForm(false);
        if (onRefreshUser) onRefreshUser();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Lỗi khi gửi hồ sơ đăng ký.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already a lecturer or admin
  if (user?.role === 'lecturer' || user?.role === 'admin') {
    return (
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 p-6 shadow-sm dark:shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Vai trò: {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Giảng viên (Lecturer)'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Bạn có toàn quyền tổ chức cuộc thi mô phỏng, tạo đề thi và chấm điểm bài tập cho học viên.
              </p>
            </div>
          </div>
          <Link
            to={user.role === 'admin' ? '/admin' : '/lecturer'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Vào không gian {user.role === 'admin' ? 'Admin' : 'Giảng viên'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="lecturer-registration" className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] overflow-hidden shadow-sm dark:shadow-xl transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#253047] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50 dark:bg-[#172033]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Đăng ký trở thành Giảng viên
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Lecturer Role
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nâng cấp tài khoản để tạo đề thi mô phỏng, giao bài tập phân tích và chấm điểm học viên.
            </p>
          </div>
        </div>

        {application?.status === 'PENDING' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Đang chờ duyệt
          </span>
        ) : application?.status === 'REJECTED' && !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp lại đơn mới</span>
          </button>
        ) : null}
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {feedback && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
          </div>
        )}

        {/* State 1: PENDING */}
        {application?.status === 'PENDING' && (
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hồ sơ đang trong quá trình xét duyệt
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Đơn đăng ký của bạn đã được chuyển tới Ban Quản trị hệ thống StockSim vào ngày{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(application.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  . Sau khi được duyệt, quyền Giảng viên sẽ được kích hoạt tự động trên tài khoản của bạn.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Họ và tên:</span>{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{application.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Số điện thoại:</span>{' '}
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{application.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Đơn vị / Trường:</span>{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{application.university || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Khoa / Bộ môn:</span>{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{application.department || 'Chưa cung cấp'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Kinh nghiệm & Lý do đăng ký:</span>
                <p className="p-3 bg-white/60 dark:bg-black/20 rounded-xl border border-amber-500/10 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {application.experience}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: REJECTED (when not currently editing new form) */}
        {application?.status === 'REJECTED' && !showForm && (
          <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đơn đăng ký trước đó chưa được chấp thuận
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lý do từ Ban Quản trị:{' '}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {application.rejectionReason || 'Hồ sơ chưa cung cấp đầy đủ thông tin hoặc chưa đáp ứng tiêu chí.'}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp lại đơn đăng ký mới</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: FORM (when no application, or rejected and wants to re-apply) */}
        {(!application || (application.status === 'REJECTED' && showForm)) && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo kỳ thi riêng</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Thiết lập cuộc thi mô phỏng, vốn ban đầu và quy chế giao dịch cho lớp học.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Giao bài tập</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Xây dựng checklist chỉ báo kỹ thuật, hạn nộp và gán cho học viên cụ thể.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Chấm điểm thông minh</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tự động đối soát lịch sử khớp lệnh và bằng chứng giao dịch thực tế của sinh viên.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              {/* Họ và tên */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Họ và tên *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Số điện thoại liên hệ *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Trường / Đơn vị */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trường đại học / Tổ chức đào tạo
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.university}
                    onChange={e => setFormData({ ...formData, university: e.target.value })}
                    placeholder="Đại học FPT, NEU, FTU..."
                    className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Khoa / Bộ môn */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Khoa / Bộ môn chuyên trách
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Khoa Tài chính - Ngân hàng, Kinh tế..."
                  className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Kinh nghiệm / Lý do đăng ký */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kinh nghiệm giảng dạy, chứng chỉ hoặc lý do muốn làm Giảng viên *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ví dụ: Giảng viên bộ môn Tài chính doanh nghiệp; có chứng chỉ hành nghề môi giới chứng khoán; muốn tổ chức cuộc thi mô phỏng cho lớp sinh viên K16..."
                  className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* LinkedIn / Portfolio / Chứng chỉ */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Link hồ sơ LinkedIn / CV / Chứng chỉ (tùy chọn)
                </label>
                <input
                  type="url"
                  value={formData.linkedinOrPortfolio}
                  onChange={e => setFormData({ ...formData, linkedinOrPortfolio: e.target.value })}
                  placeholder="https://linkedin.com/in/... hoặc link tài liệu chứng chỉ Google Drive"
                  className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end items-center gap-3">
              {application?.status === 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi đơn đăng ký tới Ban Quản trị</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
