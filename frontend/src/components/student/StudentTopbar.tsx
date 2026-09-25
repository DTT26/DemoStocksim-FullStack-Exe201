import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../../data/mockStudentData';

interface StudentTopbarProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const StudentTopbar = ({ mobileOpen, setMobileOpen }: StudentTopbarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-[#e2e8f0] dark:border-[#253047] bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden md:flex relative max-w-md w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search simulations, assignments..." 
            className="w-full bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#172033] focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
          title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#111827] flex items-center justify-center leading-none shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#172033] rounded-xl shadow-xl border border-slate-200 dark:border-[#253047] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-200 dark:border-[#253047] flex justify-between items-center bg-slate-50 dark:bg-[#111827]">
                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium cursor-pointer">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.length > 0 ? (
                  MOCK_NOTIFICATIONS.map(notification => (
                    <div key={notification.id} className={`p-4 border-b border-slate-100 dark:border-[#253047] last:border-0 hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors cursor-pointer ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-semibold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></div>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{notification.description}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                        {new Date(notification.time).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No new notifications</div>
                )}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[#253047] text-center">
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer">View all</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-[#253047]"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 p-1 pl-2 pr-3 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-[#253047] cursor-pointer"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#253047]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white border border-slate-200 dark:border-[#253047]">
                {user?.name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#172033] rounded-xl shadow-xl border border-slate-200 dark:border-[#253047] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-200 dark:border-[#253047] bg-slate-50 dark:bg-[#111827]">
                <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link to="/student/profile" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  View Profile
                </Link>
              </div>
              <div className="p-2 border-t border-slate-200 dark:border-[#253047]">
                <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
