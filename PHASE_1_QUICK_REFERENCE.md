# ⚡ PHASE 1 - QUICK REFERENCE GUIDE

## 🎯 At a Glance

**What was implemented:** Enterprise security fixes
**Time to implement:** 2 hours completed
**Risk level:** Low (no breaking changes)
**Backward compatible:** ✅ Yes

---

## 🔑 Key Changes

### 1️⃣ Database Connection Pooling
```python
# File: backend/app/db/session.py
pool_size=20              # 20 default connections
max_overflow=10           # +10 for spikes
pool_pre_ping=True        # Health checks
pool_recycle=3600         # Refresh hourly
```

### 2️⃣ JWT Token Verification
```python
# File: backend/app/core/security.py
# Usage in endpoints:
async def create_submission(
    ...,
    user_id: str = Depends(verify_token)  # ← JWT required
):
    pass
```

### 3️⃣ Environment Variables
```bash
# File: backend/.env
JWT_SECRET=your_secret_here
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ALLOWED_ORIGINS=localhost:3000,yourdomain.com
```

### 4️⃣ Security Headers
```
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ Strict-Transport-Security
✅ Content-Security-Policy
✅ X-XSS-Protection
```

---

## 🚀 Quick Start

### Start Services
```bash
cd /path/to/hackathon
docker-compose up -d
docker-compose ps
```

### Test API
```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass","full_name":"User","role":"STUDENT"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}' \
  | jq -r '.access_token')

# Use token
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Protected Endpoints (Require JWT)

| Endpoint | Method | Protected |
|----------|--------|-----------|
| `/api/hackathons` | POST | ✅ Yes |
| `/api/hackathons/{id}/teams` | POST | ✅ Yes |
| `/api/submissions` | POST | ✅ Yes |
| `/api/payments/simulate` | POST | ✅ Yes |
| `/api/users/me` | GET | ✅ Yes |

---

## ⚙️ Configuration

### Development (.env)
```bash
JWT_SECRET=your_secret
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/hackfusion
ENVIRONMENT=development
ALLOWED_ORIGINS=localhost:3000,localhost:5173
```

### Production (.env)
```bash
JWT_SECRET=generate_strong_secret_key_32_chars
DATABASE_URL=postgresql+asyncpg://user:strong_pass@prod-db:5432/hackfusion
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com
USE_HTTPS=true
SSL_CERT_PATH=/app/certs/cert.pem
SSL_KEY_PATH=/app/certs/key.pem
```

---

## 🔒 Security Checklist

Before going live:
- [ ] Change JWT_SECRET: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] Change database password
- [ ] Set ALLOWED_ORIGINS to your domain only
- [ ] Set ENVIRONMENT=production
- [ ] Enable HTTPS certificates
- [ ] Configure SMTP for emails
- [ ] Verify .env is not in git: `git status | grep .env` (should be empty)
- [ ] Test protected endpoints return 401 without token
- [ ] Test endpoints work with valid token

---

## 🧪 Validation Script

```bash
bash scripts/validate-phase-1.sh
```

Output should show:
```
✅ PASS: Connection pool configured
✅ PASS: JWT_SECRET validation implemented
✅ PASS: verify_token decorator implemented
✅ PASS: CORS restricted to allowed_origins
✅ PASS: Security headers implemented
✅ PASS: Request size validation implemented
✅ PASS: .env file exists
✅ PASS: Protected endpoints found
```

---

## 📱 API Test Examples

### Without Token (Should Fail)
```bash
curl http://localhost:5000/api/users/me
# Expected: 403 Forbidden or 401 Unauthorized
```

### With Invalid Token (Should Fail)
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

### With Valid Token (Should Work)
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer valid_token_here"
# Expected: 200 OK + user data
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `JWT_SECRET not set` | Add to .env: `JWT_SECRET=your_secret` |
| `401 Unauthorized` | Login first to get token, use in header |
| `CORS error` | Check ALLOWED_ORIGINS in .env |
| `DB connection error` | Check DATABASE_URL, ensure postgres running |
| `Container won't start` | Check logs: `docker-compose logs api` |

---

## 📚 Documentation

- **Full guide:** `PHASE_1_COMPLETE.md`
- **Summary:** `PHASE_1_SUMMARY.md`
- **This file:** `PHASE_1_QUICK_REFERENCE.md`

---

## 🎯 Files Changed

| File | Type | Change |
|------|------|--------|
| `backend/app/db/session.py` | Modified | Connection pooling |
| `backend/app/core/security.py` | Modified | JWT verification |
| `backend/app/main.py` | Modified | Security headers, CORS |
| `backend/app/api/payments.py` | Modified | JWT protection |
| `backend/app/api/hackathons.py` | Modified | JWT protection |
| `backend/app/api/submissions.py` | Modified | JWT protection |
| `backend/app/api/users.py` | Modified | JWT protection |
| `backend/.env` | Created | Dev configuration |
| `backend/.env.example` | Created | Prod template |
| `docker-compose.yml` | Modified | .env integration |
| `scripts/generate-certs.sh` | Created | SSL cert generation |
| `scripts/validate-phase-1.sh` | Created | Validation tool |

**Total: 12 files (7 modified, 5 created)**

---

## ✅ Status

**Phase 1 Complete:** All security measures implemented and tested

**Next:** Phase 2 - Frontend Integration (4 hours)
- API service layer
- Auth context
- PayU integration
- Celery tasks
- Logging

---

## 👋 Questions?

See `PHASE_1_COMPLETE.md` for:
- Detailed implementation details
- Security explanations
- Testing procedures
- Troubleshooting guide
- Environment variables reference
