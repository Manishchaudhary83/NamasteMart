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
    
    // Support demo session tokens seamlessly without throwing CastError
    const isDemoId = decoded.id === 'demo_admin_id' || decoded.id === 'demo_cashier_id' || (typeof decoded.id === 'string' && decoded.id.startsWith('demo_'));
    const isValidObjectId = mongoose.Types.ObjectId.isValid(decoded.id);

    if (isDemoId || !isValidObjectId) {
      const isAdmin = decoded.id === 'demo_admin_id' || (typeof decoded.id === 'string' && decoded.id.includes('admin'));
      const fallbackEmail = isAdmin ? 'admin@namastemart.com' : 'cashier@namastemart.com';
      const fallbackRole = isAdmin ? 'Admin' : 'Cashier';
      const fallbackName = isAdmin ? 'System Administrator' : 'Mart Cashier';

      if (mongoose.connection.readyState === 1) {
        // Since database is fully connected, try to find and bind to the real matching seeded user
        const realUser = await User.findOne({ email: fallbackEmail }).select('-password');
        if (realUser) {
          req.user = realUser;
          return next();
        }
        
        const roleUser = await User.findOne({ role: fallbackRole }).select('-password');
        if (roleUser) {
          req.user = roleUser;
          return next();
        }
      }

      // Offline mode or no matched account found, provide safe fallback
      req.user = {
        _id: decoded.id,
        fullName: fallbackName,
        email: fallbackEmail,
        role: fallbackRole
      };
      return next();
    }

    if (mongoose.connection.readyState !== 1) {
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
