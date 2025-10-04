import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHandler';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error: %s', err.message);
    sendError(res, err.message || 'Internal Server Error', err.status || 500);
};
