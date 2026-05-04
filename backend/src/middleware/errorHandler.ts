import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      issues: err.issues,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.code, message: err.message });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Something went wrong' });
};
