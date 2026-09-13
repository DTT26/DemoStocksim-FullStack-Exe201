import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Award, Activity, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Good afternoon, {user?.name || 'Student'}</h1>
        <p className="text-[#787b86] mt-2 text-lg">Track your trading practice, simulations and learning progress.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#787b86]">Portfolio Value</p>
              <h3 className="text-2xl font-bold text-white mt-1">108.5M ₫</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#787b86]">Total Return</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">+8.52%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#787b86]">Current Ranking</p>
              <h3 className="text-2xl font-bold text-white mt-1">#7 <span className="text-lg font-normal text-[#787b86]">/ 42</span></h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#787b86]">Active Simulations</p>
              <h3 className="text-2xl font-bold text-white mt-1">2</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Simulation */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Active Simulation</h2>
            </div>
            <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live
                    </span>
                    <span className="text-sm text-[#787b86] font-medium">Started Sep 12, 2026</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Vietnam Stock Challenge #01</h3>
                  <p className="text-[#787b86] mt-2 max-w-lg">
                    Practice trading with 100M VND starting capital on the HOSE market. Complete assignments and compete for the highest return.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 p-6 bg-[#131722] rounded-xl border border-[#2a2e39]">
                <div>
                  <p className="text-sm text-[#787b86] mb-1">Participants</p>
                  <p className="text-lg font-bold text-white">42</p>
                </div>
                <div>
                  <p className="text-sm text-[#787b86] mb-1">Your Rank</p>
                  <p className="text-lg font-bold text-blue-600">#7</p>
                </div>
                <div>
                  <p className="text-sm text-[#787b86] mb-1">Return</p>
                  <p className="text-lg font-bold text-emerald-600">+8.52%</p>
                </div>
                <div>
                  <p className="text-sm text-[#787b86] mb-1">Sim Time</p>
                  <p className="text-sm font-semibold text-[#d1d4dc] mt-1">14:30<br/>12/09/2026</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link to="/trade/sim-01" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm shadow-blue-200">
                  Continue Trading
                </Link>
                <Link to="/leaderboard" className="bg-[#1e222d] hover:bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] font-medium py-2.5 px-6 rounded-lg transition-colors">
                  View Leaderboard
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Assignments */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Assignments</h2>
            </div>
            <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6">
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md mb-2 inline-block">In Progress</span>
                  <h4 className="font-bold text-white">Technical Analysis: FPT</h4>
                  <p className="text-sm text-[#787b86] mt-1">Vietnam Stock Challenge #01</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-[#787b86]">Due: Sep 15, 2026</span>
                    <Link to="/student/assignments" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View →</Link>
                  </div>
                </div>
                <div className="border-l-4 border-[#2a2e39] pl-4">
                  <span className="text-xs font-semibold text-[#787b86] bg-[#2a2e39] px-2 py-1 rounded-md mb-2 inline-block">Not Started</span>
                  <h4 className="font-bold text-white">Value Investing Portfolio</h4>
                  <p className="text-sm text-[#787b86] mt-1">Advanced Trading #02</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-[#787b86]">Due: Sep 20, 2026</span>
                    <Link to="/student/assignments" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View →</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Overview */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Performance Overview</h2>
            </div>
            <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-[#787b86] mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white">65.2%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#787b86] mb-1">Total Trades</p>
                  <p className="text-xl font-bold text-[#d1d4dc]">23</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#787b86]">Winning Trades</span>
                  <span className="font-medium text-emerald-600">15</span>
                </div>
                <div className="w-full bg-[#2a2e39] rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-[#787b86]">Losing Trades</span>
                  <span className="font-medium text-red-600">8</span>
                </div>
                <div className="w-full bg-[#2a2e39] rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#2a2e39]">
                <Link to="/student/performance" className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View Full Performance
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
