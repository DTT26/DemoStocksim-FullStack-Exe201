import React from 'react';
import type { JournalSession } from '../types/journalTypes';
import { MetricCard } from './MetricCard';
import {
  formatMoneyVND,
  formatPercent,
  formatHoldingTime,
  calculateNetPnL,
  calculateWinRate,
  calculateGrossProfit,
  calculateGrossLoss,
  calculateAverageWin,
  calculateAverageLoss,
  calculateProfitFactor,
  calculatePayoffRatio,
  calculateExpectancy,
  calculateLargestWin,
  calculateLargestLoss,
  calculateEquityCurve,
  calculateDrawdownCurve,
  calculateSharpeRatio,
  groupTradesByDay
} from '../../../utils/tradingAnalytics';
import { DollarSign, Percent, BarChart3, ShieldAlert, Clock, Award } from 'lucide-react';

interface OverviewTabProps {
  session: JournalSession;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ session }) => {
  const trades = session.trades || [];
  const initialBalance = session.initialBalance || 100000000;
  const netPnL = trades.length > 0 ? calculateNetPnL(trades) : session.netPnL;
  const endingBalance = initialBalance + netPnL;
  const returnRate = initialBalance > 0 ? (netPnL / initialBalance) * 100 : 0;
  const winRate = trades.length > 0 ? calculateWinRate(trades) : session.winRate;

  // Breakdown calculations
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const grossProfit = calculateGrossProfit(trades);
  const grossLoss = calculateGrossLoss(trades);
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  const profitFactor = calculateProfitFactor(trades);
  const payoffRatio = calculatePayoffRatio(trades);
  const expectancy = calculateExpectancy(trades);
  const largestWin = calculateLargestWin(trades);
  const largestLoss = calculateLargestLoss(trades);
  const avgPnLPerTrade = trades.length > 0 ? Math.round(netPnL / trades.length) : 0;

  // Drawdown
  const equityCurve = calculateEquityCurve(initialBalance, trades);
  const drawdownData = calculateDrawdownCurve(equityCurve);
  const maxDDPercent = drawdownData.maxDrawdownPercent;
  const maxDDAmount = drawdownData.maxDrawdownAmount;
  const sharpe = calculateSharpeRatio(trades);
  const recoveryFactor = maxDDAmount > 0 ? parseFloat((netPnL / maxDDAmount).toFixed(2)) : null;

  // Rhythm
  const dayGroups = groupTradesByDay(trades);
  const tradingDaysCount = dayGroups.length || (trades.length > 0 ? 1 : 0);
  const bestDay = dayGroups.find(d => d.isBest) || (dayGroups.length > 0 ? dayGroups[0] : null);
  const worstDay = dayGroups.find(d => d.isWorst) || (dayGroups.length > 1 ? dayGroups[dayGroups.length - 1] : null);

  const holdingTimes = trades
    .map(t => {
      if (t.holdingTimeMinutes !== undefined) return t.holdingTimeMinutes;
      if (t.entryTime && t.exitTime) {
        return Math.max(0, (new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()) / (1000 * 60));
      }
      return null;
    })
    .filter((m): m is number => m !== null);

  const avgHoldingMins = holdingTimes.length > 0
    ? Math.round(holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length)
    : null;

  // Stop loss compliance check
  const tradesWithSL = trades.filter(t => t.sl !== undefined && t.sl > 0);
  const slUsagePercent = trades.length > 0 ? Math.round((tradesWithSL.length / trades.length) * 100) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. SESSION INFORMATION */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <span>Session Information</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            label="Starting Balance"
            value={formatMoneyVND(initialBalance)}
            subValue="Initial capital"
          />
          <MetricCard
            label="Ending Balance"
            value={formatMoneyVND(endingBalance)}
            subValue="Current portfolio equity"
          />
          <MetricCard
            label="Net P&L"
            value={formatMoneyVND(netPnL, true)}
            trend={netPnL >= 0 ? 'up' : 'down'}
            subValue="Realized outcome"
          />
          <MetricCard
            label="Return"
            value={formatPercent(returnRate, true)}
            trend={returnRate >= 0 ? 'up' : 'down'}
            subValue="ROI on initial balance"
          />
          <MetricCard
            label="Trades"
            value={trades.length || session.tradesCount}
            subValue="Executed closed trades"
          />
          <MetricCard
            label="Win Rate"
            value={formatPercent(winRate, false)}
            trend={winRate >= 50 ? 'up' : 'down'}
            subValue={`${winningTrades.length} wins / ${trades.length} total`}
          />
        </div>
      </div>

      {/* 2. PERFORMANCE RESULTS */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span>Performance Results</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161f31] border border-slate-200/60 dark:border-[#253047]/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Net P&L
            </span>
            <div className={`text-xl sm:text-2xl font-bold mt-1 ${netPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatMoneyVND(netPnL, true)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Total realized net profit</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161f31] border border-slate-200/60 dark:border-[#253047]/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Trades Summary
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {trades.length} Trades
            </div>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
              {winningTrades.length} Wins <span className="text-slate-400 font-normal">•</span> <span className="text-rose-500 dark:text-rose-400">{losingTrades.length} Losses</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161f31] border border-slate-200/60 dark:border-[#253047]/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Win Rate
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatPercent(winRate, false)}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161f31] border border-slate-200/60 dark:border-[#253047]/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Avg P&L / Trade
            </span>
            <div className={`text-xl sm:text-2xl font-bold mt-1 ${avgPnLPerTrade >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatMoneyVND(avgPnLPerTrade, true)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Expected return per trade</p>
          </div>
        </div>
      </div>

      {/* 3. P&L BREAKDOWN & TRADING QUALITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Breakdown */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>P&L Breakdown</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              Realized
            </span>
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Gross Profit</span>
              <span className="font-bold text-emerald-500">{formatMoneyVND(grossProfit, true)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Gross Loss</span>
              <span className="font-bold text-rose-500">{formatMoneyVND(-grossLoss, true)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Average Win</span>
              <span className="font-bold text-emerald-500">{formatMoneyVND(avgWin, true)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Average Loss</span>
              <span className="font-bold text-rose-500">{formatMoneyVND(-avgLoss, true)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Largest Win</span>
              <span className="font-bold text-emerald-500">{formatMoneyVND(largestWin, true)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1f283e]">
              <span className="text-slate-500 dark:text-slate-400">Largest Loss</span>
              <span className="font-bold text-rose-500">{formatMoneyVND(largestLoss, true)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-900 dark:text-white font-bold">Profit Factor</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
                {profitFactor !== null && profitFactor !== Infinity ? `${profitFactor}x` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Trading Quality */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Trading Quality</span>
            </span>
            <span className="text-xs text-slate-400">Hover [?] for formulas</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <MetricCard
              label="Profit Factor"
              value={profitFactor !== null && profitFactor !== Infinity ? `${profitFactor}x` : 'N/A'}
              tooltip="Gross profit divided by gross loss. A value above 1.0 means total profits are greater than total losses."
              trend={profitFactor && profitFactor > 1.2 ? 'up' : 'neutral'}
            />
            <MetricCard
              label="Payoff Ratio"
              value={payoffRatio !== null ? `${payoffRatio}` : 'N/A'}
              tooltip="Average Win divided by Average Loss. Indicates how much you gain on winning trades relative to what you give up on losses."
              trend={payoffRatio && payoffRatio > 1.5 ? 'up' : 'neutral'}
            />
            <MetricCard
              label="Expectancy"
              value={formatMoneyVND(expectancy, true)}
              tooltip="(Win Rate × Average Win) - (Loss Rate × Average Loss). The mathematical average amount your trading is expected to return per trade."
              trend={expectancy >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Recovery Factor"
              value={recoveryFactor !== null ? `${recoveryFactor}` : 'N/A'}
              tooltip="Net Profit divided by Maximum Drawdown. Measures how quickly the portfolio overcomes its worst drawdown."
              trend={recoveryFactor && recoveryFactor > 2 ? 'up' : 'neutral'}
            />
          </div>
        </div>
      </div>

      {/* 4. RISK & TRADING RHYTHM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Risk Management</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <MetricCard
              label="Max Drawdown"
              value={maxDDPercent > 0 ? `-${maxDDPercent}%` : '0.00%'}
              subValue={maxDDAmount > 0 ? formatMoneyVND(-maxDDAmount, false) : undefined}
              tooltip="The largest peak-to-trough drop in portfolio balance before a new peak is reached."
              trend={maxDDPercent > 10 ? 'down' : 'neutral'}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={sharpe !== null ? sharpe : 'N/A'}
              tooltip={
                sharpe !== null
                  ? 'Measures excess return relative to total return volatility. Higher is better.'
                  : 'Not enough trading data to calculate this metric (minimum 5 trades required).'
              }
              trend={sharpe && sharpe > 1.0 ? 'up' : 'neutral'}
            />
            <MetricCard
              label="Stop Loss Usage"
              value={slUsagePercent !== null ? `${slUsagePercent}%` : 'N/A'}
              tooltip={
                slUsagePercent !== null
                  ? 'Percentage of trades executed with a predefined Stop Loss order.'
                  : 'No Stop Loss data recorded in this session.'
              }
              trend={slUsagePercent && slUsagePercent >= 80 ? 'up' : 'neutral'}
            />
            <MetricCard
              label="Risk / Reward"
              value={payoffRatio ? `1 : ${payoffRatio}` : 'N/A'}
              tooltip="Realized reward-to-risk ratio based on average winning and losing trades."
            />
          </div>
        </div>

        {/* Trading Rhythm */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Trading Rhythm</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <MetricCard
              label="Avg Holding Time"
              value={formatHoldingTime(avgHoldingMins)}
              subValue="Mean position duration"
            />
            <MetricCard
              label="Trading Days"
              value={`${tradingDaysCount} days`}
              subValue={`${(trades.length / Math.max(1, tradingDaysCount)).toFixed(1)} trades / day`}
            />
            <MetricCard
              label="Best Day"
              value={bestDay ? formatMoneyVND(bestDay.pnl, true) : 'N/A'}
              subValue={bestDay ? bestDay.date : 'No trades'}
              trend={bestDay && bestDay.pnl > 0 ? 'up' : 'neutral'}
            />
            <MetricCard
              label="Worst Day"
              value={worstDay ? formatMoneyVND(worstDay.pnl, true) : 'N/A'}
              subValue={worstDay ? worstDay.date : 'No trades'}
              trend={worstDay && worstDay.pnl < 0 ? 'down' : 'neutral'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
