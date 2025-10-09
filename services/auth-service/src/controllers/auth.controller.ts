import { Request, Response } from 'express';
import { requestOTP, verifyOTP } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/responseHandler';
import logger from '../utils/logger';

export const sendOTPController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;
        const result = await requestOTP(mobile);
        sendSuccess(res, result);
    } catch (err: any) {
        logger.error('Send OTP error: %o', err);
        const message = err?.message || 'Unknown error while sending OTP';
        sendError(res, message, 400);
    }
};

export const verifyOTPController = async (req: Request, res: Response) => {
    try {
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        return sendError(res, 'Mobile and OTP are required', 400);
      }
  
      const result = await verifyOTP(mobile, otp);
      return sendSuccess(res, result);
  
    } catch (err: any) {
      logger.error('Verify OTP error: %s', err.message);
      return sendError(res, err.message || 'Something went wrong', 400);
    }
  };