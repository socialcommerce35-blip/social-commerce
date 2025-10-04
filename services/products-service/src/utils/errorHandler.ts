import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { errorResponse } from './response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log full error stack in backend
  logger.error(err.stack || err.message || err);

  // Send general error message to frontend
  res.status(500).json(errorResponse('Internal Server Error'));
};
