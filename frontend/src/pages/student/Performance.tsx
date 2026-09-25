import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { tradingApi } from '../../services/tradingApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const StudentPerformance = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReturn: 0,
    totalPnL: 0,
    winRate: 0,
    profitFactor: '1.0',
    bestTrade: 0,
    worstTrade: 0,
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

        transactions.forEach(tx => {
          const desc = tx.description || '';
          
          // Match closed position format
          const closeMatch = desc.match(/Đóng (LONG|SHORT) (?:[\d,.]+ )?([A-Z0-9.]+).*?Lợi nhuận: ([-\d,.]+)đ/i);
          if (closeMatch) {
            const symbol = closeMatch[2];
            const pnlStr = closeMatch[3].replace(/\./g, '').replace(/,/g, '');
            const pnl = parseFloat(pnlStr) || 0;
            trades.push({ symbol, pnl, timestamp: new Date(tx.createdAt) });
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Deep dive into your trading statistics and behavioral patterns.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] p-5 rounded-2xl shadow-sm dark:shadow-md transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Return</p>
          <h3 className={`text-2xl font-bold mt-1 ${stats.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
            {stats.totalReturn > 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
          </h3>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] p-5 rounded-2xl shadow-sm dark:shadow-md transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Win Rate</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.winRate.toFixed(1)}%</h3>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] p-5 rounded-2xl shadow-sm dark:shadow-md transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Profit Factor</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.profitFactor}</h3>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] p-5 rounded-2xl shadow-sm dark:shadow-md transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Best Trade</p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">+{stats.bestTrade.toLocaleString('vi-VN')}₫</h3>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] p-5 rounded-2xl shadow-sm dark:shadow-md transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Worst Trade</p>
          <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-500 mt-1">{stats.worstTrade.toLocaleString('vi-VN')}₫</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] p-6 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Equity Curve</h2>
          <div className="flex bg-slate-100 dark:bg-[#172033] rounded-lg p-1 border border-slate-200 dark:border-[#253047]">
            {['1W', '1M', '3M', '6M', 'YTD', 'ALL'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Loading equity curve...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValuePerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#253047' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="date" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: isDark ? '#253047' : '#e2e8f0', borderRadius: '0.5rem', color: isDark ? '#ffffff' : '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
    </div>
  );
};

