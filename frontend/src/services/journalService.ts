import { getSessions, getSessionDetails, type PaperSession } from './marketApi';
import { tradingApi } from './tradingApi';
import { useSimulatorStore } from '../features/market/engine/useSimulatorStore';
import type { JournalSession, JournalTrade } from '../features/journal/types/journalTypes';
import { calculateNetPnL, calculateWinRate } from '../utils/tradingAnalytics';

// Realistic sample sessions for educational demonstration if user has not yet traded
const SEED_SESSIONS: JournalSession[] = [];

export const journalService = {
  /**
   * Fetch all journal sessions combining:
   * 1. Backend Paper Trading Sessions (`/api/paper-trading`)
   * 2. Active simulator store session
   * 3. Fallback seeds if no sessions exist
   */
  async getSessions(userId?: string): Promise<JournalSession[]> {
    let combinedSessions: JournalSession[] = [];

    // 1. Fetch from backend API
    try {
      const apiSessions: PaperSession[] = await getSessions();
      if (Array.isArray(apiSessions) && apiSessions.length > 0) {
        const mapped: JournalSession[] = apiSessions.map(s => {
          const stats = s.statistics || {
            totalTrades: 0,
            winRate: 0,
            netPnL: (s.equity || s.balance || s.initialBalance) - s.initialBalance
          };
          return {
            id: s._id,
            name: s.name || `${s.symbol} Session`,
            simulationName: 'Simulator Paper Session',
            simulationId: s._id,
            symbol: s.symbol,
            timeframe: s.timeframe || '15m',
            status: s.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
            startedAt: s.startedAt || new Date().toISOString(),
            completedAt: s.completedAt,
            initialBalance: s.initialBalance || 100000000,
            endingBalance: s.balance || s.equity || s.initialBalance,
            balance: s.balance || s.initialBalance,
            equity: s.equity || s.initialBalance,
            tradesCount: stats.totalTrades || 0,
            winRate: stats.winRate || 0,
            netPnL: stats.netPnL || 0,
            trades: []
          };
        });
        combinedSessions.push(...mapped);
      }
    } catch (err) {
      console.warn('Could not fetch backend paper-trading sessions:', err);
    }

    // 2. Fetch from Simulator Zustand store if active session exists
    try {
      const state = useSimulatorStore.getState();
      if (state.session && !combinedSessions.some(s => s.id === state.session?._id)) {
        const storeSession = state.session;
        const storeTrades: JournalTrade[] = (state.history || []).map(h => ({
          id: h.id,
          symbol: h.symbol,
          side: h.side,
          entryPrice: h.entryPrice,
          exitPrice: h.exitPrice,
          quantity: h.lot,
          lot: h.lot,
          pnl: h.netPnL,
          returnRate: h.entryPrice > 0 ? parseFloat((((h.exitPrice - h.entryPrice) / h.entryPrice) * 100).toFixed(2)) : 0,
          entryTime: h.openTime,
          exitTime: h.closeTime,
          openTime: h.openTime,
          closeTime: h.closeTime,
          status: 'CLOSED',
          closeReason: h.closeReason,
          setupTag: h.setupTag
        }));

        combinedSessions.unshift({
          id: storeSession._id,
          name: storeSession.name || `${storeSession.symbol} Active Session`,
          simulationName: 'Live Market Replay',
          simulationId: storeSession._id,
          symbol: storeSession.symbol,
          timeframe: storeSession.timeframe || '15m',
          status: storeSession.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
          startedAt: storeSession.replayStartTime || new Date().toISOString(),
          initialBalance: storeSession.config.initialBalance || 100000000,
          endingBalance: storeSession.equity || storeSession.balance,
          balance: storeSession.balance,
          equity: storeSession.equity,
          tradesCount: storeTrades.length,
          winRate: calculateWinRate(storeTrades),
          netPnL: calculateNetPnL(storeTrades),
          trades: storeTrades
        });
      }
    } catch (e) {
      console.warn('Could not read simulator store session:', e);
    }

    return combinedSessions;
  },

  /**
   * Get session detail by ID
   */
  async getSessionById(sessionId: string): Promise<JournalSession | null> {
    // 1. Check in Simulator Store
    const state = useSimulatorStore.getState();
    if (state.session && state.session._id === sessionId) {
      const storeTrades: JournalTrade[] = (state.history || []).map(h => ({
        id: h.id,
        symbol: h.symbol,
        side: h.side,
        entryPrice: h.entryPrice,
        exitPrice: h.exitPrice,
        quantity: h.lot,
        lot: h.lot,
        pnl: h.netPnL,
        returnRate: h.entryPrice > 0 ? parseFloat((((h.exitPrice - h.entryPrice) / h.entryPrice) * 100).toFixed(2)) : 0,
        entryTime: h.openTime,
        exitTime: h.closeTime,
        openTime: h.openTime,
        closeTime: h.closeTime,
        status: 'CLOSED',
        closeReason: h.closeReason,
        setupTag: h.setupTag
      }));

      return {
        id: state.session._id,
        name: state.session.name || `${state.session.symbol} Active Session`,
        simulationName: 'Live Market Replay',
        simulationId: state.session._id,
        symbol: state.session.symbol,
        timeframe: state.session.timeframe || '15m',
        status: state.session.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
        startedAt: state.session.replayStartTime || new Date().toISOString(),
        initialBalance: state.session.config.initialBalance || 100000000,
        endingBalance: state.session.equity || state.session.balance,
        balance: state.session.balance,
        equity: state.session.equity,
        tradesCount: storeTrades.length,
        winRate: calculateWinRate(storeTrades),
        netPnL: calculateNetPnL(storeTrades),
        trades: storeTrades
      };
    }

    // 2. Try to fetch from backend
    try {
      const details = await getSessionDetails(sessionId);
      if (details && details.session) {
        const s = details.session;
        const trades: JournalTrade[] = (details.history || []).map((h: any) => ({
          id: h._id || h.id,
          symbol: h.symbol,
          side: h.side,
          entryPrice: h.entryPrice,
          exitPrice: h.exitPrice,
          quantity: h.lot,
          lot: h.lot,
          pnl: h.netPnL,
          returnRate: h.entryPrice > 0 ? parseFloat((((h.exitPrice - h.entryPrice) / h.entryPrice) * 100).toFixed(2)) : 0,
          entryTime: h.openTime,
          exitTime: h.closeTime,
          openTime: h.openTime,
          closeTime: h.closeTime,
          status: 'CLOSED',
          closeReason: h.closeReason,
          setupTag: h.setupTag
        }));

        return {
          id: s._id,
          name: s.name || `${s.symbol} Session`,
          simulationName: 'Simulator Paper Session',
          simulationId: s._id,
          symbol: s.symbol,
          timeframe: s.timeframe || '15m',
          status: s.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          initialBalance: s.initialBalance || 100000000,
          endingBalance: s.balance || s.equity || s.initialBalance,
          balance: s.balance || s.initialBalance,
          equity: s.equity || s.initialBalance,
          tradesCount: trades.length,
          winRate: calculateWinRate(trades),
          netPnL: calculateNetPnL(trades),
          trades
        };
      }
    } catch (e) {
      console.warn('Failed to load session details from backend:', e);
    }

    // Fallback: return first seed session so it never crashes
    return SEED_SESSIONS[0];
  }
};
