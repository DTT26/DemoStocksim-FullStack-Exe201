import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, Target, Users, Calendar, ArrowUpDown, AlertTriangle, X, Eye, Trophy, ShieldOff } from 'lucide-react';

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#262626] flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{sim.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{sim.description || 'No description provided.'}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg flex-shrink-0 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-slate-50 dark:bg-[#121214] p-3 rounded-xl border border-slate-200 dark:border-[#262626] text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{participantCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Participants</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#121214] p-3 rounded-xl border border-slate-200 dark:border-[#262626] text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">—</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Total Trades</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#121214] p-3 rounded-xl border border-slate-200 dark:border-[#262626] text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">—</p>
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
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#262626]/50 last:border-0 text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="text-slate-900 dark:text-white font-medium truncate max-w-[60%] text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-[#262626] flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#262626] rounded-xl hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors cursor-pointer">Close</button>
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
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Simulation Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Monitor and manage trading simulations across the platform.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Simulations', value: simulations.length, color: 'blue' },
          { label: 'Live', value: liveCount, color: 'emerald' },
          { label: 'Upcoming', value: upcomingCount, color: 'blue' },
          { label: 'Completed', value: completedCount, color: 'slate' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#09090b] p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#262626] shadow-sm dark:shadow-lg">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${
              card.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
              card.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              'text-slate-900 dark:text-white'
            }`}>
              {loading ? <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-[#18181b] rounded animate-pulse"></span> : card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-sm dark:shadow-lg overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="col-span-1 flex items-center gap-1.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
                <option value="" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">All Status</option>
                <option value="live" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Live</option>
                <option value="upcoming" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Upcoming</option>
                <option value="completed" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Completed</option>
                <option value="ended" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Ended</option>
              </select>
            </div>
            <div className="col-span-1 flex items-center gap-1.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
                <option value="newest" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Newest</option>
                <option value="oldest" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Oldest</option>
                <option value="students" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Most Students</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- MOBILE CARDS VIEW (Visible only on < md screens) --- */}
        <div className="block md:hidden border-t border-slate-200 dark:border-[#262626]">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-[#121214] rounded-xl animate-pulse h-32" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center p-4">
              <Target className="w-10 h-10 opacity-20 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">No simulations found</p>
              <p className="text-xs text-slate-500 mt-1">Simulations created by lecturers will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#262626]">
              {filtered.map(sim => (
                <div key={sim._id} className="p-4 space-y-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Top Row: Simulation Icon + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{sim.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                          By: {sim.createdBy?.name || sim.createdBy?.email || '—'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border shrink-0 ${getStatusBadge(sim.status)}`}>
                      {getStatusLabel(sim.status)}
                    </span>
                  </div>

                  {/* Middle Row: Market & Students & Date details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-[#262626]/50">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 dark:text-slate-500">Market:</span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#262626]">
                        {sim.market || '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{sim.participants?.length || 0}</span>
                      <span className="text-slate-400 text-[11px]">students</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>
                        {sim.startDate ? new Date(sim.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                        {' → '}
                        {sim.endDate ? new Date(sim.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#262626]/50">
                    <button
                      onClick={() => setOverviewSim(sim)}
                      className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Overview
                    </button>
                    <div className="relative" ref={openMenuId === `mobile-${sim._id}` ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === `mobile-${sim._id}` ? null : `mobile-${sim._id}`)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-[#18181b] hover:bg-slate-200 dark:hover:bg-[#262626] rounded-xl transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === `mobile-${sim._id}` && (
                        <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-[#121214] rounded-xl shadow-2xl border border-slate-200 dark:border-[#262626] overflow-hidden z-40">
                          <button onClick={() => { setOverviewSim(sim); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> View Overview
                          </button>
                          <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> View Leaderboard
                          </button>
                          <div className="border-t border-slate-100 dark:border-[#262626]">
                            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer">
                              <ShieldOff className="w-3.5 h-3.5" /> Disable Simulation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- DESKTOP TABLE VIEW (Visible on >= md screens) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[850px] whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-[#121214] border-y border-slate-200 dark:border-[#262626] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
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
            <tbody className="divide-y divide-slate-100 dark:divide-[#262626]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-6 bg-slate-100 dark:bg-[#18181b] rounded animate-pulse"></div></td></tr>
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
                  <tr key={sim._id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{sim.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{sim.createdBy?.name || sim.createdBy?.email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#18181b] px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-[#262626]">{sim.market || '—'}</span>
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
                        <button onClick={() => setOpenMenuId(openMenuId === sim._id ? null : sim._id)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === sim._id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#121214] rounded-xl shadow-2xl border border-slate-200 dark:border-[#262626] overflow-hidden z-40 text-left">
                            <button onClick={() => { setOverviewSim(sim); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /> View Overview
                            </button>
                            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" /> View Leaderboard
                            </button>
                            <div className="border-t border-slate-100 dark:border-[#262626]">
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
