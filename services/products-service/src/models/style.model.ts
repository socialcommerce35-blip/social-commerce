import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IStyle extends Document {
  _id: mongoose.Types.ObjectId;
  styleId: string;  
  name: string;
  slug: string;
  brandIds: string[]; 
  image: {
    url: string;
    publicId?: string;
  };
  description?: string;
  tags: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: number;    
  updatedAt: number;      
}

const styleSchema: Schema<IStyle> = new Schema(
  {
    styleId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    brandIds: [
      { type: String, ref: 'Brand', required: true }
    ],
    image: {
      url: { type: String, required: true },
      publicId: { type: String },
    },
    description: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Auto-update updatedAt on save
styleSchema.pre('save', function (next) {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

export const Style: Model<IStyle> = mongoose.model<IStyle>('Style', styleSchema);
