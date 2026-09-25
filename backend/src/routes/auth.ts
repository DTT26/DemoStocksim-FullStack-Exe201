import { Router } from 'express';
import { 
  googleLogin, 
  emailLogin, 
  registerRequest, 
  verifyOtp, 
  resendOtp, 
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
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

// POST /api/auth/forgot-password (Yêu cầu gửi OTP đặt lại mật khẩu)
router.post('/forgot-password', forgotPassword as any);

// POST /api/auth/verify-forgot-otp (Kiểm tra OTP quên mật khẩu trước khi đổi mk)
router.post('/verify-forgot-otp', verifyForgotOtp as any);

// POST /api/auth/reset-password (Xác thực OTP và đặt lại mật khẩu)
router.post('/reset-password', resetPassword as any);

// POST /api/auth/login (Đăng nhập bằng Email & Mật khẩu)
router.post('/login', emailLogin as any);

// POST /api/auth/google (Đăng nhập Google 1 chạm)
router.post('/google', googleLogin as any);

// POST /api/auth/refresh (Cấp lại token mới)
router.post('/refresh', refreshAccessToken as any);

// POST /api/auth/logout (Đăng xuất)
router.post('/logout', logout as any);

export default router;
