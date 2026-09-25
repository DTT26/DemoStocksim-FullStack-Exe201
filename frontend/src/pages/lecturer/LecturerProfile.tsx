import { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Key, Camera, Loader2, Phone, Building, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordCard } from '../../components/ChangePasswordCard';

export const LecturerProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    university: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Khoa Tài chính - Ngân hàng',
        title: user.title || 'Giảng viên',
        university: user.university || 'Đại học FPT',
        bio: user.bio || 'Giảng viên chuyên ngành Tài chính Doanh nghiệp và Phân tích Đầu tư Chứng khoán.'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
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
          phone: formData.phone,
          department: formData.department,
          title: formData.title,
          university: formData.university,
          bio: formData.bio
        })
      });

      if (res.ok) {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Lỗi khi cập nhật hồ sơ');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12 mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Hồ sơ giảng viên (Lecturer Profile)</h1>
        <p className="text-slate-400 mt-2 text-base">Quản lý thông tin cá nhân, học vị và phân công đào tạo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-xl overflow-hidden flex flex-col items-center p-6 text-center">
            <div className="relative mb-4 group cursor-pointer">
              {user?.picture ? (
                <img src={user.picture} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-[#172033] shadow-xl object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-4 border-[#172033] shadow-xl flex items-center justify-center text-4xl font-bold text-indigo-400">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-bold text-white">{formData.name || 'Giảng viên'}</h2>
            <p className="text-indigo-400 text-xs font-semibold mt-0.5">{formData.title || 'Giảng viên'}</p>
            <p className="text-slate-400 text-xs mt-1 mb-4 font-mono">{formData.email}</p>
            
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Shield className="w-3.5 h-3.5" />
              Giảng viên (Lecturer)
            </span>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-xl space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-[#253047] pb-3">
              Thông tin công tác
            </h3>
            <div>
              <span className="text-slate-500 block mb-0.5">Khoa / Bộ môn:</span>
              <span className="text-white font-medium">{formData.department || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Đơn vị giảng dạy:</span>
              <span className="text-white font-medium">{formData.university || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Số điện thoại:</span>
              <span className="text-white font-mono">{formData.phone || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#253047] bg-[#172033]/60 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Thông tin cá nhân & Giảng dạy
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {success && (
                <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cập nhật hồ sơ giảng viên thành công!</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Họ tên */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1.5">Họ và tên giảng viên *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white font-medium"
                      placeholder="e.g. TS. Nguyễn Văn A"
                    />
                  </div>
                </div>

                {/* Email (Google) */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1.5">Địa chỉ Email (Google)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033]/50 border border-[#253047]/50 rounded-xl text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Email được đồng bộ qua tài khoản Google, không thể sửa đổi tại đây.</p>
                </div>

                {/* Học vị / Chức danh */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Học hàm / Học vị</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Tiến sĩ, Thạc sĩ, Giảng viên chính"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Số điện thoại liên hệ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 0912345678"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Khoa / Bộ môn */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Khoa / Viện đào tạo</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Khoa Tài chính - Ngân hàng"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>

                {/* Trường đại học */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Đơn vị công tác</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="e.g. Đại học FPT"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1.5">Giới thiệu chuyên môn / Định hướng nghiên cứu</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Lĩnh vực nghiên cứu, kinh nghiệm thị trường tài chính..."
                    className="w-full p-3 bg-[#172033] border border-[#253047] rounded-xl focus:outline-none focus:border-indigo-500 text-white resize-none leading-relaxed"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-[#253047] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Đổi mật khẩu */}
          <ChangePasswordCard />
        </div>

      </div>
    </div>
  );
};
