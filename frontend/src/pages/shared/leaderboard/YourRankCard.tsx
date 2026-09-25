import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { UserAvatar } from '../../../components/UserAvatar';
import type { LeaderboardUser } from './types';

interface YourRankCardProps {
  currentUser?: LeaderboardUser;
  rank?: number;
  loading: boolean;
}

export const YourRankCard = ({ currentUser, rank, loading }: YourRankCardProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 animate-pulse transition-colors">
        <div className="h-4 w-24 bg-slate-200 dark:bg-[#2a2e39] rounded mb-6"></div>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-slate-200 dark:bg-[#2a2e39] rounded-full"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="h-10 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
      </div>
    );
  }

  if (!currentUser || !rank) {
    return (
      <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 text-center h-full flex flex-col justify-center transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Not Ranked Yet</h3>
        <p className="text-slate-500 dark:text-[#787b86] text-sm">You are not currently ranked in this simulation. Participate to get on the board!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 transition-colors">
      <h3 className="text-sm font-bold text-slate-500 dark:text-[#787b86] uppercase tracking-wider mb-6">Your Rank</h3>
      
      <div className="flex flex-col items-center text-center mb-8">
        <div className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
          #{rank}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#131722] px-4 py-2 rounded-full border border-slate-200 dark:border-[#2a2e39]">
          <UserAvatar
            src={currentUser.picture || currentUser.avatar}
            name={currentUser.name || currentUser.email}
            size="w-7 h-7"
            className="ring-2 ring-indigo-500/20"
          />
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentUser.name || currentUser.email.split('@')[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 divide-x divide-slate-200 dark:divide-[#2a2e39]">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 dark:text-[#787b86] uppercase font-bold tracking-wider mb-1">Portfolio</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{(currentUser.portfolio / 1000000).toFixed(1)}M</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 dark:text-[#787b86] uppercase font-bold tracking-wider mb-1">Return</p>
          <p className={`text-sm font-bold font-mono ${currentUser.returnRate > 0 ? 'text-emerald-600 dark:text-emerald-400' : currentUser.returnRate < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
            {currentUser.returnRate > 0 ? '+' : ''}{currentUser.returnRate.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 dark:text-[#787b86] uppercase font-bold tracking-wider mb-1">Trades</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{currentUser.trades}</p>
        </div>
      </div>

      <Link 
        to="/student/journal" 
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm shadow-sm"
      >
        View Trading Journal
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
