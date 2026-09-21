import { useState } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
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
    <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header & Search */}
      <div className="p-6 border-b border-[#2a2e39] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
          <p className="text-sm text-[#787b86] mt-1">Live ranking of all participants in this simulation.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787b86]" />
            <input 
              type="text" 
              placeholder="Search participants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-[#787b86] hover:text-white hover:border-[#787b86] transition-colors disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-[#787b86]">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-20" />
            <p>Loading ranking data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full h-80 flex flex-col items-center justify-center text-[#787b86]">
            <div className="w-16 h-16 bg-[#131722] rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-[#2a2e39]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No participants yet</h3>
            <p className="text-sm max-w-xs text-center">There are currently no students ranked in this simulation.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center text-[#787b86]">
            <p>No participants found matching "{searchTerm}"</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold text-right">Portfolio Value</th>
                <th className="px-6 py-4 font-semibold text-right">Profit / Loss</th>
                <th className="px-6 py-4 font-semibold text-right">Return %</th>
                <th className="px-6 py-4 font-semibold text-center">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50">
              {filteredUsers.map((user) => {
                const rank = users.findIndex(u => u.email === user.email) + 1;
                const isCurrentUser = currentUserEmail === user.email;
                
                return (
                  <tr 
                    key={user._id} 
                    className={`transition-colors ${isCurrentUser ? 'bg-blue-900/10 hover:bg-blue-900/20' : 'hover:bg-[#2a2e39]/30'}`}
                  >
                    <td className={`px-6 py-4 text-center ${isCurrentUser ? 'border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}>
                      {getRankIcon(rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-[#2a2e39] text-[#787b86]'}`}>
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrentUser ? 'text-blue-400' : 'text-slate-200'}`}>
                            {user.name || user.email.split('@')[0]}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-300">
                      {formatMoney(user.portfolio)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${user.profit > 0 ? 'text-emerald-400' : user.profit < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {user.profit > 0 ? '+' : ''}{formatMoney(user.profit)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${user.returnRate > 0 ? 'text-emerald-400' : user.returnRate < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {formatReturn(user.returnRate)}
                    </td>
                    <td className="px-6 py-4 text-center text-[#787b86] font-mono">
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
