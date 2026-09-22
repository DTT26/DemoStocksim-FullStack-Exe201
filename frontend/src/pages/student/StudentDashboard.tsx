import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Target, Activity, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_STUDENT_PORTFOLIO, MOCK_PERFORMANCE_HISTORY, MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const upcomingAssignments = MOCK_ASSIGNMENTS.filter(a => a.status === 'In Progress' || a.status === 'Not Started').slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Good afternoon, {user?.name || 'Student'}</h1>
        <p className="text-slate-400 mt-2 text-lg">Here's your trading overview and upcoming tasks.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#111827] p-6 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Portfolio Value</p>
          <h3 className="text-3xl font-bold text-white relative z-10">{MOCK_STUDENT_PORTFOLIO.totalValue.toLocaleString('vi-VN')} ₫</h3>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{MOCK_STUDENT_PORTFOLIO.totalReturn}%
            </span>
            <span className="text-xs text-slate-500">All time</span>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Win Rate</p>
          <h3 className="text-3xl font-bold text-white relative z-10">{MOCK_STUDENT_PORTFOLIO.winRate}%</h3>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-400">
              {MOCK_STUDENT_PORTFOLIO.winningTrades} wins / {MOCK_STUDENT_PORTFOLIO.totalTrades} total
            </span>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Avg. Profit / Loss</p>
          <h3 className="text-3xl font-bold text-white relative z-10">{MOCK_STUDENT_PORTFOLIO.profitFactor}x</h3>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-400">Profit Factor</span>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Active Tasks</p>
          <h3 className="text-3xl font-bold text-white relative z-10">{upcomingAssignments.length}</h3>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-400">Assignments pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Performance Chart */}
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Portfolio Performance</h2>
              <Link to="/student/performance" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Full Report <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PERFORMANCE_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#253047" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#253047', borderRadius: '0.5rem', color: '#fff' }}
                    itemStyle={{ color: '#6366F1' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Portfolio Value']}
                    labelFormatter={(label: any) => new Date(label).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Assignments */}
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Upcoming Assignments</h2>
              <Link to="/student/assignments" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingAssignments.map(assignment => (
                <Link key={assignment.id} to={`/student/assignments/${assignment.id}`} className="block group">
                  <div className="p-4 rounded-xl border border-[#253047] bg-[#172033] group-hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                        assignment.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {assignment.status}
                      </span>
                      <span className="flex items-center text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(assignment.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{assignment.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">{assignment.simulation}</p>
                    
                    {assignment.status === 'In Progress' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-[#253047] rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {upcomingAssignments.length === 0 && (
                <div className="text-center p-6 text-slate-500 text-sm">
                  No upcoming assignments!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
