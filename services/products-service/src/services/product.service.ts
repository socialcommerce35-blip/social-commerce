import { Product, IProduct } from '../models/product.model';
import { logger } from '../utils/logger';

export const getProducts = async (filters: any): Promise<IProduct[]> => {
  try {
    const query: any = {};
    if (filters?.price) query.price = { $gte: filters.price.min, $lte: filters.price.max };
    if (filters?.brands) query.brand_name = { $in: filters.brands };
    if (filters?.styles) query.style = { $in: filters.styles };
    if (filters?.category) query.category = filters.category;

    const products = await Product.find(query);
    return products;
  } catch (error) {
    logger.error('Error in getProducts service:', error);
    throw error;
  }
};


export const getBrandsByPriceRange = async (
  min: number,
  max?: number
): Promise<Record<string, string[]>> => {
  try {
    const pipeline: any[] = [];

    // Step 1: Match by min/max
    if (max) {
      pipeline.push({ $match: { price: { $gte: min, $lte: max } } });
    } else {
      // If max not provided → min+
      pipeline.push({ $match: { price: { $gte: min } } });
    }

    // Step 2: Add category buckets
    pipeline.push({
      $addFields: {
        priceCategory: {
          $switch: {
            branches: [
              { case: { $lte: ["$price", 500] }, then: "0-500" },
              { case: { $and: [{ $gt: ["$price", 500] }, { $lte: ["$price", 1000] }] }, then: "500-1000" },
              { case: { $and: [{ $gt: ["$price", 1000] }, { $lte: ["$price", 1500] }] }, then: "1000-1500" }
            ],
            default: "1500+"
          }
        }
      }
    });

    // Step 3: Group by category → unique brands
    pipeline.push({
      $group: {
        _id: "$priceCategory",
        brands: { $addToSet: "$brand_name" }
      }
    });

    const result = await Product.aggregate(pipeline);

    // Convert array → object { category: [brands] }
    const categoryBrands: Record<string, string[]> = {};
    result.forEach((item) => {
      categoryBrands[item._id] = item.brands;
    });

    return categoryBrands;
  } catch (error) {
    logger.error("Error in getBrandsByPriceRange service:", error);
    throw error;
  }
};
export const getStylesByBrands = async (brands: string[]): Promise<Record<string, string[]>> => {
  try {
    const result = await Product.aggregate([
      { $match: { brand_name: { $in: brands } } },
      {
        $group: {
          _id: "$brand_name",
          styles: { $addToSet: "$style" } // unique styles
        }
      }
    ]);

    // Transform result into { brand: styles[] } object
    const brandStyles: Record<string, string[]> = {};
    result.forEach((item) => {
      brandStyles[item._id] = item.styles;
    });

    return brandStyles;
  } catch (error) {
    logger.error('Error in getStylesByBrands service:', error);
    throw error;
  }
};
