from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
import logging
import json
import time
import uuid
import re
from datetime import datetime
from typing import Optional
from prometheus_fastapi_instrumentator import Instrumentator

from app.api import auth, hackathons, users, payments, submissions, teams, admin, resources, mentors, admin_users
from app.db.session import engine
from app.models import base


# ──────────────────────────────────────────────
# Structured JSON logging
# ──────────────────────────────────────────────

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "logger": record.name,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

logging.basicConfig(level=logging.INFO)
root_logger = logging.getLogger()
for handler in root_logger.handlers:
    handler.setFormatter(JSONFormatter())

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Rate limiter (global: 100/min; override per endpoint)
# ──────────────────────────────────────────────

RATE_LIMIT = os.getenv("RATE_LIMIT_PER_MINUTE", "100")
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{RATE_LIMIT}/minute"],
)


# ──────────────────────────────────────────────
# Application lifespan — startup / shutdown
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup: create all DB tables if they don't exist.
    On shutdown: gracefully dispose of the connection pool.
    """
    logger.info(json.dumps({"event": "startup", "message": "Creating database tables..."}))
    async with engine.begin() as conn:
        await conn.run_sync(base.Base.metadata.create_all)
    logger.info(json.dumps({"event": "startup", "message": "Database tables ready."}))

    yield  # Application is running

    logger.info(json.dumps({"event": "shutdown", "message": "Disposing DB engine..."}))
    await engine.dispose()


# ──────────────────────────────────────────────
# FastAPI Application
# ──────────────────────────────────────────────

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="Scalegrad API",
    version="2.0.0",
    description="Scalegrad API — India's Premier Hackathon Platform",
    docs_url="/api/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/api/redoc" if ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# Metrics
Instrumentator().instrument(app).expose(app, include_in_schema=False)

# Rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "*").split(","),
)

# ──────────────────────────────────────────────
# CORS — supports wildcard '*' and pattern lists
# Set ALLOWED_ORIGINS=* in .env for open dev/tunnel access
# ──────────────────────────────────────────────

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:3000,http://localhost:5173,http://localhost:80"
    if ENVIRONMENT == "development"
    else "https://yourdomain.com",
)
_origins_list = [o.strip() for o in _raw_origins.split(",") if o.strip()]
_allow_all_origins = "*" in _origins_list

if _allow_all_origins:
    logger.warning("CORS is set to allow ALL origins ('*'). Do not use in production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all_origins else _origins_list,
    allow_credentials=False if _allow_all_origins else True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "Accept"],
    max_age=600,
)


# ──────────────────────────────────────────────
# Security Headers Middleware
# ──────────────────────────────────────────────

CSP_DEV = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
CSP_PROD = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https:;"
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = CSP_DEV if ENVIRONMENT == "development" else CSP_PROD
    if ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ──────────────────────────────────────────────
# Request Logging Middleware
# ──────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    # Best-effort user ID extraction for observability (never blocks the request)
    user_id: Optional[str] = None
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            import base64
            token_parts = auth_header.split(" ")[1].split(".")
            # Decode JWT payload (base64url) without verifying signature
            padded = token_parts[1] + "=="
            payload_bytes = base64.urlsafe_b64decode(padded)
            payload = json.loads(payload_bytes)
            user_id = payload.get("sub")
        except Exception:
            pass

    logger.info(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id,
        "event": "request.start",
        "method": request.method,
        "path": request.url.path,
        "client_ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent", ""),
        "user_id": user_id,
    }))

    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    log_fn = logger.warning if response.status_code >= 400 else logger.info
    log_fn(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id,
        "event": "request.end",
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
        "user_id": user_id,
    }))

    response.headers["X-Request-ID"] = request_id
    return response


# ──────────────────────────────────────────────
# Request Size Guard
# ──────────────────────────────────────────────

@app.middleware("http")
async def validate_request_size(request: Request, call_next):
    max_size = 10 * 1024 * 1024  # 10 MB
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > max_size:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": f"Request body exceeds {max_size // (1024 * 1024)}MB limit"},
            )
    return await call_next(request)


# ──────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────

app.include_router(auth.router,        prefix="/api/auth",        tags=["Authentication"])
app.include_router(users.router,       prefix="/api/users",       tags=["Users"])
app.include_router(hackathons.router,  prefix="/api/hackathons",  tags=["Hackathons"])
app.include_router(teams.router, prefix="/api/teams", tags=["Teams"])
app.include_router(payments.router,    prefix="/api/payments",    tags=["Payments"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(resources.router,   prefix="/api/resources",   tags=["Resources"])
app.include_router(mentors.router,     prefix="/api/mentors",     tags=["Mentors"])
app.include_router(admin.router,       prefix="/api/admin",       tags=["Admin"])
app.include_router(admin_users.router, prefix="/api/admin",       tags=["Admin - Users"])
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")


# ──────────────────────────────────────────────
# Root & Health
# ──────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Scalegrad API v2 — India's Premier Hackathon Platform"}


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Deep health check — verifies DB and Redis connectivity.
    Used by Docker HEALTHCHECK and load balancer probes.
    """
    from app.core.cache import ping_redis
    from app.db.session import AsyncSessionLocal
    from sqlalchemy import text

    db_ok = False
    redis_ok = False

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.error(json.dumps({"event": "health.db_fail", "error": str(e)}))

    try:
        redis_ok = await ping_redis()
    except Exception as e:
        logger.error(json.dumps({"event": "health.redis_fail", "error": str(e)}))

    overall = "healthy" if (db_ok and redis_ok) else "degraded"
    status_code = 200 if overall == "healthy" else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall,
            "database": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
            "environment": ENVIRONMENT,
        },
    )
