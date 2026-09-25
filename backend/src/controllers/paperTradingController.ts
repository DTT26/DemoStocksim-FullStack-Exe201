import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import PaperTradingSession from '../models/PaperTradingSession';
import PaperTradingPosition from '../models/PaperTradingPosition';
import PaperTradingOrder from '../models/PaperTradingOrder';
import PaperTradingHistory from '../models/PaperTradingHistory';

// Get all sessions for the logged in user
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await PaperTradingSession.find({ user: req.user?._id }).sort({ startedAt: -1 });
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
        await PaperTradingPosition.insertMany(positions.map((p: any) => ({ ...p, session: id })));
      }
    }

    // 3. Replace pending orders
    if (orders) {
      await PaperTradingOrder.deleteMany({ session: id });
      if (orders.length > 0) {
        await PaperTradingOrder.insertMany(orders.map((o: any) => ({ ...o, session: id })));
      }
    }

    // 4. Insert new history (closed trades)
    // History is append-only. To avoid duplicates, we expect frontend to only send NEW history items,
    // OR we delete and replace them. Replacing is safer for simple autosave.
    if (history) {
      await PaperTradingHistory.deleteMany({ session: id });
      if (history.length > 0) {
        await PaperTradingHistory.insertMany(history.map((h: any) => ({ ...h, session: id })));
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
