import { useState } from 'react';
import { Settings, User, Bell, Moon, Sun, Globe, Trophy, Sparkles } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useModal } from '../contexts/ModalContext';
import { LanguageModal } from './LanguageModal';

interface ToolbarNavbarProps {
  balance: number;
  onOpenChallenge?: () => void;
  onOpenAiTutor?: () => void;
  challengeLevelName?: string;
  challengeStatus?: string;
  accountRankBadge?: string;
  accountRankName?: string;
  certCount?: number;
}

export const ToolbarNavbar = ({ 
  balance, 
  onOpenChallenge, 
  onOpenAiTutor,
  challengeLevelName, 
  challengeStatus,
  accountRankBadge,
  accountRankName,
  certCount
}: ToolbarNavbarProps) => {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showAlert } = useModal();
  const isDarkMode = theme === 'dark';
  const [language, setLanguage] = useState('VI');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  return (
    <>
      <nav className="h-12 bg-white dark:bg-[#131722] border-b border-[#e6e8ea] dark:border-[#2a2e39] flex items-center px-4 justify-between text-[#1e2329] dark:text-[#d1d4dc] text-sm shrink-0 relative z-50">
        {/* Logo AITRADEX */}
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.jpg" alt="AITRADEX" className="h-7 object-contain rounded" />
          
          {/* Nút Thử Thách Quỹ (Prop Firm Challenge) */}
          <button
            onClick={onOpenChallenge}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs transition-all shadow-sm shadow-amber-500/10 hover:scale-[1.02]"
            title={`Thử Thách Cấp Vốn Quỹ • Hạng tài khoản: ${accountRankName || 'Cấp 1'}`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Thử Thách Quỹ</span>
            {challengeStatus === 'ACTIVE' ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Thi {challengeLevelName}</span>
              </span>
            ) : challengeStatus === 'PAUSED' ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-extrabold text-amber-600 dark:text-amber-300 border border-amber-500/30">
                Tạm dừng {challengeLevelName}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 border border-amber-500/30" title="Cấp bậc cao nhất tài khoản đã đạt được">
                {accountRankBadge || 'Cấp 1'}
              </span>
            )}
          </button>

          {/* Nút AI Trading Tutor & Trade Reviewer */}
          <button
            onClick={onOpenAiTutor}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-amber-500/20 hover:from-blue-500/30 hover:to-amber-500/30 border border-blue-500/40 text-blue-600 dark:text-blue-300 font-bold text-xs transition-all shadow-sm shadow-blue-500/10 hover:scale-[1.02]"
            title="Mở Trợ lý & Gia sư AI Trading Tutor (Hỏi đáp, So sánh chiến lược, RAG)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Tutor</span>
          </button>
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
            onClick={() => showAlert({ title: 'Thông báo', message: 'Chức năng Thông báo đang được phát triển!', type: 'info' })}
            className="hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme}
            className="hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]"
            title="Đổi giao diện (Sáng/Tối)"
          >
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsLanguageModalOpen(true)}
            className="hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 flex items-center gap-1 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]"
            title="Ngôn ngữ"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-semibold">{language}</span>
          </button>
          <button 
            onClick={() => showAlert({ title: 'Cài đặt', message: 'Chức năng Cài đặt đang được phát triển!', type: 'info' })}
            className="hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]"
            title="Cài đặt"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-px h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-1" />

          {user ? (
            <UserDropdown 
              user={{ ...user, balance }} 
              onLogout={logout} 
              isChallenge={challengeStatus === 'ACTIVE' || challengeStatus === 'PAUSED'}
              challengeLevelName={challengeLevelName}
              accountRankName={accountRankName}
              certCount={certCount}
            />
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
