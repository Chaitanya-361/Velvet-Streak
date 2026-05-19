import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const appError = err instanceof AppError
    ? err
    : new AppError('INTERNAL_ERROR', 500, err.message || 'Internal server error');

  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[${appError.code}] ${appError.statusCode} ${req.method} ${req.path}: ${appError.message}`);
  if (appError.statusCode === 500 && isDev) {
    console.error(err.stack);
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details ?? [],
      ...(isDev && appError.statusCode === 500 ? { stack: err.stack } : {}),
    },
  });
}
