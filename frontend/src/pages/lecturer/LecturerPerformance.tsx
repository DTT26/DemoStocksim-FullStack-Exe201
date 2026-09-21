import { BarChart3, TrendingUp, Users, Target, BookOpen, ChevronRight, Award, AlertCircle } from 'lucide-react';

export const LecturerPerformance = () => {
  // Mock data for performance analytics
  const kpis = [
    { label: 'Total Enrolled Students', value: '450', change: '+12%', positive: true },
    { label: 'Average Simulation Score', value: '86.4', change: '+3.2', positive: true },
    { label: 'Active Assignments', value: '12', change: '-2', positive: false },
    { label: 'Platform Engagement', value: '92%', change: '+5%', positive: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Teaching Analytics</h1>
        <p className="text-slate-400 mt-2 text-lg">Gain insights into your students' performance and engagement.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <p className="text-sm font-medium text-slate-400 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
              <span className={`text-sm font-bold flex items-center gap-1 ${kpi.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
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
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-slate-500 min-h-[300px]">
            {/* Placeholder for actual chart component */}
            <div className="w-full flex items-end justify-center gap-4 h-48 border-b border-[#253047] pb-4 mb-4 relative">
              <div className="w-16 bg-indigo-500/80 rounded-t-lg h-[60%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">60%</div>
              <div className="w-16 bg-emerald-500/80 rounded-t-lg h-[85%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">85%</div>
              <div className="w-16 bg-indigo-400/80 rounded-t-lg h-[75%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(129,140,248,0.3)]">75%</div>
              <div className="w-16 bg-purple-500/80 rounded-t-lg h-[90%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">90%</div>
              <div className="w-16 bg-rose-500/80 rounded-t-lg h-[40%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]">40%</div>
            </div>
            <div className="w-full flex justify-center gap-4 text-xs font-medium text-slate-400">
              <span className="w-16 text-center truncate">Basic TA</span>
              <span className="w-16 text-center truncate">VN30</span>
              <span className="w-16 text-center truncate">Options</span>
              <span className="w-16 text-center truncate">Crypto</span>
              <span className="w-16 text-center truncate">Forex</span>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg flex flex-col">
          <div className="p-5 border-b border-[#253047] bg-[#172033] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Needs Attention
            </h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-[#253047]">
              {[
                { name: 'John Doe', issue: 'Failed 3 consecutive assignments', severity: 'high' },
                { name: 'Jane Smith', issue: 'Inactive for 14 days', severity: 'medium' },
                { name: 'Basic TA Simulation', issue: 'Average score dropped by 15%', severity: 'medium' },
                { name: 'Risk Management', issue: '0 submissions near deadline', severity: 'high' },
              ].map((item, idx) => (
                <li key={idx} className="p-4 hover:bg-[#172033]/50 transition-colors cursor-pointer flex items-center justify-between group">
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
          </div>
          <div className="p-4 border-t border-[#253047] bg-[#172033]/50 mt-auto">
            <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors w-full text-center">
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
