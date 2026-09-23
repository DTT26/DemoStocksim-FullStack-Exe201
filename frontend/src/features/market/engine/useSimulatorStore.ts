import { create } from 'zustand';
import type { SimSession, SimPosition, SimOrder, SimHistory, SimConfig } from './simulatorTypes';

// Point value multiplier (e.g. 1 lot of EURUSD = 100,000, 1 lot of BTC = 1, etc.)
// For simplicity in this demo, let's assume contract size = 100000 for everything,
// or we make position value = lot * currentPrice * contractSize.
// Let's assume standard forex lot size: 100,000 units.
const CONTRACT_SIZE = 100000;

interface SimulatorState {
  isActive: boolean;
  session: SimSession | null;
  positions: SimPosition[];
  orders: SimOrder[];
  history: SimHistory[];

  // Replay tick data
  currentPrice: number; // Mid price
  currentBid: number;
  currentAsk: number;
  currentTime: string;

  // Actions
  startSession: (session: SimSession, initialPrice?: number) => void;
  loadSession: (session: SimSession, positions: SimPosition[], orders: SimOrder[], history: SimHistory[], initialPrice?: number) => void;
  endSession: () => void;
  
  // Replay Tick (Called heavily)
  tick: (price: number, time: string) => void;

  // Trading Actions
  executeMarketOrder: (side: 'LONG' | 'SHORT', lot: number, sl?: number, tp?: number, setupTag?: string) => void;
  placePendingOrder: (type: 'LIMIT' | 'STOP', side: 'LONG' | 'SHORT', price: number, lot: number, sl?: number, tp?: number, setupTag?: string) => void;
  closePosition: (positionId: string, reason?: SimHistory['closeReason']) => void;
  cancelOrder: (orderId: string) => void;
  
  // Risk Mgmt
  updateTPSL: (positionId: string, sl?: number, tp?: number) => void;
  setLeverage: (leverage: number) => void;
  
  // App state mgmt
  reset: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  isActive: false,
  session: null,
  positions: [],
  orders: [],
  history: [],

  currentPrice: 0,
  currentBid: 0,
  currentAsk: 0,
  currentTime: '',

  reset: () => {
    set({
      isActive: false,
      session: null,
      positions: [],
      orders: [],
      history: [],
      currentPrice: 0,
      currentBid: 0,
      currentAsk: 0,
      currentTime: '',
    });
  },

  startSession: (session, initialPrice) => {
    const initP = initialPrice && initialPrice > 0 ? initialPrice : 0;
    const spread = session.config.spread > 0 ? session.config.spread : 0.2;
    set({
      isActive: true,
      session,
      positions: [],
      orders: [],
      history: [],
      currentPrice: initP,
      currentBid: initP,
      currentAsk: initP > 0 ? initP + spread : 0,
      currentTime: session.replayStartTime,
    });
  },

  loadSession: (session, positions, orders, history, initialPrice) => {
    const initP = initialPrice && initialPrice > 0 ? initialPrice : 0;
    const spread = session.config.spread > 0 ? session.config.spread : 0.2;
    set({
      isActive: true,
      session,
      positions,
      orders,
      history,
      currentPrice: initP,
      currentBid: initP,
      currentAsk: initP > 0 ? initP + spread : 0,
      currentTime: session.replayCurrentTime,
    });
  },

  endSession: async () => {
    const state = get();
    if (!state.session) return;
    
    // Close all open positions first
    const positions = [...state.positions];
    for (const pos of positions) {
      state.closePosition(pos.id, 'MANUAL');
    }
    
    // Wait for the state to update from closePosition calls
    const finalState = get();
    if (!finalState.session) return;

    const history = finalState.history;
    
    // Calculate statistics
    const totalTrades = history.length;
    const winningTrades = history.filter(h => h.netPnL > 0);
    const losingTrades = history.filter(h => h.netPnL <= 0);
    
    const wins = winningTrades.length;
    const losses = losingTrades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    const grossProfit = winningTrades.reduce((sum, h) => sum + h.netPnL, 0);
    const grossLoss = losingTrades.reduce((sum, h) => sum + Math.abs(h.netPnL), 0);
    const netPnL = grossProfit - grossLoss;
    
    const averageWin = wins > 0 ? grossProfit / wins : 0;
    const averageLoss = losses > 0 ? grossLoss / losses : 0;
    const largestWin = wins > 0 ? Math.max(...winningTrades.map(h => h.netPnL)) : 0;
    const largestLoss = losses > 0 ? Math.max(...losingTrades.map(h => Math.abs(h.netPnL))) : 0;
    
    const maxDrawdown = 0; // Simple stub, real MDD needs equity curve tracking
    const averageRR = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 999 : 0;

    const statistics = {
      totalTrades, wins, losses, winRate, grossProfit, grossLoss, netPnL,
      averageWin, averageLoss, largestWin, largestLoss, maxDrawdown, averageRR
    };

    const finalSession: SimSession = {
      ...finalState.session,
      status: 'completed',
      statistics
    };

    // Auto-save to backend
    try {
      // @ts-ignore
      const { updateSession } = await import('../../../services/marketApi');
      const payload = {
        ...finalSession,
        completedAt: new Date().toISOString(),
        currentBalance: finalState.session.balance // for legacy
      };
      
      await updateSession(finalSession._id, {
        sessionData: payload,
        positions: [], // all closed
        orders: finalState.orders, // could cancel pending too, but backend will just store them or delete them
        history: finalState.history
      });
      // Fire a custom event to notify TradingTerminal to refresh sessions
      window.dispatchEvent(new Event('simulator-session-ended'));
    } catch (e) {
      console.error('Failed to sync completed session to backend', e);
    }

    set({ session: finalSession, isActive: false });
  },

  tick: (price: number, time: string) => {
    const state = get();
    if (!state.isActive || !state.session) return;

    const config = state.session.config;
    // Spread is in points. 1 point = 0.00001 (for 5-digit brokers) or 0.01 (for JPY/gold).
    // For crypto, maybe it's just raw value. For now, let's assume 'spread' in UI is literally the price difference (or pips).
    // Let's assume UI spread of '20' means 0.20 for indices, 0.00020 for forex. 
    // To make it simple, let's treat `spread` config as exact price value (e.g. spread=0.2).
    const bid = price; 
    const ask = price + config.spread;

    set(draft => {
      const positions = [...draft.positions];
      const orders = [...draft.orders];
      const history = [...draft.history];
      let balance = draft.session!.balance;
      
      const prevDate = draft.currentTime ? new Date(draft.currentTime).getUTCDate() : null;
      const currDate = new Date(time).getUTCDate();
      const isNewDay = prevDate !== null && currDate !== prevDate;

      // Apply Daily Swap if day changed
      if (isNewDay) {
        for (const pos of positions) {
          const swap = pos.side === 'LONG' ? config.swapLong : config.swapShort;
          pos.accumulatedSwap += swap * pos.lot;
        }
      }
      
      let usedMargin = 0;
      let floatingPnL = 0;

      // 1. Check open positions (SL/TP and PnL)
      for (let i = positions.length - 1; i >= 0; i--) {
        const pos = positions[i];
        
        // PnL Calculation
        const currentExecPrice = pos.side === 'LONG' ? bid : ask;
        const actualQty = pos.lot * CONTRACT_SIZE;
        const rawPnL = pos.side === 'LONG' 
          ? (currentExecPrice - pos.entryPrice) * actualQty
          : (pos.entryPrice - currentExecPrice) * actualQty;
        
        const netPnL = rawPnL - pos.commission + pos.accumulatedSwap;
        
        floatingPnL += netPnL;
        usedMargin += pos.margin;

        // Check SL / TP
        let closeReason: SimHistory['closeReason'] | null = null;
        
        if (pos.side === 'LONG') {
          if (pos.sl && bid <= pos.sl) closeReason = 'STOP_LOSS';
          if (pos.tp && bid >= pos.tp) closeReason = 'TAKE_PROFIT';
        } else {
          if (pos.sl && ask >= pos.sl) closeReason = 'STOP_LOSS';
          if (pos.tp && ask <= pos.tp) closeReason = 'TAKE_PROFIT';
        }

        if (closeReason) {
          // Close position
          balance += netPnL;
          
          history.push({
            id: Date.now().toString() + Math.random(),
            symbol: pos.symbol,
            side: pos.side,
            lot: pos.lot,
            entryPrice: pos.entryPrice,
            exitPrice: currentExecPrice,
            closeReason,
            grossPnL: rawPnL,
            netPnL,
            setupTag: pos.setupTag,
            openTime: pos.createdAt,
            closeTime: time
          });
          
          usedMargin -= pos.margin;
          floatingPnL -= netPnL;
          positions.splice(i, 1);
        }
      }

      const equity = balance + floatingPnL;
      const freeMargin = equity - usedMargin;

      // 2. Check Margin Call / Stop Out
      // Stop Out at 50% Margin Level
      if (usedMargin > 0) {
        const marginLevel = (equity / usedMargin) * 100;
        if (marginLevel <= 50) {
          // Force close most losing position
          let worstPosIndex = -1;
          let worstPnL = 0;
          for (let k = 0; k < positions.length; k++) {
            const p = positions[k];
            const pExecPrice = p.side === 'LONG' ? bid : ask;
            const pQty = p.lot * CONTRACT_SIZE;
            const pPnL = p.side === 'LONG' 
              ? (pExecPrice - p.entryPrice) * pQty 
              : (p.entryPrice - pExecPrice) * pQty;
            if (pPnL < worstPnL) {
              worstPnL = pPnL;
              worstPosIndex = k;
            }
          }

          if (worstPosIndex !== -1) {
            const forcePos = positions[worstPosIndex];
            const forceExecPrice = forcePos.side === 'LONG' ? bid : ask;
            const forceQty = forcePos.lot * CONTRACT_SIZE;
            const forceRawPnL = forcePos.side === 'LONG'
              ? (forceExecPrice - forcePos.entryPrice) * forceQty
              : (forcePos.entryPrice - forceExecPrice) * forceQty;
            const forceNetPnL = forceRawPnL - forcePos.commission + forcePos.accumulatedSwap;

            balance += forceNetPnL;
            history.push({
              id: Date.now().toString() + Math.random(),
              symbol: forcePos.symbol,
              side: forcePos.side,
              lot: forcePos.lot,
              entryPrice: forcePos.entryPrice,
              exitPrice: forceExecPrice,
              closeReason: 'STOP_OUT',
              grossPnL: forceRawPnL,
              netPnL: forceNetPnL,
              setupTag: forcePos.setupTag,
              openTime: forcePos.createdAt,
              closeTime: time
            });
            positions.splice(worstPosIndex, 1);
          }
        }
      }

      // 3. Check Pending Orders
      for (let i = orders.length - 1; i >= 0; i--) {
        const ord = orders[i];
        let triggered = false;
        let execPrice = ord.limitPrice;

        if (ord.side === 'LONG') {
          if (ord.type === 'LIMIT' && ask <= ord.limitPrice) { triggered = true; execPrice = ask; } // Slippage to ask
          if (ord.type === 'STOP' && ask >= ord.limitPrice) { triggered = true; execPrice = ask; }
        } else {
          if (ord.type === 'LIMIT' && bid >= ord.limitPrice) { triggered = true; execPrice = bid; }
          if (ord.type === 'STOP' && bid <= ord.limitPrice) { triggered = true; execPrice = bid; }
        }

        if (triggered) {
          // Open position
          const ordActualQty = ord.lot * CONTRACT_SIZE;
          const reqMargin = (execPrice * ordActualQty) / config.leverage;
          const comm = config.commission * ord.lot;
          
          // Check max margin limit before executing
          const maxAllowedMargin = equity * (config.maxMarginPercent / 100);
          const availableMargin = maxAllowedMargin - usedMargin;
          
          if (availableMargin >= reqMargin) {
            positions.push({
              id: Date.now().toString() + Math.random(),
              symbol: ord.symbol,
              side: ord.side,
              lot: ord.lot,
              entryPrice: execPrice,
              sl: ord.sl,
              tp: ord.tp,
              setupTag: ord.setupTag,
              margin: reqMargin,
              commission: comm,
              accumulatedSwap: 0,
              createdAt: time
            });
          }
          // Order is removed whether it succeeded or failed due to margin
          orders.splice(i, 1);
        }
      }

      // Update state
      const finalEquity = balance + floatingPnL;
      
      return {
        currentPrice: price,
        currentBid: bid,
        currentAsk: ask,
        currentTime: time,
        positions,
        orders,
        history,
        session: {
          ...draft.session!,
          balance,
          equity: finalEquity,
          usedMargin,
          freeMargin: finalEquity - usedMargin,
          replayCurrentTime: time
        }
      };
    });
  },

  executeMarketOrder: (side, lot, sl, tp, setupTag) => {
    const state = get();
    if (!state.isActive || !state.session) return;
    
    const { currentBid, currentAsk, currentTime, session } = state;
    const config = session.config;

    let bid = currentBid;
    let ask = currentAsk;
    if (bid <= 0 || ask <= 0) {
      const base = state.currentPrice > 0 ? state.currentPrice : 114.36;
      bid = base;
      ask = base + (config.spread > 0 ? config.spread : 0.2);
    }

    const execPrice = side === 'LONG' ? ask : bid;
    const actualQty = lot * CONTRACT_SIZE;
    const margin = (execPrice * actualQty) / config.leverage;
    const commission = config.commission * lot;

    const maxAllowedMargin = session.equity * (config.maxMarginPercent / 100);
    const availableMargin = maxAllowedMargin - session.usedMargin;

    if (availableMargin < margin) {
      console.warn('Order Rejected: Exceeds max margin percent');
      return;
    }

    const newPos: SimPosition = {
      id: Date.now().toString(),
      symbol: session.symbol,
      side,
      lot,
      entryPrice: execPrice,
      sl,
      tp,
      setupTag,
      margin,
      commission,
      accumulatedSwap: 0,
      createdAt: currentTime || new Date().toISOString()
    };

    set(draft => {
      const positions = [...draft.positions, newPos];
      const usedMargin = positions.reduce((sum, p) => sum + p.margin, 0);
      return {
        positions,
        session: {
          ...draft.session!,
          usedMargin,
          freeMargin: draft.session!.equity - usedMargin
        }
      };
    });
  },

  placePendingOrder: (type, side, price, lot, sl, tp, setupTag) => {
    const state = get();
    if (!state.isActive || !state.session) return;

    const newOrder: SimOrder = {
      id: Date.now().toString(),
      symbol: state.session.symbol,
      side,
      type,
      limitPrice: price,
      lot,
      sl,
      tp,
      setupTag,
      createdAt: state.currentTime || new Date().toISOString()
    };

    set(draft => ({
      orders: [...draft.orders, newOrder]
    }));
  },

  closePosition: (positionId, reason = 'MANUAL') => {
    const state = get();
    if (!state.isActive || !state.session) return;

    set(draft => {
      const positions = [...draft.positions];
      const history = [...draft.history];
      let balance = draft.session!.balance;

      const posIndex = positions.findIndex(p => p.id === positionId);
      if (posIndex === -1) return draft;

      const pos = positions[posIndex];
      let bid = draft.currentBid;
      let ask = draft.currentAsk;
      if (bid <= 0 || ask <= 0) {
        const base = draft.currentPrice > 0 ? draft.currentPrice : pos.entryPrice;
        bid = base;
        ask = base + (draft.session?.config.spread || 0.2);
      }

      const currentExecPrice = pos.side === 'LONG' ? bid : ask;
      const actualQty = pos.lot * CONTRACT_SIZE;
      const rawPnL = pos.side === 'LONG' 
        ? (currentExecPrice - pos.entryPrice) * actualQty
        : (pos.entryPrice - currentExecPrice) * actualQty;
      
      const netPnL = rawPnL - pos.commission + pos.accumulatedSwap;
      
      balance += netPnL;

      history.push({
        id: Date.now().toString(),
        symbol: pos.symbol,
        side: pos.side,
        lot: pos.lot,
        entryPrice: pos.entryPrice,
        exitPrice: currentExecPrice,
        closeReason: reason,
        grossPnL: rawPnL,
        netPnL,
        setupTag: pos.setupTag,
        openTime: pos.createdAt,
        closeTime: draft.currentTime || new Date().toISOString()
      });

      positions.splice(posIndex, 1);

      const usedMargin = positions.reduce((sum, p) => sum + p.margin, 0);
      const remainingFloatingPnL = positions.reduce((sum, p) => {
        const pExecPrice = p.side === 'LONG' ? bid : ask;
        const pQty = p.lot * CONTRACT_SIZE;
        const pRaw = p.side === 'LONG' ? (pExecPrice - p.entryPrice) * pQty : (p.entryPrice - pExecPrice) * pQty;
        return sum + (pRaw - p.commission + p.accumulatedSwap);
      }, 0);
      const equity = balance + remainingFloatingPnL;

      return {
        positions,
        history,
        session: {
          ...draft.session!,
          balance,
          equity,
          usedMargin,
          freeMargin: equity - usedMargin
        }
      };
    });
  },

  cancelOrder: (orderId) => {
    set(draft => ({
      orders: draft.orders.filter(o => o.id !== orderId)
    }));
  },

  updateTPSL: (positionId, sl, tp) => {
    set(draft => ({
      positions: draft.positions.map(p => p.id === positionId ? { ...p, sl, tp } : p)
    }));
  },

  setLeverage: (leverage) => {
    set(draft => {
      if (!draft.session) return {};
      return {
        session: {
          ...draft.session,
          config: {
            ...draft.session.config,
            leverage
          }
        }
      };
    });
  }
}));

