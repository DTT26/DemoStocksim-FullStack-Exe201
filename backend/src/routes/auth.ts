import { Router } from 'express';
import { googleLogin, refreshAccessToken, logout } from '../controllers/authController';

const router = Router();

// POST /api/auth/google
router.post('/google', googleLogin as any);

// POST /api/auth/refresh
router.post('/refresh', refreshAccessToken as any);

// POST /api/auth/logout
router.post('/logout', logout as any);

export default router;
