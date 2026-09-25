import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, FileText, Save, Edit3, X, Shield, Loader2, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordCard } from '../../components/ChangePasswordCard';
import { AvatarChangeModal } from '../../components/AvatarChangeModal';
import { UserAvatar } from '../../components/UserAvatar';

export const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Ban Quản trị Hệ thống',
        bio: user.bio || 'Quản trị viên hệ thống mô phỏng giao dịch chứng khoán StockSim.',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/users/me`, {
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
          bio: formData.bio
        }),
      });
      if (response.ok) {
        await refreshUser();
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Ban Quản trị Hệ thống',
        bio: user.bio || 'Quản trị viên hệ thống mô phỏng giao dịch chứng khoán StockSim.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hồ sơ quản trị viên (Admin Profile)</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Quản lý thông tin tài khoản và phân quyền hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-sm dark:shadow-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-600/30 via-indigo-500/20 to-purple-600/30"></div>
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              {/* Avatar with click & hover to edit */}
              <div 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group cursor-pointer"
                title="Bấm để đổi ảnh đại diện"
              >
                <UserAvatar
                  src={user?.picture}
                  name={user?.name || 'Admin'}
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
                <div className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white dark:border-[#111827] group-hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">{user?.name || 'Quản trị viên'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{user?.email}</p>

              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google OAuth
                </span>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-[#1e293b] text-left text-xs space-y-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Đơn vị quản lý:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{formData.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Số điện thoại:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-mono">{formData.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-sm dark:shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#172033]/60 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Thông tin tài khoản quản trị
              </h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 border border-blue-200 dark:border-blue-500/20 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Họ và tên quản trị viên *
                  </label>
                  {editing ? (
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium py-2 px-3 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.name || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Email quản trị
                  </label>
                  <p className="text-slate-500 dark:text-slate-400 py-2 px-3 bg-slate-50 dark:bg-[#172033]/30 rounded-xl border border-slate-200 dark:border-white/5 font-mono">{formData.email}</p>
                  {editing && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Email được liên kết từ Google OAuth.</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Số điện thoại
                  </label>
                  {editing ? (
                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. 0912345678"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono" />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-mono py-2 px-3 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Phòng ban / Bộ phận
                  </label>
                  {editing ? (
                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Ban Quản trị Hệ thống"
                      className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium py-2 px-3 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5">{formData.department || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Ghi chú / Giới thiệu
                </label>
                {editing ? (
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Thông tin nhiệm vụ quản trị..."
                    className="w-full bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-blue-500 resize-none leading-relaxed" />
                ) : (
                  <p className="text-slate-700 dark:text-slate-200 py-2.5 px-3 bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-slate-200 dark:border-white/5 leading-relaxed">{formData.bio || 'Chưa có ghi chú'}</p>
                )}
              </div>

              {editing && (
                <div className="pt-4 border-t border-slate-200 dark:border-[#1e293b] flex justify-end gap-2.5 text-xs">
                  <button onClick={handleCancel} className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 font-medium cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Hủy
                  </button>
                  <button onClick={handleSave} disabled={loading} className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5 font-bold disabled:opacity-50 hover:scale-[1.02] cursor-pointer">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <ChangePasswordCard />
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> Cập nhật hồ sơ quản trị viên thành công!
        </div>
      )}

      {/* Avatar Change Modal */}
      <AvatarChangeModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
