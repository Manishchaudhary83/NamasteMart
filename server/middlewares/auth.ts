import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    if (mongoose.connection.readyState !== 1) {
        if (decoded.id === 'demo_admin_id' || decoded.id === 'demo_cashier_id') {
            req.user = {
                _id: decoded.id,
                fullName: decoded.id === 'demo_admin_id' ? 'System Administrator' : 'Mart Cashier',
                email: decoded.id === 'demo_admin_id' ? 'admin@namastemart.com' : 'cashier@namastemart.com',
                role: decoded.id === 'demo_admin_id' ? 'Admin' : 'Cashier'
            };
            return next();
        }
        return res.status(503).json({ message: 'Database disconnected. Access denied for offline-cached sessions.' });
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user?.role} is not authorized` });
    }
    next();
  };
};
