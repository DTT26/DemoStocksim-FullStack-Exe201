import { Users, TrendingUp, BarChart2, Activity } from 'lucide-react';
import type { LeaderboardUser } from './types';

interface LeaderboardStatsProps {
  users: LeaderboardUser[];
  loading?: boolean;
}

export const LeaderboardStats = ({ users, loading }: LeaderboardStatsProps) => {
  const totalParticipants = users.length;
  
  // Calculate highest return
  const highestReturn = users.length > 0 
    ? Math.max(...users.map(u => u.returnRate)) 
    : 0;
  
  const highestReturnUser = users.length > 0 
    ? users.reduce((prev, current) => (prev.returnRate > current.returnRate) ? prev : current)
    : null;

  // Calculate average return
  const avgReturn = users.length > 0
    ? users.reduce((sum, u) => sum + u.returnRate, 0) / users.length
    : 0;

  // Calculate total trades
  const totalTrades = users.reduce((sum, u) => sum + u.trades, 0);

  const formatReturn = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 shadow-sm h-[116px] animate-pulse">
            <div className="h-4 w-24 bg-[#2a2e39] rounded mb-3"></div>
            <div className="h-8 w-32 bg-[#2a2e39] rounded mb-2"></div>
            <div className="h-3 w-40 bg-[#2a2e39] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-700">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-[#787b86] mb-2">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Total Participants</span>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{totalParticipants}</p>
        <p className="text-xs text-slate-400">Registered traders</p>
      </div>

      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#787b86] mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Highest Return</span>
        </div>
        <p className={`text-3xl font-bold mb-1 ${highestReturn > 0 ? 'text-emerald-400' : highestReturn < 0 ? 'text-rose-400' : 'text-white'}`}>
          {formatReturn(highestReturn)}
        </p>
        <p className="text-xs text-slate-400 truncate">
          By {highestReturnUser?.name || highestReturnUser?.email.split('@')[0] || 'Unknown'}
        </p>
      </div>

      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-[#787b86] mb-2">
          <BarChart2 className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Average Return</span>
        </div>
        <p className={`text-3xl font-bold mb-1 ${avgReturn > 0 ? 'text-emerald-400' : avgReturn < 0 ? 'text-rose-400' : 'text-white'}`}>
          {formatReturn(avgReturn)}
        </p>
        <p className="text-xs text-slate-400">Across all participants</p>
      </div>

      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-[#787b86] mb-2">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Total Trades</span>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{totalTrades.toLocaleString('en-US')}</p>
        <p className="text-xs text-slate-400">Executed in this simulation</p>
      </div>
    </div>
  );
};
