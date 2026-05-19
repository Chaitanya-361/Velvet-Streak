import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 401, 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };

    const user = store.findUserById(decoded.sub);
    if (!user) {
      throw new AppError('UNAUTHORIZED', 401, 'User not found');
    }

    req.user = { _id: user._id, email: user.email };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new AppError('UNAUTHORIZED', 401, 'Access token expired'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError('UNAUTHORIZED', 401, 'Invalid access token'));
    } else {
      next(new AppError('UNAUTHORIZED', 401, 'Authentication failed'));
    }
  }
}
