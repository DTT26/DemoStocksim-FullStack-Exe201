import { Router } from 'express';
import { 
  googleLogin, 
  emailLogin, 
  registerRequest, 
  verifyOtp, 
  resendOtp, 
  refreshAccessToken, 
  logout 
} from '../controllers/authController';

const router = Router();

// POST /api/auth/register (Yêu cầu đăng ký tài khoản & gửi OTP)
router.post('/register', registerRequest as any);

// POST /api/auth/verify-otp (Xác nhận OTP & hoàn tất đăng ký)
router.post('/verify-otp', verifyOtp as any);

// POST /api/auth/resend-otp (Gửi lại mã OTP)
router.post('/resend-otp', resendOtp as any);

// POST /api/auth/login (Đăng nhập bằng Email & Mật khẩu)
router.post('/login', emailLogin as any);

// POST /api/auth/google (Đăng nhập Google 1 chạm)
router.post('/google', googleLogin as any);

// POST /api/auth/refresh (Cấp lại token mới)
router.post('/refresh', refreshAccessToken as any);

// POST /api/auth/logout (Đăng xuất)
router.post('/logout', logout as any);

export default router;
