import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, ChevronDown, User, Settings, LogOut, UserPlus, Play, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface AdminTopbarProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const AdminTopbar = ({ mobileOpen, setMobileOpen }: AdminTopbarProps) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications — no backend endpoint exists
  const notifications = [
    { id: 1, icon: <UserPlus className="w-4 h-4 text-blue-400" />, title: 'New user registered', description: 'A new student has joined the platform.', time: '2 minutes ago', read: false },
    { id: 2, icon: <Play className="w-4 h-4 text-emerald-400" />, title: 'Simulation started', description: 'Vietnam Stock Challenge #01 is now live.', time: '1 hour ago', read: false },
    { id: 3, icon: <CheckCircle className="w-4 h-4 text-slate-400" />, title: 'Simulation completed', description: 'US Market Training has ended.', time: 'Yesterday', read: true },
    { id: 4, icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, title: 'User role changed', description: 'A user was promoted to Lecturer.', time: '2 days ago', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden md:flex relative max-w-md w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search users, simulations..."
            className="w-full bg-[#172033] border border-[#1e293b] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#111827]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#172033] rounded-xl shadow-2xl border border-[#1e293b] overflow-hidden z-50">
              <div className="p-4 border-b border-[#1e293b] flex justify-between items-center bg-[#111827]">
                <h3 className="font-semibold text-white text-sm">Notifications</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Mark all as read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-[#1e293b] last:border-0 hover:bg-[#111827]/50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-500/5' : ''}`}>
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0 border border-[#1e293b]">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                        {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#1e293b]"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 p-1 pl-2 pr-3 hover:bg-[#172033] rounded-lg transition-colors border border-transparent hover:border-[#1e293b]"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-[#1e293b]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white border border-[#1e293b]">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white line-clamp-1">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-slate-400">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#172033] rounded-xl shadow-2xl border border-[#1e293b] overflow-hidden z-50">
              <div className="p-4 border-b border-[#1e293b] bg-[#111827]">
                <p className="font-semibold text-white text-sm">{user?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <Link to="/admin/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/admin/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </div>
              <div className="p-1.5 border-t border-[#1e293b]">
                <button onClick={() => logout()} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
