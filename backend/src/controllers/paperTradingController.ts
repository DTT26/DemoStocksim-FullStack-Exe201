import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import PaperTradingSession from '../models/PaperTradingSession';
import PaperTradingPosition from '../models/PaperTradingPosition';
import PaperTradingOrder from '../models/PaperTradingOrder';
import PaperTradingHistory from '../models/PaperTradingHistory';

// Get all sessions for the logged in user
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await PaperTradingSession.find({ user: req.user?._id }).sort({ startedAt: -1 }).lean();

    // Enrich sessions with up-to-date trade counts & stats if running or if statistics not stored
    for (const session of sessions as any[]) {
      const historyCount = await PaperTradingHistory.countDocuments({ session: session._id });
      const positionsCount = await PaperTradingPosition.countDocuments({ session: session._id });
      const totalTrades = historyCount + positionsCount;

      if (!session.statistics || session.status === 'running') {
        const historyItems = await PaperTradingHistory.find({ session: session._id }).lean();
        const wins = historyItems.filter((h: any) => (h.netPnL || 0) > 0).length;
        const winRate = historyCount > 0 ? parseFloat(((wins / historyCount) * 100).toFixed(1)) : 0;
        const netPnL = historyItems.reduce((acc: number, h: any) => acc + (h.netPnL || 0), 0);

        session.statistics = {
          totalTrades,
          wins,
          losses: historyCount - wins,
          winRate,
          grossProfit: historyItems.filter((h: any) => (h.netPnL || 0) > 0).reduce((acc: number, h: any) => acc + (h.netPnL || 0), 0),
          grossLoss: historyItems.filter((h: any) => (h.netPnL || 0) < 0).reduce((acc: number, h: any) => acc + Math.abs(h.netPnL || 0), 0),
          netPnL,
          averageWin: wins > 0 ? historyItems.filter((h: any) => (h.netPnL || 0) > 0).reduce((acc: number, h: any) => acc + (h.netPnL || 0), 0) / wins : 0,
          averageLoss: (historyCount - wins) > 0 ? historyItems.filter((h: any) => (h.netPnL || 0) < 0).reduce((acc: number, h: any) => acc + Math.abs(h.netPnL || 0), 0) / (historyCount - wins) : 0,
          largestWin: wins > 0 ? Math.max(...historyItems.filter((h: any) => (h.netPnL || 0) > 0).map((h: any) => h.netPnL || 0)) : 0,
          largestLoss: (historyCount - wins) > 0 ? Math.max(...historyItems.filter((h: any) => (h.netPnL || 0) < 0).map((h: any) => Math.abs(h.netPnL || 0))) : 0,
          maxDrawdown: 0,
          averageRR: 0
        };
      } else {
        session.statistics.totalTrades = totalTrades || session.statistics.totalTrades || 0;
      }
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get single session details to resume
export const getSessionDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await PaperTradingSession.findOne({ _id: id, user: req.user?._id });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    const positions = await PaperTradingPosition.find({ session: id });
    const orders = await PaperTradingOrder.find({ session: id });
    const history = await PaperTradingHistory.find({ session: id });

    res.json({
      session,
      positions,
      orders,
      history
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session details', error });
  }
};

// Create a new session
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      name, symbol, timeframe, initialBalance, leverage, minLot, lotStep, 
      maxMarginPercent, spread, commission, swapLong, swapShort, replayStartTime
    } = req.body;

    const newSession = new PaperTradingSession({
      user: req.user?._id,
      name: name || `${symbol} - ${timeframe}`,
      symbol,
      timeframe,
      initialBalance,
      leverage,
      minLot,
      lotStep,
      maxMarginPercent,
      spread,
      commission,
      swapLong,
      swapShort,
      balance: initialBalance,
      equity: initialBalance,
      usedMargin: 0,
      freeMargin: initialBalance,
      replayStartTime,
      replayCurrentTime: replayStartTime,
      status: 'running'
    });
    
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error });
  }
};

// Sync session state (autosave/update)
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sessionData, positions, orders, history } = req.body;
    
    // 1. Update session
    const session = await PaperTradingSession.findOneAndUpdate(
      { _id: id, user: req.user?._id },
      { $set: sessionData },
      { new: true }
    );
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // 2. Replace open positions
    if (positions) {
      await PaperTradingPosition.deleteMany({ session: id });
      if (positions.length > 0) {
        const cleanPositions = positions.map((p: any) => {
          const { _id, id: pId, ...rest } = p;
          return { ...rest, session: id };
        });
        await PaperTradingPosition.insertMany(cleanPositions);
      }
    }

    // 3. Replace pending orders
    if (orders) {
      await PaperTradingOrder.deleteMany({ session: id });
      if (orders.length > 0) {
        const cleanOrders = orders.map((o: any) => {
          const { _id, id: oId, ...rest } = o;
          return { ...rest, session: id };
        });
        await PaperTradingOrder.insertMany(cleanOrders);
      }
    }

    // 4. Insert new history (closed trades)
    if (history) {
      await PaperTradingHistory.deleteMany({ session: id });
      if (history.length > 0) {
        const cleanHistory = history.map((h: any) => {
          const { _id, id: hId, ...rest } = h;
          return { ...rest, session: id };
        });
        await PaperTradingHistory.insertMany(cleanHistory);
      }
    }
    
    res.json({ message: 'Session synced successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync session', error });
  }
};

// Delete a session
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await PaperTradingSession.findOneAndDelete({ _id: id, user: req.user?._id });
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Cascade delete related data
    await PaperTradingPosition.deleteMany({ session: id });
    await PaperTradingOrder.deleteMany({ session: id });
    await PaperTradingHistory.deleteMany({ session: id });
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session', error });
  }
};
