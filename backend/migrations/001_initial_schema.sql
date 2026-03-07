-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create product_type enum
CREATE TYPE product_type AS ENUM ('COUPON');

-- Create value_type enum
CREATE TYPE value_type AS ENUM ('STRING', 'IMAGE');

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type product_type NOT NULL DEFAULT 'COUPON',
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
    margin_percentage DECIMAL(5, 2) NOT NULL CHECK (margin_percentage >= 0),
    minimum_sell_price DECIMAL(10, 2) NOT NULL CHECK (minimum_sell_price >= 0),
    is_sold BOOLEAN DEFAULT FALSE,
    value TEXT NOT NULL UNIQUE,
    value_type value_type NOT NULL,
    sold_at TIMESTAMP WITH TIME ZONE,
    reseller_price DECIMAL(10, 2)
);

-- Create resellers table
CREATE TABLE resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    api_token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_coupons_is_sold ON coupons(is_sold);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_coupons_sold_at ON coupons(sold_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test reseller (token: test-reseller-token-12345)
-- Token hash is bcrypt hash of 'test-reseller-token-12345'
INSERT INTO resellers (name, api_token_hash) VALUES 
    ('Test Reseller', '$2b$10$YQ6P8ZXqKzYs8kQjG.RlU.Vv0E7GxJxGnxF5qZwM5RlHUuZvYJYYK');

-- Comments
COMMENT ON TABLE products IS 'Base table for all product types';
COMMENT ON TABLE coupons IS 'Coupon-specific product information';
COMMENT ON TABLE resellers IS 'External reseller accounts with API access';
COMMENT ON COLUMN coupons.minimum_sell_price IS 'Calculated as: cost_price * (1 + margin_percentage / 100)';
