import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const productService = new ProductService();

export class ResellerController {
  async getAvailableProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await productService.getAvailableCoupons();
      
      // Convert to public format (hide cost_price and margin_percentage)
      const publicProducts = coupons.map(coupon => productService.toPublicProduct(coupon));
      
      res.json(publicProducts);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  async purchaseProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reseller_price } = req.body;
      
      const purchaseResponse = await productService.purchaseCouponAsReseller(id, reseller_price);
      
      res.json(purchaseResponse);
    } catch (error) {
      next(error);
    }
  }
}
