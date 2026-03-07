import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error_code: err.errorCode,
      message: err.message,
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    error_code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};
