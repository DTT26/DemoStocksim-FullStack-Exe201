import { Trophy, TrendingUp, TrendingDown, Target, Users, Search, ArrowLeft, Download, BarChart3, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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

export const LecturerSimulationResults = () => {
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        
        // Fetch simulation details and participants
        const [simRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/simulations/${id}`, { credentials: 'include' }),
          fetch(`${apiUrl}/users?role=student`, { credentials: 'include' }) // In reality, fetch actual participants
        ]);
        
        if (simRes.ok && usersRes.ok) {
          const simData = await simRes.json();
          const usersData = await usersRes.json();
          
          setSimulation(simData);
          
          // Map real users to mock leaderboard data (sorted by mock performance)
          const leaderboardData = usersData.map((u: any, index: number) => {
            const basePortfolio = simData.initialBalance || 100000000; 
            // Generate some pseudo-random but consistent performance based on index
            const performanceMulti = 1 + ((usersData.length / 2) - index) * 0.05; 
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
              trades: 10 + (usersData.length - index) * 2
            };
          }).sort((a: LeaderboardUser, b: LeaderboardUser) => b.portfolio - a.portfolio);
          
          setUsers(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalParticipants = users.length;
  const avgReturn = users.length > 0 ? users.reduce((acc, curr) => acc + curr.returnRate, 0) / users.length : 0;
  const positiveReturns = users.filter(u => u.returnRate > 0).length;
  const winRate = users.length > 0 ? (positiveReturns / users.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link to="/lecturer/simulations" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Simulations
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{simulation?.name || 'Simulation Results'}</h1>
            {simulation && (
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                simulation.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                simulation.status === 'PUBLISHED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                simulation.status === 'ENDED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {simulation.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {simulation.status === 'PUBLISHED' ? 'UPCOMING' : simulation.status}
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-2 text-lg">Performance analytics and student rankings.</p>
        </div>
        <button className="bg-[#172033] hover:bg-[#253047] text-white border border-[#253047] font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-12 h-12 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Total Participants</p>
          <h3 className="text-2xl font-bold text-white relative z-10">{loading ? '-' : totalParticipants}</h3>
          <div className="mt-2 text-xs text-slate-500 relative z-10">Active traders</div>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Average Class Return</p>
          <h3 className={`text-2xl font-bold relative z-10 ${avgReturn > 0 ? 'text-emerald-400' : avgReturn < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {loading ? '-' : `${avgReturn > 0 ? '+' : ''}${avgReturn.toFixed(2)}%`}
          </h3>
          <div className="mt-2 text-xs text-slate-500 relative z-10">Across all portfolios</div>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="w-12 h-12 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Profitable Students</p>
          <h3 className="text-2xl font-bold text-white relative z-10">{loading ? '-' : `${winRate.toFixed(1)}%`}</h3>
          <div className="mt-2 text-xs text-slate-500 relative z-10">{positiveReturns} of {totalParticipants} participants</div>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-12 h-12 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Top Performer</p>
          <h3 className="text-xl font-bold text-amber-400 relative z-10 truncate pr-8">
            {loading ? '-' : (users[0]?.name || 'N/A')}
          </h3>
          <div className="mt-2 text-xs text-amber-500/70 relative z-10 font-medium">
            {loading || !users[0] ? '-' : `+${users[0].returnRate.toFixed(2)}% Return`}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            Class Leaderboard
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#111827] border border-[#253047] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172033]/50 border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold w-20 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold text-right">Portfolio Value</th>
                <th className="px-6 py-4 font-semibold text-right">Profit</th>
                <th className="px-6 py-4 font-semibold text-right">Return %</th>
                <th className="px-6 py-4 font-semibold text-center">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253047]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading results...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 opacity-20 mb-2" />
                      <p>No participants found.</p>
                      {searchQuery && <p className="text-sm">Try adjusting your search query.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  // If searching, we want to show their actual rank, not filtered index.
                  // But since the list is sorted by portfolio, and filteredUsers preserves order, 
                  // to get actual rank we need to find them in the `users` array.
                  const actualRank = users.findIndex(u => u._id === user._id) + 1;
                  
                  return (
                    <tr key={user._id} className="hover:bg-[#172033] transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          {actualRank === 1 ? <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center font-bold">1</div> :
                           actualRank === 2 ? <div className="w-8 h-8 bg-slate-300/10 border border-slate-300/30 text-slate-300 rounded-full flex items-center justify-center font-bold">2</div> :
                           actualRank === 3 ? <div className="w-8 h-8 bg-orange-700/10 border border-orange-700/30 text-orange-600 rounded-full flex items-center justify-center font-bold">3</div> :
                           <div className="w-8 h-8 text-slate-500 flex items-center justify-center font-medium">{actualRank}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {user.name || 'Unknown User'}
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-white">
                        {(user.portfolio / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={`inline-flex items-center gap-1 font-bold ${user.profit > 0 ? 'text-emerald-400' : user.profit < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {user.profit > 0 ? <TrendingUp className="w-3 h-3" /> : user.profit < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {user.profit > 0 ? '+' : ''}{(user.profit / 1000000).toFixed(1)}M
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs ${
                          user.returnRate > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          user.returnRate < 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                          'bg-[#253047] text-slate-400 border border-[#3b4b72]'
                        }`}>
                          {user.returnRate > 0 ? '+' : ''}{user.returnRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-400 font-medium inline-flex items-center gap-1.5 bg-[#172033] px-2.5 py-1 rounded-md border border-[#253047]">
                          <Activity className="w-3 h-3" /> {user.trades}
                        </span>
                      </td>
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
