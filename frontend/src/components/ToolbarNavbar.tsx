import { useState } from 'react';
import { Settings, User, Bell, Moon, Sun, Globe } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageModal } from './LanguageModal';

interface ToolbarNavbarProps {
  balance: number;
  onOpenSettings?: () => void;
}

export const ToolbarNavbar = ({ balance, onOpenSettings }: ToolbarNavbarProps) => {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [language, setLanguage] = useState('VI');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  return (
    <>
      <nav className="h-12 bg-white dark:bg-[#131722] border-b border-[#e6e8ea] dark:border-[#2a2e39] flex items-center px-4 justify-between text-[#1e2329] dark:text-[#d1d4dc] text-sm shrink-0 relative z-50">
        {/* Logo AITRADEX */}
        <div className="flex items-center">
          <img src="/images/logo.jpg" alt="AITRADEX" className="h-7 object-contain rounded" />
        </div>

        {/* Simulation Info (Centered) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1e2329] dark:text-white">Vietnam Stock Challenge #01</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[#787b86]">Rank</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">#7 / 42</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#787b86]">Return</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+8.52%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#787b86]">Simulation Time</span>
              <span className="font-mono text-[#1e2329] dark:text-slate-300">2026-09-12 14:30</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Chức năng Thông báo đang được phát triển!')}
            className="hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#d1d4dc]"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme}
            className="hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#d1d4dc]"
            title="Đổi giao diện (Sáng/Tối)"
          >
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsLanguageModalOpen(true)}
            className="hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 flex items-center gap-1 text-[#787b86] hover:text-[#d1d4dc]"
            title="Ngôn ngữ"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-semibold">{language}</span>
          </button>
          <button 
            onClick={onOpenSettings}
            className="hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#d1d4dc]"
            title="Cài đặt"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-px h-4 bg-[#2a2e39] mx-1" />

          {user ? (
            <UserDropdown user={{ ...user, balance }} onLogout={logout} />
          ) : (
            <button 
              onClick={() => login()} 
              className="h-7 px-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </nav>

      <LanguageModal 
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={language}
        onSelectLanguage={setLanguage}
      />
    </>
  );
};
