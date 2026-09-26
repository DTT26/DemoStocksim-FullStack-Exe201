export interface TradeLike {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  quantity?: number;
  lot?: number;
  pnl: number;
  returnRate?: number;
  entryTime?: string;
  exitTime?: string;
  openTime?: string;
  closeTime?: string;
  holdingTimeMinutes?: number;
  status?: string;
  sl?: number;
  tp?: number;
  setupTag?: string;
  closeReason?: string;
  commission?: number;
  swap?: number;
  simulation?: string;
}

export interface EquityPoint {
  index: number;
  tradeNumber: number;
  time: string;
  equity: number;
  pnl: number;
  returnRate: number;
}

export interface DrawdownPoint {
  index: number;
  tradeNumber: number;
  time: string;
  equity: number;
  peak: number;
  drawdownPercent: number;
  drawdownAmount: number;
}

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
}

export interface SidePerformance {
  side: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  avgWin: number;
  avgLoss: number;
}

export interface DayPerformance {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  returnRate: number;
  isBest?: boolean;
  isWorst?: boolean;
}

export interface HoldingTimeBucket {
  range: string;
  label: string;
  trades: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
}

// -------------------------------------------------------------
// Formatters
// -------------------------------------------------------------

export const formatMoneyVND = (value: number | undefined | null, includeSign = false): string => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Math.abs(value));

  if (value === 0) return formatted;
  if (value > 0) return includeSign ? `+${formatted}` : formatted;
  return `-${formatted}`;
};

export const formatMoneyUSD = formatMoneyVND;

export const formatPercent = (value: number | undefined | null, includeSign = true): string => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  const formatted = Math.abs(value).toFixed(2) + '%';
  if (value === 0) return '0.00%';
  if (value > 0) return includeSign ? `+${formatted}` : formatted;
  return `-${formatted}`;
};

export const formatHoldingTime = (minutes: number | undefined | null): string => {
  if (minutes === undefined || minutes === null || isNaN(minutes) || minutes < 0) return 'N/A';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// -------------------------------------------------------------
// Core Calculations
// -------------------------------------------------------------

export const calculateNetPnL = (trades: TradeLike[]): number => {
  return trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
};

export const calculateWinRate = (trades: TradeLike[]): number => {
  if (!trades.length) return 0;
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  return parseFloat(((wins / trades.length) * 100).toFixed(2));
};

export const calculateGrossProfit = (trades: TradeLike[]): number => {
  return trades.reduce((sum, t) => (t.pnl > 0 ? sum + t.pnl : sum), 0);
};

export const calculateGrossLoss = (trades: TradeLike[]): number => {
  return Math.abs(trades.reduce((sum, t) => (t.pnl < 0 ? sum + t.pnl : sum), 0));
};

export const calculateAverageWin = (trades: TradeLike[]): number => {
  const wins = trades.filter(t => t.pnl > 0);
  if (!wins.length) return 0;
  const grossProfit = calculateGrossProfit(trades);
  return Math.round(grossProfit / wins.length);
};

export const calculateAverageLoss = (trades: TradeLike[]): number => {
  const losses = trades.filter(t => t.pnl < 0);
  if (!losses.length) return 0;
  const grossLoss = calculateGrossLoss(trades);
  return Math.round(grossLoss / losses.length);
};

export const calculateProfitFactor = (trades: TradeLike[]): number | null => {
  const grossProfit = calculateGrossProfit(trades);
  const grossLoss = calculateGrossLoss(trades);
  if (grossLoss === 0) {
    return grossProfit > 0 ? Infinity : null;
  }
  return parseFloat((grossProfit / grossLoss).toFixed(2));
};

export const calculatePayoffRatio = (trades: TradeLike[]): number | null => {
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  if (avgLoss === 0) return null;
  return parseFloat((avgWin / avgLoss).toFixed(2));
};

export const calculateExpectancy = (trades: TradeLike[]): number => {
  if (!trades.length) return 0;
  const winRate = calculateWinRate(trades) / 100;
  const lossRate = 1 - winRate;
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  return Math.round((winRate * avgWin) - (lossRate * avgLoss));
};

export const calculateLargestWin = (trades: TradeLike[]): number => {
  if (!trades.length) return 0;
  const profits = trades.map(t => t.pnl).filter(p => p > 0);
  return profits.length ? Math.max(...profits) : 0;
};

export const calculateLargestLoss = (trades: TradeLike[]): number => {
  if (!trades.length) return 0;
  const losses = trades.map(t => t.pnl).filter(p => p < 0);
  return losses.length ? Math.min(...losses) : 0;
};

// -------------------------------------------------------------
// Curves & Risk
// -------------------------------------------------------------

export const calculateEquityCurve = (initialCapital: number, trades: TradeLike[]): EquityPoint[] => {
  const sorted = [...trades].sort((a, b) => {
    const timeA = new Date(a.closeTime || a.exitTime || a.entryTime || 0).getTime();
    const timeB = new Date(b.closeTime || b.exitTime || b.entryTime || 0).getTime();
    return timeA - timeB;
  });

  const curve: EquityPoint[] = [
    {
      index: 0,
      tradeNumber: 0,
      time: 'Start',
      equity: initialCapital,
      pnl: 0,
      returnRate: 0
    }
  ];

  let currentEquity = initialCapital;
  sorted.forEach((trade, i) => {
    currentEquity += trade.pnl || 0;
    const timeStr = trade.closeTime || trade.exitTime || trade.entryTime || `T#${i + 1}`;
    const returnRate = initialCapital > 0 ? ((currentEquity - initialCapital) / initialCapital) * 100 : 0;
    
    curve.push({
      index: i + 1,
      tradeNumber: i + 1,
      time: timeStr.length > 10 ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : timeStr,
      equity: currentEquity,
      pnl: trade.pnl || 0,
      returnRate: parseFloat(returnRate.toFixed(2))
    });
  });

  return curve;
};

export const calculateDrawdownCurve = (equityCurve: EquityPoint[]): { points: DrawdownPoint[]; maxDrawdownPercent: number; maxDrawdownAmount: number } => {
  if (!equityCurve.length) {
    return { points: [], maxDrawdownPercent: 0, maxDrawdownAmount: 0 };
  }

  let peak = equityCurve[0].equity;
  let maxDDPct = 0;
  let maxDDAmount = 0;

  const points: DrawdownPoint[] = equityCurve.map((pt, i) => {
    if (pt.equity > peak) {
      peak = pt.equity;
    }
    const ddAmount = peak - pt.equity;
    const ddPct = peak > 0 ? (ddAmount / peak) * 100 : 0;

    if (ddPct > maxDDPct) maxDDPct = ddPct;
    if (ddAmount > maxDDAmount) maxDDAmount = ddAmount;

    return {
      index: i,
      tradeNumber: pt.tradeNumber,
      time: pt.time,
      equity: pt.equity,
      peak,
      drawdownPercent: -parseFloat(ddPct.toFixed(2)),
      drawdownAmount: ddAmount
    };
  });

  return {
    points,
    maxDrawdownPercent: parseFloat(maxDDPct.toFixed(2)),
    maxDrawdownAmount: Math.round(maxDDAmount)
  };
};

export const calculateSharpeRatio = (trades: TradeLike[], riskFreeRate = 0.05): number | null => {
  if (trades.length < 5) return null;
  const returns = trades.map(t => (t.returnRate !== undefined ? t.returnRate : t.pnl / 1000000));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;
  const sharpe = (mean - (riskFreeRate / 252)) / stdDev;
  return parseFloat(sharpe.toFixed(2));
};

// -------------------------------------------------------------
// Breakdown & Groupings
// -------------------------------------------------------------

export const groupTradesBySymbol = (trades: TradeLike[]): SymbolPerformance[] => {
  const map = new Map<string, TradeLike[]>();
  trades.forEach(t => {
    const sym = t.symbol.toUpperCase();
    if (!map.has(sym)) map.set(sym, []);
    map.get(sym)!.push(t);
  });

  const result: SymbolPerformance[] = [];
  map.forEach((symTrades, symbol) => {
    const wins = symTrades.filter(t => t.pnl > 0).length;
    const total = symTrades.length;
    const totalPnL = symTrades.reduce((sum, t) => sum + t.pnl, 0);
    result.push({
      symbol,
      trades: total,
      wins,
      losses: total - wins,
      winRate: parseFloat(((wins / total) * 100).toFixed(1)),
      avgPnL: Math.round(totalPnL / total),
      totalPnL
    });
  });

  return result.sort((a, b) => b.totalPnL - a.totalPnL);
};

export const groupTradesBySide = (trades: TradeLike[]): SidePerformance[] => {
  const longTrades = trades.filter(t => t.side === 'LONG' || t.side === 'BUY');
  const shortTrades = trades.filter(t => t.side === 'SHORT' || t.side === 'SELL');

  const calcSide = (sideTrades: TradeLike[], sideKey: 'LONG' | 'SHORT', label: string): SidePerformance => {
    const total = sideTrades.length;
    if (total === 0) {
      return { side: sideKey, label, trades: 0, wins: 0, losses: 0, winRate: 0, totalPnL: 0, avgPnL: 0, avgWin: 0, avgLoss: 0 };
    }
    const wins = sideTrades.filter(t => t.pnl > 0);
    const losses = sideTrades.filter(t => t.pnl < 0);
    const totalPnL = sideTrades.reduce((acc, t) => acc + t.pnl, 0);
    const winSum = wins.reduce((acc, t) => acc + t.pnl, 0);
    const lossSum = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));

    return {
      side: sideKey,
      label,
      trades: total,
      wins: wins.length,
      losses: losses.length,
      winRate: parseFloat(((wins.length / total) * 100).toFixed(1)),
      totalPnL,
      avgPnL: Math.round(totalPnL / total),
      avgWin: wins.length ? Math.round(winSum / wins.length) : 0,
      avgLoss: losses.length ? Math.round(lossSum / losses.length) : 0
    };
  };

  return [
    calcSide(longTrades, 'LONG', 'Long / Buy'),
    calcSide(shortTrades, 'SHORT', 'Short / Sell')
  ];
};

export const groupTradesByDay = (trades: TradeLike[]): DayPerformance[] => {
  const map = new Map<string, TradeLike[]>();
  trades.forEach(t => {
    const dateStr = t.closeTime || t.exitTime || t.entryTime || t.openTime;
    const dayKey = dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Unknown';
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)!.push(t);
  });

  let bestPnL = -Infinity;
  let worstPnL = Infinity;

  const list: DayPerformance[] = [];
  map.forEach((dayTrades, date) => {
    const total = dayTrades.length;
    const wins = dayTrades.filter(t => t.pnl > 0).length;
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    if (pnl > bestPnL) bestPnL = pnl;
    if (pnl < worstPnL) worstPnL = pnl;

    list.push({
      date,
      trades: total,
      wins,
      losses: total - wins,
      winRate: parseFloat(((wins / total) * 100).toFixed(1)),
      pnl,
      returnRate: 0
    });
  });

  return list.map(item => ({
    ...item,
    isBest: list.length > 1 && item.pnl === bestPnL && item.pnl > 0,
    isWorst: list.length > 1 && item.pnl === worstPnL && item.pnl < 0
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const groupTradesByHoldingTime = (trades: TradeLike[]): HoldingTimeBucket[] => {
  const buckets: { range: string; label: string; minMin: number; maxMin: number; trades: TradeLike[] }[] = [
    { range: '< 5 min', label: '< 5 phút', minMin: 0, maxMin: 5, trades: [] },
    { range: '5–15 min', label: '5 – 15 phút', minMin: 5, maxMin: 15, trades: [] },
    { range: '15–60 min', label: '15 – 60 phút', minMin: 15, maxMin: 60, trades: [] },
    { range: '1–4 hours', label: '1 – 4 giờ', minMin: 60, maxMin: 240, trades: [] },
    { range: '> 4 hours', label: '> 4 giờ', minMin: 240, maxMin: Infinity, trades: [] },
  ];

  trades.forEach(t => {
    let durationMins = t.holdingTimeMinutes;
    if (durationMins === undefined && (t.entryTime || t.openTime) && (t.exitTime || t.closeTime)) {
      const start = new Date((t.openTime || t.entryTime)!).getTime();
      const end = new Date((t.closeTime || t.exitTime)!).getTime();
      durationMins = Math.max(0, (end - start) / (1000 * 60));
    }

    if (durationMins !== undefined) {
      for (const b of buckets) {
        if (durationMins >= b.minMin && durationMins < b.maxMin) {
          b.trades.push(t);
          break;
        }
      }
    }
  });

  return buckets.map(b => {
    const total = b.trades.length;
    const wins = b.trades.filter(t => t.pnl > 0).length;
    const totalPnL = b.trades.reduce((sum, t) => sum + t.pnl, 0);
    return {
      range: b.range,
      label: b.label,
      trades: total,
      winRate: total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0,
      avgPnL: total > 0 ? Math.round(totalPnL / total) : 0,
      totalPnL
    };
  });
};

export const calculateTradingHeatmap = (trades: TradeLike[]): { day: string; hour: number; pnl: number; trades: number }[] => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const tradingHours = [9, 10, 11, 13, 14, 15];

  const grid: { day: string; dayIndex: number; hour: number; pnl: number; trades: number }[] = [];
  days.forEach((day, dIdx) => {
    tradingHours.forEach(hour => {
      grid.push({ day, dayIndex: dIdx + 1, hour, pnl: 0, trades: 0 });
    });
  });

  trades.forEach(t => {
    const timeStr = t.entryTime || t.openTime || t.closeTime;
    if (!timeStr) return;
    const d = new Date(timeStr);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday ... 5 is Friday
    const hour = d.getHours();

    const cell = grid.find(c => c.dayIndex === dayOfWeek && c.hour === hour);
    if (cell) {
      cell.pnl += t.pnl;
      cell.trades += 1;
    }
  });

  return grid;
};

export const calculatePnLDistribution = (trades: TradeLike[]): { label: string; count: number; pnlSum: number; color: string }[] => {
  const buckets = [
    { label: 'Large Loss', count: 0, pnlSum: 0, color: '#f23645' },
    { label: 'Loss', count: 0, pnlSum: 0, color: '#ef5350' },
    { label: 'Small Loss', count: 0, pnlSum: 0, color: '#e57373' },
    { label: 'Break Even', count: 0, pnlSum: 0, color: '#787b86' },
    { label: 'Small Win', count: 0, pnlSum: 0, color: '#81c784' },
    { label: 'Win', count: 0, pnlSum: 0, color: '#26a69a' },
    { label: 'Large Win', count: 0, pnlSum: 0, color: '#089981' }
  ];

  if (!trades.length) return buckets;

  const profits = trades.map(t => t.pnl);
  const maxWin = Math.max(0, ...profits);
  const maxLoss = Math.abs(Math.min(0, ...profits));

  trades.forEach(t => {
    const p = t.pnl;
    if (Math.abs(p) < 1000) {
      buckets[3].count++;
      buckets[3].pnlSum += p;
    } else if (p > 0) {
      if (maxWin > 0 && p >= maxWin * 0.6) {
        buckets[6].count++;
        buckets[6].pnlSum += p;
      } else if (maxWin > 0 && p >= maxWin * 0.25) {
        buckets[5].count++;
        buckets[5].pnlSum += p;
      } else {
        buckets[4].count++;
        buckets[4].pnlSum += p;
      }
    } else {
      const absLoss = Math.abs(p);
      if (maxLoss > 0 && absLoss >= maxLoss * 0.6) {
        buckets[0].count++;
        buckets[0].pnlSum += p;
      } else if (maxLoss > 0 && absLoss >= maxLoss * 0.25) {
        buckets[1].count++;
        buckets[1].pnlSum += p;
      } else {
        buckets[2].count++;
        buckets[2].pnlSum += p;
      }
    }
  });

  return buckets;
};

export interface RiskDistributionBucket {
  label: string;
  count: number;
  pnlRiskSum: number;
  color: string;
}

export interface RiskAnalysisSummary {
  buckets: RiskDistributionBucket[];
  tradesWithSLCount: number;
  tradesWithSLPercent: number;
  avgRiskAmount: number;
  avgRiskPercent: number;
  maxRiskAmount: number;
  maxRiskPercent: number;
  disciplineRating: 'Excellent' | 'Good' | 'Moderate' | 'Unprotected';
  hasPlannedSL: boolean;
}

export const calculateRiskDistribution = (
  trades: TradeLike[],
  initialCapital = 100000000
): RiskAnalysisSummary => {
  const buckets: RiskDistributionBucket[] = [
    { label: '< 0.5%', count: 0, pnlRiskSum: 0, color: '#38bdf8' },
    { label: '0.5% - 1%', count: 0, pnlRiskSum: 0, color: '#818cf8' },
    { label: '1% - 2%', count: 0, pnlRiskSum: 0, color: '#a78bfa' },
    { label: '2% - 3%', count: 0, pnlRiskSum: 0, color: '#fb923c' },
    { label: '> 3%', count: 0, pnlRiskSum: 0, color: '#f87171' }
  ];

  if (!trades.length) {
    return {
      buckets,
      tradesWithSLCount: 0,
      tradesWithSLPercent: 0,
      avgRiskAmount: 0,
      avgRiskPercent: 0,
      maxRiskAmount: 0,
      maxRiskPercent: 0,
      disciplineRating: 'Unprotected',
      hasPlannedSL: false
    };
  }

  const tradesWithSL = trades.filter(t => t.sl !== undefined && t.sl > 0);
  const hasPlannedSL = tradesWithSL.length > 0;

  let totalRiskAmount = 0;
  let maxRiskAmount = 0;
  let evaluatedTrades = 0;

  trades.forEach(t => {
    let tradeRisk = 0;
    if (t.sl !== undefined && t.sl > 0 && t.entryPrice > 0) {
      // Planned risk from Stop Loss distance
      const qty = t.quantity || t.lot || 1;
      tradeRisk = Math.abs(t.entryPrice - t.sl) * qty;
    } else if (t.pnl < 0) {
      // Realized risk from losing trades
      tradeRisk = Math.abs(t.pnl);
    } else {
      // For winning/breakeven trades without explicit SL, calculate risk exposure
      const qty = t.quantity || t.lot || 1;
      tradeRisk = t.entryPrice > 0 ? t.entryPrice * qty * 0.01 : Math.max(1, (t.pnl || 0) * 0.5);
    }

    if (tradeRisk > maxRiskAmount) {
      maxRiskAmount = tradeRisk;
    }
    totalRiskAmount += tradeRisk;
    evaluatedTrades++;

    const riskPct = initialCapital > 0 ? (tradeRisk / initialCapital) * 100 : 0;
    if (riskPct < 0.5) {
      buckets[0].count++;
      buckets[0].pnlRiskSum += tradeRisk;
    } else if (riskPct < 1.0) {
      buckets[1].count++;
      buckets[1].pnlRiskSum += tradeRisk;
    } else if (riskPct < 2.0) {
      buckets[2].count++;
      buckets[2].pnlRiskSum += tradeRisk;
    } else if (riskPct < 3.0) {
      buckets[3].count++;
      buckets[3].pnlRiskSum += tradeRisk;
    } else {
      buckets[4].count++;
      buckets[4].pnlRiskSum += tradeRisk;
    }
  });

  const avgRiskAmount = evaluatedTrades > 0 ? Math.round(totalRiskAmount / evaluatedTrades) : 0;
  const avgRiskPercent = initialCapital > 0 ? parseFloat(((avgRiskAmount / initialCapital) * 100).toFixed(2)) : 0;
  const maxRiskPercent = initialCapital > 0 ? parseFloat(((maxRiskAmount / initialCapital) * 100).toFixed(2)) : 0;
  const tradesWithSLCount = tradesWithSL.length;
  const tradesWithSLPercent = Math.round((tradesWithSLCount / trades.length) * 100);

  let disciplineRating: 'Excellent' | 'Good' | 'Moderate' | 'Unprotected' = 'Unprotected';
  if (tradesWithSLPercent >= 80) disciplineRating = 'Excellent';
  else if (tradesWithSLPercent >= 50) disciplineRating = 'Good';
  else if (tradesWithSLPercent > 0) disciplineRating = 'Moderate';
  else disciplineRating = 'Unprotected';

  return {
    buckets,
    tradesWithSLCount,
    tradesWithSLPercent,
    avgRiskAmount,
    avgRiskPercent,
    maxRiskAmount,
    maxRiskPercent,
    disciplineRating,
    hasPlannedSL
  };
};
