import type { TradeLike } from '../../../utils/tradingAnalytics';

export type JournalTrade = TradeLike;

export interface JournalSession {
  id: string;
  name: string;
  simulationName: string;
  simulationId?: string;
  symbol: string;
  timeframe?: string;
  status: 'ACTIVE' | 'COMPLETED';
  startedAt: string;
  completedAt?: string;
  initialBalance: number;
  endingBalance: number;
  balance: number;
  equity: number;
  tradesCount: number;
  winRate: number;
  netPnL: number;
  trades: JournalTrade[];
}

export interface JournalFilterState {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'COMPLETED';
  symbol: string;
  simulation: string;
  startDate?: string;
  endDate?: string;
}

export interface JournalSummaryStats {
  totalSessions: number;
  totalTrades: number;
  winRate: number;
  netPnL: number;
}
