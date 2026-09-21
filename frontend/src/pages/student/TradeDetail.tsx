import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { MOCK_TRADES } from '../../data/mockStudentData';

export const StudentTradeDetail = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const trade = MOCK_TRADES.find(t => t.id === tradeId);

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Trade not found</h2>
        <p>The trade you are looking for does not exist or has been removed.</p>
        <Link to="/student/journal" className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Back to Journal
        </Link>
      </div>
    );
  }

  const isWin = trade.pnl > 0;
  const isLoss = trade.pnl < 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link to="/student/journal" className="p-2 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Trade Details
            <span className={`px-2.5 py-0.5 rounded text-sm font-bold uppercase ${trade.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {trade.side}
            </span>
            <span className="bg-[#172033] text-slate-300 px-2.5 py-0.5 rounded text-sm font-bold border border-[#253047]">
              {trade.symbol}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden">
            <div className="p-6 border-b border-[#253047]">
              <h2 className="text-lg font-semibold text-white">Execution Summary</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Status</p>
                <p className="font-semibold text-white">{trade.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Quantity</p>
                <p className="font-semibold text-white">{trade.quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Entry Price</p>
                <p className="font-semibold text-white">{trade.entryPrice.toLocaleString('vi-VN')}₫</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Exit Price</p>
                <p className="font-semibold text-white">{trade.exitPrice ? trade.exitPrice.toLocaleString('vi-VN') + '₫' : '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-1">Entry Time</p>
                <p className="font-semibold text-white text-sm">{new Date(trade.entryTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Exit Time</p>
                <p className="font-semibold text-white text-sm">{trade.exitTime ? new Date(trade.exitTime).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Stop Loss</p>
                <p className="font-semibold text-white">{trade.stopLoss ? trade.stopLoss.toLocaleString('vi-VN') + '₫' : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Take Profit</p>
                <p className="font-semibold text-white">{trade.takeProfit ? trade.takeProfit.toLocaleString('vi-VN') + '₫' : '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden">
            <div className="p-6 border-b border-[#253047]">
              <h2 className="text-lg font-semibold text-white">Trade Notes</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-300 whitespace-pre-wrap">{trade.notes || 'No notes for this trade.'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden">
            <div className="p-6 border-b border-[#253047]">
              <h2 className="text-lg font-semibold text-white">Financials</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#253047]/50">
                <span className="text-slate-400">Gross P&L</span>
                <span className={`font-semibold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-300'}`}>
                  {trade.pnl > 0 ? '+' : ''}{(trade.pnl + (trade.commission || 0)).toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#253047]/50">
                <span className="text-slate-400">Commission & Fees</span>
                <span className="font-semibold text-rose-400">
                  -{trade.commission?.toLocaleString('vi-VN') || 0}₫
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white font-medium">Net P&L</span>
                <span className={`text-xl font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-white'}`}>
                  {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 text-sm">Return Rate</span>
                <span className={`text-sm font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-300'}`}>
                  {trade.returnRate > 0 ? '+' : ''}{trade.returnRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Context</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Simulation</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-white">{trade.simulation}</p>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Setup / Strategy</p>
                <p className="text-sm font-medium text-white">{trade.setup || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
