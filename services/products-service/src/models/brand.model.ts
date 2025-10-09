import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId;
  brandId: string;
  name: string;
  slug: string;
  logo: {
    url: string;
    publicId?: string;
  };
  description?: string;
  website?: string;
  isActive: boolean;
  metadata: {
    totalProducts: number;
    rating: number;
    followersCount: number;
  };
  createdAt: number; 
  updatedAt: number; 
}

const brandSchema: Schema<IBrand> = new Schema(
  {
    brandId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true},
    slug: { type: String, required: true, unique: true, trim: true },
    logo: {
      url: { type: String, required: true },
      publicId: { type: String },
    },
    description: { type: String },
    website: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    metadata: {
      totalProducts: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      followersCount: { type: Number, default: 0 },
    },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Auto-update updatedAt on save
brandSchema.pre('save', function (next) {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

export const Brand: Model<IBrand> = mongoose.model<IBrand>('Brand', brandSchema);
