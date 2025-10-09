import { Style, IStyle } from "../models/style.model";
import { Bucket, IBucket } from '../models/buckets.model';
import { Brand, IBrand } from '../models/brand.model';
import { Product, IProduct } from '../models/product.model';
import { logger } from '../utils/logger';

import { FilterQuery } from 'mongoose';

interface ProductFilters {
  price?: { min: number; max: number };
  brands?: string[];
  styles?: string[];
  category?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (filters: ProductFilters) => {
  try {
    const query: FilterQuery<IProduct> = {};

    if (filters?.price) {
      query.price = { $gte: filters.price.min, $lte: filters.price.max };
    }
    if (filters?.brands) {
      query.brandId = { $in: filters.brands };
    }
    if (filters?.styles) {
      query.styleIds = { $in: filters.styles };
    }
    if (filters?.category) {
      query.category = filters.category;
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ modern .lean() typing works automatically
    ]);

    return {
      success: true,
      total,
      count: products.length,
      page,
      totalPages: Math.ceil(total / limit),
      products, // plain JS objects (fast for API)
    };
  } catch (error) {
    logger.error('Error in getProducts service:', error);
    throw error;
  }
};



export const getBrandsByPriceRange = async (): Promise<any[]> => {
  // Fetch all buckets
  const buckets: IBucket[] = await Bucket.find({ isActive: true }).sort({ displayOrder: 1 });

  const result = [];

  for (const bucket of buckets) {
    // Fetch brands linked to this bucket
    const brands: IBrand[] = await Brand.find({
      brandId: { $in: bucket.brandIds },
      isActive: true
    });

    result.push({
      bucketId: bucket.bucketId,
      bucketName: bucket.name,
      priceRange: bucket.priceRange,
      brands: brands.map(b => ({
        brandId: b.brandId,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        description: b.description,
        website: b.website,
        metadata: b.metadata
      }))
    });
  }

  return result;
};

export const getStylesByBrands = async (brandIds: string[]) => {
  if (!brandIds || brandIds.length === 0) return { styles: [], count: 0 };

  const styles = await Style.find({
    brandIds: { $in: brandIds },
    isActive: true
  }).sort({ displayOrder: 1 });

  // Remove duplicates by styleId
  const uniqueStylesMap: Record<string, any> = {};
  styles.forEach(style => {
    uniqueStylesMap[style.styleId] = style;
  });

  const uniqueStyles = Object.values(uniqueStylesMap);
  return { styles: uniqueStyles, count: uniqueStyles.length };
};

export const getBrandsByBucketIds = async (bucketIds: string[]) => {
  const buckets = await Bucket.find({ 
    bucketId: { $in: bucketIds },
    isActive: true
  });

  // Map bucketId => array of brands
  const result: Record<string, { brandId: string }[]> = {};

  buckets.forEach(bucket => {
    result[bucket.bucketId] = bucket.brandIds.map(brandId => ({ brandId }));
  });

  return result;
};