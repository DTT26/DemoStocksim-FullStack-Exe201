import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, Target, Activity, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_STUDENT_PORTFOLIO, MOCK_PERFORMANCE_HISTORY, MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const upcomingAssignments = MOCK_ASSIGNMENTS.filter(a => a.status === 'In Progress' || a.status === 'Not Started').slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Good afternoon, {user?.name || 'Student'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">
          Here's your trading overview and upcoming tasks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-6">
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-500" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Portfolio Value</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white relative z-10 break-words">
            ${MOCK_STUDENT_PORTFOLIO.totalValue.toLocaleString('en-US')}
          </h3>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-0.5 sm:py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{MOCK_STUDENT_PORTFOLIO.totalReturn}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">All time</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Win Rate</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white relative z-10">
            {MOCK_STUDENT_PORTFOLIO.winRate}%
          </h3>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {MOCK_STUDENT_PORTFOLIO.winningTrades} wins / {MOCK_STUDENT_PORTFOLIO.totalTrades} total
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-500" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Avg. Profit / Loss</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white relative z-10">
            {MOCK_STUDENT_PORTFOLIO.profitFactor}x
          </h3>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400">Profit Factor</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 relative z-10">Active Tasks</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white relative z-10">
            {upcomingAssignments.length}
          </h3>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400">Assignments pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* Active Simulation */}
          <section>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Active Simulation</h2>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm p-4 sm:p-6 overflow-hidden relative transition-colors">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-[#787b86] font-medium">Started Sep 12, 2026</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Trading Challenge #01</h3>
                  <p className="text-slate-600 dark:text-[#787b86] mt-2 max-w-lg text-xs sm:text-sm leading-relaxed">
                    Luyện tập giao dịch mô phỏng thời gian thực, hoàn thành các bài tập của giảng viên và cạnh tranh bảng xếp hạng hiệu suất.
                  </p>
                </div>
                <div className="pt-2 sm:pt-0 shrink-0">
                  <Link 
                    to="/trade/fpt" 
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    Trade Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg p-4 sm:p-6 transition-colors min-w-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Portfolio Performance</h2>
              <Link to="/student/journal" className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Trading Journal <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="h-[220px] sm:h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PERFORMANCE_HISTORY} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#253047' : '#f1f5f9'} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : (val / 1000).toFixed(0) + 'k'}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#111827' : '#ffffff', 
                      borderColor: isDark ? '#253047' : '#e2e8f0', 
                      borderRadius: '0.5rem', 
                      color: isDark ? '#fff' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#6366F1' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString('en-US')}`, 'Portfolio Value']}
                    labelFormatter={(label: any) => new Date(label).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 min-w-0">
          {/* Assignments */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg p-4 sm:p-6 transition-colors">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Upcoming Assignments</h2>
              <Link to="/student/assignments" className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {upcomingAssignments.map(assignment => (
                <Link key={assignment.id} to={`/student/assignments/${assignment.id}`} className="block group">
                  <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#253047] bg-slate-50 dark:bg-[#172033] group-hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        assignment.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20' : 
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {assignment.status}
                      </span>
                      <span className="flex items-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        {new Date(assignment.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{assignment.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{assignment.simulation}</p>
                    
                    {assignment.status === 'In Progress' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">Progress</span>
                          <span className="text-slate-900 dark:text-white font-medium">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#253047] rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${assignment.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {upcomingAssignments.length === 0 && (
                <div className="text-center p-6 text-slate-400 dark:text-slate-500 text-sm">
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
