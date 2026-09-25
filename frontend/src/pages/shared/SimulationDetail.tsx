import { Link, useParams } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, ChevronLeft } from 'lucide-react';

export const SimulationDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Link to="/student/simulations" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Simulations
      </Link>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-200 dark:border-[#253047] bg-slate-50/50 dark:bg-[#172033]/50">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vietnam Stock Challenge #01 {id ? `(${id})` : ''}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg max-w-2xl">
            Compete with students across the university in a 3-month trading challenge using HOSE real market data.
            Focus on technical analysis and risk management.
          </p>
        </div>

        {/* Info Section */}
        <div className="p-8 border-b border-slate-200 dark:border-[#253047]">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Simulation Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Initial Capital</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">100,000,000 VND</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                <BarChart2 className="w-4 h-4" />
                <span className="text-sm font-medium">Market</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">HOSE</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Jun 1, 2026</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">to Sep 20, 2026</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Participants</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">42</p>
            </div>
          </div>
        </div>

        {/* My Performance Section (If joined) */}
        <div className="p-8 bg-slate-50/50 dark:bg-[#172033]/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Performance</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Portfolio Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">108.5M</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Return</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">+8.52%</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Ranking</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">#7</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#253047] shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Total Trades</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">23</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to={`/trade/${id || 'sim-01'}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-sm text-center">
              Continue Trading
            </Link>
            <Link to="/student/journal" className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-medium py-3 px-8 rounded-lg transition-colors text-center shadow-sm">
              View Journal
            </Link>
            <Link to="/leaderboard" className="bg-white hover:bg-slate-100 dark:bg-[#111827] dark:hover:bg-[#172033] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#253047] font-medium py-3 px-8 rounded-lg transition-colors text-center shadow-sm">
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
