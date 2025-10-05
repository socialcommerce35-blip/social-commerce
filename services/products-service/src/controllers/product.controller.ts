import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export const fetchProducts = async (req: Request, res: Response) => {
  console.log('here')
  try {
    const filters = req.body;
    const products = await productService.getProducts(filters);
    res.json(successResponse(products));
  } catch (error) {
    res.status(500).json(errorResponse());
  }
};

export const fetchBrandsByPrice = async (req: Request, res: Response) => {
  try {
    console.log('here2')
    const { min, max } = req.body;
    const brands = await productService.getBrandsByPriceRange(min, max);
    res.json(successResponse(brands));
  } catch (error) {
    res.status(500).json(errorResponse());
  }
};

export const fetchStylesByBrands = async (req: Request, res: Response) => {
  try {
    const { brands } = req.body;
    const styles = await productService.getStylesByBrands(brands);
    res.json(successResponse(styles));
  } catch (error) {
    res.status(500).json(errorResponse());
  }
};
