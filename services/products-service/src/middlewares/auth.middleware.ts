import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { errorResponse } from '../utils/responseHandler';

export interface AuthRequest extends Request {
  user?: { user_id: string; mobile: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json(
        errorResponse(
          'No token provided. 🚫 Access denied! You need a valid key to enter this area.',
          'Unauthorized'
        )
      );
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      user_id: string;
      mobile: string;
      role: string;
    };

    req.user = {
      user_id: decoded.user_id,
      mobile: decoded.mobile,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired ⏰ Please log in again to continue.'
        : 'Invalid token 🕵️ Someone’s trying to sneak in! Please provide a valid token.';
        
    return res.status(401).json(errorResponse(message, 'Unauthorized'));
  }
};
