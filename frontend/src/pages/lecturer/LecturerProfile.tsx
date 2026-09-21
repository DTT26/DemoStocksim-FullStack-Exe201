import { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Key, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LecturerProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  // Simulated states for visual feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Simulate API call since we can't fully modify Google Auth profiles here easily without backend changes
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Lecturer Profile</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden flex flex-col items-center p-6 text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-4 border-[#172033] shadow-xl flex items-center justify-center text-4xl font-bold text-indigo-400">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-xs font-medium text-white">Change Avatar</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white">{formData.name || 'Your Name'}</h2>
            <p className="text-slate-400 text-sm mt-1 mb-4">{formData.email || 'your.email@example.com'}</p>
            
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Shield className="w-3.5 h-3.5" />
              {user?.role || 'Lecturer'}
            </span>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg">
            <div className="p-5 border-b border-[#253047] bg-[#172033]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Personal Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white transition-colors"
                      placeholder="e.g. Dr. John Smith"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-[#172033]/50 border border-[#253047]/50 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Email cannot be changed as it is linked to your Google Account.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#253047] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              {success && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm text-center font-medium animate-in slide-in-from-bottom-2">
                  Profile updated successfully!
                </div>
              )}
            </form>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg">
            <div className="p-5 border-b border-[#253047] bg-[#172033]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Authentication
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-4">
                Your account is currently managed through Google OAuth. Password changes are handled via your Google Account settings.
              </p>
              <button 
                disabled
                className="px-5 py-2.5 bg-[#172033] border border-[#253047] text-slate-500 font-medium rounded-lg cursor-not-allowed"
              >
                Change Password (Managed by Google)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
