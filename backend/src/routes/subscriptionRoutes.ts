import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// 1. Get current user's subscription and remaining quota
router.get('/me', protect, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const resp = await fetch(`${PYTHON_URL}/api/v1/subscription/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {})
      }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (error: any) {
    console.error('Error forwarding subscription/me to python:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin gói đăng ký' });
  }
});

export default router;
