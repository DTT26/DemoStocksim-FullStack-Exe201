import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, BookOpen, Activity, User, Settings, LogOut, TrendingUp, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface StudentSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const StudentSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: StudentSidebarProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Simulations', path: '/student/simulations', icon: <Target className="w-5 h-5" /> },
    { name: 'Assignments', path: '/student/assignments', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Trading Journal', path: '/student/journal', icon: <Activity className="w-5 h-5" /> },
    { name: 'Performance', path: '/student/performance', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const bottomItems = [
    { name: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/student/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 flex flex-col bg-[#111827] border-r border-[#253047] transition-all duration-300
    ${collapsed ? 'w-[80px]' : 'w-[260px]'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#253047]">
          {!collapsed && (
            <Link to="/student" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Tradex<span className="text-indigo-500">.ai</span></span>
            </Link>
          )}
          {collapsed && (
            <Link to="/student" className="mx-auto flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </Link>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5 scrollbar-hide">
          <div className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {!collapsed && 'Main Menu'}
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/student' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : undefined}
              >
                <div className={`${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </div>
                {!collapsed && <span className="font-medium text-[15px]">{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#253047] flex flex-col gap-1.5">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-[#172033] text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : undefined}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </div>
                {!collapsed && <span className="font-medium text-[15px]">{item.name}</span>}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10 w-full
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-[15px]">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
