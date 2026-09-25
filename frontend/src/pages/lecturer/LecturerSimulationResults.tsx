import { Trophy, TrendingUp, TrendingDown, Target, Users, Search, ArrowLeft, Download, BarChart3, Activity, Check, X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface ParticipantItem {
  _id: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'DISQUALIFIED' | 'LEFT';
  userId: {
    _id: string;
    name?: string;
    email: string;
    picture?: string;
  };
  initialBalance: number;
  currentBalance: number;
  portfolioValue: number;
  totalProfit: number;
  returnRate: number;
  createdAt: string;
}

export const LecturerSimulationResults = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'pending'>('leaderboard');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const [simRes, partRes] = await Promise.all([
        fetch(`${apiUrl}/simulations/${id}`, { credentials: 'include' }),
        fetch(`${apiUrl}/simulations/${id}/participants`, { credentials: 'include' })
      ]);
      
      if (simRes.ok) {
        setSimulation(await simRes.json());
      }
      if (partRes.ok) {
        setParticipants(await partRes.json());
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleApprove = async (participantId: string) => {
    setActionLoadingId(participantId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/simulations/${id}/participants/${participantId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (participantId: string) => {
    setActionLoadingId(participantId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/simulations/${id}/participants/${participantId}/reject`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeParticipants = participants.filter(p => p.status === 'ACTIVE')
    .sort((a, b) => b.returnRate - a.returnRate);
  
  const pendingParticipants = participants.filter(p => p.status === 'PENDING');

  const filteredActive = activeParticipants.filter(p => 
    (p.userId?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (p.userId?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalParticipants = activeParticipants.length;
  const avgReturn = totalParticipants > 0 ? activeParticipants.reduce((acc, curr) => acc + curr.returnRate, 0) / totalParticipants : 0;
  const positiveReturns = activeParticipants.filter(u => u.returnRate > 0).length;
  const winRate = totalParticipants > 0 ? (positiveReturns / totalParticipants) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link to="/lecturer/simulations" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm font-medium flex items-center gap-2 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Simulations
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{simulation?.name || 'Simulation Results'}</h1>
            {simulation && (
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                simulation.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                simulation.status === 'PUBLISHED' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                simulation.status === 'ENDED' ? 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20' : 
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {simulation.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {simulation.status === 'PUBLISHED' ? 'UPCOMING' : simulation.status}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Performance analytics and student rankings.</p>
        </div>
        <button className="bg-white dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#253047] text-slate-700 dark:text-white border border-slate-200 dark:border-[#253047] font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-12 h-12 text-slate-900 dark:text-white" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Total Participants</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{loading ? '-' : totalParticipants}</h3>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 relative z-10">Active traders</div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-12 h-12 text-slate-900 dark:text-white" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Average Class Return</p>
          <h3 className={`text-2xl font-bold relative z-10 ${avgReturn > 0 ? 'text-emerald-600 dark:text-emerald-400' : avgReturn < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {loading ? '-' : `${avgReturn > 0 ? '+' : ''}${avgReturn.toFixed(2)}%`}
          </h3>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 relative z-10">Across all portfolios</div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="w-12 h-12 text-slate-900 dark:text-white" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Profitable Students</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{loading ? '-' : `${winRate.toFixed(1)}%`}</h3>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 relative z-10">{positiveReturns} of {totalParticipants} participants</div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-12 h-12 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Top Performer</p>
          <h3 className="text-xl font-bold text-amber-500 dark:text-amber-400 relative z-10 truncate pr-8">
            {loading ? '-' : (activeParticipants[0]?.userId?.name || activeParticipants[0]?.userId?.email || 'N/A')}
          </h3>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-500/70 relative z-10 font-medium">
            {loading || !activeParticipants[0] ? '-' : `+${activeParticipants[0].returnRate.toFixed(2)}% Return`}
          </div>
        </div>
      </div>

      {/* Tabs & Table Container */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg overflow-hidden flex flex-col">
        {/* Header Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-[#253047] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-[#172033]">
          <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 dark:border-[#253047]">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Class Leaderboard ({activeParticipants.length})
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 relative ${
                activeTab === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Yêu cầu chờ duyệt
              {pendingParticipants.length > 0 && (
                <span className="bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingParticipants.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'leaderboard' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-colors"
              />
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'leaderboard' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#172033]/50 border-b border-slate-200 dark:border-[#253047] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 font-semibold w-20 text-center">Rank</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold text-right">Portfolio Value</th>
                  <th className="px-6 py-4 font-semibold text-right">Profit</th>
                  <th className="px-6 py-4 font-semibold text-right">Return %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#253047]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading results...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 opacity-20 mb-2" />
                        <p className="text-slate-900 dark:text-white font-medium">No active participants found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActive.map((item) => {
                    const actualRank = activeParticipants.findIndex(p => p._id === item._id) + 1;
                    const student = item.userId;
                    const portfolio = item.currentBalance + item.portfolioValue;
                    const profit = item.totalProfit;

                    return (
                      <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            {actualRank === 1 ? <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center font-bold">1</div> :
                             actualRank === 2 ? <div className="w-8 h-8 bg-slate-300/20 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold">2</div> :
                             actualRank === 3 ? <div className="w-8 h-8 bg-orange-700/10 border border-orange-700/30 text-orange-600 rounded-full flex items-center justify-center font-bold">3</div> :
                             <div className="w-8 h-8 text-slate-500 flex items-center justify-center font-medium">{actualRank}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                              {student?.name ? student.name.charAt(0).toUpperCase() : (student?.email?.charAt(0).toUpperCase() || 'S')}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {student?.name || 'Student'}
                              </span>
                              <p className="text-xs text-slate-500 mt-0.5">{student?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                          {(portfolio / 1000000).toFixed(1)}M ₫
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={`inline-flex items-center gap-1 font-bold ${profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {profit > 0 ? <TrendingUp className="w-3 h-3" /> : profit < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                            {profit > 0 ? '+' : ''}{(profit / 1000000).toFixed(1)}M
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs ${
                            item.returnRate > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
                            item.returnRate < 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 
                            'bg-slate-100 dark:bg-[#253047] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#3b4b72]'
                          }`}>
                            {item.returnRate > 0 ? '+' : ''}{item.returnRate.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#172033]/50 border-b border-slate-200 dark:border-[#253047] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sinh viên</th>
                  <th className="px-6 py-4 font-semibold text-center">Thời gian gửi</th>
                  <th className="px-6 py-4 font-semibold text-center">Vốn ban đầu</th>
                  <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#253047]">
                {pendingParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Check className="w-10 h-10 text-emerald-500 opacity-40 mb-2" />
                        <p className="text-slate-700 dark:text-slate-300">Không có yêu cầu tham gia nào đang chờ duyệt.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingParticipants.map((item) => {
                    const student = item.userId;
                    const isProcessing = actionLoadingId === item._id;

                    return (
                      <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                              {student?.name ? student.name.charAt(0).toUpperCase() : (student?.email?.charAt(0).toUpperCase() || 'S')}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {student?.name || 'Student'}
                              </span>
                              <p className="text-xs text-slate-500 mt-0.5">{student?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-slate-900 dark:text-white font-medium">
                          {(item.initialBalance / 1000000).toFixed(0)}M ₫
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={isProcessing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Duyệt (Accept)
                            </button>
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={isProcessing}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Từ chối (Reject)
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
