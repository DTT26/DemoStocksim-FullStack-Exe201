import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, CheckCircle2, Save, X, Edit3, User, Phone, BookOpen, GraduationCap, FileText, Loader2, Camera } from 'lucide-react';
import { MOCK_STUDENT_PORTFOLIO } from '../../data/mockStudentData';
import { ChangePasswordCard } from '../../components/ChangePasswordCard';
import { AvatarChangeModal } from '../../components/AvatarChangeModal';
import { UserAvatar } from '../../components/UserAvatar';

export const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    university: '',
    class: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        studentId: user.studentId || 'SE150123',
        university: user.university || 'FPT University',
        class: user.class || 'SE1501',
        phone: user.phone || '0987654321',
        bio: user.bio || 'Học viên đam mê giao dịch chứng khoán, đầu tư giá trị và phân tích kỹ thuật.'
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setToastMsg(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formData.name,
          studentId: formData.studentId,
          university: formData.university,
          class: formData.class,
          phone: formData.phone,
          bio: formData.bio
        })
      });

      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
        setToastMsg({ text: '✅ Cập nhật hồ sơ cá nhân thành công!', type: 'success' });
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setToastMsg({ text: err.message || 'Lỗi khi cập nhật hồ sơ', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        studentId: user.studentId || 'SE150123',
        university: user.university || 'FPT University',
        class: user.class || 'SE1501',
        phone: user.phone || '0987654321',
        bio: user.bio || 'Học viên đam mê giao dịch chứng khoán, đầu tư giá trị và phân tích kỹ thuật.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hồ sơ cá nhân (Student Profile)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Quản lý thông tin tài khoản học viên và theo dõi chỉ số học tập.</p>
        </div>

        {toastMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
          }`}>
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white ml-2 cursor-pointer">✕</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-8 text-center relative overflow-hidden shadow-sm dark:shadow-xl transition-colors">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 dark:from-indigo-900/60 dark:via-purple-900/40 dark:to-blue-900/50"></div>
            <div className="relative z-10 flex flex-col items-center">
              {/* Avatar with click & hover to edit */}
              <div 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative mb-4 group cursor-pointer"
                title="Bấm để đổi ảnh đại diện"
              >
                <UserAvatar
                  src={user?.picture}
                  name={user?.name || 'Student'}
                  size="w-24 h-24"
                  textClassName="text-3xl"
                  className="border-4 border-white dark:border-[#111827] shadow-xl transition-transform group-hover:scale-105"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold gap-0.5">
                  <Camera className="w-5 h-5" />
                  <span>Đổi ảnh</span>
                </div>
                
                {/* Badge button */}
                <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white dark:border-[#111827] group-hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Học viên'}</h2>
              <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Sinh viên (Student)
              </span>
              
              <div className="flex items-center gap-2 mt-4 text-slate-500 dark:text-slate-400 text-xs">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="font-mono">{user?.email || 'student@example.com'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-xl transition-colors">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-[#253047] pb-3">
              Thống kê học tập & Giao dịch
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-[#253047]/50">
                <span className="text-slate-500 dark:text-slate-400">Kỳ thi tham gia:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">1</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-[#253047]/50">
                <span className="text-slate-500 dark:text-slate-400">Bài tập đã nộp:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">2</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-[#253047]/50">
                <span className="text-slate-500 dark:text-slate-400">Tổng số lệnh trade:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{MOCK_STUDENT_PORTFOLIO.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Tỷ lệ thắng (Win Rate):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{MOCK_STUDENT_PORTFOLIO.winRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Account & Editable Form */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-white flex items-center justify-center p-2 shrink-0 shadow border border-slate-200 dark:border-transparent">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Tài khoản đăng nhập Google
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Đã liên kết
                  </span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 font-mono text-xs mt-1">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Tài khoản được bảo vệ qua Google OAuth và HttpOnly Session Cookies an toàn.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] overflow-hidden shadow-sm dark:shadow-xl transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-[#253047] flex justify-between items-center bg-slate-50/50 dark:bg-[#172033]/60">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Thông tin cá nhân học viên</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật họ tên, mã sinh viên, trường lớp và số điện thoại</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                
                {/* Họ và tên */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên *</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Nhập họ và tên đầy đủ"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium px-4 py-2.5 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.name || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Mã sinh viên */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mã số sinh viên (MSSV)</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.studentId}
                      onChange={e => setFormData({...formData, studentId: e.target.value})}
                      placeholder="e.g. SE150123"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-mono px-4 py-2.5 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.studentId || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Lớp */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Lớp sinh hoạt / Khóa học</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.class}
                      onChange={e => setFormData({...formData, class: e.target.value})}
                      placeholder="e.g. SE1501, K15"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium px-4 py-2.5 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.class || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Trường đại học */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Trường / Đơn vị đào tạo</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.university}
                      onChange={e => setFormData({...formData, university: e.target.value})}
                      placeholder="e.g. Đại học FPT"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium px-4 py-2.5 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.university || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Số điện thoại liên hệ</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g. 0987654321"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-mono px-4 py-2.5 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Giới thiệu / Bio */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Giới thiệu ngắn (Bio)</label>
                  {isEditing ? (
                    <textarea 
                      rows={3}
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="Mục tiêu học tập, phong cách đầu tư yêu thích..."
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-slate-700 dark:text-slate-200 px-4 py-3 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5 min-h-[80px] whitespace-pre-wrap leading-relaxed">{formData.bio || 'Chưa có thông tin giới thiệu'}</p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <ChangePasswordCard />

        </div>

      </div>

      {/* Avatar Change Modal */}
      <AvatarChangeModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentPicture={user?.picture}
        userName={user?.name || 'Học viên'}
        onSuccess={() => {
          setToastMsg({ text: '✅ Đổi ảnh đại diện thành công!', type: 'success' });
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />
    </div>
  );
};
