import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Search, 
  Calendar, 
  Globe, 
  ArrowRight, 
  Layers, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ParticipantPreview {
  _id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
}

interface SimulationCardData {
  _id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'ENDED';
  market: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  totalParticipants: number;
  activeParticipants: number;
  pendingParticipants: number;
  participants: ParticipantPreview[];
}

interface OverviewResponse {
  summary: {
    totalStudents: number;
    activeStudents: number;
    pendingRequests: number;
  };
  simulations: SimulationCardData[];
}

export const LecturerStudents = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationFilter, setSimulationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/simulations/students/overview`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load student management overview');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching student overview:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            PUBLISHED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            DRAFT
          </span>
        );
      case 'ENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
            COMPLETED
          </span>
        );
    }
  };

  // Filter logic
  const simulations = data?.simulations || [];

  const filteredSimulations = simulations.filter(sim => {
    // 1. Simulation dropdown filter
    if (simulationFilter !== 'ALL' && sim._id !== simulationFilter) {
      return false;
    }

    // 2. Status dropdown filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'COMPLETED' && sim.status !== 'ENDED') return false;
      if (statusFilter !== 'COMPLETED' && sim.status !== statusFilter) return false;
    }

    // 3. Search query: student name, student email, or simulation name
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const simNameMatches = sim.name.toLowerCase().includes(q);
      const studentMatches = sim.participants.some(
        p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
      if (!simNameMatches && !studentMatches) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-[#253047] pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>Simulation-Based Learning</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Students</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
            Manage students across your simulations.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="bg-white dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#253047] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#253047] font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Students */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-14 h-14 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Total Students
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? '—' : data?.summary.totalStudents ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Unique enrolled students across all your simulations
          </p>
        </div>

        {/* Active Students */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserCheck className="w-14 h-14 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Students
          </div>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {loading ? '—' : data?.summary.activeStudents ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Active participants currently trading in simulations
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-14 h-14 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Requests
          </div>
          <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {loading ? '—' : data?.summary.pendingRequests ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Students waiting for approval to join simulations
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-md flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          {/* Simulation filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={simulationFilter}
              onChange={(e) => setSimulationFilter(e.target.value)}
              className="w-full sm:w-48 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-sm text-slate-800 dark:text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Simulations</option>
              {simulations.map(sim => (
                <option key={sim._id} value={sim._id}>
                  {sim.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-sm text-slate-800 dark:text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Your Simulations Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Your Simulations</span>
            <span className="text-xs bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
              {filteredSimulations.length}
            </span>
          </h2>
          {searchQuery && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20">
              Showing simulations matching "{searchQuery}"
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-6 bg-slate-100 dark:bg-[#172033] rounded w-2/3"></div>
                  <div className="h-6 bg-slate-100 dark:bg-[#172033] rounded w-16"></div>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-[#172033] rounded w-1/2"></div>
                <div className="h-16 bg-slate-100 dark:bg-[#172033] rounded"></div>
                <div className="h-10 bg-slate-100 dark:bg-[#172033] rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-rose-300 dark:border-rose-500/30 p-8 text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-slate-900 dark:text-white font-semibold">Error loading simulations</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={fetchOverview}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredSimulations.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-sm">
            <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Simulations Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery || simulationFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No simulations matched your filter criteria. Try resetting your search or filters.'
                : 'You have not created any simulations yet. Go to Simulations to create your first trading simulation.'}
            </p>
            {(searchQuery || simulationFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSimulationFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((sim) => {
              // Check if students in this simulation match search
              const matchingStudents = searchQuery.trim() !== ''
                ? sim.participants.filter(
                    p => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                         p.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
                  )
                : [];

              return (
                <div
                  key={sim._id}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] hover:border-indigo-500/50 p-6 flex flex-col justify-between shadow-sm dark:shadow-lg transition-all duration-300 hover:shadow-indigo-500/10 group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Name + Status */}
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {sim.name}
                      </h3>
                      <div>{getStatusBadge(sim.status)}</div>
                    </div>

                    {/* Metadata: Market + Dates */}
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Market:</span>
                        <span>{sim.market || 'VN'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          {formatDate(sim.startDate)} – {formatDate(sim.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Participant Counters Section */}
                    <div className="bg-slate-50 dark:bg-[#172033]/80 rounded-xl p-3 border border-slate-200 dark:border-[#253047] grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Students</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{sim.totalParticipants}</p>
                      </div>
                      <div className="border-x border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{sim.activeParticipants}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{sim.pendingParticipants}</p>
                      </div>
                    </div>

                    {/* If search matched students in this simulation, display chips */}
                    {matchingStudents.length > 0 && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-2.5 space-y-1">
                        <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{matchingStudents.length} student{matchingStudents.length > 1 ? 's' : ''} matched:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {matchingStudents.slice(0, 3).map((st) => (
                            <span
                              key={st._id}
                              className="text-[11px] bg-white dark:bg-[#172033] text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-[#253047]"
                            >
                              {st.name}
                            </span>
                          ))}
                          {matchingStudents.length > 3 && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 py-0.5 px-1">
                              +{matchingStudents.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button: View Students */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-[#253047]/60">
                    <button
                      onClick={() => navigate(`/lecturer/simulations/${sim._id}/students`)}
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-[#172033] hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-800 dark:text-white hover:text-white font-medium text-sm rounded-xl border border-slate-200 dark:border-[#253047] hover:border-indigo-600 transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shadow-sm"
                    >
                      <span>View Students</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
