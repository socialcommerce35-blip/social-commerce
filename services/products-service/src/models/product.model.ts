import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


export interface IProductVariant {
  sku: string;
  size?: string;
  color?: {
    name?: string;
    hex?: string;
  };
  inventory?: {
    available: number;
    reserved: number;
  };
  isAvailable?: boolean;
}

export interface IProduct extends Document {
  productId: string;
  name: string;
  slug: string;
  description: string;
  brandId: string; 
  styleIds: string[];
  
  pricing: {
    mrp: number;
    sellingPrice: number;
    discount?: number;
    currency?: string;
  };

  images: {
    url: string;
    publicId?: string;
    isPrimary?: boolean;
    order?: number;
  }[];

  category: {
    primary: string;
    secondary?: string;
    tertiary?: string;
  };

  gender: 'Men' | 'Women' | 'Unisex' | 'Boys' | 'Girls';

  variants: IProductVariant[];

  specifications?: {
    material?: string;
    pattern?: string;
    occasion?: string[];
    sleeves?: string;
    neckline?: string;
    fit?: string;
    length?: string;
    care?: string[];
    countryOfOrigin?: string;
  };

  sizeChart?: Map<string, any>;

  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  ratings?: {
    average: number;
    count: number;
  };

  metrics?: {
    views: number;
    likes: number;
    shares: number;
    saves: number;
    orders: number;
  };

  status?: 'draft' | 'active' | 'out_of_stock' | 'discontinued';
  isActive?: boolean;
  isFeatured?: boolean;

  tags?: string[];
  returnPolicy?: {
    returnable: boolean;
    days: number;
  };

  seller?: {
    id?: string;
    name?: string;
  };

  createdAt?: number;
  updatedAt?: number;
}

const productSchema: Schema<IProduct> = new Schema(
  {
    productId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    brandId: { type: String, ref: 'Brand', required: true },
    styleIds: [{ type: String, ref: 'Style' }],

    pricing: {
      mrp: { type: Number, required: true, min: 0 },
      sellingPrice: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0, max: 100 },
      currency: { type: String, default: 'INR' }
    },

    images: [{
      url: { type: String, required: true },
      publicId: String,
      isPrimary: { type: Boolean, default: false },
      order: Number
    }],

    category: {
      primary: { type: String, required: true, index: true },
      secondary: String,
      tertiary: String
    },

    gender: { type: String, enum: ['Men','Women','Unisex','Boys','Girls'], required: true, index: true },

    variants: [{
      sku: { type: String, required: true, unique: true },
      size: String,
      color: {
        name: String,
        hex: String
      },
      inventory: {
        available: { type: Number, default: 0, min: 0 },
        reserved: { type: Number, default: 0 }
      },
      isAvailable: { type: Boolean, default: true }
    }],

    specifications: {
      material: String,
      pattern: String,
      occasion: [String],
      sleeves: String,
      neckline: String,
      fit: String,
      length: String,
      care: [String],
      countryOfOrigin: String
    },

    sizeChart: { type: Map, of: Schema.Types.Mixed },

    seo: {
      title: String,
      description: String,
      keywords: [String]
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },

    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      orders: { type: Number, default: 0 }
    },

    status: { type: String, enum: ['draft','active','out_of_stock','discontinued'], default: 'draft', index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    tags: [String],
    returnPolicy: {
      returnable: { type: Boolean, default: true },
      days: { type: Number, default: 30 }
    },
    seller: {
      id: String,
      name: String
    },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

productSchema.pre('save', function (next) {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
