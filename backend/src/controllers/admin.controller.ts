import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CreateCouponDTO, UpdateCouponDTO } from '../models/product.model';
import { ValidationError } from '../utils/errors';

const productService = new ProductService();
const authService = new AuthService();

export class AdminController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateCouponDTO = req.body;
      const coupon = await productService.createCoupon(dto);
      
      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await productService.getAllCoupons();
      
      res.json(coupons);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await productService.getCouponById(id);
      
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dto: UpdateCouponDTO = req.body;
      
      const coupon = await productService.updateCoupon(id, dto);
      
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await productService.deleteCoupon(id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async createReseller(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      
      if (!name || name.trim() === '') {
        throw new ValidationError('Reseller name is required');
      }
      
      const result = await authService.createReseller(name.trim());
      
      res.status(201).json({
        reseller: {
          id: result.reseller.id,
          name: result.reseller.name,
          created_at: result.reseller.created_at
        },
        token: result.token,
        message: 'Store this token securely - it will not be shown again!'
      });
    } catch (error) {
      next(error);
    }
  }
}
