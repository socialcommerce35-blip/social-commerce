import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { errorResponse } from '../utils/responseHandler';

export interface AuthRequest extends Request {
  user?: { user_id: string; mobile: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json(errorResponse('No token provided', 'Unauthorized'));

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { user_id: string; mobile: string };
    req.user = { user_id: decoded.user_id, mobile: decoded.mobile };
    next();
  } catch (err) {
    return res.status(401).json(errorResponse(err, 'Invalid token'));
  }
};