import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/responseHandler';

export const fetchProducts = async (req: Request, res: Response) => {
  try {
    const filters = req.body;
    const products = await productService.getProducts(filters);
    res.json(successResponse(products));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
};

export const fetchBrandsByPrice = async (req: Request, res: Response) => {
  try {
    const bucketsWithBrands = await productService.getBrandsByPriceRange();
    res.json(successResponse(bucketsWithBrands));
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
};

export const fetchStylesByBuckets = async (req: Request, res: Response) => {
  try {
    const { bucketIds } = req.body;

    if (!bucketIds || !Array.isArray(bucketIds) || bucketIds.length === 0) {
      return res.status(400).json(errorResponse("bucketIds required"));
    }

    // Step 1: Get brands in selected buckets
    const brandsInBuckets = await productService.getBrandsByBucketIds(bucketIds);

    // Step 2: Flatten brandIds for querying styles
    const brandIds: string[] = [];
    bucketIds.forEach((bucketId: string) => {
      const brandsInBucket = brandsInBuckets[bucketId];
      if (brandsInBucket) {
        brandsInBucket.forEach(b => brandIds.push(b.brandId));
      }
    });

    // Step 3: Get unique styles for these brandIds
    const { styles, count } = await productService.getStylesByBrands(brandIds);

    res.json(successResponse({ count, styles }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || "Something went wrong"));
  }
};