import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production');

      req.user = await User.findById(decoded.userId).select('-passwordHash');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
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
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production');
      req.user = await User.findById(decoded.userId).select('-passwordHash');
    } catch (error) {
      // Token expired or invalid, continue without req.user
    }
  }
  next();
};
