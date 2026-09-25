export interface SimConfig {
  initialBalance: number;
  leverage: number;
  minLot: number;
  lotStep: number;
  maxMarginPercent: number;
  spread: number;
  commission: number;
  swapLong: number;
  swapShort: number;
}

export interface SimPosition {
  id: string; // temporary id for frontend
  symbol: string;
  side: 'LONG' | 'SHORT';
  lot: number;
  entryPrice: number;
  sl?: number;
  tp?: number;
  setupTag?: string;
  margin: number;
  commission: number;
  accumulatedSwap: number;
  createdAt: string;
}

export interface SimOrder {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  type: 'LIMIT' | 'STOP';
  limitPrice: number;
  lot: number;
  sl?: number;
  tp?: number;
  setupTag?: string;
  createdAt: string;
}

export interface SimHistory {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  lot: number;
  entryPrice: number;
  exitPrice: number;
  closeReason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'STOP_OUT';
  grossPnL: number;
  netPnL: number;
  setupTag?: string;
  openTime: string;
  closeTime: string;
}

export interface SimSession {
  _id: string;
  name: string;
  symbol: string;
  timeframe: string;
  
  config: SimConfig;

  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;

  replayStartTime: string;
  replayCurrentTime: string;

  status: 'running' | 'completed';

  statistics?: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    grossProfit: number;
    grossLoss: number;
    netPnL: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    maxDrawdown: number;
    averageRR: number;
  };
}
