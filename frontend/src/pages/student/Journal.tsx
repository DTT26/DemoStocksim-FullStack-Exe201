import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_TRADES, MOCK_STUDENT_PORTFOLIO } from '../../data/mockStudentData';

export const StudentJournal = () => {
  const [filter, setFilter] = useState('All');

  const filteredTrades = MOCK_TRADES.filter(trade => {
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
          <h3 className="text-2xl font-bold text-white mt-1">{MOCK_STUDENT_PORTFOLIO.totalTrades}</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Win Rate</p>
          <h3 className="text-2xl font-bold text-white mt-1">{MOCK_STUDENT_PORTFOLIO.winRate}%</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Average Win</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{MOCK_STUDENT_PORTFOLIO.averageWin.toLocaleString('vi-VN')}₫</h3>
        </div>
        <div className="bg-[#111827] border border-[#253047] p-5 rounded-2xl">
          <p className="text-sm font-medium text-slate-400">Average Loss</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1">{MOCK_STUDENT_PORTFOLIO.averageLoss.toLocaleString('vi-VN')}₫</h3>
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
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-[#172033]/50 transition-colors">
                  <td className="px-6 py-4 text-slate-300">{new Date(trade.date).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">{trade.entryPrice.toLocaleString('vi-VN')}</td>
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
              ))}
              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No trades found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
