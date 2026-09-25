import React, { useState, useMemo } from 'react';
import type { JournalSession, JournalTrade } from '../types/journalTypes';
import { TradeDetailDrawer } from './TradeDetailDrawer';
import { formatMoneyVND, formatPercent } from '../../../utils/tradingAnalytics';
import { Search, Filter, RotateCcw, ArrowRight, Eye, ListFilter } from 'lucide-react';

interface TradesTabProps {
  session: JournalSession;
}

export const TradesTab: React.FC<TradesTabProps> = ({ session }) => {
  const trades = session.trades || [];

  // Filter states
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');

  // Selected trade for Drawer
  const [selectedTrade, setSelectedTrade] = useState<JournalTrade | null>(null);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Symbol search
      if (search.trim()) {
        const query = search.trim().toUpperCase();
        if (!t.symbol.toUpperCase().includes(query)) return false;
      }

      // Side filter
      if (sideFilter !== 'ALL') {
        const isLong = t.side === 'LONG' || t.side === 'BUY';
        if (sideFilter === 'BUY' && !isLong) return false;
        if (sideFilter === 'SELL' && isLong) return false;
      }

      // Result filter
      if (resultFilter === 'PROFIT' && t.pnl <= 0) return false;
      if (resultFilter === 'LOSS' && t.pnl >= 0) return false;

      return true;
    });
  }, [trades, search, sideFilter, resultFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setSideFilter('ALL');
    setResultFilter('ALL');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol (e.g. FPT, VCB, BTC)..."
            className="w-full bg-slate-50 dark:bg-[#161f31] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Side Filter */}
        <div className="w-full sm:w-auto min-w-[120px]">
          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-[#161f31] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white text-xs sm:text-sm font-medium rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">Buy / Long</option>
            <option value="SELL">Sell / Short</option>
          </select>
        </div>

        {/* Result Filter */}
        <div className="w-full sm:w-auto min-w-[120px]">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-[#161f31] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white text-xs sm:text-sm font-medium rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Results</option>
            <option value="PROFIT">Profitable</option>
            <option value="LOSS">Losses</option>
          </select>
        </div>

        {/* Reset */}
        {(search || sideFilter !== 'ALL' || resultFilter !== 'ALL') && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Trades Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl overflow-hidden shadow-sm">
        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center">
            <ListFilter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white">No trades match your criteria</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search or filters to see recorded trades.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#253047] text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-3 text-center">Side</th>
                  <th className="py-3 px-4 text-right">Entry</th>
                  <th className="py-3 px-4 text-right">Exit</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4 text-right">P&L</th>
                  <th className="py-3 px-3 text-right">Return</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1f283e]">
                {filteredTrades.map((trade, idx) => {
                  const isLong = trade.side === 'LONG' || trade.side === 'BUY';
                  const isProfit = trade.pnl > 0;
                  const isLoss = trade.pnl < 0;

                  const entryStr = trade.entryTime || trade.openTime
                    ? new Date((trade.entryTime || trade.openTime)!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-';
                  const exitStr = trade.exitTime || trade.closeTime
                    ? new Date((trade.exitTime || trade.closeTime)!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-';

                  return (
                    <tr
                      key={trade.id || idx}
                      onClick={() => setSelectedTrade(trade)}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#161f31] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                          {trade.symbol}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            isLong
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {trade.side}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatMoneyVND(trade.entryPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {trade.exitPrice ? formatMoneyVND(trade.exitPrice) : '-'}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {trade.quantity || trade.lot || '1'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {entryStr}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {exitStr}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold">
                        <span
                          className={
                            isProfit
                              ? 'text-emerald-600 dark:text-[#089981]'
                              : isLoss
                              ? 'text-rose-600 dark:text-[#f23645]'
                              : 'text-slate-500'
                          }
                        >
                          {formatMoneyVND(trade.pnl, true)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-xs">
                        {trade.returnRate !== undefined ? (
                          <span className={trade.returnRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                            {formatPercent(trade.returnRate, true)}
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {trade.status || 'CLOSED'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Detail Drawer */}
      <TradeDetailDrawer
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
};
