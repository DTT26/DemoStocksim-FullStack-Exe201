import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
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

    // Nếu chưa có, tạo user mới
    if (!user) {
      user = new User({
        email,
        name,
        picture,
        googleId,
        role: 'student', // Mặc định là student
      });
      await user.save();
    } else {
      // Cập nhật thông tin nếu cần thiết (ví dụ: avatar mới)
      let updated = false;
      if (!user.googleId) { user.googleId = googleId; updated = true; }
      if (user.name !== name) { user.name = name; updated = true; }
      if (user.picture !== picture) { user.picture = picture; updated = true; }
      if (updated) {
        await user.save();
      }
    }

    // Tạo JWT token
    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' } // Hạn ngắn cho Access Token
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      refreshSecret,
      { expiresIn: '7d' } // Hạn dài cho Refresh Token
    );

    // Trả về token và thông tin cơ bản
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

// POST /api/auth/refresh
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';

    const decoded: any = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status === 'DISABLED') {
      return res.status(401).json({ message: 'User not found or disabled' });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};
