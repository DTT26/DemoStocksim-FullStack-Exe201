import { Router } from 'express';
import { googleLogin, refreshAccessToken } from '../controllers/authController';

const router = Router();

// POST /api/auth/google
router.post('/google', googleLogin as any);

// POST /api/auth/refresh
router.post('/refresh', refreshAccessToken as any);

export default router;
