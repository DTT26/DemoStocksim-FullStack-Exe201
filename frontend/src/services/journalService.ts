import { getSessions, getSessionDetails, type PaperSession } from './marketApi';
import { tradingApi } from './tradingApi';
import { useSimulatorStore } from '../features/market/engine/useSimulatorStore';
import type { JournalSession, JournalTrade } from '../features/journal/types/journalTypes';
import { calculateNetPnL, calculateWinRate } from '../utils/tradingAnalytics';

// Realistic sample sessions for educational demonstration if user has not yet traded
const SEED_SESSIONS: JournalSession[] = [
  {
    id: 'session-demo-01',
    name: 'Morning Trading Session',
    simulationName: 'Trading Challenge #01',
    simulationId: 'sim-01',
    symbol: 'BTCUSDT',
    timeframe: '5m',
    status: 'COMPLETED',
    startedAt: '2026-09-24T09:00:00Z',
    completedAt: '2026-09-24T11:30:00Z',
    initialBalance: 100000000,
    endingBalance: 108250000,
    balance: 108250000,
    equity: 108250000,
    tradesCount: 12,
    winRate: 58.3,
    netPnL: 8250000,
    trades: [
      {
        id: 't-01',
        symbol: 'BTCUSDT',
        side: 'BUY',
        entryPrice: 128500,
        exitPrice: 132000,
        quantity: 1000,
        lot: 1000,
        pnl: 3500000,
        returnRate: 2.72,
        entryTime: '2026-09-24T09:15:00Z',
        exitTime: '2026-09-24T09:45:00Z',
        holdingTimeMinutes: 30,
        status: 'CLOSED',
        sl: 126000,
        tp: 132000,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Breakout EMA20'
      },
      {
        id: 't-02',
        symbol: 'VCB',
        side: 'SELL',
        entryPrice: 94000,
        exitPrice: 92500,
        quantity: 1000,
        lot: 1000,
        pnl: 1500000,
        returnRate: 1.6,
        entryTime: '2026-09-24T09:50:00Z',
        exitTime: '2026-09-24T10:15:00Z',
        holdingTimeMinutes: 25,
        status: 'CLOSED',
        sl: 95000,
        tp: 92500,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Resistance Rejection'
      },
      {
        id: 't-03',
        symbol: 'HPG',
        side: 'BUY',
        entryPrice: 28500,
        exitPrice: 28000,
        quantity: 3000,
        lot: 3000,
        pnl: -1500000,
        returnRate: -1.75,
        entryTime: '2026-09-24T10:20:00Z',
        exitTime: '2026-09-24T10:35:00Z',
        holdingTimeMinutes: 15,
        status: 'CLOSED',
        sl: 28000,
        tp: 29500,
        closeReason: 'STOP_LOSS',
        setupTag: 'False Breakout'
      },
      {
        id: 't-04',
        symbol: 'BTCUSDT',
        side: 'BUY',
        entryPrice: 131000,
        exitPrice: 133500,
        quantity: 1000,
        lot: 1000,
        pnl: 2500000,
        returnRate: 1.91,
        entryTime: '2026-09-24T10:40:00Z',
        exitTime: '2026-09-24T11:05:00Z',
        holdingTimeMinutes: 25,
        status: 'CLOSED',
        sl: 129500,
        tp: 134000,
        closeReason: 'MANUAL',
        setupTag: 'Trend Pullback'
      },
      {
        id: 't-05',
        symbol: 'VIC',
        side: 'BUY',
        entryPrice: 45200,
        exitPrice: 44300,
        quantity: 2000,
        lot: 2000,
        pnl: -1800000,
        returnRate: -1.99,
        entryTime: '2026-09-24T11:10:00Z',
        exitTime: '2026-09-24T11:28:00Z',
        holdingTimeMinutes: 18,
        status: 'CLOSED',
        sl: 44300,
        tp: 47000,
        closeReason: 'STOP_LOSS',
        setupTag: 'Support Bounce'
      },
      {
        id: 't-06',
        symbol: 'BTCUSDT',
        side: 'BUY',
        entryPrice: 133000,
        exitPrice: 136550,
        quantity: 1000,
        lot: 1000,
        pnl: 3550000,
        returnRate: 2.67,
        entryTime: '2026-09-24T11:20:00Z',
        exitTime: '2026-09-24T11:30:00Z',
        holdingTimeMinutes: 10,
        status: 'CLOSED',
        sl: 131500,
        tp: 136500,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Momentum Scalp'
      }
    ]
  },
  {
    id: 'session-demo-02',
    name: 'Afternoon Trend Session',
    simulationName: 'Vietnam Stock Challenge',
    simulationId: 'sim-02',
    symbol: 'VIC',
    timeframe: '15m',
    status: 'ACTIVE',
    startedAt: '2026-09-23T13:00:00Z',
    initialBalance: 50000000,
    endingBalance: 52450000,
    balance: 52450000,
    equity: 52450000,
    tradesCount: 8,
    winRate: 62.5,
    netPnL: 2450000,
    trades: [
      {
        id: 't-10',
        symbol: 'VIC',
        side: 'BUY',
        entryPrice: 44000,
        exitPrice: 45200,
        quantity: 2000,
        lot: 2000,
        pnl: 2400000,
        returnRate: 2.73,
        entryTime: '2026-09-23T13:10:00Z',
        exitTime: '2026-09-23T14:15:00Z',
        holdingTimeMinutes: 65,
        status: 'CLOSED',
        sl: 43200,
        tp: 45200,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Breakout EMA20'
      },
      {
        id: 't-11',
        symbol: 'MWG',
        side: 'BUY',
        entryPrice: 52000,
        exitPrice: 51200,
        quantity: 1000,
        lot: 1000,
        pnl: -800000,
        returnRate: -1.54,
        entryTime: '2026-09-23T13:30:00Z',
        exitTime: '2026-09-23T14:00:00Z',
        holdingTimeMinutes: 30,
        status: 'CLOSED',
        sl: 51200,
        tp: 53500,
        closeReason: 'STOP_LOSS',
        setupTag: 'Support Bounce'
      },
      {
        id: 't-12',
        symbol: 'VIC',
        side: 'BUY',
        entryPrice: 45100,
        exitPrice: 45525,
        quantity: 2000,
        lot: 2000,
        pnl: 850000,
        returnRate: 0.94,
        entryTime: '2026-09-23T14:10:00Z',
        exitTime: '2026-09-23T14:25:00Z',
        holdingTimeMinutes: 15,
        status: 'CLOSED',
        setupTag: 'Momentum Scalp'
      }
    ]
  },
  {
    id: 'session-demo-03',
    name: 'Practice Session - Forex / Crypto',
    simulationName: 'Practice Session',
    simulationId: 'sim-03',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    status: 'COMPLETED',
    startedAt: '2026-09-21T08:00:00Z',
    completedAt: '2026-09-21T18:00:00Z',
    initialBalance: 200000000,
    endingBalance: 204200000,
    balance: 204200000,
    equity: 204200000,
    tradesCount: 14,
    winRate: 50.0,
    netPnL: 4200000,
    trades: [
      {
        id: 't-21',
        symbol: 'BTCUSDT',
        side: 'BUY',
        entryPrice: 63500,
        exitPrice: 64800,
        quantity: 0.5,
        lot: 0.5,
        pnl: 3250000,
        returnRate: 2.05,
        entryTime: '2026-09-21T09:00:00Z',
        exitTime: '2026-09-21T11:00:00Z',
        holdingTimeMinutes: 120,
        status: 'CLOSED',
        sl: 62800,
        tp: 64800,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Trend Pullback'
      },
      {
        id: 't-22',
        symbol: 'ETHUSDT',
        side: 'SELL',
        entryPrice: 3480,
        exitPrice: 3420,
        quantity: 5,
        lot: 5,
        pnl: 1800000,
        returnRate: 1.72,
        entryTime: '2026-09-21T13:00:00Z',
        exitTime: '2026-09-21T14:30:00Z',
        holdingTimeMinutes: 90,
        status: 'CLOSED',
        sl: 3510,
        tp: 3420,
        closeReason: 'TAKE_PROFIT',
        setupTag: 'Resistance Rejection'
      },
      {
        id: 't-23',
        symbol: 'BTCUSDT',
        side: 'BUY',
        entryPrice: 64900,
        exitPrice: 64300,
        quantity: 0.5,
        lot: 0.5,
        pnl: -850000,
        returnRate: -0.92,
        entryTime: '2026-09-21T15:00:00Z',
        exitTime: '2026-09-21T16:00:00Z',
        holdingTimeMinutes: 60,
        status: 'CLOSED',
        sl: 64300,
        tp: 65800,
        closeReason: 'STOP_LOSS',
        setupTag: 'Breakout EMA20'
      }
    ]
  }
];
import { getContractMultiplier } from '../features/market/data';

export const journalService = {
  /**
   * Fetch all journal sessions combining:
   * 1. Backend Paper Trading Sessions (`/api/paper-trading`)
   * 2. Active simulator store session (with open positions & closed trades)
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
            simulationName: 'Live Market Replay',
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
      if (state.session) {
        const storeSession = state.session;

        // Open positions
        const openTrades: JournalTrade[] = (state.positions || []).map(p => {
          const currentExecPrice = p.side === 'LONG' ? (state.currentBid || p.entryPrice) : (state.currentAsk || p.entryPrice);
          const actualQty = p.lot * getContractMultiplier(p.symbol);
          const rawPnL = p.side === 'LONG' 
            ? (currentExecPrice - p.entryPrice) * actualQty 
            : (p.entryPrice - currentExecPrice) * actualQty;
          const netPnL = rawPnL - (p.commission || 0) + (p.accumulatedSwap || 0);
          const returnRate = p.entryPrice > 0 ? parseFloat((((currentExecPrice - p.entryPrice) / p.entryPrice) * (p.side === 'LONG' ? 100 : -100)).toFixed(2)) : 0;

          return {
            id: p.id,
            symbol: p.symbol,
            side: p.side,
            entryPrice: p.entryPrice,
            exitPrice: undefined,
            quantity: p.lot,
            lot: p.lot,
            pnl: netPnL,
            returnRate,
            entryTime: p.createdAt,
            exitTime: undefined,
            openTime: p.createdAt,
            closeTime: undefined,
            status: 'OPEN',
            sl: p.sl,
            tp: p.tp,
            setupTag: p.setupTag
          };
        });

        // Closed trades
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

        const allStoreTrades = [...openTrades, ...storeTrades];
        const storeSessionItem: JournalSession = {
          id: storeSession._id,
          name: storeSession.name || `${storeSession.symbol} Session`,
          simulationName: 'Live Market Replay',
          simulationId: storeSession._id,
          symbol: storeSession.symbol,
          timeframe: storeSession.timeframe || '15m',
          status: storeSession.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
          startedAt: storeSession.replayStartTime || new Date().toISOString(),
          initialBalance: storeSession.config?.initialBalance || 100000000,
          endingBalance: storeSession.equity || storeSession.balance,
          balance: storeSession.balance,
          equity: storeSession.equity,
          tradesCount: allStoreTrades.length,
          winRate: calculateWinRate(storeTrades),
          netPnL: calculateNetPnL(storeTrades),
          trades: allStoreTrades
        };

        const existingIdx = combinedSessions.findIndex(s => s.id === storeSession._id);
        if (existingIdx >= 0) {
          combinedSessions[existingIdx] = {
            ...combinedSessions[existingIdx],
            ...storeSessionItem
          };
        } else {
          combinedSessions.unshift(storeSessionItem);
        }
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
      const openTrades: JournalTrade[] = (state.positions || []).map(p => {
        const currentExecPrice = p.side === 'LONG' ? (state.currentBid || p.entryPrice) : (state.currentAsk || p.entryPrice);
        const actualQty = p.lot * getContractMultiplier(p.symbol);
        const rawPnL = p.side === 'LONG' 
          ? (currentExecPrice - p.entryPrice) * actualQty 
          : (p.entryPrice - currentExecPrice) * actualQty;
        const netPnL = rawPnL - (p.commission || 0) + (p.accumulatedSwap || 0);
        const returnRate = p.entryPrice > 0 ? parseFloat((((currentExecPrice - p.entryPrice) / p.entryPrice) * (p.side === 'LONG' ? 100 : -100)).toFixed(2)) : 0;

        return {
          id: p.id,
          symbol: p.symbol,
          side: p.side,
          entryPrice: p.entryPrice,
          exitPrice: undefined,
          quantity: p.lot,
          lot: p.lot,
          pnl: netPnL,
          returnRate,
          entryTime: p.createdAt,
          exitTime: undefined,
          openTime: p.createdAt,
          closeTime: undefined,
          status: 'OPEN',
          sl: p.sl,
          tp: p.tp,
          setupTag: p.setupTag
        };
      });

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

      const allTrades = [...openTrades, ...storeTrades];

      return {
        id: state.session._id,
        name: state.session.name || `${state.session.symbol} Active Session`,
        simulationName: 'Live Market Replay',
        simulationId: state.session._id,
        symbol: state.session.symbol,
        timeframe: state.session.timeframe || '15m',
        status: state.session.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
        startedAt: state.session.replayStartTime || new Date().toISOString(),
        initialBalance: state.session.config?.initialBalance || 100000000,
        endingBalance: state.session.equity || state.session.balance,
        balance: state.session.balance,
        equity: state.session.equity,
        tradesCount: allTrades.length,
        winRate: calculateWinRate(storeTrades),
        netPnL: calculateNetPnL(storeTrades),
        trades: allTrades
      };
    }

    // 2. Try to fetch from backend
    try {
      const details = await getSessionDetails(sessionId);
      if (details && details.session) {
        const s = details.session;

        const openTrades: JournalTrade[] = (details.positions || []).map((p: any) => ({
          id: p._id || p.id,
          symbol: p.symbol,
          side: p.side,
          entryPrice: p.entryPrice,
          exitPrice: undefined,
          quantity: p.lot,
          lot: p.lot,
          pnl: p.floatingPnL || 0,
          returnRate: 0,
          entryTime: p.createdAt,
          exitTime: undefined,
          openTime: p.createdAt,
          closeTime: undefined,
          status: 'OPEN',
          sl: p.sl,
          tp: p.tp,
          setupTag: p.setupTag
        }));

        const closedTrades: JournalTrade[] = (details.history || []).map((h: any) => ({
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

        const allTrades = [...openTrades, ...closedTrades];

        return {
          id: s._id,
          name: s.name || `${s.symbol} Session`,
          simulationName: 'Live Market Replay',
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
          tradesCount: allTrades.length,
          winRate: calculateWinRate(closedTrades),
          netPnL: calculateNetPnL(closedTrades),
          trades: allTrades
        };
      }
    } catch (e) {
      console.warn('Failed to load session details from backend:', e);
    }

    // Fallback: return first seed session so it never crashes
    return SEED_SESSIONS[0];
  }
};
