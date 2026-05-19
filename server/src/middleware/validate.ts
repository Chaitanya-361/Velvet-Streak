import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../types';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          issue: e.message,
        }));
        next(new AppError('VALIDATION_ERROR', 422, 'Validation failed', details));
      } else {
        next(err);
      }
    }
  };
}
