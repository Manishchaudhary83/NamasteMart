import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const dbCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) {
        // 1 = connected
        return res.status(503).json({
            message: 'Database connection is not established.',
            error: 'Database Offline',
            help: 'Please ensure MONGODB_URI is correctly configured in your environment secrets.'
        });
    }
    next();
};
