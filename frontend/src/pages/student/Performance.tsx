import { TrendingUp, PieChart, BarChart } from 'lucide-react';

export const StudentPerformance = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Trading Performance</h1>
        <p className="text-[#787b86] mt-2 text-lg">Detailed analysis of your trading behavior and results across all simulations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <p className="text-sm font-medium text-[#787b86] uppercase tracking-wider mb-2">Total Portfolio Value</p>
          <h3 className="text-2xl font-bold text-white">108,520,000 ₫</h3>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <p className="text-sm font-medium text-[#787b86] uppercase tracking-wider mb-2">Total Return</p>
          <h3 className="text-2xl font-bold text-emerald-600">+8.52%</h3>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <p className="text-sm font-medium text-[#787b86] uppercase tracking-wider mb-2">Win Rate</p>
          <h3 className="text-2xl font-bold text-blue-600">65.2%</h3>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <p className="text-sm font-medium text-[#787b86] uppercase tracking-wider mb-2">Total Trades</p>
          <h3 className="text-2xl font-bold text-white">23</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-white">Portfolio Growth</h2>
            </div>
            <div className="flex-1 bg-[#131722] rounded-xl border border-[#2a2e39] flex items-center justify-center text-[#787b86]">
              [ Line Chart Visualization (e.g. Recharts) ]
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-white">Trading Statistics</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]">
                <span className="text-[#787b86]">Winning Trades</span>
                <span className="font-bold text-emerald-600">15</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]">
                <span className="text-[#787b86]">Losing Trades</span>
                <span className="font-bold text-red-600">8</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]">
                <span className="text-[#787b86]">Best Trade</span>
                <span className="font-bold text-emerald-600">+12.5% (FPT)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#787b86]">Worst Trade</span>
                <span className="font-bold text-red-600">-4.2% (VNM)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-white">Trading Behavior</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]">
                <span className="text-[#787b86]">Most Traded</span>
                <span className="font-bold text-white">FPT, HPG</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]">
                <span className="text-[#787b86]">Avg Holding</span>
                <span className="font-bold text-white">3.2 days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#787b86]">Risk Profile</span>
                <span className="font-bold text-amber-600">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
