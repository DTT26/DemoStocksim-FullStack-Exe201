import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const LecturerPerformance = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiUrl}/simulations/dashboard/stats`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch performance stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalStudents = stats?.totalEnrolledStudents ?? 0;
  const avgScore = stats?.avgScore ?? 0;
  const activeAssignments = stats?.activeAssignments ?? 0;
  const chartData = stats?.chartData || [];
  const needsAttention = stats?.needsAttention || [];

  const kpis = [
    { label: 'Total Enrolled Students', value: loading ? '...' : `${totalStudents}`, change: '+100%', positive: true, icon: Users },
    { label: 'Average Simulation Return', value: loading ? '...' : `${avgScore > 0 ? '+' : ''}${avgScore}%`, change: avgScore >= 0 ? '+Rate' : '-Rate', positive: avgScore >= 0, icon: Target },
    { label: 'Active Assignments', value: loading ? '...' : `${activeAssignments}`, change: 'Active', positive: true, icon: BookOpen },
    { label: 'Simulations Analyzed', value: loading ? '...' : `${chartData.length}`, change: 'Live', positive: true, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Teaching Analytics</h1>
        <p className="text-slate-400 mt-2 text-lg">Real-time performance analytics and student engagement metrics.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <p className="text-sm font-medium text-slate-400 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
              <span className={`text-sm font-bold flex items-center gap-1 ${kpi.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className={`w-4 h-4 ${!kpi.positive && 'rotate-180'}`} />
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Simulation */}
        <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg flex flex-col">
          <div className="p-5 border-b border-[#253047] bg-[#172033] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Class Performance by Simulation
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center min-h-[320px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading analytics...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-slate-500 text-sm">Chưa có dữ liệu mô phỏng.</div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#253047" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#253047', borderRadius: '0.5rem', color: '#fff' }}
                      formatter={(value: any) => [`${value}%`, 'Avg Return Rate']}
                      cursor={{ fill: '#172033' }}
                    />
                    <Bar dataKey="avgReturn" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.avgReturn >= 0 ? '#10B981' : '#F43F5E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg flex flex-col">
          <div className="p-5 border-b border-[#253047] bg-[#172033] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Needs Attention ({needsAttention.length})
            </h2>
          </div>
          <div className="p-0 flex-1">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading alerts...</div>
            ) : needsAttention.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">Tất cả sinh viên đang hoạt động bình thường và có lợi nhuận dương.</div>
            ) : (
              <ul className="divide-y divide-[#253047]">
                {needsAttention.map((item: any) => (
                  <li key={item.id} className="p-4 hover:bg-[#172033]/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${item.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'} shadow-[0_0_8px_currentColor]`} />
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                        <p className="text-sm text-slate-400">{item.issue}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
