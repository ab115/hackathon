FROM python:3.11-slim

# Build-time environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies (libpq for psycopg2, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Install Python dependencies first (layer cache optimisation)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application code
COPY . .

# Pre-create uploads directory so Docker copies these permissions to the named volume
RUN mkdir -p /app/uploads

# Ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose API port
EXPOSE 5000

# WEB_CONCURRENCY defaults to 4 workers; override per deployment
# Uses uvloop + httptools for maximum async throughput
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers ${WEB_CONCURRENCY:-4} --loop uvloop --http httptools --proxy-headers --forwarded-allow-ips='*'"]
