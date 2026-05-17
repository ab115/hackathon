from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/scalegrad")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Production-grade connection pooling configuration
engine = create_async_engine(
    DATABASE_URL,
    echo=False if ENVIRONMENT == "production" else False,  # Never log queries in prod
    pool_size=5,           # Per-worker connections — 2 workers × 5 = 10 total
    max_overflow=10,       # Burst headroom — total max = 2 × 15 = 30 (Postgres default max)
    pool_pre_ping=True,    # Verify connection health before use
    pool_recycle=1800,     # Recycle connections every 30 minutes
    pool_timeout=10,       # Raise immediately after 10s wait — don't block forever
    connect_args={
        "timeout": 10,
        "server_settings": {"application_name": "hackathon_api"},
    }
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
