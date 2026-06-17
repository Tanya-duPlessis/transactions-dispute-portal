import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateUuid = (...params: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    for (const param of params) {
      const value = req.params[param];
      if (value && !UUID_REGEX.test(Array.isArray(value) ? value[0] : value)) {
        throw new AppError('INVALID_ID', `Invalid ${param} format`, 400);
      }
    }
    next();
  };
