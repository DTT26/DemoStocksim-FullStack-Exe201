import { useState } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
import { UserAvatar } from '../../../components/UserAvatar';
import type { LeaderboardUser } from './types';

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserEmail?: string;
  loading: boolean;
  onRefresh: () => void;
}

export const LeaderboardTable = ({ users, currentUserEmail, loading, onRefresh }: LeaderboardTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMoney = (val: number) => {
    if (val === undefined || val === null) return '0 ₫';
    if (Math.abs(val) >= 1000000) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(val);
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatReturn = (val: number) => {
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl" title="1st Place">🥇</span>;
    if (rank === 2) return <span className="text-2xl" title="2nd Place">🥈</span>;
    if (rank === 3) return <span className="text-2xl" title="3rd Place">🥉</span>;
    return <span className="font-bold text-[#787b86]">{rank}</span>;
  };

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm flex flex-col h-full overflow-hidden transition-colors">
      {/* Header & Search */}
      <div className="p-6 border-b border-slate-200 dark:border-[#2a2e39] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard</h2>
          <p className="text-sm text-slate-500 dark:text-[#787b86] mt-1">Live ranking of all participants in this simulation.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#787b86]" />
            <input 
              type="text" 
              placeholder="Search participants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] text-slate-900 dark:text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white hover:border-slate-300 dark:hover:border-[#787b86] transition-colors disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 dark:text-[#787b86]">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-40" />
            <p>Loading ranking data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full h-80 flex flex-col items-center justify-center text-slate-400 dark:text-[#787b86]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#131722] rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400 dark:text-[#2a2e39]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No participants yet</h3>
            <p className="text-sm max-w-xs text-center text-slate-500">There are currently no students ranked in this simulation.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-slate-500 dark:text-[#787b86]">
            <p>No participants found matching "{searchTerm}"</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#131722] border-b border-slate-200 dark:border-[#2a2e39] text-slate-500 dark:text-[#787b86] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold text-right">Portfolio Value</th>
                <th className="px-6 py-4 font-semibold text-right">Profit / Loss</th>
                <th className="px-6 py-4 font-semibold text-right">Return %</th>
                <th className="px-6 py-4 font-semibold text-center">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/50">
              {filteredUsers.map((user) => {
                const rank = users.findIndex(u => u.email === user.email) + 1;
                const isCurrentUser = currentUserEmail === user.email;
                
                return (
                  <tr 
                    key={user._id} 
                    className={`transition-colors ${isCurrentUser ? 'bg-indigo-50/70 dark:bg-blue-900/10 hover:bg-indigo-50 dark:hover:bg-blue-900/20' : 'hover:bg-slate-50/80 dark:hover:bg-[#2a2e39]/30'}`}
                  >
                    <td className={`px-6 py-4 text-center ${isCurrentUser ? 'border-l-2 border-indigo-600 dark:border-blue-500' : 'border-l-2 border-transparent'}`}>
                      {getRankIcon(rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.picture || user.avatar}
                          name={user.name || user.email}
                          size="w-8 h-8"
                          className={isCurrentUser ? "ring-2 ring-indigo-500/30" : ""}
                        />
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrentUser ? 'text-indigo-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {user.name || user.email.split('@')[0]}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatMoney(user.portfolio)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${user.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : user.profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                      {user.profit > 0 ? '+' : ''}{formatMoney(user.profit)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${user.returnRate > 0 ? 'text-emerald-600 dark:text-emerald-400' : user.returnRate < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                      {formatReturn(user.returnRate)}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-[#787b86] font-mono">
                      {user.trades}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
