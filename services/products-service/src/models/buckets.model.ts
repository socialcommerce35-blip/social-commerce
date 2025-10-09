import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBucket extends Document {
  _id: mongoose.Types.ObjectId; 
  bucketId: string;              
  name: string;
  slug: string;
  priceRange: {
    min: number;
    max: number;
  };
  displayOrder: number;
  description?: string;
  isActive: boolean;
  brandIds: string[]; 
  createdAt: number;
  updatedAt: number;
}

const bucketSchema: Schema<IBucket> = new Schema(
  {
    bucketId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    priceRange: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        validate: {
          validator: function (v: number) {
            return v > this.priceRange.min;
          },
          message: 'Max price must be greater than min price',
        },
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    brandIds: [
      {
        type: String, 
        ref: 'Brand',
      },
    ],
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() }
  },
  {
    versionKey: false,
    timestamps: false
  }
);

bucketSchema.pre('save', function (next) {
    const now = Date.now();
    this.updatedAt = now;
    if (!this.createdAt) this.createdAt = now;
    next();
  });

export const Bucket: Model<IBucket> = mongoose.model<IBucket>('Bucket', bucketSchema);



