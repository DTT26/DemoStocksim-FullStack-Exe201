import React from 'react';
import { ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import type { JournalSession } from '../types/journalTypes';
import { formatMoneyVND, formatPercent } from '../../../utils/tradingAnalytics';

interface SessionTableProps {
  sessions: JournalSession[];
  onSelectSession: (sessionId: string) => void;
}

export const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  onSelectSession
}) => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#253047] text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Session</th>
              <th className="py-3.5 px-4">Simulation</th>
              <th className="py-3.5 px-4">Started</th>
              <th className="py-3.5 px-4 text-center">Trades</th>
              <th className="py-3.5 px-4 text-center">Win Rate</th>
              <th className="py-3.5 px-4 text-right">P&L</th>
              <th className="py-3.5 px-4 text-right">Portfolio Value</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1f283e]">
            {sessions.map((session) => {
              const isProfit = session.netPnL >= 0;
              const formattedDate = session.startedAt
                ? new Date(session.startedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'N/A';

              return (
                <tr
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#161f31] transition-colors cursor-pointer group"
                >
                  {/* Session Name & Status */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <span>{session.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {session.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {session.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              COMPLETED
                            </span>
                          )}
                          {session.timeframe && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              • {session.timeframe}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Simulation */}
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {session.simulationName}
                  </td>

                  {/* Started Date */}
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">
                    {formattedDate}
                  </td>

                  {/* Trades Count */}
                  <td className="py-4 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                    {session.tradesCount}
                  </td>

                  {/* Win Rate */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
                        session.winRate >= 50
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatPercent(session.winRate, false)}
                    </span>
                  </td>

                  {/* P&L */}
                  <td className="py-4 px-4 text-right font-bold text-sm">
                    <span
                      className={
                        isProfit
                          ? 'text-emerald-600 dark:text-[#089981]'
                          : 'text-rose-600 dark:text-[#f23645]'
                      }
                    >
                      {formatMoneyVND(session.netPnL, true)}
                    </span>
                  </td>

                  {/* Portfolio Value */}
                  <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white">
                    {formatMoneyVND(session.endingBalance || session.balance)}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
