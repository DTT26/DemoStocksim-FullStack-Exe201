import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  getLevels, 
  getMyChallenge, 
  startLevel, 
  resetChallenge, 
  pauseChallenge,
  resumeChallenge,
  endChallenge,
  evaluateRisk 
} from '../controllers/challengeController';

const router = Router();

// Public: Xem thông số các cấp độ
router.get('/levels', getLevels);

// Protected: Yêu cầu đăng nhập tài khoản
router.get('/me', protect, getMyChallenge);
router.post('/start', protect, startLevel);
router.post('/reset', protect, resetChallenge);
router.post('/pause', protect, pauseChallenge);
router.post('/resume', protect, resumeChallenge);
router.post('/end', protect, endChallenge);
router.post('/evaluate', protect, evaluateRisk);

export default router;
