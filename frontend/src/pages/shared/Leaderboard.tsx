import { Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LeaderboardUser {
  _id: string;
  name?: string;
  email: string;
  // Mock data fields for UI
  portfolio: number;
  profit: number;
  returnRate: number;
  trades: number;
}

export const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/users?role=student`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Map real users to mock leaderboard data (sorted by mock performance)
          const leaderboardData = data.map((u: any, index: number) => {
            const basePortfolio = 10000; // $10,000 USD
            // Generate some pseudo-random but consistent performance based on index
            const performanceMulti = 1 + (data.length - index) * 0.05; 
            const portfolio = basePortfolio * performanceMulti;
            const profit = portfolio - basePortfolio;
            const returnRate = (profit / basePortfolio) * 100;
            
            return {
              _id: u._id,
              name: u.name,
              email: u.email,
              portfolio,
              profit,
              returnRate,
              trades: 10 + (data.length - index) * 2
            };
          }).sort((a: LeaderboardUser, b: LeaderboardUser) => b.portfolio - a.portfolio);
          
          setUsers(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Find current user's rank
  const currentUserIndex = users.findIndex(u => u.email === currentUser?.email);
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : '-';
  const currentUserData = currentUserIndex >= 0 ? users[currentUserIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Trading Challenge #01</h1>
        <p className="text-[#787b86] mt-2 text-lg">Compete, learn, and improve your trading performance.</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
          <span className="text-sm font-medium text-[#787b86]">{loading ? '...' : users.length} Participants</span>
        </div>
      </div>

      {/* Your Position */}
      {currentUserData && (
        <div className="bg-blue-600 text-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/50 rounded-full flex items-center justify-center border-4 border-blue-400">
              <span className="text-2xl font-bold">#{currentUserRank}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Position</h3>
              <p className="text-blue-200 text-sm">
                {currentUserIndex <= Math.ceil(users.length * 0.2) ? 'Top 20% of participants' : 'Keep trading to improve!'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Portfolio</p>
              <p className="text-xl font-bold">{(currentUserData.portfolio / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Profit</p>
              <p className="text-xl font-bold text-emerald-300">{(currentUserData.profit > 0 ? '+' : '')}{(currentUserData.profit / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Return</p>
              <p className="text-xl font-bold text-emerald-300">{(currentUserData.returnRate > 0 ? '+' : '')}{currentUserData.returnRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold text-right">Portfolio Value</th>
                <th className="px-6 py-4 font-semibold text-right">Profit</th>
                <th className="px-6 py-4 font-semibold text-right">Return %</th>
                <th className="px-6 py-4 font-semibold text-center">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#787b86]">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading leaderboard...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#787b86]">
                    No participants found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const rank = index + 1;
                  const isCurrentUser = currentUser?.email === user.email;
                  
                  return (
                    <tr key={user._id} className={`${isCurrentUser ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50/50'} transition-colors`}>
                      <td className="px-6 py-4 text-center">
                        {rank === 1 ? <span className="text-2xl" title="1st Place">🥇</span> :
                         rank === 2 ? <span className="text-2xl" title="2nd Place">🥈</span> :
                         rank === 3 ? <span className="text-2xl" title="3rd Place">🥉</span> :
                         <span className={`font-bold ${isCurrentUser ? 'text-blue-600' : 'text-[#787b86]'}`}>{rank}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCurrentUser ? 'bg-blue-200 text-blue-700' : 'bg-[#2a2e39] text-[#787b86]'}`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`font-bold ${isCurrentUser ? 'text-blue-900' : 'text-white'}`}>
                              {user.name || 'Unknown'} {isCurrentUser && '(You)'}
                            </span>
                            <p className="text-xs text-[#787b86]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium">
                        ${user.portfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${user.profit > 0 ? 'text-emerald-600' : user.profit < 0 ? 'text-red-600' : 'text-[#787b86]'}`}>
                        {user.profit >= 0 ? '+$' : '-$'}{Math.abs(user.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${user.returnRate > 0 ? 'text-emerald-600' : user.returnRate < 0 ? 'text-red-600' : 'text-[#787b86]'}`}>
                        {user.returnRate > 0 ? '+' : ''}{user.returnRate.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center text-[#787b86]">{user.trades}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
