import React from 'react';
import { Calendar, Hash, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { formatMoneyVND, formatPercent } from '../../../utils/tradingAnalytics';
import type { JournalSummaryStats } from '../types/journalTypes';

interface JournalSummaryProps {
  stats: JournalSummaryStats;
}

export const JournalSummary: React.FC<JournalSummaryProps> = ({ stats }) => {
  const isProfit = stats.netPnL >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Sessions */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Sessions
          </span>
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {stats.totalSessions}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Recorded sessions
        </div>
      </div>

      {/* Total Trades */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Trades
          </span>
          <Hash className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {stats.totalTrades}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Executed orders
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Win Rate
          </span>
          <Target className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatPercent(stats.winRate, false)}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Profitable trades ratio
        </div>
      </div>

      {/* Net P&L */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net P&L
          </span>
          {isProfit ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-500" />
          )}
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isProfit
              ? 'text-emerald-600 dark:text-[#089981]'
              : 'text-rose-600 dark:text-[#f23645]'
          }`}
        >
          {formatMoneyVND(stats.netPnL, true)}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Realized cumulative result
        </div>
      </div>
    </div>
  );
};
