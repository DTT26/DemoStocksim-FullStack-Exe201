import { Link, useParams } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, ChevronLeft } from 'lucide-react';

export const SimulationDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Link to="/simulations" className="inline-flex items-center text-sm font-medium text-[#787b86] hover:text-blue-600 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Simulations
      </Link>

      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-[#2a2e39] bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Vietnam Stock Challenge #01 {id ? `(${id})` : ''}</h1>
          <p className="text-[#787b86] mt-4 text-lg max-w-2xl">
            Compete with students across the university in a 3-month trading challenge using HOSE real market data.
            Focus on technical analysis and risk management.
          </p>
        </div>

        {/* Info Section */}
        <div className="p-8 border-b border-[#2a2e39]">
          <h3 className="text-sm font-bold text-[#787b86] uppercase tracking-wider mb-6">Simulation Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-[#787b86] mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Initial Capital</span>
              </div>
              <p className="text-xl font-bold text-white">100,000,000 VND</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#787b86] mb-2">
                <BarChart2 className="w-4 h-4" />
                <span className="text-sm font-medium">Market</span>
              </div>
              <p className="text-xl font-bold text-white">HOSE</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#787b86] mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-sm font-bold text-white">Jun 1, 2026</p>
              <p className="text-sm text-[#787b86]">to Sep 20, 2026</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#787b86] mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Participants</span>
              </div>
              <p className="text-xl font-bold text-white">42</p>
            </div>
          </div>
        </div>

        {/* My Performance Section (If joined) */}
        <div className="p-8 bg-blue-50/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#787b86] uppercase tracking-wider">My Performance</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1e222d] p-4 rounded-xl border border-[#2a2e39] shadow-sm">
              <p className="text-xs text-[#787b86] uppercase font-semibold mb-1">Portfolio Value</p>
              <p className="text-xl font-bold text-white">108.5M</p>
            </div>
            <div className="bg-[#1e222d] p-4 rounded-xl border border-[#2a2e39] shadow-sm">
              <p className="text-xs text-[#787b86] uppercase font-semibold mb-1">Return</p>
              <p className="text-xl font-bold text-emerald-600">+8.52%</p>
            </div>
            <div className="bg-[#1e222d] p-4 rounded-xl border border-[#2a2e39] shadow-sm">
              <p className="text-xs text-[#787b86] uppercase font-semibold mb-1">Ranking</p>
              <p className="text-xl font-bold text-blue-600">#7</p>
            </div>
            <div className="bg-[#1e222d] p-4 rounded-xl border border-[#2a2e39] shadow-sm">
              <p className="text-xs text-[#787b86] uppercase font-semibold mb-1">Total Trades</p>
              <p className="text-xl font-bold text-white">23</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to={`/trade/${id || 'sim-01'}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-sm shadow-blue-200 text-center">
              Continue Trading
            </Link>
            <Link to="/leaderboard" className="bg-[#1e222d] hover:bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] font-medium py-3 px-8 rounded-lg transition-colors text-center">
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
