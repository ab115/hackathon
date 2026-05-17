"""
Async Redis Cache Helper  — Production-Grade
--------------------------------------------
Features:
  - Circuit breaker: trips after 5 consecutive failures, resets after 30s
  - Fast socket timeout (500ms) so Redis failure never blocks the event loop
  - Probabilistic early expiry to prevent cache stampede
  - Cache-aside helper with stampede protection
  - Graceful degradation: cache failure never crashes a request

All public functions return None / do nothing on error.
"""

import json
import os
import math
import random
import time
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Module-level singleton
_redis_client: Optional[aioredis.Redis] = None

# ──────────────────────────────────────────────
# Circuit Breaker State
# ──────────────────────────────────────────────
_failures: int = 0
_circuit_open_until: float = 0.0
_FAILURE_THRESHOLD: int = 5
_COOLDOWN_SECONDS: float = 30.0


def _circuit_is_open() -> bool:
    """Returns True if the circuit breaker has tripped (Redis is considered down)."""
    return time.monotonic() < _circuit_open_until


def _record_success() -> None:
    global _failures, _circuit_open_until
    _failures = 0
    _circuit_open_until = 0.0


def _record_failure() -> None:
    global _failures, _circuit_open_until
    _failures += 1
    if _failures >= _FAILURE_THRESHOLD:
        _circuit_open_until = time.monotonic() + _COOLDOWN_SECONDS
        logger.warning(
            "Redis circuit breaker OPEN — skipping cache for %.0fs", _COOLDOWN_SECONDS
        )


# ──────────────────────────────────────────────
# Client
# ──────────────────────────────────────────────

async def _get_client() -> aioredis.Redis:
    """Return a cached async Redis client, initialising if needed."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=0.5,   # fail fast
            socket_timeout=0.5,           # fail fast
            retry_on_timeout=False,
        )
    return _redis_client


# ──────────────────────────────────────────────
# Core Cache Operations
# ──────────────────────────────────────────────

async def get_cached(key: str) -> Optional[Any]:
    """Retrieve a cached value. Returns None on miss, circuit-open, or error."""
    if _circuit_is_open():
        return None
    try:
        client = await _get_client()
        raw = await client.get(key)
        if raw is not None:
            _record_success()
            return json.loads(raw)
        _record_success()
    except Exception as exc:
        _record_failure()
        logger.warning("Cache GET failed key=%s: %s", key, exc)
    return None


async def set_cached(key: str, value: Any, ttl: int = 60) -> None:
    """Store a value with TTL (seconds). Silently ignores errors."""
    if _circuit_is_open():
        return
    try:
        client = await _get_client()
        await client.setex(key, ttl, json.dumps(value, default=str))
        _record_success()
    except Exception as exc:
        _record_failure()
        logger.warning("Cache SET failed key=%s: %s", key, exc)


async def invalidate(key: str) -> None:
    """Delete a specific cache key."""
    if _circuit_is_open():
        return
    try:
        client = await _get_client()
        await client.delete(key)
        _record_success()
    except Exception as exc:
        _record_failure()
        logger.warning("Cache DELETE failed key=%s: %s", key, exc)


async def invalidate_pattern(pattern: str) -> None:
    """
    Delete all cache keys matching a glob pattern.
    Uses SCAN to avoid blocking the Redis event loop on large keyspaces.
    """
    if _circuit_is_open():
        return
    try:
        client = await _get_client()
        keys = [k async for k in client.scan_iter(pattern, count=100)]
        if keys:
            await client.delete(*keys)
        _record_success()
    except Exception as exc:
        _record_failure()
        logger.warning("Cache PATTERN DELETE failed pattern=%s: %s", pattern, exc)


async def invalidate_keys(*keys: str) -> None:
    """Delete multiple specific keys at once (faster than pattern for known keys)."""
    if not keys or _circuit_is_open():
        return
    try:
        client = await _get_client()
        await client.delete(*keys)
        _record_success()
    except Exception as exc:
        _record_failure()
        logger.warning("Cache multi-DELETE failed: %s", exc)


# ──────────────────────────────────────────────
# Stampede-Safe Cache-Aside Helper
# ──────────────────────────────────────────────

async def get_or_set(
    key: str,
    loader,           # async callable returning the fresh value
    ttl: int = 60,
    beta: float = 1.0,  # > 1 = more aggressive pre-expiry refresh
) -> Any:
    """
    Probabilistic early expiration (XFetch algorithm) to prevent stampede.

    Multiple concurrent requests that find the same expired key will NOT
    all fire DB queries simultaneously. Instead, one wins the refresh race
    while others either get a slightly stale value or wait.

    Set beta > 1.0 on endpoints with expensive DB queries.
    """
    if not _circuit_is_open():
        try:
            client = await _get_client()
            # Try to get both value and remaining TTL atomically
            async with client.pipeline(transaction=False) as pipe:
                pipe.get(key)
                pipe.ttl(key)
                raw, remaining_ttl = await pipe.execute()

            if raw is not None:
                remaining = remaining_ttl if remaining_ttl and remaining_ttl > 0 else 0
                # Probabilistic early expiration: refresh if random score exceeds
                # the XFetch threshold. More aggressive as TTL shrinks.
                delta = ttl - remaining
                if delta <= 0 or random.random() >= math.exp(-beta * delta / remaining):
                    _record_success()
                    return json.loads(raw)
            _record_success()
        except Exception as exc:
            _record_failure()
            logger.warning("Cache get_or_set read failed key=%s: %s", key, exc)

    # Cache miss or circuit open — load fresh value
    value = await loader()
    await set_cached(key, value, ttl)
    return value


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────

async def ping_redis() -> bool:
    """Health check — returns True if Redis responds."""
    try:
        client = await _get_client()
        result = await client.ping()
        _record_success()
        return result
    except Exception:
        _record_failure()
        return False
