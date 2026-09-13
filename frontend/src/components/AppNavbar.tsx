import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserDropdown } from './UserDropdown';
import { BookOpen } from 'lucide-react';

export const AppNavbar = () => {
  const { user, logout, login } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Simulations', path: '/simulations' },
      ];
    }
    
    if (user.role === 'lecturer') {
      return [
        { label: 'Dashboard', path: '/lecturer' },
        { label: 'Simulations', path: '/lecturer/simulations' },
        { label: 'Assignments', path: '/lecturer/assignments' },
        { label: 'Students', path: '/lecturer/students' },
      ];
    }
    
    return [
      { label: 'Dashboard', path: '/student' },
      { label: 'Simulations', path: '/simulations' },
      { label: 'Assignments', path: '/student/assignments' },
      { label: 'Leaderboard', path: '/leaderboard' },
      { label: 'Performance', path: '/student/performance' },
    ];
  };

  const links = getLinks();

  return (
    <nav className="h-16 bg-white dark:bg-[#1e222d] border-b border-[#e6e8ea] dark:border-[#2a2e39] flex items-center px-6 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="flex items-center gap-2 mr-8">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-xl text-[#1e2329] dark:text-white tracking-tight">StockSim Edu</span>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'text-[#787b86] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39] hover:text-[#1e2329] dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      <div>
        {user ? (
          <UserDropdown user={user} onLogout={logout} />
        ) : (
          <button 
            onClick={() => login()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Log in / Register
          </button>
        )}
      </div>
    </nav>
  );
};
