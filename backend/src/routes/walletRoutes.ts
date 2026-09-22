import { Router } from 'express';
import { getWallet, resetNormalWallet } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Lấy thông tin số dư tài khoản thường và số lượt reset còn lại
router.get('/', protect, getWallet);
router.get('/:userId', getWallet);

// Reset số dư tài khoản thường (Chỉ thực hiện khi User chủ động bấm trong Profile, tối đa 5 lần/tuần)
router.post('/reset', protect, resetNormalWallet);

export default router;
