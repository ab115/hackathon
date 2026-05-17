## Phase 3: STRUCTURED JSON LOGGING & OBSERVABILITY

### Overview

Phase 3 implements structured JSON logging throughout the backend, enabling:
- **Request Tracing**: Track requests from entry to response with millisecond timing
- **Security Monitoring**: Log all auth events with success/failure tracking
- **Payment Tracking**: Detailed logs of all payment operations
- **Async Task Monitoring**: Track Celery task execution, retries, and failures
- **Error Analysis**: Structured error logging for debugging and alerting
- **Performance Insights**: Duration metrics for all operations

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ HTTP Request → Nginx Reverse Proxy                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Request Logging Middleware (app/main.py)                │
│ - Extracts user ID from JWT token                       │
│ - Logs request start with method/path/headers           │
│ - Calculates duration, status code, response size       │
│ - Adds X-Request-ID header for tracing                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ API Endpoint Handler (app/api/\*.py)                     │
│ - Uses structured logging functions from core/logging.py│
│ - Logs auth events, payment operations, errors          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Structured Logger (app/core/logging.py)                 │
│ - JSON formatter with timestamp, event, level, context  │
│ - Convenience functions: log_auth, log_payment, etc.    │
└────────────────────┬────────────────────────────────────┘
                     │
┌───────┬───────────┼───────────┬────────────┐
│       │           │           │            │
▼       ▼           ▼           ▼            ▼
Stdout  File Logs   Logs API    Monitoring   Error Alerts
(console)(./logs/)  (CloudWatch) (Datadog)   (PagerDuty)
```

### Files Changed

#### 1. **backend/app/main.py** - Request Logging Middleware
- Added JSON formatter for structured logging
- Request logging middleware captures:
  - Request ID (UUID for tracing)
  - Method, path, query parameters
  - Client IP, user agent
  - User ID (decoded from JWT token)
  - Response status code, duration (ms), response size
  - Request ID header for correlation

```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "request.start",
  "method": "POST",
  "path": "/api/payments/initiate",
  "user_id": "42",
  "client_ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

#### 2. **backend/app/core/logging.py** (NEW)
Centralized logging module with:

**StructuredLogger class** - Static methods for domain-specific logging:
- `log_event()` - Generic event logging
- `log_auth()` - Authentication events (register, login, failures)
- `log_database()` - Database operations with duration tracking
- `log_external_call()` - External API calls (PayU, SMTP)
- `log_payment()` - Payment operations with transaction details
- `log_celery_task()` - Async task execution tracking
- `log_error()` - Error events with full context

**Convenience functions** - Import-friendly wrappers:
```python
from app.core.logging import log_auth, log_payment, log_error

# Authentication event
log_auth("login", "user@example.com", success=True)

# Payment event
log_payment("initiated", "TXN123", 500.0, "INR", "PENDING", user_id="42")

# Error event
log_error("ValidationError", "Invalid email format", user_id="42")
```

#### 3. **backend/app/api/auth.py** - Auth Logging
Logs added:
- Registration attempts (success/failure with reason)
- Login attempts (success/failure with reason)

```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "event": "auth.attempt",
  "level": "INFO",
  "context": {
    "action": "login",
    "email": "user@example.com",
    "success": true
  }
}
```

#### 4. **backend/app/api/payments.py** - Payment Logging
Logs added to:
- `/initiate` - Payment initiation with order ID, amount, currency
- `/verify` - Payment verification with status change
- `/simulate` - Payment simulation for testing
- Error cases with error types and messages

```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "event": "payment",
  "level": "INFO",
  "context": {
    "action": "initiated",
    "order_id": "TXN42123456789",
    "amount": 500.0,
    "currency": "INR",
    "status": "PENDING"
  },
  "user_id": "42"
}
```

#### 5. **backend/app/tasks/worker.py** - Celery Task Logging
Enhanced all 5 tasks with structured logging:
- Task start event
- Task completion with duration
- Retry events with retry count
- Failure events with error message

```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "event": "celery.task",
  "level": "INFO",
  "context": {
    "task": "send_payment_confirmation",
    "status": "completed",
    "duration_ms": 245.67,
    "retry_count": 0
  },
  "user_id": "42"
}
```

### Usage Examples

#### Log Authentication Event
```python
from app.core.logging import log_auth

# Success
log_auth(action="login", email="user@example.com", success=True)

# Failure
log_auth(
    action="login",
    email="user@example.com",
    success=False,
    reason="Invalid password"
)
```

#### Log Payment Operation
```python
from app.core.logging import log_payment

log_payment(
    action="initiated",
    order_id="TXN42123456789",
    amount=500.0,
    currency="INR",
    status="PENDING",
    user_id="42"
)
```

#### Log Error
```python
from app.core.logging import log_error

try:
    # code that might fail
except Exception as e:
    log_error(
        error_type="PaymentVerificationError",
        message=str(e),
        user_id="42",
        details={"order_id": "TXN123"}
    )
```

#### Log Database Operation
```python
from app.core.logging import StructuredLogger
import time

start = time.time()
try:
    # database operation
    success = True
except Exception as e:
    success = False
    error = str(e)

duration_ms = (time.time() - start) * 1000
StructuredLogger.log_database(
    operation="INSERT",
    model="User",
    duration_ms=duration_ms,
    success=success,
    error=error if not success else None,
    user_id="42"
)
```

#### Log External API Call
```python
from app.core.logging import StructuredLogger
import time

start = time.time()
response = payu_api.call(...)  # PayU API call
duration_ms = (time.time() - start) * 1000

StructuredLogger.log_external_call(
    service="payu",
    endpoint="/api/payment/verify",
    method="POST",
    status_code=response.status_code,
    duration_ms=duration_ms,
    user_id="42"
)
```

### Log Output Format

All logs are output as newline-delimited JSON (NDJSON) for easy parsing:

```
{"timestamp": "2024-01-15T10:30:45.123456Z", "request_id": "uuid", "event": "request.start", ...}
{"timestamp": "2024-01-15T10:30:45.234567Z", "request_id": "uuid", "event": "auth.attempt", ...}
{"timestamp": "2024-01-15T10:30:45.456789Z", "request_id": "uuid", "event": "request.end", ...}
```

### Monitoring & Analysis

#### Local Development
Monitor logs directly:
```bash
docker-compose logs -f backend | grep -E '"event"|"error_type"'
```

#### Request Tracing
All requests have unique `request_id` header:
```bash
curl -v http://localhost:5000/api/payments/initiate
# Response header: X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

# Find all logs for this request
docker-compose logs backend | grep '550e8400-e29b-41d4-a716-446655440000'
```

#### Cloud Deployment
**AWS CloudWatch**:
```bash
# CloudWatch Logs Insights query
fields @timestamp, @message, user_id, event, duration_ms
| filter event = "payment"
| stats avg(duration_ms), max(duration_ms) by event
```

**Datadog**:
```
# Dashboard for payment success rate
(event:payment AND status:SUCCESS) / (event:payment) | stats count() as success_rate 
```

**ELK Stack (Elasticsearch + Kibana)**:
```json
{
  "query": {
    "bool": {
      "must": [
        {"term": {"event.keyword": "payment"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  }
}
```

### Key Metrics to Monitor

1. **Request Latency**
   - Duration: `request.end.duration_ms`
   - Query: `avg(duration_ms) by path`
   - Alert: Duration > 1000ms

2. **Auth Failures**
   - Query: `event:auth.attempt AND success:false`
   - Alert: > 10 failed logins from single IP in 1 minute

3. **Payment Success Rate**
   - Query: `event:payment AND status:SUCCESS / event:payment`
   - Alert: < 95% success rate

4. **Async Task Failures**
   - Query: `event:celery.task AND status:failed`
   - Alert: Any failed email task

5. **Error Rate**
   - Query: `event:error`
   - Alert: Error count > 5 in 5 minutes

### Configuration for Cloud Platforms

#### AWS CloudWatch
```python
import watchtower
import logging

logger = logging.getLogger(__name__)
logger.addHandler(watchtower.CloudWatchLogHandler())
```

#### Datadog
```bash
# In docker-compose.yml
services:
  backend:
    environment:
      DD_SERVICE: hackfusion-api
      DD_ENV: production
      DD_TRACE_ENABLED: "true"
    labels:
      com.datadoghq.tags.service: "hackfusion-api"
```

#### ELK Stack
```bash
# Logstash configuration
input {
  file {
    path => "/var/log/hackfusion/*.log"
    codec => json
  }
}

filter {
  # Logstash processing
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "hackfusion-%{+YYYY.MM.dd}"
  }
}
```

### Next Steps

1. **Set up log aggregation** (CloudWatch, Datadog, or ELK)
2. **Create dashboards** for key metrics
3. **Configure alerts** for error thresholds
4. **Implement log retention** policies (30 days dev, 90 days prod)
5. **Add database operation logging** to ORM layer

### Summary

Phase 3 adds enterprise-grade observability to HackFusion:
- ✅ Structured JSON logging on all requests
- ✅ Auth event tracking with security focus
- ✅ Payment operation tracing
- ✅ Async task execution monitoring
- ✅ Request ID correlation for end-to-end tracing
- ✅ Duration metrics for performance analysis
- ✅ Error categorization for faster debugging

This foundation enables quick root cause analysis, performance monitoring, and security incident investigation in production environments.
