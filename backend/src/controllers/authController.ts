import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Otp from '../models/Otp';
import jwt from 'jsonwebtoken';
import { sendOtpEmail, sendForgotPasswordEmail } from '../services/emailService';

/**
 * Helper cấp phát JWT Access Token (7 ngày) & Refresh Token (30 ngày)
 * kèm thiết lập cookie bảo mật HttpOnly
 */
const issueTokensAndCookies = (res: Response, user: any) => {
  const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    refreshSecret,
    { expiresIn: '30d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return { token, refreshToken };
};

/**
 * Xác thực Google reCAPTCHA v3
 */
const verifyRecaptchaV3 = async (captchaToken?: string): Promise<boolean> => {
  if (!captchaToken) return true; // Cho phép fallback nếu không bắt buộc
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LehIsstAAAAAJrnfa0QbbVOoE_5MyNB78qVZP3g';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    const captchaRes = await fetch(verifyUrl, { method: 'POST' });
    const captchaData = await captchaRes.json();

    if (!captchaData.success || (typeof captchaData.score === 'number' && captchaData.score < 0.5)) {
      console.warn('reCAPTCHA v3 verification failed or low score:', captchaData);
      return false;
    }
    return true;
  } catch (err) {
    console.error('reCAPTCHA verification error:', err);
    return false;
  }
};

/**
 * POST /api/auth/register
 * Bước 1: Kiểm tra thông tin, băm mật khẩu, tạo mã OTP và gửi về email
 */
export const registerRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, password, termsAccepted, captchaToken } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập họ và tên của bạn.' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Vui lòng nhập địa chỉ email (Gmail).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Địa chỉ email không đúng định dạng.' });
    }

    // Kiểm tra quy định mật khẩu: chữ hoa, chữ thường, số, tối thiểu 8 ký tự
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu.' });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !isLongEnough) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ in hoa (A-Z), 1 chữ thường (a-z) và 1 chữ số (0-9).'
      });
    }

    // Bắt buộc đồng ý điều khoản
    if (!termsAccepted) {
      return res.status(400).json({
        message: 'Bạn phải đọc và đồng ý với Điều khoản dịch vụ & Chính sách của StockSim để tiếp tục.'
      });
    }

    // Xác thực reCAPTCHA v3
    if (captchaToken) {
      const isCaptchaValid = await verifyRecaptchaV3(captchaToken);
      if (!isCaptchaValid) {
        return res.status(403).json({ message: 'Xác thực an toàn reCAPTCHA không thành công. Vui lòng thử lại.' });
      }
    }

    // Kiểm tra email đã có tài khoản chưa
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'Địa chỉ email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập hoặc sử dụng email khác.'
      });
    }

    // Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Mã hoá mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Xoá các OTP cũ chưa xác thực của email này nếu có
    await Otp.deleteMany({ email: cleanEmail });

    // Lưu bản ghi OTP mới (tự động hết hạn sau 10 phút nhờ TTL index)
    await Otp.create({
      email: cleanEmail,
      otp,
      name: name.trim(),
      passwordHash,
    });

    // Gửi email OTP
    await sendOtpEmail(cleanEmail, otp, name.trim());

    res.status(200).json({
      message: 'Mã xác thực OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác/spam).',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('registerRequest error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình xử lý đăng ký' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Bước 2: Kiểm tra mã OTP, kích hoạt tài khoản User, khởi tạo ví và tự động đăng nhập
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mã xác thực OTP.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Tìm bản ghi OTP
    const otpDoc = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!otpDoc) {
      return res.status(400).json({
        message: 'Mã OTP không chính xác hoặc đã hết hạn (hiệu lực đúng 10 phút). Vui lòng thử lại hoặc bấm Gửi lại mã.'
      });
    }

    // Kiểm tra chính xác thời gian hiệu lực 10 phút (600,000 ms)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (Date.now() - new Date(otpDoc.createdAt).getTime() > TEN_MINUTES_MS) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        message: 'Mã OTP đăng ký đã hết hạn sau đúng 10 phút. Vui lòng bấm Gửi lại mã OTP mới.'
      });
    }

    // Kiểm tra xem User đã được tạo chưa (phòng trường hợp bấm nhiều lần)
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = new User({
        email: cleanEmail,
        name: otpDoc.name,
        passwordHash: otpDoc.passwordHash,
        role: 'student',
        status: 'ACTIVE',
      });
      await user.save();

      // Khởi tạo ví giao dịch mô phỏng 100.000.000 VNĐ
      await Wallet.create({
        userId: user._id,
        balance: 100000000,
        availableBalance: 100000000,
      });
    }

    // Xoá các OTP đã sử dụng
    await Otp.deleteMany({ email: cleanEmail });

    // Tạo token và cookie
    const { token, refreshToken } = issueTokensAndCookies(res, user);

    res.status(201).json({
      message: 'Kích hoạt tài khoản thành công! Chào mừng bạn đến với StockSim.',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình xác thực OTP' });
  }
};

/**
 * POST /api/auth/resend-otp
 * Gửi lại mã OTP mới cho người dùng
 */
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingOtp = await Otp.findOne({ email: cleanEmail });

    if (!existingOtp) {
      return res.status(400).json({
        message: 'Phiên đăng ký của bạn đã hết hạn (quá 10 phút). Vui lòng nhập lại thông tin đăng ký.'
      });
    }

    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (Date.now() - new Date(existingOtp.createdAt).getTime() > TEN_MINUTES_MS) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        message: 'Phiên đăng ký của bạn đã hết hạn sau đúng 10 phút. Vui lòng nhập lại thông tin đăng ký.'
      });
    }

    // Tạo mã OTP mới
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    existingOtp.otp = newOtp;
    existingOtp.createdAt = new Date();
    await existingOtp.save();

    await sendOtpEmail(cleanEmail, newOtp, existingOtp.name);

    res.status(200).json({
      message: 'Mã xác thực OTP mới đã được gửi vào email của bạn.',
    });
  } catch (error) {
    console.error('resendOtp error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi gửi lại mã OTP' });
  }
};

/**
 * POST /api/auth/login
 * Đăng nhập bằng Email & Mật khẩu
 */
export const emailLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Xác thực reCAPTCHA v3 nếu có token
    if (captchaToken) {
      const isCaptchaValid = await verifyRecaptchaV3(captchaToken);
      if (!isCaptchaValid) {
        return res.status(403).json({ message: 'Xác thực an toàn reCAPTCHA không thành công. Vui lòng thử lại.' });
      }
    }

    // Tìm user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Kiểm tra nếu tài khoản đăng ký bằng Google (chưa tạo mật khẩu riêng)
    if (!user.passwordHash) {
      return res.status(400).json({
        message: 'Tài khoản này được đăng ký thông qua Google. Vui lòng bấm nút "Tiếp tục bằng Google" để đăng nhập.'
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended). Vui lòng liên hệ Quản trị viên để được hỗ trợ.'
      });
    }

    // So khớp mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Cấp phát token & cookie
    const { token, refreshToken } = issueTokensAndCookies(res, user);

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('emailLogin error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng nhập' });
  }
};

/**
 * POST /api/auth/google
 * Đăng nhập 1 chạm bằng Google OAuth
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { access_token, captchaToken } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Verify reCAPTCHA v3 token
    if (captchaToken) {
      const isCaptchaValid = await verifyRecaptchaV3(captchaToken);
      if (!isCaptchaValid) {
        return res.status(403).json({ message: 'Captcha verification failed' });
      }
    }

    // Lấy thông tin user từ Google API
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ message: 'Invalid Google access token' });
    }

    const googleData = await googleRes.json();
    const { email, name, picture, sub: googleId } = googleData;

    // Tìm user trong Database
    let user = await User.findOne({ email });

    // Kiểm tra nếu tài khoản bị khóa hoặc tạm ngưng (Suspended/Disabled)
    if (user && (user.status === 'DISABLED' || user.status === 'SUSPENDED')) {
      return res.status(403).json({
        message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended). Vui lòng liên hệ Quản trị viên để được hỗ trợ.'
      });
    }

    // Nếu chưa có, tạo user mới
    if (!user) {
      user = new User({
        email,
        name,
        picture,
        googleId,
        role: 'student', // Mặc định là student
        status: 'ACTIVE',
      });
      await user.save();

      await Wallet.create({
        userId: user._id,
        balance: 100000000,
        availableBalance: 100000000,
      });
    } else {
      // Cập nhật thông tin nếu cần thiết
      let updated = false;
      if (!user.googleId) { user.googleId = googleId; updated = true; }
      if (!user.name && name) { user.name = name; updated = true; }
      // Chỉ cập nhật avatar từ Google nếu người dùng CHƯA đổi avatar riêng và CHƯA có avatar
      if (!user.customAvatar && !user.picture && picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Tạo token và cookie
    const { token, refreshToken } = issueTokensAndCookies(res, user);

    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error during Google login' });
  }
};

/**
 * POST /api/auth/refresh
 * Cấp lại Access Token mới khi sắp hết hạn
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';

    const decoded: any = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended)' });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

/**
 * POST /api/auth/logout
 * Đăng xuất tài khoản & xóa cookies
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * POST /api/auth/forgot-password
 * Yêu cầu gửi mã OTP đặt lại mật khẩu qua email
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, captchaToken } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Email.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Xác thực reCAPTCHA v3 nếu có token
    if (captchaToken) {
      const isCaptchaValid = await verifyRecaptchaV3(captchaToken);
      if (!isCaptchaValid) {
        return res.status(403).json({ message: 'Xác thực an toàn reCAPTCHA không thành công. Vui lòng thử lại.' });
      }
    }

    // Tìm tài khoản theo email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này trong hệ thống.' });
    }

    if (user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ Quản trị viên.' });
    }

    // Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Xóa các mã OTP đặt lại mật khẩu cũ của email này nếu có
    await Otp.deleteMany({ email: cleanEmail, purpose: 'FORGOT_PASSWORD' });

    // Lưu bản ghi OTP mới
    await Otp.create({
      email: cleanEmail,
      otp,
      name: user.name || 'Người dùng',
      purpose: 'FORGOT_PASSWORD',
    });

    // Gửi email chứa OTP
    await sendForgotPasswordEmail(cleanEmail, otp, user.name || 'Người dùng');

    res.status(200).json({
      message: 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác/spam).'
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình xử lý quên mật khẩu' });
  }
};

/**
 * POST /api/auth/reset-password
 * Xác thực OTP và đặt lại mật khẩu mới
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, captchaToken } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Email, mã OTP và Mật khẩu mới.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Xác thực reCAPTCHA v3 nếu có token
    if (captchaToken) {
      const isCaptchaValid = await verifyRecaptchaV3(captchaToken);
      if (!isCaptchaValid) {
        return res.status(403).json({ message: 'Xác thực an toàn reCAPTCHA không thành công. Vui lòng thử lại.' });
      }
    }

    // Kiểm tra tiêu chuẩn mật khẩu mới
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
    }

    // Tìm mã OTP hợp lệ
    const otpDoc = await Otp.findOne({ email: cleanEmail, otp: cleanOtp, purpose: 'FORGOT_PASSWORD' });
    if (!otpDoc) {
      return res.status(400).json({
        message: 'Mã xác thực OTP không chính xác hoặc đã hết hạn (hiệu lực đúng 10 phút). Vui lòng thử lại hoặc yêu cầu gửi lại mã mới.'
      });
    }

    // Kiểm tra chính xác thời gian hiệu lực 10 phút (600,000 ms)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (Date.now() - new Date(otpDoc.createdAt).getTime() > TEN_MINUTES_MS) {
      await Otp.deleteMany({ email: cleanEmail, purpose: 'FORGOT_PASSWORD' });
      return res.status(400).json({
        message: 'Mã OTP khôi phục mật khẩu đã hết hạn sau đúng 10 phút. Vui lòng gửi lại yêu cầu để nhận mã mới.'
      });
    }

    // Tìm user và cập nhật mật khẩu
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng.' });
    }

    // Băm mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Xóa OTP sau khi sử dụng thành công
    await Otp.deleteMany({ email: cleanEmail, purpose: 'FORGOT_PASSWORD' });

    res.status(200).json({
      message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đặt lại mật khẩu' });
  }
};

/**
 * POST /api/auth/verify-forgot-otp
 * Kiểm tra mã OTP quên mật khẩu trước khi cho phép người dùng đặt mật khẩu mới
 */
export const verifyForgotOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Email và mã OTP.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const otpDoc = await Otp.findOne({ email: cleanEmail, otp: cleanOtp, purpose: 'FORGOT_PASSWORD' });
    if (!otpDoc) {
      return res.status(400).json({
        message: 'Mã xác thực OTP không chính xác hoặc đã hết hạn (hiệu lực đúng 10 phút).'
      });
    }

    // Kiểm tra chính xác thời gian hiệu lực 10 phút (600,000 ms)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (Date.now() - new Date(otpDoc.createdAt).getTime() > TEN_MINUTES_MS) {
      await Otp.deleteMany({ email: cleanEmail, purpose: 'FORGOT_PASSWORD' });
      return res.status(400).json({
        message: 'Mã OTP đã hết hạn sau đúng 10 phút. Vui lòng gửi lại yêu cầu để nhận mã mới.'
      });
    }

    res.status(200).json({
      message: 'Mã OTP hợp lệ! Hãy thiết lập mật khẩu mới cho tài khoản của bạn.'
    });
  } catch (error) {
    console.error('verifyForgotOtp error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình kiểm tra mã OTP' });
  }
};

