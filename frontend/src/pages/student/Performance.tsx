import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Target, Activity, Zap } from 'lucide-react';
import { tradingApi } from '../../services/tradingApi';
import { useAuth } from '../../contexts/AuthContext';

export const StudentPerformance = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReturn: 0,
    totalPnL: 0,
    winRate: 0,
    profitFactor: '1.0',
    bestTrade: 0,
    worstTrade: 0,
    mostTradedSymbol: 'FPT',
    avgPositionSize: 0,
    bySymbol: [] as { symbol: string; pnl: number }[],
    equityCurve: [] as { date: string; value: number }[]
  });

  useEffect(() => {
    const fetchRealPerformance = async () => {
      try {
        const [txRes, pfRes] = await Promise.all([
          tradingApi.getTransactions(user?._id),
          tradingApi.getPortfolio(user?._id)
        ]);

        let transactions: any[] = [];
        if (txRes.success && Array.isArray(txRes.data)) {
          transactions = txRes.data;
        }

        let currentBalance = 100_000_000;
        if (pfRes.success && pfRes.data?.wallet) {
          currentBalance = pfRes.data.wallet.balance;
        }

        // Parse closed trade transactions
        const trades: { symbol: string; pnl: number; timestamp: Date }[] = [];
        const symbolCounts: Record<string, number> = {};
        const symbolPnL: Record<string, number> = {};

        transactions.forEach(tx => {
          const desc = tx.description || '';
          
          // Match closed position format
          const closeMatch = desc.match(/Đóng (LONG|SHORT) (?:[\d,.]+ )?([A-Z0-9.]+).*?Lợi nhuận: ([-\d,.]+)đ/i);
          if (closeMatch) {
            const symbol = closeMatch[2];
            const pnlStr = closeMatch[3].replace(/\./g, '').replace(/,/g, '');
            const pnl = parseFloat(pnlStr) || 0;
            trades.push({ symbol, pnl, timestamp: new Date(tx.createdAt) });

            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
            symbolPnL[symbol] = (symbolPnL[symbol] || 0) + pnl;
          } else {
            // Check for open position to count symbol activity
            const openMatch = desc.match(/Mở (LONG|SHORT) ([A-Z0-9.]+)/i);
            if (openMatch) {
              const symbol = openMatch[2];
              symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
            }
          }
        });

        const totalClosed = trades.length;
        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);
        
        const winRate = totalClosed > 0 ? (wins.length / totalClosed) * 100 : 0;
        const totalProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
        const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
        const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? 'MAX' : '1.0';
        
        const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
        const initialCapital = 100_000_000;
        const totalReturn = ((totalPnL) / initialCapital) * 100;

        const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
        const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;

        let mostTradedSymbol = 'FPT';
        let maxCount = 0;
        Object.entries(symbolCounts).forEach(([sym, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostTradedSymbol = sym;
          }
        });

        const bySymbol = Object.entries(symbolPnL).map(([symbol, pnl]) => ({ symbol, pnl }));

        // Generate dynamic equity curve
        const baseCapital = 100_000_000;
        let cumulative = baseCapital;
        const equityCurve: { date: string; value: number }[] = [];
        
        // Add starting point 7 days ago
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        equityCurve.push({ date: startDate.toISOString(), value: baseCapital });

        trades.reverse().forEach(t => {
          cumulative += t.pnl;
          equityCurve.push({ date: t.timestamp.toISOString(), value: cumulative });
        });

        if (equityCurve.length === 1) {
          equityCurve.push({ date: new Date().toISOString(), value: currentBalance });
        }

        setStats({
          totalReturn,
          totalPnL,
          winRate,
          profitFactor,
          bestTrade,
          worstTrade,
          mostTradedSymbol,
          avgPositionSize: 10_000_000,
          bySymbol: bySymbol.length > 0 ? bySymbol : [{ symbol: 'FPT', pnl: 0 }],
          equityCurve
        });
      } catch (error) {
        console.error('Error fetching student performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealPerformance();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h1>
        <p className="text-slate-400 mt-2 text-lg">Deep dive into your trading statistics and behavioral patterns.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Total Return</p>
          <h3 className={`text-2xl font-bold mt-1 ${stats.totalReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {stats.totalReturn > 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
          </h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Win Rate</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.winRate.toFixed(1)}%</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Profit Factor</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.profitFactor}</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Best Trade</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{stats.bestTrade.toLocaleString('vi-VN')}₫</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Worst Trade</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1">{stats.worstTrade.toLocaleString('vi-VN')}₫</h3>
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
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500">Loading equity curve...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Performance by Symbol</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bySymbol} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    stats.bySymbol.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'} />
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
                <p className="text-lg font-bold text-white">{stats.mostTradedSymbol}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-[#172033] rounded-xl border border-[#253047]">
              <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Net Profit / Loss</p>
                <p className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.totalPnL > 0 ? '+' : ''}{stats.totalPnL.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#172033] rounded-xl border border-[#253047]">
              <div className="p-3 bg-amber-500/10 rounded-lg shrink-0">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Closed Trades</p>
                <p className="text-lg font-bold text-white">{stats.bySymbol.length} symbols active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
