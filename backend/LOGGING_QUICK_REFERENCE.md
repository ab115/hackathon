## Observability Quick Reference

### Import & Use

```python
from app.core.logging import (
    log_event,        # Generic event logging
    log_auth,         # Auth events
    log_payment,      # Payment events
    log_error,        # Error logging
    StructuredLogger  # Full API
)
```

### Common Patterns

#### 1. Log Authentication Event
```python
# Success
log_auth(
    action="login",
    email="user@example.com",
    success=True
)

# Failure
log_auth(
    action="login",
    email="user@example.com",
    success=False,
    reason="Invalid password"
)
```

#### 2. Log Payment Operation
```python
log_payment(
    action="initiated",           # initiated/completed/failed/refunded
    order_id="TXN123456",
    amount=500.0,
    currency="INR",
    status="PENDING",             # PENDING/SUCCESS/FAILED
    user_id="42"
)
```

#### 3. Log Error with Context
```python
try:
    # operation
except Exception as e:
    log_error(
        error_type="PaymentError",
        message=str(e),
        user_id="42",
        request_id=request_id,
        details={"order_id": "TXN123", "amount": 500}
    )
```

#### 4. Log Database Operation
```python
import time

start = time.time()
try:
    user = db.query(User).filter(User.id == 42).first()
    StructuredLogger.log_database(
        operation="SELECT",
        model="User",
        duration_ms=(time.time() - start) * 1000,
        success=True,
        user_id="42"
    )
except Exception as e:
    StructuredLogger.log_database(
        operation="SELECT",
        model="User",
        duration_ms=(time.time() - start) * 1000,
        success=False,
        error=str(e),
        user_id="42"
    )
```

#### 5. Log External API Call
```python
import time

start = time.time()
try:
    response = requests.post("https://payu.in/api/...", data={...})
    StructuredLogger.log_external_call(
        service="payu",
        endpoint="/api/payment/verify",
        method="POST",
        status_code=response.status_code,
        duration_ms=(time.time() - start) * 1000,
        user_id="42"
    )
except Exception as e:
    StructuredLogger.log_external_call(
        service="payu",
        endpoint="/api/payment/verify",
        method="POST",
        status_code=500,
        duration_ms=(time.time() - start) * 1000,
        user_id="42",
        error=str(e)
    )
```

#### 6. Log Celery Task
```python
import time

start = time.time()
try:
    # Task execution
    StructuredLogger.log_celery_task(
        task_name="send_email",
        status="completed",
        duration_ms=(time.time() - start) * 1000,
        user_id="42"
    )
except Exception as e:
    StructuredLogger.log_celery_task(
        task_name="send_email",
        status="failed",
        duration_ms=(time.time() - start) * 1000,
        user_id="42",
        error=str(e),
        retry_count=1
    )
```

#### 7. Log Generic Event
```python
log_event(
    event="user.registered",
    level="info",
    context={"email": "user@example.com", "role": "student"},
    user_id="42"
)
```

### Output Examples

#### Auth Event
```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "event": "auth.attempt",
  "level": "INFO",
  "context": {
    "action": "login",
    "email": "user@example.com",
    "success": true
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Payment Event
```json
{
  "timestamp": "2024-01-15T10:30:45.654321Z",
  "event": "payment",
  "level": "INFO",
  "context": {
    "action": "completed",
    "order_id": "TXN42123456789",
    "amount": 500.0,
    "currency": "INR",
    "status": "SUCCESS"
  },
  "user_id": "42"
}
```

#### Request Event
```json
{
  "timestamp": "2024-01-15T10:30:45.234567Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "request.end",
  "method": "POST",
  "path": "/api/payments/initiate",
  "status_code": 200,
  "duration_ms": 234.56,
  "response_size_bytes": 1024,
  "user_id": "42"
}
```

#### Error Event
```json
{
  "timestamp": "2024-01-15T10:30:46.123456Z",
  "event": "error",
  "level": "ERROR",
  "context": {
    "error_type": "PaymentError",
    "message": "Connection timeout to PayU API",
    "order_id": "TXN123"
  },
  "user_id": "42",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### View Logs Locally

```bash
# All logs
docker-compose logs -f backend

# Auth events only
docker-compose logs backend | grep 'auth.attempt'

# Payment events only
docker-compose logs backend | grep 'payment'

# Errors only
docker-compose logs backend | grep 'error'

# Request ID tracing
docker-compose logs backend | grep '550e8400-e29b-41d4-a716-446655440000'

# Pretty print JSON
docker-compose logs backend | grep 'event' | jq '.'
```

### Cloud Monitoring Queries

**AWS CloudWatch Logs Insights**:
```
# Payment success rate (last hour)
fields @timestamp, event, status, user_id
| filter event = "payment"
| stats count(*) as total, sum(if(status = "SUCCESS", 1, 0)) as success
| fields (success * 100.0) / total as success_rate_percent

# Slow requests (> 500ms)
fields @timestamp, path, duration_ms, user_id
| filter duration_ms > 500
| stats count() by path

# Error rate
fields @timestamp, event
| filter event = "error"
| stats count() as error_count
```

**Datadog Dashboard Query**:
```
avg:system.cpu{service:hackfusion-api}
payment_success_rate:payment{status:SUCCESS}
request.latency_p99{service:hackfusion-api}
celery.task.failure_count{service:hackfusion-api}
```

**Grafana with Loki**:
```
{job="hackfusion-api"} | json | duration_ms > 1000
{job="hackfusion-api"} | json | event="error"
{job="hackfusion-api"} | json | event="payment" | status="SUCCESS"
```

### Best Practices

1. **Always include user_id** for audit trails
2. **Use request_id** for distributed tracing
3. **Log at appropriate level** (info = normal, warning = unexpected, error = failed)
4. **Include context** dict for additional details
5. **Duration tracking** for performance monitoring
6. **Error messages** should be human-readable and actionable
7. **Avoid logging sensitive data** (passwords, API keys, credit cards)

### Testing Logs

```python
# Test logging in development
from app.core.logging import log_event

# This will output to console
log_event(
    event="test.event",
    level="info",
    context={"test": True}
)
```

Output:
```json
{"timestamp": "2024-01-15T10:30:45.123456Z", "event": "test.event", "level": "INFO", "context": {"test": true}}
```

### Troubleshooting

**Logs not appearing**:
1. Check log level in FastAPI app settings
2. Verify docker-compose logs output
3. Check stderr vs stdout

**Request IDs not showing**:
1. Verify request logging middleware is active
2. Check Authorization header format (Bearer \<token\>)
3. Ensure JWT_SECRET is set correctly

**Performance logs missing duration**:
1. Remember to calculate duration after operation
2. Use `(time.time() - start_time) * 1000` for milliseconds
3. Round to 2 decimal places for readability

**Task logs not appearing**:
1. Verify Celery worker is running
2. Check Redis connection
3. Ensure task imports are correct
