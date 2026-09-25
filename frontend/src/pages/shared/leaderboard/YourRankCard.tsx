import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LeaderboardUser } from './types';

interface YourRankCardProps {
  currentUser?: LeaderboardUser;
  rank?: number;
  loading: boolean;
}

export const YourRankCard = ({ currentUser, rank, loading }: YourRankCardProps) => {
  if (loading) {
    return (
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 animate-pulse">
        <div className="h-4 w-24 bg-[#2a2e39] rounded mb-6"></div>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#2a2e39] rounded-full"></div>
          <div className="h-4 w-32 bg-[#2a2e39] rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="h-10 bg-[#2a2e39] rounded"></div>
          <div className="h-10 bg-[#2a2e39] rounded"></div>
          <div className="h-10 bg-[#2a2e39] rounded"></div>
        </div>
        <div className="h-10 bg-[#2a2e39] rounded"></div>
      </div>
    );
  }

  if (!currentUser || !rank) {
    return (
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 text-center h-full flex flex-col justify-center">
        <h3 className="text-lg font-bold text-white mb-2">Not Ranked Yet</h3>
        <p className="text-[#787b86] text-sm">You are not currently ranked in this simulation. Participate to get on the board!</p>
      </div>
    );
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  return (
    <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6">
      <h3 className="text-sm font-bold text-[#787b86] uppercase tracking-wider mb-6">Your Rank</h3>
      
      <div className="flex flex-col items-center text-center mb-8">
        <div className="text-5xl font-black text-white mb-4 tracking-tighter">
          #{rank}
        </div>
        
        <div className="flex items-center gap-3 bg-[#131722] px-4 py-2 rounded-full border border-[#2a2e39]">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-200 text-sm">{currentUser.name || currentUser.email.split('@')[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 divide-x divide-[#2a2e39]">
        <div className="text-center">
          <p className="text-[10px] text-[#787b86] uppercase font-bold tracking-wider mb-1">Portfolio</p>
          <p className="text-sm font-bold text-white font-mono">{(currentUser.portfolio / 1000000).toFixed(1)}M</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#787b86] uppercase font-bold tracking-wider mb-1">Return</p>
          <p className={`text-sm font-bold font-mono ${currentUser.returnRate > 0 ? 'text-emerald-400' : currentUser.returnRate < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {currentUser.returnRate > 0 ? '+' : ''}{currentUser.returnRate.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#787b86] uppercase font-bold tracking-wider mb-1">Trades</p>
          <p className="text-sm font-bold text-white font-mono">{currentUser.trades}</p>
        </div>
      </div>

      <Link 
        to="/student/journal" 
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
      >
        View Trading Journal
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
