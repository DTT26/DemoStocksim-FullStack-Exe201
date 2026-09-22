import { useState } from 'react';
import { Search, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../../data/mockStudentData';

interface StudentTopbarProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const StudentTopbar = ({ mobileOpen, setMobileOpen }: StudentTopbarProps) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-[#253047] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden md:flex relative max-w-md w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search simulations, assignments..." 
            className="w-full bg-[#172033] border border-[#253047] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-[#111827] flex items-center justify-center leading-none shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#172033] rounded-xl shadow-xl border border-[#253047] overflow-hidden z-50">
              <div className="p-4 border-b border-[#253047] flex justify-between items-center bg-[#111827]">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.length > 0 ? (
                  MOCK_NOTIFICATIONS.map(notification => (
                    <div key={notification.id} className={`p-4 border-b border-[#253047] last:border-0 hover:bg-[#111827] transition-colors cursor-pointer ${!notification.read ? 'bg-indigo-500/5' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-semibold ${!notification.read ? 'text-white' : 'text-slate-300'}`}>{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></div>}
                      </div>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{notification.description}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {new Date(notification.time).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                )}
              </div>
              <div className="p-3 bg-[#111827] border-t border-[#253047] text-center">
                <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">View all</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#253047]"></div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 pl-2 pr-3 hover:bg-[#172033] rounded-lg transition-colors border border-transparent hover:border-[#253047]"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-[#253047]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white border border-[#253047]">
                {user?.name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white line-clamp-1">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-400">Student</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#172033] rounded-xl shadow-xl border border-[#253047] overflow-hidden z-50">
              <div className="p-4 border-b border-[#253047] bg-[#111827]">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link to="/student/profile" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  View Profile
                </Link>
                <Link to="/student/settings" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  Settings
                </Link>
              </div>
              <div className="p-2 border-t border-[#253047]">
                <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
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
