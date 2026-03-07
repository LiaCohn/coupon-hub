import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../config/database';
import { Coupon, CreateCouponDTO, UpdateCouponDTO, ProductType } from '../models/product.model';

export class ProductRepository {
  async createCoupon(dto: CreateCouponDTO, minimumSellPrice: number): Promise<Coupon> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const productId = uuidv4();
      
      // Insert into products table
      await client.query(
        `INSERT INTO products (id, name, description, type, image_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, dto.name, dto.description, ProductType.COUPON, dto.image_url]
      );
      
      // Insert into coupons table
      await client.query(
        `INSERT INTO coupons (id, cost_price, margin_percentage, minimum_sell_price, value, value_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, dto.cost_price, dto.margin_percentage, minimumSellPrice, dto.value, dto.value_type]
      );
      
      await client.query('COMMIT');
      
      // Fetch and return the created coupon
      const result = await this.getCouponById(productId);
      return result!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCouponById(id: string): Promise<Coupon | null> {
    const result = await query(
      `SELECT 
        p.id, p.name, p.description, p.type, p.image_url, p.created_at, p.updated_at,
        c.cost_price, c.margin_percentage, c.minimum_sell_price, c.is_sold, 
        c.value, c.value_type, c.sold_at, c.reseller_price
       FROM products p
       INNER JOIN coupons c ON p.id = c.id
       WHERE p.id = $1`,
      [id]
    );
    
    return result.rows.length > 0 ? this.mapRowToCoupon(result.rows[0]) : null;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const result = await query(
      `SELECT 
        p.id, p.name, p.description, p.type, p.image_url, p.created_at, p.updated_at,
        c.cost_price, c.margin_percentage, c.minimum_sell_price, c.is_sold, 
        c.value, c.value_type, c.sold_at, c.reseller_price
       FROM products p
       INNER JOIN coupons c ON p.id = c.id
       ORDER BY p.created_at DESC`
    );
    
    return result.rows.map(row => this.mapRowToCoupon(row));
  }

  async getAvailableCoupons(): Promise<Coupon[]> {
    const result = await query(
      `SELECT 
        p.id, p.name, p.description, p.type, p.image_url, p.created_at, p.updated_at,
        c.cost_price, c.margin_percentage, c.minimum_sell_price, c.is_sold, 
        c.value, c.value_type, c.sold_at, c.reseller_price
       FROM products p
       INNER JOIN coupons c ON p.id = c.id
       WHERE c.is_sold = false
       ORDER BY p.created_at DESC`
    );
    
    return result.rows.map(row => this.mapRowToCoupon(row));
  }

  async updateCoupon(id: string, dto: UpdateCouponDTO, minimumSellPrice?: number): Promise<Coupon | null> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Build dynamic update query for products
      const productUpdates: string[] = [];
      const productValues: any[] = [];
      let paramCount = 1;
      
      if (dto.name !== undefined) {
        productUpdates.push(`name = $${paramCount++}`);
        productValues.push(dto.name);
      }
      if (dto.description !== undefined) {
        productUpdates.push(`description = $${paramCount++}`);
        productValues.push(dto.description);
      }
      if (dto.image_url !== undefined) {
        productUpdates.push(`image_url = $${paramCount++}`);
        productValues.push(dto.image_url);
      }
      
      if (productUpdates.length > 0) {
        productValues.push(id);
        await client.query(
          `UPDATE products SET ${productUpdates.join(', ')} WHERE id = $${paramCount}`,
          productValues
        );
      }
      
      // Build dynamic update query for coupons
      const couponUpdates: string[] = [];
      const couponValues: any[] = [];
      paramCount = 1;
      
      if (dto.cost_price !== undefined) {
        couponUpdates.push(`cost_price = $${paramCount++}`);
        couponValues.push(dto.cost_price);
      }
      if (dto.margin_percentage !== undefined) {
        couponUpdates.push(`margin_percentage = $${paramCount++}`);
        couponValues.push(dto.margin_percentage);
      }
      if (minimumSellPrice !== undefined) {
        couponUpdates.push(`minimum_sell_price = $${paramCount++}`);
        couponValues.push(minimumSellPrice);
      }
      if (dto.value !== undefined) {
        couponUpdates.push(`value = $${paramCount++}`);
        couponValues.push(dto.value);
      }
      if (dto.value_type !== undefined) {
        couponUpdates.push(`value_type = $${paramCount++}`);
        couponValues.push(dto.value_type);
      }
      
      if (couponUpdates.length > 0) {
        couponValues.push(id);
        await client.query(
          `UPDATE coupons SET ${couponUpdates.join(', ')} WHERE id = $${paramCount}`,
          couponValues
        );
      }
      
      await client.query('COMMIT');
      
      return await this.getCouponById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async purchaseCoupon(id: string, resellerPrice?: number): Promise<Coupon | null> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Lock the row for update
      const result = await client.query(
        `SELECT 
          p.id, p.name, p.description, p.type, p.image_url, p.created_at, p.updated_at,
          c.cost_price, c.margin_percentage, c.minimum_sell_price, c.is_sold, 
          c.value, c.value_type, c.sold_at, c.reseller_price
         FROM products p
         INNER JOIN coupons c ON p.id = c.id
         WHERE p.id = $1
         FOR UPDATE`,
        [id]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      const coupon = this.mapRowToCoupon(result.rows[0]);
      
      if (coupon.is_sold) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Mark as sold
      await client.query(
        `UPDATE coupons 
         SET is_sold = true, sold_at = CURRENT_TIMESTAMP, reseller_price = $1
         WHERE id = $2`,
        [resellerPrice || coupon.minimum_sell_price, id]
      );
      
      await client.query('COMMIT');
      
      // Return updated coupon
      return await this.getCouponById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapRowToCoupon(row: any): Coupon {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      image_url: row.image_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cost_price: parseFloat(row.cost_price),
      margin_percentage: parseFloat(row.margin_percentage),
      minimum_sell_price: parseFloat(row.minimum_sell_price),
      is_sold: row.is_sold,
      value: row.value,
      value_type: row.value_type,
      sold_at: row.sold_at,
      reseller_price: row.reseller_price ? parseFloat(row.reseller_price) : undefined,
    };
  }
}
