import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware';

const router = Router();
const PYTHON_URL = (process.env.PYTHON_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');

// 1. Get current user's subscription and remaining quota
router.get('/me', protect, async (req: any, res: Response) => {
  const userId = req.user?._id?.toString();
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.token;
  const authHeader = token ? `Bearer ${token}` : req.headers.authorization;

  // Try fetching from Python Microservice first
  try {
    const resp = await fetch(`${PYTHON_URL}/api/v1/subscription/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      signal: AbortSignal.timeout(4000) // Fast 4s timeout to avoid blocking if python is sleeping/502
    });

    if (resp.ok) {
      const data = await resp.json();
      return res.status(resp.status).json(data);
    }
  } catch (pyError: any) {
    console.warn(`[Subscription] Python microservice failed or timed out: ${pyError?.message || pyError}. Falling back to direct MongoDB...`);
  }

  // Robust Direct MongoDB Fallback: Ensures PRO users NEVER lose PRO badge on page reload
  try {
    if (userId) {
      const db = mongoose.connection.db;
      if (db) {
        const sub = await db.collection('subscriptions').findOne({ user_id: userId });
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (sub) {
          let dailyUsed = sub.daily_ai_used || 0;
          if (sub.last_active_date && sub.last_active_date < todayStr) {
            dailyUsed = 0;
          }

          let plan = sub.plan || 'FREE';
          let limit = sub.daily_ai_limit || (plan === 'PREMIUM' ? 500 : 10);
          const expiresAt = sub.premium_expires_at ? new Date(sub.premium_expires_at) : null;
          let isPremium = plan === 'PREMIUM';

          if (isPremium && expiresAt && now > expiresAt) {
            isPremium = false;
            plan = 'FREE';
            limit = 10;
          }

          const remaining = Math.max(0, limit - dailyUsed);

          return res.json({
            success: true,
            plan,
            dailyAiLimit: limit,
            dailyAiUsed: dailyUsed,
            remainingToday: remaining,
            premiumExpiresAt: sub.premium_expires_at || null,
            isPremium,
            lastActiveDate: sub.last_active_date || todayStr
          });
        }
      }
    }

    // Default FREE fallback if no record found
    return res.json({
      success: true,
      plan: 'FREE',
      dailyAiLimit: 10,
      dailyAiUsed: 0,
      remainingToday: 10,
      premiumExpiresAt: null,
      isPremium: false,
      lastActiveDate: new Date().toISOString().split('T')[0]
    });
  } catch (error: any) {
    console.error('Error in direct MongoDB subscription fallback:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin gói đăng ký' });
  }
});

export default router;
