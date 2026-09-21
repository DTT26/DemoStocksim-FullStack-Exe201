import type { LeaderboardUser } from './types';

interface TopPerformersCardProps {
  users: LeaderboardUser[];
  loading: boolean;
}

export const TopPerformersCard = ({ users, loading }: TopPerformersCardProps) => {
  if (loading) {
    return (
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 animate-pulse mt-4">
        <div className="h-4 w-32 bg-[#2a2e39] rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#2a2e39] rounded-full"></div>
              <div className="w-8 h-8 bg-[#2a2e39] rounded-full"></div>
              <div className="flex-1 h-3 bg-[#2a2e39] rounded"></div>
              <div className="w-12 h-3 bg-[#2a2e39] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const top3 = users.slice(0, 3);
  if (top3.length === 0) return null;

  const getMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    return '🥉';
  };

  return (
    <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 mt-4">
      <h3 className="text-sm font-bold text-[#787b86] uppercase tracking-wider mb-6">Top Performers</h3>
      
      <div className="space-y-4">
        {top3.map((user, index) => (
          <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-[#2a2e39]/30 rounded-lg transition-colors">
            <span className="text-xl" title={`Rank ${index + 1}`}>{getMedal(index)}</span>
            
            <div className="w-8 h-8 rounded-full bg-[#131722] border border-[#2a2e39] flex items-center justify-center font-bold text-xs text-slate-300">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-white truncate">
                {user.name || user.email.split('@')[0]}
              </p>
            </div>
            
            <span className={`text-sm font-bold font-mono ${user.returnRate > 0 ? 'text-emerald-400' : user.returnRate < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {user.returnRate > 0 ? '+' : ''}{user.returnRate.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
