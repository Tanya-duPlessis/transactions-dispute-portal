import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.issues[0].message,
        details: result.error.issues,
      },
    });
  }
  next();
};
