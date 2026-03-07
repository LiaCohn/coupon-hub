#!/bin/bash

# Test API Script for Coupon Hub
# This script tests all API endpoints

set -e

API_BASE="http://localhost:3000"
RESELLER_TOKEN="test-reseller-token-12345"

echo "🧪 Testing Coupon Hub API..."
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$API_BASE/health" | jq '.'
echo ""

# Test 2: Create a Coupon (Admin API)
echo "2️⃣  Creating a test coupon (Admin API)..."
PRODUCT_ID=$(curl -s -X POST "$API_BASE/api/admin/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amazon $100 Gift Card",
    "description": "Redeemable on Amazon.com for any purchase",
    "image_url": "https://m.media-amazon.com/images/I/71SdIB++ixL._AC_SX679_.jpg",
    "cost_price": 80.00,
    "margin_percentage": 25,
    "value": "AMZN-TEST-1234-5678",
    "value_type": "STRING"
  }' | jq -r '.id')

echo "✅ Created product with ID: $PRODUCT_ID"
echo ""

# Test 3: Get All Products (Admin API)
echo "3️⃣  Getting all products (Admin API)..."
curl -s "$API_BASE/api/admin/products" | jq '.'
echo ""

# Test 4: Get Product by ID (Admin API)
echo "4️⃣  Getting product by ID (Admin API)..."
curl -s "$API_BASE/api/admin/products/$PRODUCT_ID" | jq '.'
echo ""

# Test 5: Get Available Products (Customer API)
echo "5️⃣  Getting available products (Customer API)..."
curl -s "$API_BASE/api/customer/products" | jq '.'
echo ""

# Test 6: Get Available Products (Reseller API)
echo "6️⃣  Getting available products (Reseller API)..."
curl -s "$API_BASE/api/v1/products" \
  -H "Authorization: Bearer $RESELLER_TOKEN" | jq '.'
echo ""

# Test 7: Try to purchase with low reseller price (should fail)
echo "7️⃣  Testing purchase with low reseller price (should fail)..."
curl -s -X POST "$API_BASE/api/v1/products/$PRODUCT_ID/purchase" \
  -H "Authorization: Bearer $RESELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reseller_price": 90.00
  }' | jq '.'
echo ""

# Test 8: Purchase with valid reseller price
echo "8️⃣  Purchasing with valid reseller price..."
curl -s -X POST "$API_BASE/api/v1/products/$PRODUCT_ID/purchase" \
  -H "Authorization: Bearer $RESELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reseller_price": 120.00
  }' | jq '.'
echo ""

# Test 9: Try to purchase again (should fail - already sold)
echo "9️⃣  Trying to purchase again (should fail - already sold)..."
curl -s -X POST "$API_BASE/api/v1/products/$PRODUCT_ID/purchase" \
  -H "Authorization: Bearer $RESELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reseller_price": 120.00
  }' | jq '.'
echo ""

# Test 10: Create another coupon for customer purchase
echo "🔟 Creating another coupon for customer test..."
PRODUCT_ID_2=$(curl -s -X POST "$API_BASE/api/admin/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix Premium 1 Month",
    "description": "One month subscription to Netflix Premium",
    "image_url": "https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/US-en-20210607-popsignuptwoweeks-perspective_alpha_website_small.jpg",
    "cost_price": 12.00,
    "margin_percentage": 20,
    "value": "NFLX-PREMIUM-9876",
    "value_type": "STRING"
  }' | jq -r '.id')

echo "✅ Created product with ID: $PRODUCT_ID_2"
echo ""

# Test 11: Customer purchase
echo "1️⃣1️⃣  Customer purchasing coupon..."
curl -s -X POST "$API_BASE/api/customer/products/$PRODUCT_ID_2/purchase" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 12: Test invalid bearer token (should fail)
echo "1️⃣2️⃣  Testing invalid bearer token (should fail)..."
curl -s "$API_BASE/api/v1/products" \
  -H "Authorization: Bearer invalid-token-12345" | jq '.'
echo ""

echo "✅ All tests completed!"
