import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, CheckCircle2, Save, X } from 'lucide-react';
import { MOCK_STUDENT_PORTFOLIO } from '../../data/mockStudentData';

export const StudentProfile = () => {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    studentId: 'SE150123',
    university: 'FPT University',
    class: 'SE1501',
    phone: '0987654321',
    bio: 'Trading enthusiast. Learning about value investing and technical analysis.'
  });

  const handleSave = () => {
    // API Call to save user profile would go here
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Student Profile</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your personal information and view your learning progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
            <div className="relative z-10 flex flex-col items-center">
              {user?.picture ? (
                <img src={user.picture} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#111827] bg-[#172033] shadow-lg mb-4 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-[#111827] bg-indigo-600 shadow-lg mb-4 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              )}
              <h2 className="text-2xl font-bold text-white">{user?.name || 'Student Name'}</h2>
              <p className="text-indigo-400 font-medium mt-1">Student</p>
              
              <div className="flex items-center gap-2 mt-4 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                {user?.email || 'student@example.com'}
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Learning Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#253047]/50">
                <span className="text-slate-300">Simulations Joined</span>
                <span className="font-bold text-white">3</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#253047]/50">
                <span className="text-slate-300">Assignments Completed</span>
                <span className="font-bold text-white">12</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#253047]/50">
                <span className="text-slate-300">Total Trades</span>
                <span className="font-bold text-white">{MOCK_STUDENT_PORTFOLIO.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Win Rate</span>
                <span className="font-bold text-emerald-400">{MOCK_STUDENT_PORTFOLIO.winRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Account & Editable Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2.5 shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Connected Account
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </h3>
                <p className="text-slate-300 mt-1">{user?.email}</p>
                <p className="text-sm text-slate-500 mt-2">
                  You sign in to Tradex.ai using your Google account. 
                  Authentication credentials and password are managed securely by Google.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden">
            <div className="p-6 border-b border-[#253047] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Student ID</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.studentId}
                      onChange={e => setFormData({...formData, studentId: e.target.value})}
                      className="w-full bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white font-medium px-4 py-2.5 bg-[#172033]/50 rounded-lg border border-transparent">{formData.studentId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Class</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.class}
                      onChange={e => setFormData({...formData, class: e.target.value})}
                      className="w-full bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white font-medium px-4 py-2.5 bg-[#172033]/50 rounded-lg border border-transparent">{formData.class}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">University / School</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.university}
                      onChange={e => setFormData({...formData, university: e.target.value})}
                      className="w-full bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white font-medium px-4 py-2.5 bg-[#172033]/50 rounded-lg border border-transparent">{formData.university}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white font-medium px-4 py-2.5 bg-[#172033]/50 rounded-lg border border-transparent">{formData.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  ) : (
                    <p className="text-white px-4 py-3 bg-[#172033]/50 rounded-lg border border-transparent min-h-[100px] whitespace-pre-wrap">{formData.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
