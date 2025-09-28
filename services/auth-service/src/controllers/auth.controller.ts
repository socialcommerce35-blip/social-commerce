import { Request, Response } from 'express';
import User from '../models/user.model';
import { addOtpToUser, verifyOtp } from '../services/otp.service';
import { generateToken } from '../services/token.service';
// import { sendWelcomeEmail } from '../services/email.service';
import * as crypto from 'crypto';

// Login or Register
export const loginOrRegister = async (req: Request, res: Response) => {
  try {
    const { mobile, email, name } = req.body;
    if (!mobile) return res.status(400).json({ success: false, data: null, error: 'Mobile is required' });

    let user = await User.findOne({ mobile });

    if (!user) {
      // Check if email already exists
      if (email) {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
          return res.status(400).json({ success: false, data: null, error: 'Email already in use' });
        }
      }

      user = new User({ mobile, email, name });
      await user.save();

      // if (email) await sendWelcomeEmail(email, name); // commented for now
    }

    const otp = await addOtpToUser(user);

    return res.json({ success: true, data: { otp }, error: null }); // return OTP in dev
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, data: null, error: err.message || 'Server error' });
  }
};

// Verify OTP
export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ success: false, data: null, error: 'Mobile and OTP are required' });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ success: false, data: null, error: 'User not found' });

    const isValid = await verifyOtp(user, otp);
    if (!isValid) return res.status(400).json({ success: false, data: null, error: 'Invalid OTP' });

    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    return res.json({ success: true, data: { token }, error: null });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, data: null, error: err.message || 'Server error' });
  }
};

// Logout
export const logoutController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, data: null, error: 'Unauthorized' });

    user.saltKey = crypto.randomBytes(16).toString('hex');
    user.lastLogout = new Date();
    await user.save();

    return res.json({ success: true, data: { message: 'Logged out successfully' }, error: null });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, data: null, error: err.message || 'Server error' });
  }
};
