import User, { IUser } from '../models/user.model';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY || 5);
const MAX_OTP_PER_USER_WINDOW = 3; // max OTPs per 15 minutes
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export const generateOtp = (): string => {
  return "456123"
};

export const canRequestOtp = (user: IUser): boolean => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - OTP_REQUEST_WINDOW_MS);
  const recentRequests = user.otpRequests.filter(r => r.requestedAt > windowStart);
  return recentRequests.length < MAX_OTP_PER_USER_WINDOW;
};

export const addOtpToUser = async (user: IUser): Promise<string> => {
  if (!canRequestOtp(user)) throw new Error('Too many OTP requests. Try later.');
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  user.otps.push({ code: otp, expiresAt, used: false });
  user.otpRequests.push({ requestedAt: new Date() });
  await user.save();
  return otp;
};

export const verifyOtp = async (user: IUser, otp: string): Promise<boolean> => {
  const now = new Date();
  const validOtp = user.otps.find(o => o.code === otp && !o.used && o.expiresAt > now);

  if (!validOtp) {
    user.failedOtpAttempts = (user.failedOtpAttempts || 0) + 1;
    await user.save();
    if (user.failedOtpAttempts >= MAX_FAILED_ATTEMPTS) throw new Error('Too many failed attempts. Try later.');
    return false;
  }

  validOtp.used = true;
  user.failedOtpAttempts = 0;
  await user.save();
  return true;
};
