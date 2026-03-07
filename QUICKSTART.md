# 🚀 Quick Start Guide - Coupon Hub

Get the Coupon Hub running in 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- Git installed
- Terminal/Command line access

## Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Coupon_Hub
```

### 2. Start Everything with Docker

**Just one command - no additional setup needed!**

```bash
docker-compose up --build
```

This single command will automatically:
- ✅ Install all backend dependencies (npm install)
- ✅ Install all frontend dependencies (npm install)
- ✅ Build the backend (TypeScript → JavaScript)
- ✅ Build the frontend (React → Static files)
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Start all services

**First build takes 3-5 minutes (downloading images and installing dependencies). Subsequent builds are much faster!**

☕ Grab a coffee while it builds the first time!

### 3. Wait for Services

Watch the logs until you see:
```
coupon-hub-backend   | 🚀 Server is running on port 3000
coupon-hub-frontend  | [notice] ... start worker process
coupon-hub-db        | database system is ready to accept connections
```

### 4. Access the Application

Open your browser:

- **Customer Store**: http://localhost
- **Admin Dashboard**: http://localhost/admin

## Quick Demo

### 1. Create a Coupon (Admin)

1. Go to http://localhost/admin
2. Fill in the form:
   - **Name**: Amazon $100 Gift Card
   - **Description**: Redeemable on Amazon.com
   - **Image URL**: https://m.media-amazon.com/images/I/71SdIB++ixL._AC_SX679_.jpg
   - **Cost Price**: 80
   - **Margin**: 25
   - **Coupon Value**: AMZN-TEST-1234
   - **Value Type**: String
3. Click "Create Coupon"
4. See the calculated minimum sell price: $100.00

### 2. Browse as Customer

1. Go to http://localhost/
2. See your coupon listed
3. Click "Purchase"
4. Confirm purchase
5. Get your coupon code!

### 3. Test Reseller API

Open a new terminal:

```bash
# Get available products
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer test-reseller-token-12345"

# Purchase with custom price
curl -X POST http://localhost:3000/api/v1/products/{product-id}/purchase \
  -H "Authorization: Bearer test-reseller-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"reseller_price": 120.00}'
```

Replace `{product-id}` with the actual UUID from the first response.

## Run the Test Script

Automated testing of all endpoints:

```bash
chmod +x test-api.sh
./test-api.sh
```

This tests:
- ✅ Admin CRUD operations
- ✅ Customer purchase flow
- ✅ Reseller API with authentication
- ✅ Price validation
- ✅ Error handling

## Stop the Application

```bash
# Stop containers (keep data)
docker-compose down

# Stop and delete all data
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 80, 3000, or 5432 is already in use:

1. Stop the conflicting service, OR
2. Edit `docker-compose.yml` and change the port mappings:
   ```yaml
   frontend:
     ports:
       - "8080:80"  # Change 80 to 8080
   ```

### Services Won't Start

```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs -f

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database Connection Error

```bash
# Wait for database health check
docker-compose ps

# Restart just the backend
docker-compose restart backend
```

## Next Steps

- 📖 Read the full [README.md](README.md)
- 📡 Explore [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- 🏗️ Understand [ARCHITECTURE.md](ARCHITECTURE.md)

## Default Credentials

**Reseller API Token:**
```
test-reseller-token-12345
```

This token is pre-configured in the database for testing.

## Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost |
| Backend | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |

## Database Connection

If you want to connect with a database client:

```
Host: localhost
Port: 5432
Database: coupon_hub
Username: postgres
Password: postgres
```

## What's Running?

Check running containers:

```bash
docker-compose ps
```

Should show:
- coupon-hub-frontend (nginx)
- coupon-hub-backend (node)
- coupon-hub-db (postgres)

## Success! 🎉

You now have a fully functional digital coupon marketplace running locally!

- Create and manage coupons via Admin UI
- Browse and purchase via Customer UI
- Integrate with Reseller API

Happy coding! 🚀
