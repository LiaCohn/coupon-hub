import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

const productService = new ProductService();

export class CustomerController {
  async getAvailableProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await productService.getAvailableCoupons();
      
      // Convert to public format (hide sensitive data)
      const publicProducts = coupons.map(coupon => productService.toPublicProduct(coupon));
      
      res.json(publicProducts);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await productService.getCouponById(id);
      
      // Convert to public format
      const publicProduct = productService.toPublicProduct(coupon);
      
      res.json(publicProduct);
    } catch (error) {
      next(error);
    }
  }

  async purchaseProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const purchaseResponse = await productService.purchaseCouponAsCustomer(id);
      
      res.json(purchaseResponse);
    } catch (error) {
      next(error);
    }
  }
}
