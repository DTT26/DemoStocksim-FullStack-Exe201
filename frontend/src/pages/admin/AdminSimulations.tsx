import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, Target, Users, Calendar, ArrowUpDown, AlertTriangle, X, Eye, Trophy, ShieldOff, ShieldCheck } from 'lucide-react';

interface SimulationData {
  _id: string;
  name: string;
  description?: string;
  market?: string;
  status: string;
  initialBalance?: number;
  startDate?: string;
  endDate?: string;
  createdBy?: { _id: string; name?: string; email: string };
  participants?: any[];
}

// --- Overview Modal ---
const SimulationOverviewModal = ({ sim, onClose }: { sim: SimulationData; onClose: () => void }) => {
  const participantCount = sim.participants?.length || 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sim.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sim.description || 'No description provided.'}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg flex-shrink-0 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-[#172033] p-3 rounded-lg border border-slate-200 dark:border-[#1e293b] text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{participantCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Participants</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#172033] p-3 rounded-lg border border-slate-200 dark:border-[#1e293b] text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">—</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Total Trades</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#172033] p-3 rounded-lg border border-slate-200 dark:border-[#1e293b] text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">—</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Avg Return</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              { label: 'Lecturer', value: sim.createdBy?.name || sim.createdBy?.email || '—' },
              { label: 'Market', value: sim.market || '—' },
              { label: 'Initial Balance', value: sim.initialBalance ? `$${sim.initialBalance.toLocaleString()}` : '—' },
              { label: 'Start Date', value: sim.startDate ? new Date(sim.startDate).toLocaleDateString() : '—' },
              { label: 'End Date', value: sim.endDate ? new Date(sim.endDate).toLocaleDateString() : '—' },
              { label: 'Status', value: sim.status },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#1e293b] last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="text-sm text-slate-900 dark:text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-[#1e293b] flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-lg hover:bg-slate-200 dark:hover:bg-[#1e293b] transition-colors cursor-pointer">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export const AdminSimulations = () => {
  const [simulations, setSimulations] = useState<SimulationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [overviewSim, setOverviewSim] = useState<SimulationData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSimulations = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/simulations`, { credentials: 'include' });
        if (response.ok) setSimulations(await response.json());
        else setError('Unable to load simulations.');
      } catch (err) {
        console.error(err);
        setError('Unable to load simulations.');
      } finally {
        setLoading(false);
      }
    };
    fetchSimulations();
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Filtering
  let filtered = [...simulations];
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q));
  }
  if (statusFilter) {
    filtered = filtered.filter(s => {
      const st = s.status.toLowerCase();
      if (statusFilter === 'live') return st === 'active' || st === 'live';
      if (statusFilter === 'upcoming') return st === 'upcoming' || st === 'draft';
      if (statusFilter === 'completed') return st === 'completed';
      if (statusFilter === 'ended') return st === 'ended';
      return true;
    });
  }
  if (sortBy === 'newest') filtered.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  if (sortBy === 'oldest') filtered.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  if (sortBy === 'students') filtered.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));

  const liveCount = simulations.filter(s => ['active', 'live'].includes(s.status.toLowerCase())).length;
  const upcomingCount = simulations.filter(s => ['upcoming', 'draft'].includes(s.status.toLowerCase())).length;
  const completedCount = simulations.filter(s => ['completed', 'ended'].includes(s.status.toLowerCase())).length;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'live') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (s === 'upcoming' || s === 'draft') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    if (s === 'completed') return 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
    if (s === 'ended') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'Live';
    if (s === 'draft') return 'Upcoming';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (error && !loading && simulations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 dark:text-slate-400 gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 opacity-80" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to load simulations</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Simulation Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Monitor and manage trading simulations across the platform.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Simulations', value: simulations.length, color: 'blue' },
          { label: 'Live', value: liveCount, color: 'emerald' },
          { label: 'Upcoming', value: upcomingCount, color: 'blue' },
          { label: 'Completed', value: completedCount, color: 'slate' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-[#1e293b] shadow-sm dark:shadow-lg">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${
              card.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
              card.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              'text-slate-900 dark:text-white'
            }`}>
              {loading ? <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-[#1e293b] rounded animate-pulse"></span> : card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1e293b] shadow-sm dark:shadow-lg overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
                <option value="" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">All Status</option>
                <option value="live" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Live</option>
                <option value="upcoming" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Upcoming</option>
                <option value="completed" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Completed</option>
                <option value="ended" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Ended</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
                <option value="newest" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Newest</option>
                <option value="oldest" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Oldest</option>
                <option value="students" className="bg-white dark:bg-[#172033] text-slate-900 dark:text-white">Most Students</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-[#172033]/50 border-y border-slate-200 dark:border-[#1e293b] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Simulation</th>
                <th className="px-5 py-3.5 font-semibold">Lecturer</th>
                <th className="px-5 py-3.5 font-semibold">Market</th>
                <th className="px-5 py-3.5 font-semibold text-center">Students</th>
                <th className="px-5 py-3.5 font-semibold">Start Date</th>
                <th className="px-5 py-3.5 font-semibold">End Date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-6 bg-slate-100 dark:bg-[#1e293b] rounded animate-pulse"></div></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                      <Target className="w-10 h-10 opacity-20 mb-2" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">No simulations found</p>
                      <p className="text-sm">Simulations created by lecturers will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(sim => (
                  <tr key={sim._id} className="hover:bg-slate-50/60 dark:hover:bg-[#172033]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{sim.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{sim.createdBy?.name || sim.createdBy?.email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1e293b]">{sim.market || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{sim.participants?.length || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{sim.startDate ? new Date(sim.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{sim.endDate ? new Date(sim.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getStatusBadge(sim.status)}`}>
                        {getStatusLabel(sim.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="relative inline-block" ref={openMenuId === sim._id ? menuRef : null}>
                        <button onClick={() => setOpenMenuId(openMenuId === sim._id ? null : sim._id)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === sim._id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#172033] rounded-lg shadow-2xl border border-slate-200 dark:border-[#1e293b] overflow-hidden z-40">
                            <button onClick={() => { setOverviewSim(sim); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /> View Overview
                            </button>
                            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" /> View Leaderboard
                            </button>
                            <div className="border-t border-slate-100 dark:border-[#1e293b]">
                              <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer">
                                <ShieldOff className="w-4 h-4" /> Disable Simulation
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overview Modal */}
      {overviewSim && <SimulationOverviewModal sim={overviewSim} onClose={() => setOverviewSim(null)} />}
    </div>
  );
};
