# 📡 API Documentation - Coupon Hub

Complete API reference for the Coupon Hub Digital Marketplace.

## Base URLs

- **Admin API**: `http://localhost:3000/api/admin`
- **Customer API**: `http://localhost:3000/api/customer`
- **Reseller API**: `http://localhost:3000/api/v1`

## Authentication

### Reseller API Authentication

All Reseller API endpoints require Bearer token authentication.

**Header Format:**
```
Authorization: Bearer <token>
```

**Default Test Token:**
```
test-reseller-token-12345
```

**Error Response (401):**
```json
{
  "error_code": "UNAUTHORIZED",
  "message": "Missing or invalid authorization header"
}
```

## Admin API

### Create Product

Create a new coupon product.

**Endpoint:** `POST /api/admin/products`

**Request Body:**
```json
{
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com for any purchase",
  "image_url": "https://example.com/amazon-gift-card.jpg",
  "cost_price": 80.00,
  "margin_percentage": 25,
  "value": "AMZN-1234-5678-9012",
  "value_type": "STRING"
}
```

**Field Descriptions:**
- `name` (string, required): Product name
- `description` (string, required): Product description
- `image_url` (string, required): Valid URL to product image
- `cost_price` (number, required): Cost price in dollars (≥ 0)
- `margin_percentage` (number, required): Profit margin percentage (≥ 0)
- `value` (string, required): The actual coupon code/value
- `value_type` (enum, required): "STRING" or "IMAGE"

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com for any purchase",
  "type": "COUPON",
  "image_url": "https://example.com/amazon-gift-card.jpg",
  "cost_price": 80.00,
  "margin_percentage": 25,
  "minimum_sell_price": 100.00,
  "is_sold": false,
  "value": "AMZN-1234-5678-9012",
  "value_type": "STRING",
  "created_at": "2026-03-05T10:00:00.000Z",
  "updated_at": "2026-03-05T10:00:00.000Z"
}
```

**Note:** `minimum_sell_price` is automatically calculated as `cost_price × (1 + margin_percentage / 100)`.

---

### Get All Products

Retrieve all products (including sold ones).

**Endpoint:** `GET /api/admin/products`

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com for any purchase",
    "type": "COUPON",
    "image_url": "https://example.com/amazon-gift-card.jpg",
    "cost_price": 80.00,
    "margin_percentage": 25,
    "minimum_sell_price": 100.00,
    "is_sold": true,
    "value": "AMZN-1234-5678-9012",
    "value_type": "STRING",
    "sold_at": "2026-03-05T10:30:00.000Z",
    "reseller_price": 120.00,
    "created_at": "2026-03-05T10:00:00.000Z",
    "updated_at": "2026-03-05T10:00:00.000Z"
  }
]
```

---

### Get Product by ID

Retrieve a specific product by its ID.

**Endpoint:** `GET /api/admin/products/:id`

**Path Parameters:**
- `id` (UUID): Product ID

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com for any purchase",
  "type": "COUPON",
  "image_url": "https://example.com/amazon-gift-card.jpg",
  "cost_price": 80.00,
  "margin_percentage": 25,
  "minimum_sell_price": 100.00,
  "is_sold": false,
  "value": "AMZN-1234-5678-9012",
  "value_type": "STRING",
  "created_at": "2026-03-05T10:00:00.000Z",
  "updated_at": "2026-03-05T10:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

---

### Update Product

Update an existing product.

**Endpoint:** `PUT /api/admin/products/:id`

**Path Parameters:**
- `id` (UUID): Product ID

**Request Body:**
```json
{
  "name": "Amazon $150 Gift Card",
  "cost_price": 120.00,
  "margin_percentage": 25
}
```

**Note:** All fields are optional. Only provided fields will be updated. If `cost_price` or `margin_percentage` are updated, `minimum_sell_price` is automatically recalculated.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amazon $150 Gift Card",
  "cost_price": 120.00,
  "margin_percentage": 25,
  "minimum_sell_price": 150.00,
  ...
}
```

---

### Delete Product

Delete a product.

**Endpoint:** `DELETE /api/admin/products/:id`

**Path Parameters:**
- `id` (UUID): Product ID

**Response (204 No Content):**
No response body.

**Error Response (404):**
```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

---

## Customer API

### Get Available Products

Retrieve all unsold products (public information only).

**Endpoint:** `GET /api/customer/products`

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com for any purchase",
    "image_url": "https://example.com/amazon-gift-card.jpg",
    "price": 100.00
  }
]
```

**Note:** `cost_price`, `margin_percentage`, and `value` are hidden from customers.

---

### Get Product by ID

Retrieve a specific product (public information only).

**Endpoint:** `GET /api/customer/products/:id`

**Path Parameters:**
- `id` (UUID): Product ID

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com for any purchase",
  "image_url": "https://example.com/amazon-gift-card.jpg",
  "price": 100.00
}
```

---

### Purchase Product

Purchase a product as a customer.

**Endpoint:** `POST /api/customer/products/:id/purchase`

**Path Parameters:**
- `id` (UUID): Product ID

**Request Body:**
None required. Customers pay the `minimum_sell_price`.

**Response (200 OK):**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "final_price": 100.00,
  "value_type": "STRING",
  "value": "AMZN-1234-5678-9012"
}
```

**Error Response (404):**
```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

**Error Response (409):**
```json
{
  "error_code": "PRODUCT_ALREADY_SOLD",
  "message": "Product has already been sold"
}
```

---

## Reseller API

All Reseller API endpoints require Bearer token authentication.

### Get Available Products

Retrieve all unsold products (public information only).

**Endpoint:** `GET /api/v1/products`

**Headers:**
```
Authorization: Bearer test-reseller-token-12345
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com for any purchase",
    "image_url": "https://example.com/amazon-gift-card.jpg",
    "price": 100.00
  }
]
```

**Note:** `cost_price` and `margin_percentage` are hidden from resellers.

---

### Get Product by ID

Retrieve a specific product (public information only).

**Endpoint:** `GET /api/v1/products/:id`

**Headers:**
```
Authorization: Bearer test-reseller-token-12345
```

**Path Parameters:**
- `id` (UUID): Product ID

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com for any purchase",
  "image_url": "https://example.com/amazon-gift-card.jpg",
  "price": 100.00
}
```

---

### Purchase Product

Purchase a product as a reseller with a custom price.

**Endpoint:** `POST /api/v1/products/:id/purchase`

**Headers:**
```
Authorization: Bearer test-reseller-token-12345
```

**Path Parameters:**
- `id` (UUID): Product ID

**Request Body:**
```json
{
  "reseller_price": 120.00
}
```

**Field Descriptions:**
- `reseller_price` (number, required): The price at which the reseller will sell the coupon. Must be ≥ `minimum_sell_price`.

**Response (200 OK):**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "final_price": 120.00,
  "value_type": "STRING",
  "value": "AMZN-1234-5678-9012"
}
```

**Error Response (400):**
```json
{
  "error_code": "RESELLER_PRICE_TOO_LOW",
  "message": "Reseller price 90.00 is below minimum sell price 100.00"
}
```

**Error Response (401):**
```json
{
  "error_code": "UNAUTHORIZED",
  "message": "Invalid token"
}
```

**Error Response (404):**
```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

**Error Response (409):**
```json
{
  "error_code": "PRODUCT_ALREADY_SOLD",
  "message": "Product has already been sold"
}
```

---

## Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T10:00:00.000Z"
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PRODUCT_NOT_FOUND` | 404 | Product does not exist |
| `PRODUCT_ALREADY_SOLD` | 409 | Product has been purchased |
| `RESELLER_PRICE_TOO_LOW` | 400 | Reseller price below minimum |
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Example Usage

### Using curl

```bash
# Create a product (Admin)
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix 1 Month",
    "description": "Netflix Premium subscription",
    "image_url": "https://example.com/netflix.jpg",
    "cost_price": 12.00,
    "margin_percentage": 20,
    "value": "NFLX-ABCD-1234",
    "value_type": "STRING"
  }'

# Get available products (Customer)
curl http://localhost:3000/api/customer/products

# Purchase as reseller
curl -X POST http://localhost:3000/api/v1/products/{product-id}/purchase \
  -H "Authorization: Bearer test-reseller-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"reseller_price": 120.00}'
```

### Using JavaScript (axios)

```javascript
import axios from 'axios';

// Admin: Create product
const createProduct = async () => {
  const response = await axios.post('http://localhost:3000/api/admin/products', {
    name: 'Amazon $100 Gift Card',
    description: 'Gift card',
    image_url: 'https://example.com/image.jpg',
    cost_price: 80.00,
    margin_percentage: 25,
    value: 'AMZN-1234',
    value_type: 'STRING'
  });
  console.log(response.data);
};

// Customer: Purchase product
const purchaseAsCustomer = async (productId) => {
  const response = await axios.post(
    `http://localhost:3000/api/customer/products/${productId}/purchase`
  );
  console.log('Coupon:', response.data.value);
};

// Reseller: Purchase product
const purchaseAsReseller = async (productId) => {
  const response = await axios.post(
    `http://localhost:3000/api/v1/products/${productId}/purchase`,
    { reseller_price: 120.00 },
    { headers: { Authorization: 'Bearer test-reseller-token-12345' } }
  );
  console.log('Coupon:', response.data.value);
};
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing rate limiting using libraries like `express-rate-limit`.

## Pagination

Currently, all endpoints return complete result sets. For production use with large datasets, implement pagination:

```
GET /api/admin/products?page=1&limit=20
```

## Versioning

The Reseller API uses versioning (`/api/v1`). Future versions would be accessible at `/api/v2`, etc.

---

**For support or questions, please refer to the main README.md**
