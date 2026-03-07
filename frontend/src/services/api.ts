import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Admin API client
export const adminApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer API client
export const customerApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/customer`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Coupon {
  id: string;
  name: string;
  description: string;
  type: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  value: string;
  value_type: 'STRING' | 'IMAGE';
  created_at: string;
  updated_at: string;
  sold_at?: string;
  reseller_price?: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

export interface CreateCouponDTO {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value: string;
  value_type: 'STRING' | 'IMAGE';
}

export interface PurchaseResponse {
  product_id: string;
  final_price: number;
  value_type: 'STRING' | 'IMAGE';
  value: string;
}

// Admin API methods
export const adminService = {
  async createCoupon(data: CreateCouponDTO): Promise<Coupon> {
    const response = await adminApi.post('/products', data);
    return response.data;
  },

  async getAllProducts(): Promise<Coupon[]> {
    const response = await adminApi.get('/products');
    return response.data;
  },

  async getProductById(id: string): Promise<Coupon> {
    const response = await adminApi.get(`/products/${id}`);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<CreateCouponDTO>): Promise<Coupon> {
    const response = await adminApi.put(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await adminApi.delete(`/products/${id}`);
  },
};

// Customer API methods
export const customerService = {
  async getAvailableProducts(): Promise<PublicProduct[]> {
    const response = await customerApi.get('/products');
    return response.data;
  },

  async getProductById(id: string): Promise<PublicProduct> {
    const response = await customerApi.get(`/products/${id}`);
    return response.data;
  },

  async purchaseProduct(id: string): Promise<PurchaseResponse> {
    const response = await customerApi.post(`/products/${id}/purchase`);
    return response.data;
  },
};
