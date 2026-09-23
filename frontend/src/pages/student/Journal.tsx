import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradingApi } from '../../services/tradingApi';
import { useSimulatorStore } from '../../features/market/engine/useSimulatorStore';
import { MOCK_TRADES, MOCK_STUDENT_PORTFOLIO } from '../../data/mockStudentData';
import { useAuth } from '../../contexts/AuthContext';

export const StudentJournal = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: MOCK_STUDENT_PORTFOLIO.totalTrades,
    winRate: MOCK_STUDENT_PORTFOLIO.winRate,
    averageWin: MOCK_STUDENT_PORTFOLIO.averageWin,
    averageLoss: MOCK_STUDENT_PORTFOLIO.averageLoss,
  });

  const fetchJournalData = async () => {
    setLoading(true);
    try {
      let combinedTrades: any[] = [];

      // 1. Fetch real paper trading transactions from backend API
      try {
        const res = await tradingApi.getTransactions(user?._id);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiTrades = res.data.map((tx: any) => {
            const desc = tx.description || '';
            const isClose = tx.type === 'DEPOSIT';
            const isBuy = tx.type === 'BUY_STOCK' || desc.includes('LONG') || desc.includes('BUY');
            
            const symbolMatch = desc.match(/(?:LONG|SHORT|BUY|SELL|Mở|Đóng)\s+([A-Z0-9]+)/i);
            const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : 'STOCK';
            
            const priceMatch = desc.match(/ở giá\s+([\d.,]+)/);
            const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
            
            const pnlMatch = desc.match(/Lợi nhuận:\s*(-?[\d.,]+)/);
            let pnl = 0;
            if (pnlMatch) {
              pnl = parseFloat(pnlMatch[1].replace(/,/g, ''));
            }

            return {
              id: tx._id,
              date: tx.createdAt,
              symbol,
              side: isBuy ? 'BUY' : 'SELL',
              entryPrice: price,
              exitPrice: isClose ? price : undefined,
              pnl,
              returnRate: pnl !== 0 && tx.amount ? parseFloat(((pnl / Math.abs(tx.amount)) * 100).toFixed(2)) : 0,
              type: tx.type,
              description: desc
            };
          });

          combinedTrades = [...combinedTrades, ...apiTrades];
        }
      } catch (e) {
        console.error('Failed to fetch paper trading transactions', e);
      }

      // 2. Fetch Simulator Store history
      const simHistory = useSimulatorStore.getState().history;
      if (simHistory && simHistory.length > 0) {
        const simTrades = simHistory.map(item => ({
          id: item.id,
          date: item.closeTime || item.openTime,
          symbol: item.symbol,
          side: item.side === 'LONG' ? 'BUY' : 'SELL',
          entryPrice: item.entryPrice,
          exitPrice: item.exitPrice,
          pnl: item.netPnL,
          returnRate: item.entryPrice > 0 ? parseFloat((((item.exitPrice - item.entryPrice) / item.entryPrice) * 100).toFixed(2)) : 0,
          type: 'SIMULATOR',
          description: `Simulation trade on ${item.symbol}`
        }));
        combinedTrades = [...combinedTrades, ...simTrades];
      }

      // 3. Fallback to MOCK_TRADES if user hasn't executed trades yet
      if (combinedTrades.length === 0) {
        combinedTrades = MOCK_TRADES;
      }

      setTrades(combinedTrades);

      // Calculate stats
      const total = combinedTrades.length;
      const winning = combinedTrades.filter(t => t.pnl > 0);
      const losing = combinedTrades.filter(t => t.pnl < 0);
      
      const winRate = total > 0 ? parseFloat(((winning.length / total) * 100).toFixed(1)) : 0;
      const totalWinPnL = winning.reduce((acc, t) => acc + t.pnl, 0);
      const totalLossPnL = losing.reduce((acc, t) => acc + Math.abs(t.pnl), 0);
      
      const averageWin = winning.length > 0 ? Math.round(totalWinPnL / winning.length) : 0;
      const averageLoss = losing.length > 0 ? Math.round(totalLossPnL / losing.length) : 0;

      setStats({
        totalTrades: total,
        winRate,
        averageWin,
        averageLoss: -averageLoss,
      });

    } catch (error) {
      console.error('Error fetching journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalData();
  }, [user]);

  const filteredTrades = trades.filter(trade => {
    if (filter === 'All') return true;
    if (filter === 'Winning') return trade.pnl > 0;
    if (filter === 'Losing') return trade.pnl < 0;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Trading Journal</h1>
        <p className="text-slate-400 mt-2 text-lg">Review your past trades and analyze your decisions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Total Trades</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.totalTrades}</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Win Rate</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.winRate}%</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Average Win</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{stats.averageWin.toLocaleString('vi-VN')}₫</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Average Loss</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1">{stats.averageLoss.toLocaleString('vi-VN')}₫</h3>
        </div>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden">
        <div className="flex border-b border-[#253047] px-4">
          {['All', 'Winning', 'Losing'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                filter === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#172033] border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Symbol</th>
                <th className="px-6 py-3 font-semibold">Side</th>
                <th className="px-6 py-3 font-semibold text-right">Entry</th>
                <th className="px-6 py-3 font-semibold text-right">Exit</th>
                <th className="px-6 py-3 font-semibold text-right">P&L</th>
                <th className="px-6 py-3 font-semibold text-right">Return</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253047]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading trading history...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No trades found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredTrades.map(trade => (
                  <tr key={trade.id} className="hover:bg-[#172033]/50 transition-colors">
                    <td className="px-6 py-4 text-slate-300">{new Date(trade.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">{trade.entryPrice ? trade.entryPrice.toLocaleString('vi-VN') : '-'}</td>
                    <td className="px-6 py-4 text-right text-slate-300">{trade.exitPrice ? trade.exitPrice.toLocaleString('vi-VN') : '-'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${trade.pnl > 0 ? 'text-emerald-500' : trade.pnl < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('vi-VN')}₫
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${trade.pnl > 0 ? 'text-emerald-500' : trade.pnl < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {trade.returnRate > 0 ? '+' : ''}{trade.returnRate}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/student/journal/${trade.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Details</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
