import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Check, 
  X, 
  ChevronRight, 
  Globe, 
  BookOpen, 
  Activity, 
  Wallet, 
  TrendingUp, 
  ExternalLink,
  Shield,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ParticipantUser {
  _id: string;
  name?: string;
  email: string;
  picture?: string;
  status?: string;
}

interface Participant {
  _id: string;
  simulationId: string;
  userId: ParticipantUser;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'DISQUALIFIED' | 'LEFT';
  joinedAt?: string;
  initialBalance: number;
  currentBalance: number;
  portfolioValue: number;
  totalProfit: number;
  returnRate: number;
  ordersCount?: number;
  assignmentStats?: {
    submitted: number;
    total: number;
    graded: number;
    pending: number;
  };
  createdAt?: string;
}

interface SimulationDetails {
  _id: string;
  name: string;
  market?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  initialBalance?: number;
}

interface StudentPerformanceData {
  student: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
    participantStatus: string;
  };
  simulation: {
    _id: string;
    name: string;
    market: string;
    joinedAt?: string;
    status: string;
  };
  tradingActivity: {
    totalOrders: number;
    totalFilledOrders: number;
    currentBalance: number;
    portfolioValue: number;
    totalProfit: number;
    returnRate: number;
  };
  assignmentProgress: {
    assigned: number;
    submitted: number;
    graded: number;
    pending: number;
    assignments: {
      _id: string;
      title: string;
      symbol?: string;
      deadline?: string;
      status: string;
      score?: number | null;
      submittedAt?: string | null;
    }[];
  };
  recentTrades: {
    id: string;
    time: string;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    pnl: number;
    status: string;
  }[];
}

export const LecturerSimulationStudents = () => {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();

  const [simulation, setSimulation] = useState<SimulationDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED'>('ALL');

  // Performance Drawer / Modal
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [performanceData, setPerformanceData] = useState<StudentPerformanceData | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [perfError, setPerfError] = useState<string | null>(null);

  // Approve / Reject loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const fetchData = async () => {
    if (!simulationId) return;
    try {
      setLoading(true);
      setError(null);

      const [simRes, partRes] = await Promise.all([
        fetch(`${apiUrl}/simulations/${simulationId}`, { credentials: 'include' }),
        fetch(`${apiUrl}/simulations/${simulationId}/participants`, { credentials: 'include' })
      ]);

      if (simRes.ok) {
        setSimulation(await simRes.json());
      } else {
        throw new Error('Simulation not found');
      }

      if (partRes.ok) {
        const parts = await partRes.json();
        setParticipants(Array.isArray(parts) ? parts : []);
      }
    } catch (err: any) {
      console.error('Error fetching simulation participants:', err);
      setError(err.message || 'Error loading participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [simulationId]);

  // Fetch performance details when a participant is selected
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!selectedParticipant || !simulationId) return;
      try {
        setLoadingPerformance(true);
        setPerfError(null);
        const res = await fetch(
          `${apiUrl}/simulations/${simulationId}/participants/${selectedParticipant._id}/performance`,
          { credentials: 'include' }
        );

        if (!res.ok) {
          throw new Error('Failed to load performance details');
        }

        const data = await res.json();
        setPerformanceData(data);
      } catch (err: any) {
        console.error('Error loading student performance:', err);
        setPerfError(err.message || 'Failed to load details');
      } finally {
        setLoadingPerformance(false);
      }
    };

    if (selectedParticipant) {
      fetchPerformance();
    } else {
      setPerformanceData(null);
    }
  }, [selectedParticipant, simulationId]);

  // Handle participant approval
  const handleApprove = async (participantId: string) => {
    try {
      setActionLoadingId(participantId);
      const res = await fetch(
        `${apiUrl}/simulations/${simulationId}/participants/${participantId}/approve`,
        {
          method: 'PATCH',
          credentials: 'include'
        }
      );

      if (res.ok) {
        setParticipants((prev) =>
          prev.map((p) => (p._id === participantId ? { ...p, status: 'ACTIVE' } : p))
        );
      } else {
        const errJson = await res.json();
        alert(errJson.message || 'Failed to approve student');
      }
    } catch (err) {
      console.error('Error approving participant:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle participant rejection
  const handleReject = async (participantId: string) => {
    if (!window.confirm('Are you sure you want to reject this participant request?')) return;
    try {
      setActionLoadingId(participantId);
      const res = await fetch(
        `${apiUrl}/simulations/${simulationId}/participants/${participantId}/reject`,
        {
          method: 'PATCH',
          credentials: 'include'
        }
      );

      if (res.ok) {
        setParticipants((prev) =>
          prev.map((p) => (p._id === participantId ? { ...p, status: 'REJECTED' } : p))
        );
      } else {
        const errJson = await res.json();
        alert(errJson.message || 'Failed to reject student');
      }
    } catch (err) {
      console.error('Error rejecting participant:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Currency & Return formatting
  const formatVND = (val: number | null | undefined, showSign = false) => {
    if (val === null || val === undefined) return '—';
    const absStr = Math.abs(Math.round(val)).toLocaleString('vi-VN') + ' ₫';
    if (showSign) {
      if (val > 0) return `+${absStr}`;
      if (val < 0) return `-${absStr}`;
    }
    return val < 0 ? `-${absStr}` : absStr;
  };

  const formatReturn = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // KPIs
  const totalParticipants = participants.length;
  const activeParticipants = participants.filter((p) => p.status === 'ACTIVE').length;
  const pendingParticipants = participants.filter((p) => p.status === 'PENDING').length;
  const activeReturns = participants
    .filter((p) => p.status === 'ACTIVE' && typeof p.returnRate === 'number')
    .map((p) => p.returnRate);
  const avgReturn = activeReturns.length > 0
    ? activeReturns.reduce((acc, curr) => acc + curr, 0) / activeReturns.length
    : 0;

  // Filtered participants
  const filteredParticipants = participants.filter((p) => {
    // Status filter
    if (statusFilter !== 'ALL' && p.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const name = p.userId?.name?.toLowerCase() || '';
      const email = p.userId?.email?.toLowerCase() || '';
      if (!name.includes(q) && !email.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link 
          to="/lecturer/students" 
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>All Simulations</span>
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
          {simulation?.name || 'Simulation'}
        </span>
        <span>/</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Participants</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-[#253047] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {simulation?.name || 'Simulation Students'}
            </h1>
            {simulation && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                simulation.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
              }`}>
                {simulation.status}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage students participating in this simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-white dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#253047] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#253047] font-medium py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Small Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Participants */}
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Total Participants
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {loading ? '—' : totalParticipants}
          </h3>
        </div>

        {/* Active */}
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Active
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {loading ? '—' : activeParticipants}
          </h3>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            Pending
          </p>
          <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {loading ? '—' : pendingParticipants}
          </h3>
        </div>

        {/* Avg Return */}
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Avg Return
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${
            avgReturn > 0 ? 'text-emerald-600 dark:text-emerald-400' : avgReturn < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {loading ? '—' : formatReturn(avgReturn)}
          </h3>
        </div>
      </div>

      {/* Table Controls (Search + Status Filter) */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-md flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] text-sm text-slate-800 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Participant Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#172033]/70 border-b border-slate-200 dark:border-[#253047] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Orders</th>
                <th className="px-5 py-4 text-right">Portfolio Value</th>
                <th className="px-5 py-4 text-right">P&L</th>
                <th className="px-4 py-4 text-right">Return</th>
                <th className="px-5 py-4 text-center">Assignments</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#253047]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p>Loading participants...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                      <p className="text-slate-900 dark:text-white font-medium">{error}</p>
                      <button
                        onClick={fetchData}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 opacity-20 mb-2" />
                      <p className="text-slate-900 dark:text-white font-medium">No students found.</p>
                      {searchQuery && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Try adjusting your search query or status filter.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => {
                  const isPending = participant.status === 'PENDING';
                  const isActionLoading = actionLoadingId === participant._id;
                  const name = participant.userId?.name || 'Student';
                  const email = participant.userId?.email || '—';
                  const initialChar = name.charAt(0).toUpperCase();

                  const pnl = participant.totalProfit;
                  const returnRate = participant.returnRate;

                  return (
                    <tr
                      key={participant._id}
                      className="hover:bg-slate-50 dark:hover:bg-[#172033]/60 transition-colors group"
                    >
                      {/* Student Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                            {initialChar}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block truncate">
                              {name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          participant.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : participant.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {participant.status === 'ACTIVE' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          )}
                          {participant.status}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        {isPending ? '—' : `${participant.ordersCount ?? 0} Orders`}
                      </td>

                      {/* Portfolio Value */}
                      <td className="px-5 py-4 text-right font-medium text-slate-900 dark:text-white">
                        {isPending ? '—' : formatVND(participant.portfolioValue)}
                      </td>

                      {/* P&L */}
                      <td className={`px-5 py-4 text-right font-semibold ${
                        isPending
                          ? 'text-slate-400'
                          : pnl > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : pnl < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {isPending ? '—' : formatVND(pnl, true)}
                      </td>

                      {/* Return % */}
                      <td className={`px-4 py-4 text-right font-semibold ${
                        isPending
                          ? 'text-slate-400'
                          : returnRate > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : returnRate < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {isPending ? '—' : formatReturn(returnRate)}
                      </td>

                      {/* Assignments */}
                      <td className="px-5 py-4 text-center text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {isPending ? (
                          '—'
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-[#172033] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#253047]">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                            <span>
                              {participant.assignmentStats?.submitted ?? 0} / {participant.assignmentStats?.total ?? 0} Submitted
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(participant._id)}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-600/20 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                              title="Approve participant"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(participant._id)}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-600/20 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                              title="Reject participant"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => setSelectedParticipant(participant)}
                              className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium"
                              title="View details"
                            >
                              View →
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedParticipant(participant)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-[#172033] hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-[#253047] hover:border-indigo-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Modal / Drawer: Student Performance */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111827] min-h-screen border-l border-slate-200 dark:border-[#253047] shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            
            {/* Modal Header */}
            <div>
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-[#253047] pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Contextual Performance
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Student Performance</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Performance strictly within simulation: <span className="text-slate-800 dark:text-slate-200 font-medium">{simulation?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingPerformance ? (
                <div className="py-24 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading student performance data...</p>
                </div>
              ) : perfError ? (
                <div className="py-16 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-slate-900 dark:text-white font-medium">{perfError}</p>
                </div>
              ) : performanceData ? (
                <div className="space-y-6 mt-6">
                  {/* Student & Simulation Profile Header */}
                  <div className="bg-slate-50 dark:bg-[#172033] rounded-2xl p-4 border border-slate-200 dark:border-[#253047] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shadow-sm">
                        {performanceData.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {performanceData.student.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            performanceData.student.participantStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {performanceData.student.participantStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {performanceData.student.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs space-y-1 text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Market: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{performanceData.simulation.market}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Joined: </span>
                        <span className="text-slate-700 dark:text-slate-300">{formatDate(performanceData.simulation.joinedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trading Activity KPIs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Trading Activity
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Filled Orders</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {performanceData.tradingActivity.totalFilledOrders} orders
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Current Balance</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {formatVND(performanceData.tradingActivity.currentBalance)}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Portfolio Value</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {formatVND(performanceData.tradingActivity.portfolioValue)}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total P&L</p>
                        <p className={`text-base font-bold mt-0.5 ${
                          performanceData.tradingActivity.totalProfit > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : performanceData.tradingActivity.totalProfit < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {formatVND(performanceData.tradingActivity.totalProfit, true)}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Return Rate</p>
                        <p className={`text-base font-bold mt-0.5 ${
                          performanceData.tradingActivity.returnRate > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : performanceData.tradingActivity.returnRate < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {formatReturn(performanceData.tradingActivity.returnRate)}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#172033]/70 p-3 rounded-xl border border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Status</p>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {performanceData.student.participantStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Progress */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Assignment Progress
                    </h4>
                    <div className="bg-slate-50 dark:bg-[#172033]/70 rounded-xl p-3 border border-slate-200 dark:border-[#253047] grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Assigned</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {performanceData.assignmentProgress.assigned}
                        </p>
                      </div>
                      <div className="border-x border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Submitted</p>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {performanceData.assignmentProgress.submitted}
                        </p>
                      </div>
                      <div className="border-r border-slate-200 dark:border-[#253047]">
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400">Graded</p>
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {performanceData.assignmentProgress.graded}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">Pending</p>
                        <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          {performanceData.assignmentProgress.pending}
                        </p>
                      </div>
                    </div>

                    {/* Mini Assignment list */}
                    {performanceData.assignmentProgress.assignments.length > 0 && (
                      <div className="bg-slate-50/60 dark:bg-[#172033]/40 rounded-xl border border-slate-200 dark:border-[#253047] p-2 divide-y divide-slate-200 dark:divide-[#253047]/60 text-xs">
                        {performanceData.assignmentProgress.assignments.map((asg) => (
                          <div key={asg._id} className="py-2 px-2 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{asg.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Target: {asg.symbol || 'VN Stocks'} • Deadline: {formatDate(asg.deadline)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                asg.status === 'GRADED'
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                                  : asg.status === 'SUBMITTED'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : 'bg-slate-200 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400'
                              }`}>
                                {asg.status === 'GRADED' ? `Graded: ${asg.score} pts` : asg.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Trading Activity */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Recent Trading Activity
                    </h4>
                    <div className="bg-slate-50 dark:bg-[#172033]/70 rounded-xl border border-slate-200 dark:border-[#253047] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#253047]">
                            <tr>
                              <th className="px-3 py-2.5">Time</th>
                              <th className="px-3 py-2.5">Symbol</th>
                              <th className="px-3 py-2.5 text-center">Side</th>
                              <th className="px-3 py-2.5 text-right">Quantity</th>
                              <th className="px-3 py-2.5 text-right">Price</th>
                              <th className="px-3 py-2.5 text-right">P&L</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-[#253047]">
                            {performanceData.recentTrades.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                  No trading activity recorded yet for this student.
                                </td>
                              </tr>
                            ) : (
                              performanceData.recentTrades.map((tr) => {
                                const isBuy = tr.side === 'BUY' || tr.side === 'LONG';
                                return (
                                  <tr key={tr.id} className="hover:bg-slate-100/60 dark:hover:bg-[#111827]/40">
                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                      {formatDate(tr.time)} {formatTime(tr.time)}
                                    </td>
                                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                                      {tr.symbol}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isBuy
                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                      }`}>
                                        {tr.side}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-200">
                                      {tr.quantity.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-200">
                                      {formatVND(tr.price)}
                                    </td>
                                    <td className={`px-3 py-2 text-right font-semibold ${
                                      tr.pnl > 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : tr.pnl < 0
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                      {tr.pnl !== 0 ? formatVND(tr.pnl, true) : '—'}
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

                  {/* Navigation Links */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/lecturer/assignments')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Submissions</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/trade/fpt`)}
                      className="px-4 py-2 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#253047] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#253047] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>View Trading History</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Read-only monitoring notice */}
            <div className="border-t border-slate-200 dark:border-[#253047] pt-4 text-xs text-slate-500 dark:text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
              <span>
                Lecturer Monitoring Mode: Student learning and trading performance monitoring only. Account credentials and user records are managed by Administrator.
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
