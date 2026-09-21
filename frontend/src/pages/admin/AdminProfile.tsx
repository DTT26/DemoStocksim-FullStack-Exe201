import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, FileText, Save, Edit3, X, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
        phone: '',
        department: '',
        bio: '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });
      if (response.ok) {
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
      setFormData(prev => ({ ...prev, name: user.name || '' }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-purple-600/20"></div>
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-24 h-24 rounded-full border-4 border-[#111827] shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-4 border-[#111827] shadow-xl flex items-center justify-center text-3xl font-bold text-blue-400">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}

              <h2 className="text-xl font-bold text-white mt-4">{user?.name || 'Admin'}</h2>
              <p className="text-sm text-slate-400 mt-1">{user?.email}</p>

              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google Connected
                </span>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-[#1e293b] text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Member since</p>
                <p className="text-sm text-slate-300 mt-1 font-medium">
                  {user ? new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg">
            <div className="p-6 border-b border-[#1e293b] bg-[#172033] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Profile Information
              </h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg transition-colors flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
                  </label>
                  {editing ? (
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm" />
                  ) : (
                    <p className="text-white font-medium py-2.5">{formData.name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email
                  </label>
                  <p className="text-slate-400 py-2.5">{formData.email}</p>
                  {editing && <p className="text-xs text-slate-500 mt-1">Email is managed by Google and cannot be changed.</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
                  </label>
                  {editing ? (
                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. +84 123 456 789"
                      className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-600" />
                  ) : (
                    <p className="text-white font-medium py-2.5">{formData.phone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" /> Department
                  </label>
                  {editing ? (
                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Information Technology"
                      className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-600" />
                  ) : (
                    <p className="text-white font-medium py-2.5">{formData.department || '—'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Bio
                </label>
                {editing ? (
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..."
                    className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm resize-none placeholder-slate-600" />
                ) : (
                  <p className="text-white font-medium py-2.5">{formData.bio || '—'}</p>
                )}
              </div>

              {editing && (
                <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                  <button onClick={handleCancel} className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-[#172033] border border-[#1e293b] rounded-lg transition-colors flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}
    </div>
  );
};
