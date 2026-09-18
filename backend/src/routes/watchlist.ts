import express from 'express';
import { 
  getWatchlists, 
  createWatchlist, 
  updateWatchlist, 
  deleteWatchlist 
} from '../controllers/watchlistController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', deleteWatchlist);

export default router;
