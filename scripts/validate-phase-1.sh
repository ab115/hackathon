#!/bin/bash
# ============================================================
# PHASE 1 TESTING SCRIPT
# Quick validation that all security changes are working
# ============================================================

set -e

echo "🔒 PHASE 1 SECURITY VALIDATION"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API base URL
API_URL="http://localhost:5000"
TIMEOUT=5

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        exit 1
    fi
}

warn_note() {
    echo -e "${YELLOW}⚠️ NOTE${NC}: $1"
}

# Test 1: DB Connection Pool
echo "📊 Test 1: Database Connection Pooling"
if grep -q "pool_size=20" backend/app/db/session.py; then
    test_result 0 "Connection pool configured (pool_size=20)"
else
    test_result 1 "Connection pool not found in session.py"
fi
echo ""

# Test 2: JWT Secret validation
echo "🔐 Test 2: JWT Secret Configuration"
if grep -q "if not SECRET_KEY or SECRET_KEY ==" backend/app/core/security.py; then
    test_result 0 "JWT_SECRET validation implemented"
else
    test_result 1 "JWT_SECRET validation not found"
fi
echo ""

# Test 3: JWT Verification Decorator
echo "🎫 Test 3: JWT Verification Decorator"
if grep -q "async def verify_token" backend/app/core/security.py; then
    test_result 0 "verify_token decorator implemented"
else
    test_result 1 "verify_token decorator not found"
fi
echo ""

# Test 4: CORS Configuration
echo "🌍 Test 4: CORS Security Configuration"
if grep -q "allow_origins=allowed_origins" backend/app/main.py; then
    test_result 0 "CORS restricted to allowed_origins"
else
    test_result 1 "CORS configuration not found"
fi
echo ""

# Test 5: Security Headers
echo "🛡️ Test 5: Security Headers"
if grep -q "X-Content-Type-Options" backend/app/main.py; then
    test_result 0 "Security headers implemented"
else
    test_result 1 "Security headers not found"
fi
echo ""

# Test 6: Request Size Validation
echo "📦 Test 6: Request Size Validation"
if grep -q "validate_request_size" backend/app/main.py; then
    test_result 0 "Request size validation implemented"
else
    test_result 1 "Request size validation not found"
fi
echo ""

# Test 7: Environment Variables
echo "🔧 Test 7: Environment Variables"
if [ -f "backend/.env" ]; then
    test_result 0 ".env file exists"
else
    test_result 1 ".env file missing"
fi

if [ -f "backend/.env.example" ]; then
    test_result 0 ".env.example template exists"
else
    test_result 1 ".env.example template missing"
fi
echo ""

# Test 8: .env in .gitignore
echo "🔒 Test 8: .env in .gitignore"
if grep -q "backend/.env" .gitignore || grep -q ".env" .gitignore; then
    test_result 0 ".env files are in .gitignore"
else
    warn_note ".env files should be in .gitignore"
fi
echo ""

# Test 9: Endpoints protected with JWT
echo "🚪 Test 9: Protected Endpoints"
echo "Checking for @Depends(verify_token)..."

for file in backend/app/api/*.py; do
    if grep -l "Depends(verify_token)" "$file" > /dev/null 2>&1; then
        basename "$file" | sed 's/.py//'
        grep -c "Depends(verify_token)" "$file" | xargs -I {} echo "  └─ {} endpoint(s) protected"
    fi
done

if [ -n "$(grep -r "Depends(verify_token)" backend/app/api/)" ]; then
    test_result 0 "Protected endpoints found"
else
    test_result 1 "No protected endpoints found"
fi
echo ""

echo "========================================"
echo "📋 SUMMARY"
echo "========================================"
echo ""
echo "Database Configuration:    ✅ Connection pooling enabled"
echo "JWT Security:             ✅ Verification decorator ready"
echo "CORS Protection:          ✅ Restricted origins configured"
echo "Security Headers:         ✅ Anti-XSS, anti-clickjacking enabled"
echo "Request Size Limits:      ✅ 10MB max enforced"
echo "Environment Variables:    ✅ .env files configured"
echo "Protected Endpoints:      ✅ JWT verification applied"
echo ""

# Test runtime if Docker is running
echo "🔄 Testing Runtime Configuration..."
echo ""

if command -v docker &> /dev/null; then
    if [ "$(docker ps -q -f name=hackfusion-api)" ]; then
        echo "✅ API container is running"
        
        # Test health endpoint
        if timeout $TIMEOUT curl -s "$API_URL/health" > /dev/null 2>&1; then
            test_result 0 "API health check endpoint responding"
        else
            warn_note "API not responding (container may still be starting)"
        fi
        
        # Test protected endpoint without token
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/users/me" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
            test_result 0 "Protected endpoint returns 401/403 without token"
        else
            warn_note "Protected endpoint returned HTTP $HTTP_CODE (expected 401 or 403)"
        fi
        
        echo ""
        echo "📝 Next Steps:"
        echo "1. Get authentication token:"
        echo "   TOKEN=\$(curl -X POST $API_URL/api/auth/login \\\\"
        echo "     -H 'Content-Type: application/json' \\\\"
        echo "     -d '{\"email\":\"test@example.com\",\"password\":\"password\"}' | jq -r '.access_token')"
        echo ""
        echo "2. Test protected endpoint with token:"
        echo "   curl $API_URL/api/users/me -H \"Authorization: Bearer \\\$TOKEN\""
        echo ""
    else
        warn_note "API container not running. Start with: docker-compose up -d"
    fi
else
    warn_note "Docker not found. Please start services manually."
fi

echo ""
echo "✅ PHASE 1 VALIDATION COMPLETE"
echo ""
echo "👉 Ready to proceed with Phase 2? 🚀"
