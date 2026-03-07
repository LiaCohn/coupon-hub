export enum ProductType {
  COUPON = 'COUPON'
}

export enum ValueType {
  STRING = 'STRING',
  IMAGE = 'IMAGE'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  image_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface Coupon extends Product {
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  value: string;
  value_type: ValueType;
  sold_at?: Date;
  reseller_price?: number;
}

export interface CreateCouponDTO {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value: string;
  value_type: ValueType;
}

export interface UpdateCouponDTO {
  name?: string;
  description?: string;
  image_url?: string;
  cost_price?: number;
  margin_percentage?: number;
  value?: string;
  value_type?: ValueType;
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

export interface PurchaseResponse {
  product_id: string;
  final_price: number;
  value_type: ValueType;
  value: string;
}
