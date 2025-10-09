import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string; 
  
  // Basic user info
  email?: string | null;
  mobile?: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    avatar?: {
      url?: string | null;
      publicId?: string | null;
    };
    gender?: string | null;
    dateOfBirth?: string | null; // epoch
    bio?: string | null;
    username?: string | null;
  };

  // Social metrics
  social?: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
  };

  // Preferences
  buckets?: {
    bucketId: string; 
    selectedAt: number;
  }[];

  styles?: {
    styleId: string; 
    selectedAt: number; 
  }[];

  // Derived preferences for quick feed generation
  derived?: {
    priceRanges?: { min: number; max: number }[];
    brandIds?: string[]; 
    styleIds?: string[];
  };

  onboardingCompleted?: boolean;
  isActive?: boolean;
  role?: 'user' | 'seller' | 'admin';

  createdAt?: number; // epoch
  updatedAt?: number; // epoch
}

const userProfileSchema: Schema<IUserProfile> = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String,  trim: true },
    mobile: { type: String },
    profile: {
      firstName: String,
      lastName: String,
      avatar: {
        url: String,
        publicId: String,
      },
      gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      dateOfBirth: String,
      bio: String,
      username: { type: String, unique: true, trim: true, required: true },
    },
    social: {
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      postsCount: { type: Number, default: 0 },
    },
    buckets: [
      {
        bucketId: { type: String, required: true },
        selectedAt: { type: Number, default: () => Date.now() },
      },
    ],
    styles: [
      {
        styleId: { type: String, required: true },
        selectedAt: { type: Number, default: () => Date.now() },
      },
    ],
    derived: {
      priceRanges: [{ min: Number, max: Number }],
      brandIds: [String],
      styleIds: [String],
    },
    onboardingCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Pre-save to update updatedAt
userProfileSchema.pre('save', function (next) {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

export const UserProfile: Model<IUserProfile> = mongoose.model<IUserProfile>(
  'UserProfile',
  userProfileSchema
);
