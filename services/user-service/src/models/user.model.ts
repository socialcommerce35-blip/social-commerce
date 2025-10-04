import mongoose, { Schema, Document } from 'mongoose';
import logger from '../utils/logger';

export interface IUser extends Document {
  user_id: string;
  username: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  mobile: string;
  preferences: {
    price_range?: { min: number; max: number } | null;
    styles?: string[];
  };
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

const UserSchema: Schema = new Schema(
  {
    user_id: { type: String, required: true, index: true, unique: true },
    username: { type: String, required: true, unique: true },
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    email: { type: String },
    mobile: { type: String, required: true },
    preferences: {
      price_range: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      styles: { type: [String], default: [] },
    },
    createdAt: { type: Number },
    updatedAt: { type: Number },
  },
  {
    timestamps: false, // we handle manually
    versionKey: false, // no __v
  }
);

// Pre-save hook: only first-time creation
UserSchema.pre<IUser>('save', function (next) {
  const now = Date.now();
  if (!this.createdAt) this.createdAt = now;
  this.updatedAt = now;
  logger.info(`User pre-save hook: ${this.user_id}`);
  next();
});

// Post-save hook
UserSchema.post<IUser>('save', function (doc) {
  logger.info(`User saved: ${doc.user_id}`);
});

export default mongoose.model<IUser>('user-profiles', UserSchema);
