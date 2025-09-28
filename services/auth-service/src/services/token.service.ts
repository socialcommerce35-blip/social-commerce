import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

const JWT_EXPIRE: SignOptions['expiresIn'] = (process.env.JWT_EXPIRE || '1d') as SignOptions['expiresIn'];

export const generateToken = (user: IUser): string => {
  const payload = { userId: user._id, saltKey: user.saltKey };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; saltKey: string };
};
