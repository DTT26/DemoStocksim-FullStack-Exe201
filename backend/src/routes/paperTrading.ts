import express from 'express';
import { 
  getSessions, 
  getSessionDetails,
  createSession, 
  updateSession, 
  deleteSession 
} from '../controllers/paperTradingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getSessions);
router.get('/:id', getSessionDetails);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
