import { Users, GraduationCap, Shield, Target, ArrowRight, UserPlus, Play, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserData {
  _id: string;
  name?: string;
  email: string;
  picture?: string;
  role: string;
  status: string;
  createdAt?: string;
}

interface SimulationData {
  _id: string;
  name: string;
  status: string;
}

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [simulations, setSimulations] = useState<SimulationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const [usersRes, simsRes] = await Promise.all([
          fetch(`${apiUrl}/users`, { credentials: 'include' }),
          fetch(`${apiUrl}/simulations`, { credentials: 'include' }),
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (simsRes.ok) setSimulations(await simsRes.json());
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUsers = users.length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const lecturersCount = users.filter(u => u.role === 'lecturer').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  const liveCount = simulations.filter(s => s.status === 'active' || s.status === 'live').length;
  const upcomingCount = simulations.filter(s => s.status === 'upcoming' || s.status === 'draft').length;
  const completedCount = simulations.filter(s => s.status === 'completed' || s.status === 'ended').length;

  const recentUsers = [...users].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  }).slice(0, 5);

  // Mock activities — no backend endpoint
  const activities = [
    { icon: <UserPlus className="w-4 h-4 text-blue-400" />, text: 'New user registered', time: '2 minutes ago' },
    { icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, text: 'User role updated to Lecturer', time: '1 hour ago' },
    { icon: <Play className="w-4 h-4 text-emerald-400" />, text: 'Simulation started: VN30 Trading', time: '3 hours ago' },
    { icon: <CheckCircle className="w-4 h-4 text-slate-400" />, text: 'Simulation completed: US Market', time: 'Yesterday' },
    { icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, text: 'User account suspended', time: '2 days ago' },
  ];

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      student: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      lecturer: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return styles[role] || styles.student;
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 opacity-80" />
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  // SVG Donut chart helper
  const DonutSegment = ({ percent, offset, color }: { percent: number; offset: number; color: string }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeLen = (percent / 100) * circumference;
    const strokeOffset = circumference - (offset / 100) * circumference;
    return (
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={`${strokeLen} ${circumference - strokeLen}`}
        strokeDashoffset={-strokeOffset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    );
  };

  const roleData = totalUsers > 0 ? [
    { label: 'Students', count: studentsCount, pct: (studentsCount / totalUsers) * 100, color: '#3B82F6' },
    { label: 'Lecturers', count: lecturersCount, pct: (lecturersCount / totalUsers) * 100, color: '#A855F7' },
    { label: 'Admins', count: adminsCount, pct: (adminsCount / totalUsers) * 100, color: '#F59E0B' },
  ] : [];

  const simStatusData = simulations.length > 0 ? [
    { label: 'Live', count: liveCount, color: '#10B981' },
    { label: 'Upcoming', count: upcomingCount, color: '#3B82F6' },
    { label: 'Completed', count: completedCount, color: '#6B7280' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2 text-lg">
          Welcome back, <span className="text-blue-400 font-medium">{currentUser?.name || 'Admin'}</span>. Here's what's happening with StockSim.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: <Users className="w-6 h-6" />, color: 'blue', sub: `${users.filter(u => u.status === 'active' || u.status === 'ACTIVE').length} active` },
          { label: 'Students', value: studentsCount, icon: <GraduationCap className="w-6 h-6" />, color: 'blue', sub: null },
          { label: 'Lecturers', value: lecturersCount, icon: <Shield className="w-6 h-6" />, color: 'purple', sub: null },
          { label: 'Simulations', value: simulations.length, icon: <Target className="w-6 h-6" />, color: 'emerald', sub: liveCount > 0 ? `${liveCount} Live` : null },
        ].map((card, idx) => (
          <div key={idx} className="bg-[#111827] p-5 rounded-xl border border-[#1e293b] shadow-lg hover:border-blue-500/30 transition-colors group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${card.color}-500/5 rounded-bl-full group-hover:bg-${card.color}-500/10 transition-colors`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {loading ? <span className="inline-block w-10 h-8 bg-[#1e293b] rounded animate-pulse"></span> : card.value}
                </h3>
                {card.sub && !loading && (
                  <p className="text-xs text-slate-500 mt-1 font-medium">{card.sub}</p>
                )}
              </div>
              <div className={`p-2.5 bg-${card.color}-500/10 text-${card.color}-400 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Donut */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg p-6">
          <h2 className="text-lg font-bold text-white mb-6">Users by Role</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : totalUsers === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Users className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-sm">No users yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {roleData.reduce((acc: any[], seg, i) => {
                    const offset = acc.reduce((sum, s) => sum + s.pct, 0);
                    acc.push(seg);
                    return acc;
                  }, [] as any[]).length && roleData.map((seg, i) => {
                    const offset = roleData.slice(0, i).reduce((sum, s) => sum + s.pct, 0);
                    return <DonutSegment key={i} percent={seg.pct} offset={offset} color={seg.color} />;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{totalUsers}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Total</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {roleData.map((seg, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                      <span className="text-sm text-slate-300">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{seg.count}</span>
                      <span className="text-xs text-slate-500">({seg.pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simulation Status Bar Chart */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg p-6">
          <h2 className="text-lg font-bold text-white mb-6">Simulation Status</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : simulations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Target className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-sm">No simulations yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {simStatusData.map((item, i) => {
                const pct = simulations.length > 0 ? (item.count / simulations.length) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{item.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-[#1e293b] flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Simulations</span>
                <span className="text-lg font-bold text-white">{simulations.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Users + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#1e293b] flex justify-between items-center bg-[#172033]">
            <h2 className="text-lg font-bold text-white">Recent Users</h2>
            <Link to="/admin/users" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View All Users <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#172033]/50 border-b border-[#1e293b] text-slate-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4" colSpan={4}>
                        <div className="h-6 bg-[#1e293b] rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  recentUsers.map(u => (
                    <tr key={u._id} className="hover:bg-[#172033]/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt="" className="w-8 h-8 rounded-full border border-[#1e293b]" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                              {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white text-sm">{u.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          (u.status === 'active' || u.status === 'ACTIVE')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${(u.status === 'active' || u.status === 'ACTIVE') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400 text-xs font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg overflow-hidden">
          <div className="p-5 border-b border-[#1e293b] bg-[#172033]">
            <h2 className="text-lg font-bold text-white">Recent Activities</h2>
          </div>
          <div className="divide-y divide-[#1e293b]">
            {activities.map((act, i) => (
              <div key={i} className="p-4 flex items-start gap-3 hover:bg-[#172033]/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#172033] flex items-center justify-center flex-shrink-0 border border-[#1e293b] mt-0.5">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium">{act.text}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
