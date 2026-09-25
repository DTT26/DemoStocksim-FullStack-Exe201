import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';
  const tokensToTry: string[] = [];

  if (req.cookies && req.cookies.token) {
    tokensToTry.push(req.cookies.token);
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const bearer = req.headers.authorization.split(' ')[1];
    if (bearer && !tokensToTry.includes(bearer)) {
      tokensToTry.push(bearer);
    }
  }

  for (const token of tokensToTry) {
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (user) {
        if (user.status === 'DISABLED' || user.status === 'SUSPENDED') {
          return res.status(403).json({ 
            message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended). Phiên làm việc đã kết thúc.' 
          });
        }
        req.user = user;
        return next();
      }
    } catch (error) {
      // Thử token tiếp theo nếu có
    }
  }

  if (tokensToTry.length > 0) {
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const lecturer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'lecturer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a lecturer' });
  }
};

export const optionalProtect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production';
  const tokensToTry: string[] = [];

  if (req.cookies && req.cookies.token) {
    tokensToTry.push(req.cookies.token);
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const bearer = req.headers.authorization.split(' ')[1];
    if (bearer && !tokensToTry.includes(bearer)) {
      tokensToTry.push(bearer);
    }
  }

  for (const token of tokensToTry) {
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (user) {
        req.user = user;
        break;
      }
    } catch (error) {
      // Continue trying next token
    }
  }
  next();
};
