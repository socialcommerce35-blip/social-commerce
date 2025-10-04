import { Product, IProduct } from '../models/product.model';
import { logger } from '../utils/logger';

export const getProducts = async (filters: any): Promise<IProduct[]> => {
  try {
    const query: any = {};
    if (filters.price) query.price = { $gte: filters.price.min, $lte: filters.price.max };
    if (filters.brands) query.brand_name = { $in: filters.brands };
    if (filters.styles) query.style = { $in: filters.styles };
    if (filters.category) query.category = filters.category;

    const products = await Product.find(query);
    return products;
  } catch (error) {
    logger.error('Error in getProducts service:', error);
    throw error;
  }
};

export const getBrandsByPriceRange = async (min: number, max: number): Promise<string[]> => {
  try {
    return await Product.find({ price: { $gte: min, $lte: max } }).distinct('brand_name');
  } catch (error) {
    logger.error('Error in getBrandsByPriceRange service:', error);
    throw error;
  }
};

export const getStylesByBrands = async (brands: string[]): Promise<string[]> => {
  try {
    return await Product.find({ brand_name: { $in: brands } }).distinct('style');
  } catch (error) {
    logger.error('Error in getStylesByBrands service:', error);
    throw error;
  }
};
