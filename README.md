# 🎟️ Coupon Hub - Digital Coupon Marketplace

A full-stack digital marketplace for selling coupon-based products through direct customer purchases and external reseller API integration. Built with Node.js/Express, PostgreSQL, React, and fully Dockerized.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Business Logic](#business-logic)
- [Security](#security)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- **Admin Dashboard**: Create, view, update, and delete coupon products
- **Customer Storefront**: Browse and purchase digital coupons
- **Reseller API**: Secure REST API for external resellers with Bearer token authentication
- **Strict Pricing Rules**: Server-side price calculation and validation
- **Atomic Transactions**: Thread-safe purchase operations with PostgreSQL row locking
- **Type Safety**: Full TypeScript implementation across frontend and backend

### Technical Highlights
- 🔒 Bearer token authentication for reseller API
- 💰 Automatic pricing calculation: `minimum_sell_price = cost_price × (1 + margin_percentage / 100)`
- 🔄 Real-time product availability
- 🐳 Fully Dockerized with docker-compose
- 📊 PostgreSQL with proper relationships and constraints
- 🎨 Modern, responsive React UI

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React Frontend │ ───────▶│  Express Backend │ ───────▶│ PostgreSQL  │
│   (Port 80)     │         │   (Port 3000)    │         │  Database   │
└─────────────────┘         └──────────────────┘         └─────────────┘
        │                            │
        │                            │
        ▼                            ▼
  Customer/Admin UI          Reseller API (Bearer Auth)
```

### Technology Stack

**Backend:**
- Node.js 18 with Express
- TypeScript for type safety
- PostgreSQL 15 with pg driver
- bcrypt for token hashing
- express-validator for request validation

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Axios for API calls
- React Router for navigation

**Infrastructure:**
- Docker & Docker Compose
- Nginx for frontend serving
- Multi-stage builds for optimization

## 📦 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git
- (Optional) Node.js 18+ and npm for local development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Coupon_Hub
```

### 2. Start the Application

That's it! Just one command:

```bash
docker-compose up --build
```

This single command will automatically:
- Install all backend dependencies
- Install all frontend dependencies
- Build the TypeScript backend
- Build the React frontend
- Start PostgreSQL database
- Run database migrations
- Start all services

**No additional setup needed!**

Services will be available on:
- **PostgreSQL** on port 5432
- **Backend API** on port 3000
- **Frontend** on port 80

**Note**: First build takes 3-5 minutes (downloading images and dependencies). Subsequent builds are much faster!

### 3. Access the Application

- **Frontend**: http://localhost
- **Admin Dashboard**: http://localhost/admin
- **Customer Store**: http://localhost/
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 4. Default Test Reseller Token

For testing the Reseller API, use this token:
```
test-reseller-token-12345
```

## 📚 API Documentation

### Admin API

**Base URL:** `/api/admin`

#### Create Product
```bash
POST /api/admin/products
Content-Type: application/json

{
  "name": "Amazon $100 Gift Card",
  "description": "Redeemable on Amazon.com",
  "image_url": "https://example.com/image.jpg",
  "cost_price": 80.00,
  "margin_percentage": 25,
  "value": "AMZN-1234-5678",
  "value_type": "STRING"
}

# Response: 201 Created
{
  "id": "uuid",
  "name": "Amazon $100 Gift Card",
  "minimum_sell_price": 100.00,
  ...
}
```

#### Get All Products
```bash
GET /api/admin/products

# Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Amazon $100 Gift Card",
    "cost_price": 80.00,
    "margin_percentage": 25,
    "minimum_sell_price": 100.00,
    "is_sold": false,
    ...
  }
]
```

#### Get Product by ID
```bash
GET /api/admin/products/{id}

# Response: 200 OK
{
  "id": "uuid",
  "name": "Amazon $100 Gift Card",
  "cost_price": 80.00,
  ...
}
```

#### Update Product
```bash
PUT /api/admin/products/{id}
Content-Type: application/json

{
  "cost_price": 85.00,
  "margin_percentage": 20
}

# Response: 200 OK
```

#### Delete Product
```bash
DELETE /api/admin/products/{id}

# Response: 204 No Content
```

#### Create Reseller

**⚠️ Security Note:** This endpoint is currently unprotected for demonstration purposes. In production, this would require admin authentication and authorization.

```bash
POST /api/admin/resellers
Content-Type: application/json

{
  "name": "New Reseller Company"
}

# Response: 201 Created
{
  "reseller": {
    "id": "uuid",
    "name": "New Reseller Company",
    "created_at": "2026-03-07T..."
  },
  "token": "a3f2b8c9d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  "message": "Store this token securely - it will not be shown again!"
}
```

**Important:** 
- The token is only displayed **once** upon creation
- Store it securely and provide it to the reseller
- The token is hashed in the database using bcrypt
- Lost tokens cannot be recovered (would require creating a new reseller)

**Testing:**
```bash
# 1. Create a reseller
curl -X POST http://localhost:3000/api/admin/resellers \
  -H "Content-Type: application/json" \
  -d '{"name": "My Test Reseller"}'

# 2. Use the returned token to test reseller API
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer <token-from-step-1>"
```

### Customer API

**Base URL:** `/api/customer`

#### Get Available Products
```bash
GET /api/customer/products

# Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com",
    "image_url": "https://...",
    "price": 100.00
  }
]
```

#### Purchase Product
```bash
POST /api/customer/products/{id}/purchase
Content-Type: application/json

# Response: 200 OK
{
  "product_id": "uuid",
  "final_price": 100.00,
  "value_type": "STRING",
  "value": "AMZN-1234-5678"
}
```

### Reseller API

**Base URL:** `/api/v1`
**Authentication:** Bearer Token required

#### Get Available Products
```bash
GET /api/v1/products
Authorization: Bearer test-reseller-token-12345

# Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com",
    "image_url": "https://...",
    "price": 100.00
  }
]
```

#### Get Product by ID
```bash
GET /api/v1/products/{id}
Authorization: Bearer test-reseller-token-12345

# Response: 200 OK
{
  "id": "uuid",
  "name": "Amazon $100 Gift Card",
  "price": 100.00
}
```

#### Purchase Product
```bash
POST /api/v1/products/{id}/purchase
Authorization: Bearer test-reseller-token-12345
Content-Type: application/json

{
  "reseller_price": 120.00
}

# Response: 200 OK
{
  "product_id": "uuid",
  "final_price": 120.00,
  "value_type": "STRING",
  "value": "AMZN-1234-5678"
}
```

### Error Responses

All errors follow this format:
```json
{
  "error_code": "ERROR_NAME",
  "message": "Human readable message"
}
```

**Common Error Codes:**
- `PRODUCT_NOT_FOUND` (404): Product does not exist
- `PRODUCT_ALREADY_SOLD` (409): Product has already been purchased
- `RESELLER_PRICE_TOO_LOW` (400): Reseller price is below minimum sell price
- `UNAUTHORIZED` (401): Missing or invalid authentication token
- `VALIDATION_ERROR` (400): Invalid request data

## 📁 Project Structure

```
Coupon_Hub/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Database operations
│   │   ├── models/             # TypeScript interfaces
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── routes/             # API routes
│   │   ├── config/             # Database configuration
│   │   ├── utils/              # Utilities and validators
│   │   └── index.ts            # Application entry point
│   ├── migrations/             # Database migrations
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Admin/
│   │   │   └── Customer/
│   │   ├── pages/              # Page components
│   │   ├── services/           # API client
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── test-api.sh                 # API testing script
└── README.md
```

## 💻 Development

### Docker Development (Recommended)

The docker-compose setup is the intended way to run this project. It automatically handles all configuration:

```bash
# Start all services with logs
docker-compose up

# Rebuild after code changes
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

### Local Development (Advanced)

For advanced debugging without Docker, you'll need PostgreSQL running locally:

#### Backend
```bash
cd backend
npm install

# Set environment variables (no .env file needed for Docker)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coupon_hub"
export PORT=3000
export NODE_ENV=development

# Run migrations
npm run migrate

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend
npm install

# Start development server (runs on port 5173)
npm run dev
```

**Note:** Local development requires PostgreSQL to be installed and running on your machine.

### Database Migrations

The database schema is automatically created on startup. To manually run migrations:

```bash
docker-compose exec backend npm run migrate
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (will delete database data)
docker-compose down -v
```

## 🧪 Testing

### Automated API Testing

Run the test script (requires `curl` and `jq`):

```bash
chmod +x test-api.sh
./test-api.sh
```

This script tests:
1. Health check
2. Creating coupons (Admin API)
3. Retrieving products (Admin/Customer/Reseller APIs)
4. Purchase validation with invalid reseller price
5. Successful reseller purchase
6. Duplicate purchase prevention
7. Customer purchase flow
8. Invalid authentication token handling

### Manual Testing

#### Test Admin UI
1. Navigate to http://localhost/admin
2. Create a new coupon with cost_price=80 and margin=25
3. Verify minimum_sell_price is calculated as 100.00
4. View the created product in the list

#### Test Customer UI
1. Navigate to http://localhost/
2. Browse available coupons
3. Click "Purchase" on a coupon
4. Confirm purchase and verify coupon value is displayed

#### Test Reseller API
```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/products/{id}/purchase \
  -H "Authorization: Bearer test-reseller-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"reseller_price": 120.00}'
```

## 📊 Business Logic

### Pricing Formula

The minimum sell price is calculated server-side using:

```
minimum_sell_price = cost_price × (1 + margin_percentage / 100)
```

**Example:**
- Cost Price: $80.00
- Margin: 25%
- Minimum Sell Price: $80.00 × 1.25 = $100.00

### Reseller Pricing Rules

1. Resellers can set their own price when purchasing
2. `reseller_price` must be ≥ `minimum_sell_price`
3. If `reseller_price` < `minimum_sell_price` → 400 error
4. Resellers profit from the difference: `profit = reseller_price - minimum_sell_price`

### Purchase Flow

1. **Validation**: Check product exists and is not sold
2. **Price Check**: Validate reseller price (if applicable)
3. **Atomic Lock**: Lock the product row using `SELECT FOR UPDATE`
4. **Purchase**: Mark as sold, record price and timestamp
5. **Response**: Return coupon value to buyer

This ensures no race conditions or double-purchases.

## 🔒 Security

### Implemented Security Measures

- **Bearer Token Authentication**: Required for all reseller API calls
- **Token Hashing**: Tokens stored as bcrypt hashes in database
- **Secure Token Generation**: Uses crypto.randomBytes() for reseller tokens
- **Parameterized Queries**: Prevents SQL injection
- **Input Validation**: express-validator on all endpoints
- **CORS Configuration**: Cross-origin protection
- **Server-Side Pricing**: Clients cannot manipulate prices
- **Error Handling**: Generic error messages to prevent information leakage
- **Docker Security**: Non-root users, minimal base images

### Admin API Security Considerations

**Current State:**
The Admin API endpoints (`/api/admin/*`) are currently **unprotected** for demonstration purposes and ease of local testing.

**Why This Design:**
- **Focus:** The assignment emphasizes pricing enforcement, transaction integrity, and reseller API security
- **Scope:** Implementing full admin authentication would extend beyond entry-level requirements
- **Demonstration:** The reseller authentication pattern demonstrates security implementation capabilities

**Production Requirements:**
For production deployment, admin endpoints would require:
- **JWT-based authentication** with admin role verification
- **Admin user management** with bcrypt-hashed passwords
- **Session management** with token expiration and refresh
- **Multi-factor authentication (MFA)** for sensitive operations (delete, reseller creation)
- **Audit logging** for all administrative actions
- **Rate limiting** and IP whitelisting
- **HTTPS/TLS encryption** for all communications

**Current Architecture:**
The authentication middleware pattern is demonstrated in the Reseller API (`/api/v1/*`), which implements Bearer token authentication with bcrypt hashing. This same pattern would extend to admin authentication with role-based access control (RBAC).

**Deployment Recommendation:**
- Run this application only in trusted local development environments
- Do not expose admin endpoints to public networks without authentication
- Implement proper authentication before any production deployment

### Environment Variables

**Current Setup (Development):**
For local Docker development, environment variables are defined in `docker-compose.yml`. This is acceptable for development environments.

**Production Deployment:**
For production, **never commit credentials to version control**. Use:
- Environment variables injected by your hosting platform (AWS, Azure, etc.)
- Secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- `.env` files (already in `.gitignore`) if deploying manually

**Never commit to version control:**
- Database passwords
- API tokens
- Admin credentials
- Any secrets or credentials

## 🚀 Future Enhancements

While this project meets all core requirements, here are potential enhancements for a production system:

### Reseller Management
Currently, resellers are created via database migration. In a production system, I would add:
- **Admin endpoint** to create/manage resellers (`POST /api/admin/resellers`)
- **Automatic token generation** with secure random tokens
- **Secure token delivery** via email or secure portal (shown once)
- **Token rotation/revocation** capabilities for security
- **Reseller dashboard** with API usage statistics and purchase history
- **Rate limiting** per reseller to prevent abuse

**Current Implementation:**
- Resellers are added via database migration
- Test token available: `test-reseller-token-12345`
- Sufficient for demonstration and testing purposes

### Additional Production Features
- **Admin Authentication**: Role-based access control for admin endpoints
- **Customer Accounts**: User registration and login for purchase history
- **Email Notifications**: Send coupon codes via email after purchase
- **Inventory Management**: Bulk coupon uploads and stock tracking
- **Analytics Dashboard**: Sales metrics, revenue reports, and popular products
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Webhook Support**: Notify resellers of inventory updates
- **Multi-currency Support**: International pricing and conversions
- **Audit Logging**: Track all system changes for compliance

### Scalability Improvements
- **Caching Layer**: Redis for frequently accessed products
- **Database Optimization**: Read replicas for high-traffic scenarios
- **CDN Integration**: Serve product images via CDN
- **Message Queue**: Async processing for purchases and notifications
- **Monitoring**: Application performance monitoring (APM) and alerts

**Design Philosophy:**
This project demonstrates core backend competencies without over-engineering. Each feature above addresses real production concerns while keeping the assignment focused on the essential requirements: pricing enforcement, API design, and transaction integrity.

## 🔧 Troubleshooting

### Port Already in Use

If ports 80, 3000, or 5432 are already in use:

```bash
# Edit docker-compose.yml and change port mappings
# For example, change "80:80" to "8080:80"
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart the database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Frontend Can't Connect to Backend

1. Ensure all services are running: `docker-compose ps`
2. Check backend health: `curl http://localhost:3000/health`
3. Verify environment variables in frontend container
4. Check browser console for CORS errors

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build

# Or manually run migrations
docker-compose exec backend npm run migrate
```

### Build Errors

```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 📄 License

MIT License

## 👥 Contributing

This is a backend exercise project. For improvements or issues, please open an issue or pull request.

---

**Built with ❤️ using Node.js, TypeScript, React, and PostgreSQL**
