import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProduct extends Document {
  product_id: string;
  title: string;
  category: string;
  brand_id: string;
  brand_name: string;
  price: number;
  style: string;
  description?: string;
  createdAt: number;  // epoch time
  updatedAt: number;  // epoch time
}

const productSchema = new Schema<IProduct>(
  {
    product_id: { type: String, default: uuidv4, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    brand_id: { type: String, required: true },
    brand_name: { type: String, required: true },
    price: { type: Number, required: true },
    style: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Number, default: () => Date.now() }, // epoch ms
    updatedAt: { type: Number, default: () => Date.now() }, // epoch ms
  },
  { versionKey: false }
);

// Pre-save hook to update timestamps
productSchema.pre<IProduct>('save', function (next) {
  const now = Date.now();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});

// Pre-update hook for findOneAndUpdate
productSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const Product = model<IProduct>('Product', productSchema);
