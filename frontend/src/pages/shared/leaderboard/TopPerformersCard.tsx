import { UserAvatar } from '../../../components/UserAvatar';
import type { LeaderboardUser } from './types';

interface TopPerformersCardProps {
  users: LeaderboardUser[];
  loading: boolean;
}

export const TopPerformersCard = ({ users, loading }: TopPerformersCardProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 animate-pulse mt-4 transition-colors">
        <div className="h-4 w-32 bg-slate-200 dark:bg-[#2a2e39] rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-200 dark:bg-[#2a2e39] rounded-full"></div>
              <div className="w-8 h-8 bg-slate-200 dark:bg-[#2a2e39] rounded-full"></div>
              <div className="flex-1 h-3 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
              <div className="w-12 h-3 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
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
    <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 mt-4 transition-colors">
      <h3 className="text-sm font-bold text-slate-500 dark:text-[#787b86] uppercase tracking-wider mb-6">Top Performers</h3>
      
      <div className="space-y-4">
        {top3.map((user, index) => (
          <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-[#2a2e39]/30 rounded-lg transition-colors">
            <span className="text-xl" title={`Rank ${index + 1}`}>{getMedal(index)}</span>
            
            <UserAvatar
              src={user.picture || user.avatar}
              name={user.name || user.email}
              size="w-8 h-8"
              className="ring-1 ring-slate-200 dark:ring-[#2a2e39]"
            />
            
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.name || user.email.split('@')[0]}
              </p>
            </div>
            
            <span className={`text-sm font-bold font-mono ${user.returnRate > 0 ? 'text-emerald-600 dark:text-emerald-400' : user.returnRate < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
              {user.returnRate > 0 ? '+' : ''}{user.returnRate.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
