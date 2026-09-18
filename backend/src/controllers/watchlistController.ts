import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Watchlist from '../models/Watchlist';

// Get all watchlists for logged in user
export const getWatchlists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const watchlists = await Watchlist.find({ user: req.user?._id });
    res.json(watchlists);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new watchlist
export const createWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, symbols } = req.body;
    const newWatchlist = new Watchlist({
      user: req.user?._id,
      name,
      symbols: symbols || []
    });
    const savedWatchlist = await newWatchlist.save();
    res.status(201).json(savedWatchlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create watchlist', error });
  }
};

// Update a watchlist (rename or update symbols)
export const updateWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, symbols } = req.body;
    
    const watchlist = await Watchlist.findOneAndUpdate(
      { _id: id, user: req.user?._id },
      { name, symbols },
      { new: true }
    );
    
    if (!watchlist) {
      res.status(404).json({ message: 'Watchlist not found' });
      return;
    }
    
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update watchlist', error });
  }
};

// Delete a watchlist
export const deleteWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const watchlist = await Watchlist.findOneAndDelete({ _id: id, user: req.user?._id });
    
    if (!watchlist) {
      res.status(404).json({ message: 'Watchlist not found' });
      return;
    }
    
    res.json({ message: 'Watchlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete watchlist', error });
  }
};
