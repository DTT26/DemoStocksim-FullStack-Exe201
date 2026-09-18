import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import PaperTradingSession from '../models/PaperTradingSession';

// Get all sessions for the logged in user
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await PaperTradingSession.find({ user: req.user?._id }).sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new session
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symbol, initialBalance } = req.body;
    const newSession = new PaperTradingSession({
      user: req.user?._id,
      symbol,
      initialBalance,
      currentBalance: initialBalance,
      status: 'running'
    });
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error });
  }
};

// Update session (e.g. currentBalance or complete it)
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentBalance, status } = req.body;
    
    const updateData: any = { currentBalance };
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    
    const session = await PaperTradingSession.findOneAndUpdate(
      { _id: id, user: req.user?._id },
      updateData,
      { new: true }
    );
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update session', error });
  }
};

// Delete a session (optional, for cleanup)
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await PaperTradingSession.findOneAndDelete({ _id: id, user: req.user?._id });
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session', error });
  }
};
