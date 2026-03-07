import { ProductRepository } from '../repositories/product.repository';
import { PricingService } from './pricing.service';
import { 
  Coupon, 
  CreateCouponDTO, 
  UpdateCouponDTO, 
  PublicProduct, 
  PurchaseResponse 
} from '../models/product.model';
import { 
  ProductNotFoundError, 
  ProductAlreadySoldError, 
  ResellerPriceTooLowError 
} from '../utils/errors';

export class ProductService {
  private productRepository: ProductRepository;
  private pricingService: PricingService;

  constructor() {
    this.productRepository = new ProductRepository();
    this.pricingService = new PricingService();
  }

  async createCoupon(dto: CreateCouponDTO): Promise<Coupon> {
    const minimumSellPrice = this.pricingService.calculateMinimumSellPrice(
      dto.cost_price,
      dto.margin_percentage
    );
    
    return await this.productRepository.createCoupon(dto, minimumSellPrice);
  }

  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.productRepository.getCouponById(id);
    
    if (!coupon) {
      throw new ProductNotFoundError();
    }
    
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await this.productRepository.getAllCoupons();
  }

  async getAvailableCoupons(): Promise<Coupon[]> {
    return await this.productRepository.getAvailableCoupons();
  }

  async updateCoupon(id: string, dto: UpdateCouponDTO): Promise<Coupon> {
    // Check if product exists
    const existingCoupon = await this.productRepository.getCouponById(id);
    if (!existingCoupon) {
      throw new ProductNotFoundError();
    }

    // Recalculate minimum_sell_price if cost_price or margin_percentage changed
    let minimumSellPrice: number | undefined;
    
    const newCostPrice = dto.cost_price !== undefined ? dto.cost_price : existingCoupon.cost_price;
    const newMarginPercentage = dto.margin_percentage !== undefined ? dto.margin_percentage : existingCoupon.margin_percentage;
    
    //if cost_price or margin_percentage changed, recalculate minimum_sell_price
    if (dto.cost_price !== undefined || dto.margin_percentage !== undefined) {
      minimumSellPrice = this.pricingService.calculateMinimumSellPrice(
        newCostPrice,
        newMarginPercentage
      );
    }
    
    const updated = await this.productRepository.updateCoupon(id, dto, minimumSellPrice);
    
    if (!updated) {
      throw new ProductNotFoundError();
    }
    
    return updated;
  }

  async deleteCoupon(id: string): Promise<void> {
    const deleted = await this.productRepository.deleteCoupon(id);
    
    if (!deleted) {
      throw new ProductNotFoundError();
    }
  }

  async purchaseCouponAsCustomer(id: string): Promise<PurchaseResponse> {
    const coupon = await this.productRepository.getCouponById(id);
    
    if (!coupon) {
      throw new ProductNotFoundError();
    }
    
    if (coupon.is_sold) {
      throw new ProductAlreadySoldError();
    }
    
    const purchasedCoupon = await this.productRepository.purchaseCoupon(id);
    
    if (!purchasedCoupon) {
      throw new ProductAlreadySoldError();
    }
    
    return {
      product_id: purchasedCoupon.id,
      final_price: purchasedCoupon.minimum_sell_price,
      value_type: purchasedCoupon.value_type,
      value: purchasedCoupon.value,
    };
  }

  async purchaseCouponAsReseller(id: string, resellerPrice: number): Promise<PurchaseResponse> {
    const coupon = await this.productRepository.getCouponById(id);
    
    if (!coupon) {
      throw new ProductNotFoundError();
    }
    
    if (coupon.is_sold) {
      throw new ProductAlreadySoldError();
    }
    
    // Validate reseller price
    if (!this.pricingService.validateResellerPrice(resellerPrice, coupon.minimum_sell_price)) {
      throw new ResellerPriceTooLowError(
        `Reseller price ${resellerPrice} is below minimum sell price ${coupon.minimum_sell_price}`
      );
    }
    
    const purchasedCoupon = await this.productRepository.purchaseCoupon(id, resellerPrice);
    
    if (!purchasedCoupon) {
      throw new ProductAlreadySoldError();
    }
    
    return {
      product_id: purchasedCoupon.id,
      final_price: resellerPrice,
      value_type: purchasedCoupon.value_type,
      value: purchasedCoupon.value,
    };
  }

  /**
   * Convert a Coupon to a PublicProduct (hides sensitive data)
   */
  toPublicProduct(coupon: Coupon): PublicProduct {
    const { id, name, description, image_url, minimum_sell_price } = coupon;
    return {
      id,
      name,
      description,
      image_url,
      price: minimum_sell_price,
    };
  }
}
