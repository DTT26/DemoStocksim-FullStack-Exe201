import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, Zap } from 'lucide-react';
import { MOCK_STUDENT_PORTFOLIO, MOCK_PERFORMANCE_HISTORY, MOCK_PERFORMANCE_BY_SYMBOL } from '../../data/mockStudentData';

export const StudentPerformance = () => {
  const [timeRange, setTimeRange] = useState('1M');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h1>
        <p className="text-slate-400 mt-2 text-lg">Deep dive into your trading statistics and behavioral patterns.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Total Return</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{MOCK_STUDENT_PORTFOLIO.totalReturn}%</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Win Rate</p>
          <h3 className="text-2xl font-bold text-white mt-1">{MOCK_STUDENT_PORTFOLIO.winRate}%</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Profit Factor</p>
          <h3 className="text-2xl font-bold text-white mt-1">{MOCK_STUDENT_PORTFOLIO.profitFactor}</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Best Trade</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{MOCK_STUDENT_PORTFOLIO.bestTrade.toLocaleString('vi-VN')}₫</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Worst Trade</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1">{MOCK_STUDENT_PORTFOLIO.worstTrade.toLocaleString('vi-VN')}₫</h3>
        </div>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-white">Equity Curve</h2>
          <div className="flex bg-[#172033] rounded-lg p-1 border border-[#253047]">
            {['1W', '1M', '3M', '6M', 'YTD', 'ALL'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_PERFORMANCE_HISTORY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValuePerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#253047" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#253047', borderRadius: '0.5rem', color: '#fff' }}
                itemStyle={{ color: '#10B981' }}
                formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Portfolio Value']}
                labelFormatter={(label: any) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValuePerf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Performance by Symbol</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PERFORMANCE_BY_SYMBOL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253047" vertical={false} />
                <XAxis dataKey="symbol" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#253047', borderRadius: '0.5rem', color: '#fff' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Net P&L']}
                  cursor={{ fill: '#172033' }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {
                    MOCK_PERFORMANCE_BY_SYMBOL.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#F43F5E'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Trading Behavior</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-[#172033] rounded-xl border border-[#253047]">
              <div className="p-3 bg-indigo-500/10 rounded-lg shrink-0">
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Most Traded Symbol</p>
                <p className="text-lg font-bold text-white">{MOCK_STUDENT_PORTFOLIO.mostTradedSymbol}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-[#172033] rounded-xl border border-[#253047]">
              <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Average Position Size</p>
                <p className="text-lg font-bold text-white">{MOCK_STUDENT_PORTFOLIO.averagePositionSize.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#172033] rounded-xl border border-[#253047]">
              <div className="p-3 bg-amber-500/10 rounded-lg shrink-0">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Most Active Trading Period</p>
                <p className="text-lg font-bold text-white">{MOCK_STUDENT_PORTFOLIO.mostActiveTradingPeriod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
