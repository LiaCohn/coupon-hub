# 🏗️ Architecture Documentation - Coupon Hub

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Network                           │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │      │   Backend    │      │  PostgreSQL  │  │
│  │   (Nginx)    │─────▶│   (Express)  │─────▶│   Database   │  │
│  │   Port 80    │      │  Port 3000   │      │  Port 5432   │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                                 │
│         │                      │                                 │
│         │                      ├─────────────────┐              │
│         │                      │                 │              │
│    Browser                 Admin API      Reseller API          │
│    Requests             Customer API    (Bearer Auth)           │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layered Architecture

The backend follows a clean, layered architecture:

```
┌─────────────────────────────────────────────┐
│            Controllers                       │  ← HTTP Request Handlers
│  (admin, customer, reseller)                │
├─────────────────────────────────────────────┤
│            Middleware                        │  ← Auth, Validation, Errors
│  (auth, validation, error)                  │
├─────────────────────────────────────────────┤
│            Services                          │  ← Business Logic
│  (product, pricing, auth)                   │
├─────────────────────────────────────────────┤
│            Repositories                      │  ← Data Access
│  (product, reseller)                        │
├─────────────────────────────────────────────┤
│            Database (PostgreSQL)             │  ← Data Persistence
└─────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. Controllers
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Parse request parameters
  - Call appropriate services
  - Format responses
  - Delegate error handling to middleware
- **Example**: `AdminController.createProduct()`

#### 2. Services
- **Purpose**: Implement core business logic
- **Responsibilities**:
  - Pricing calculations
  - Purchase validation
  - Token authentication
  - Transaction orchestration
- **Example**: `PricingService.calculateMinimumSellPrice()`

#### 3. Repositories
- **Purpose**: Manage database operations
- **Responsibilities**:
  - CRUD operations
  - Query building
  - Transaction management
  - Data mapping
- **Example**: `ProductRepository.purchaseCoupon()`

#### 4. Middleware
- **Purpose**: Request/response processing pipeline
- **Responsibilities**:
  - Authentication (Bearer tokens)
  - Input validation
  - Error handling
  - Logging
- **Example**: `authenticateReseller()`

### Request Flow

#### Admin Create Product Flow
```
1. POST /api/admin/products
2. → Validation Middleware (validate input)
3. → AdminController.createProduct()
4. → ProductService.createCoupon()
5. → PricingService.calculateMinimumSellPrice()
6. → ProductRepository.createCoupon()
7. → Database Transaction (BEGIN)
8. → INSERT INTO products
9. → INSERT INTO coupons
10. → Database Transaction (COMMIT)
11. ← Return created coupon
12. ← HTTP 201 response
```

#### Reseller Purchase Flow
```
1. POST /api/v1/products/:id/purchase
2. → Auth Middleware (validate Bearer token)
3. → Validation Middleware (validate input)
4. → ResellerController.purchaseProduct()
5. → ProductService.purchaseCouponAsReseller()
6. → ProductRepository.getCouponById() (check exists)
7. → PricingService.validateResellerPrice()
8. → ProductRepository.purchaseCoupon()
9. → Database Transaction (BEGIN)
10. → SELECT ... FOR UPDATE (row lock)
11. → Check is_sold status
12. → UPDATE coupons SET is_sold = true
13. → Database Transaction (COMMIT)
14. ← Return coupon value
15. ← HTTP 200 response
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│      products       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
│ type                │
│ image_url           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ 1:1
          ▼
┌─────────────────────┐
│      coupons        │
├─────────────────────┤
│ id (PK, FK)         │
│ cost_price          │
│ margin_percentage   │
│ minimum_sell_price  │
│ is_sold             │
│ value               │
│ value_type          │
│ sold_at             │
│ reseller_price      │
└─────────────────────┘

┌─────────────────────┐
│     resellers       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ api_token_hash      │
│ created_at          │
└─────────────────────┘
```

### Table Details

#### products
- **Purpose**: Base table for all product types
- **Design**: Supports future product types beyond coupons
- **Key Constraints**:
  - `id` is UUID primary key
  - `type` is enum (currently only COUPON)
  - Auto-updated `updated_at` via trigger

#### coupons
- **Purpose**: Coupon-specific data
- **Design**: One-to-one with products
- **Key Constraints**:
  - `id` references products(id) with CASCADE delete
  - CHECK: `cost_price >= 0`
  - CHECK: `margin_percentage >= 0`
  - UNIQUE: `value` (no duplicate coupon codes)
  - INDEX: `is_sold` for fast availability queries

#### resellers
- **Purpose**: External reseller accounts
- **Design**: Stores authentication credentials
- **Key Constraints**:
  - `api_token_hash` is bcrypt hash (not plaintext)
  - UNIQUE: `api_token_hash`

### Indexes

```sql
-- Fast lookup of available products
CREATE INDEX idx_coupons_is_sold ON coupons(is_sold);

-- Fast product type filtering
CREATE INDEX idx_products_type ON products(type);

-- Fast sold date queries
CREATE INDEX idx_coupons_sold_at ON coupons(sold_at);
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── CustomerPage
│   │   ├── CouponCard (multiple)
│   │   └── PurchaseModal
│   └── AdminPage
│       ├── ProductForm
│       └── ProductList
```

### State Management

- **Approach**: React Hooks (useState, useEffect)
- **No Redux**: Simple enough for local component state
- **API Client**: Axios with separate instances for each API

### Routing

- **Library**: React Router v6
- **Routes**:
  - `/` → Customer Page
  - `/admin` → Admin Page

### API Service Layer

```typescript
// Separation of concerns
adminService.createCoupon(data)
customerService.purchaseProduct(id)

// Axios instances with base URLs
adminApi    → /api/admin
customerApi → /api/customer
```

## Security Architecture

### Authentication Flow (Reseller API)

```
1. Client sends request with Bearer token
2. → Auth Middleware extracts token
3. → AuthService.validateBearerToken()
4. → Fetch all resellers from database
5. → Compare token with each hash (bcrypt.compare)
6. → If match found: attach reseller to request
7. → If no match: throw UnauthorizedError
8. → Continue to controller or return 401
```

### Token Storage

- **Never store plaintext tokens**
- Use bcrypt with salt rounds = 10
- Hash on registration/creation
- Compare on authentication

### Price Protection

- **Client cannot send** `cost_price` or `margin_percentage`
- **Server calculates** `minimum_sell_price`
- **Validation** ensures `reseller_price >= minimum_sell_price`
- **Stored in database** for audit trail

### SQL Injection Prevention

```typescript
// ✅ Safe: Parameterized queries
query('SELECT * FROM products WHERE id = $1', [id])

// ❌ Unsafe: String concatenation (never do this)
query(`SELECT * FROM products WHERE id = '${id}'`)
```

### Race Condition Prevention

```sql
-- Atomic purchase with row locking
BEGIN;
SELECT * FROM coupons WHERE id = $1 AND is_sold = false FOR UPDATE;
-- Check status, validate, then update
UPDATE coupons SET is_sold = true WHERE id = $1;
COMMIT;
```

## Scalability Considerations

### Current Limitations

1. **No caching**: Every request hits the database
2. **No pagination**: All products returned at once
3. **Single database**: No read replicas or sharding
4. **No CDN**: Static assets served from containers
5. **No rate limiting**: Open to abuse

### Future Improvements

#### Short-term
- Add Redis for caching frequently accessed products
- Implement pagination (limit/offset)
- Add database indexes for common queries
- Implement rate limiting per IP/token

#### Long-term
- Read replicas for product queries
- Write master for purchases
- CDN for static assets and images
- Horizontal scaling with load balancer
- Message queue for async operations
- Microservices architecture if needed

## Deployment Architecture

### Docker Compose Setup

```yaml
services:
  postgres:    # Data persistence
  backend:     # API server
  frontend:    # Static file server (Nginx)

networks:
  coupon-hub-network:  # Internal communication

volumes:
  postgres_data:  # Database persistence
```

### Container Communication

- **Frontend → Backend**: HTTP via Docker network DNS
- **Backend → Database**: PostgreSQL protocol
- **External → Frontend**: Port 80
- **External → Backend**: Port 3000

### Health Checks

- **PostgreSQL**: `pg_isready` every 10s
- **Backend**: Depends on healthy database
- **Frontend**: Depends on backend

## Error Handling Strategy

### Error Flow

```
1. Error occurs in repository/service
2. → Throw custom error (e.g., ProductNotFoundError)
3. → Caught by Express error middleware
4. → Mapped to HTTP status code
5. → Formatted as standard error response
6. → Logged for debugging
7. → Sent to client
```

### Error Response Format

```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Human readable message"
}
```

### Custom Error Classes

```typescript
ProductNotFoundError → 404
ProductAlreadySoldError → 409
ResellerPriceTooLowError → 400
UnauthorizedError → 401
ValidationError → 400
```

## Testing Strategy

### Unit Testing (Future)
- Services: Pricing calculations, validation logic
- Repositories: Database operations (with mock)
- Middleware: Authentication, validation

### Integration Testing
- API endpoints with test database
- Full request/response cycle
- Transaction rollback between tests

### E2E Testing
- Automated with test script (`test-api.sh`)
- Manual testing via frontend
- All user flows covered

## Monitoring & Logging

### Current Implementation
- Console logging for queries
- Error logging in error middleware
- Docker logs accessible via `docker-compose logs`

### Future Improvements
- Structured logging (Winston, Pino)
- Log aggregation (ELK stack)
- APM (Application Performance Monitoring)
- Metrics (Prometheus, Grafana)
- Alerting on errors/slow queries

## Performance Considerations

### Database
- Indexes on frequently queried columns
- Connection pooling (20 connections)
- Prepared statements (parameterized queries)
- Transaction isolation level: READ COMMITTED

### Backend
- Async/await for non-blocking I/O
- No unnecessary middleware
- Efficient data structures
- Early validation to fail fast

### Frontend
- Vite for fast builds
- Code splitting (automatic)
- Image optimization (future)
- Lazy loading (future)

---

**This architecture balances simplicity with best practices, suitable for a production-ready MVP that can scale as needed.**
