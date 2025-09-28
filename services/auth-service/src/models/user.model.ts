import mongoose, { Document, Schema } from 'mongoose';
import * as crypto from 'crypto';

export interface IUser extends Document {
  mobile: string;
  email?: string;
  name?: string;
  isVerified: boolean;
  otps: Array<{ code: string; expiresAt: Date; used: boolean }>;
  otpRequests: Array<{ requestedAt: Date }>;
  failedOtpAttempts: number;
  saltKey: string;
  roles: string[];
  lastLogin?: Date;
  lastLogout?: Date;
  status: 'active' | 'inactive' | 'banned';
  deviceInfo?: { deviceId?: string; deviceType?: string; ip?: string; userAgent?: string };
  location?: { country?: string; city?: string; ip?: string };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  mobile: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  name: { type: String },
  isVerified: { type: Boolean, default: false },

  otps: [{ code: String, expiresAt: Date, used: Boolean }],
  otpRequests: [{ requestedAt: Date }],
  failedOtpAttempts: { type: Number, default: 0 },

  saltKey: { type: String, default: () => crypto.randomBytes(16).toString('hex') },
  roles: { type: [String], default: ['user'] },
  lastLogin: { type: Date },
  lastLogout: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },

  deviceInfo: { deviceId: String, deviceType: String, ip: String, userAgent: String },
  location: { country: String, city: String, ip: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
