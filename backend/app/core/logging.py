"""Structured logging utilities for the application."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class StructuredLogger:
    """
    Provides structured logging methods that output JSON for easy parsing
    and indexing in logs aggregation systems (Elasticsearch, Splunk, etc.).
    """

    @staticmethod
    def log_event(
        event: str,
        level: str = "info",
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> None:
        """
        Log a structured event with optional context and user/request tracking.

        Args:
            event: Event name (e.g., "user.registered", "payment.initiated")
            level: Log level ("info", "warning", "error", "debug")
            context: Additional context data to include in the log
            user_id: Optional user ID for tracking
            request_id: Optional request ID for tracing
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": event,
            "level": level.upper(),
        }

        if user_id:
            log_data["user_id"] = user_id
        if request_id:
            log_data["request_id"] = request_id
        if context:
            log_data["context"] = context

        log_func = getattr(logger, level.lower(), logger.info)
        log_func(json.dumps(log_data))

    @staticmethod
    def log_auth(
        action: str,
        email: str,
        success: bool,
        reason: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> None:
        """
        Log authentication events with security focus.

        Args:
            action: Auth action ("login", "register", "logout", "token_refresh")
            email: User email
            success: Whether action succeeded
            reason: Reason for failure (if success=False)
            request_id: Optional request ID for tracing
        """
        context = {"action": action, "email": email, "success": success}
        if reason:
            context["reason"] = reason

        level = "warning" if not success else "info"
        StructuredLogger.log_event(
            event="auth.attempt",
            level=level,
            context=context,
            request_id=request_id,
        )

    @staticmethod
    def log_database(
        operation: str,
        model: str,
        duration_ms: float,
        success: bool,
        error: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> None:
        """
        Log database operations for performance monitoring.

        Args:
            operation: DB operation ("INSERT", "SELECT", "UPDATE", "DELETE")
            model: Model name (e.g., "User", "Hackathon")
            duration_ms: Operation duration in milliseconds
            success: Whether operation succeeded
            error: Error message if operation failed
            user_id: Optional user ID for tracking
        """
        context = {
            "operation": operation,
            "model": model,
            "duration_ms": round(duration_ms, 2),
            "success": success,
        }
        if error:
            context["error"] = error

        level = "warning" if not success else ("warning" if duration_ms > 1000 else "info")
        StructuredLogger.log_event(
            event="database.operation",
            level=level,
            context=context,
            user_id=user_id,
        )

    @staticmethod
    def log_external_call(
        service: str,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        user_id: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        """
        Log external API calls (PayU, email service, etc.).

        Args:
            service: Service name ("payu", "smtp", "aws_s3", etc.)
            endpoint: API endpoint called
            method: HTTP method
            status_code: Response status code
            duration_ms: Call duration in milliseconds
            user_id: Optional user ID for tracking
            error: Error message if call failed
        """
        context = {
            "service": service,
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
        }
        if error:
            context["error"] = error

        level = "error" if status_code >= 500 else ("warning" if status_code >= 400 else "info")
        StructuredLogger.log_event(
            event="external.call",
            level=level,
            context=context,
            user_id=user_id,
        )

    @staticmethod
    def log_payment(
        action: str,
        order_id: str,
        amount: float,
        currency: str,
        status: str,
        user_id: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        """
        Log payment events with transaction details.

        Args:
            action: Payment action ("initiated", "completed", "failed", "refunded")
            order_id: Order/transaction ID
            amount: Amount in base currency
            currency: Currency code (INR, USD)
            status: Payment status (from PayU)
            user_id: Optional user ID
            error: Error message if action failed
        """
        context = {
            "action": action,
            "order_id": order_id,
            "amount": amount,
            "currency": currency,
            "status": status,
        }
        if error:
            context["error"] = error

        level = "warning" if action == "failed" else "info"
        StructuredLogger.log_event(
            event="payment",
            level=level,
            context=context,
            user_id=user_id,
        )

    @staticmethod
    def log_celery_task(
        task_name: str,
        status: str,
        duration_ms: Optional[float] = None,
        user_id: Optional[str] = None,
        error: Optional[str] = None,
        retry_count: int = 0,
    ) -> None:
        """
        Log Celery task execution for async processing monitoring.

        Args:
            task_name: Task name (e.g., "send_registration_email")
            status: Task status ("started", "completed", "failed", "retried")
            duration_ms: Execution duration in milliseconds (if completed)
            user_id: Optional user ID
            error: Error message if task failed
            retry_count: Number of retries so far
        """
        context = {
            "task": task_name,
            "status": status,
            "retry_count": retry_count,
        }
        if duration_ms:
            context["duration_ms"] = round(duration_ms, 2)
        if error:
            context["error"] = error

        level = "error" if status == "failed" else ("warning" if status == "retried" else "info")
        StructuredLogger.log_event(
            event="celery.task",
            level=level,
            context=context,
            user_id=user_id,
        )

    @staticmethod
    def log_error(
        error_type: str,
        message: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Log error events with full context for debugging.

        Args:
            error_type: Type of error (e.g., "ValidationError", "DatabaseError")
            message: Error message
            user_id: Optional user ID
            request_id: Optional request ID
            details: Additional error details
        """
        context = {
            "error_type": error_type,
            "message": message,
        }
        if details:
            context.update(details)

        StructuredLogger.log_event(
            event="error",
            level="error",
            context=context,
            user_id=user_id,
            request_id=request_id,
        )


# Convenience functions for common logging patterns
def log_event(
    event: str,
    level: str = "info",
    context: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> None:
    """Convenience function to log a structured event."""
    StructuredLogger.log_event(event, level, context, user_id, request_id)


def log_auth(
    action: str,
    email: str,
    success: bool,
    reason: Optional[str] = None,
    request_id: Optional[str] = None,
) -> None:
    """Convenience function to log auth events."""
    StructuredLogger.log_auth(action, email, success, reason, request_id)


def log_payment(
    action: str,
    order_id: str,
    amount: float,
    currency: str,
    status: str,
    user_id: Optional[str] = None,
    error: Optional[str] = None,
) -> None:
    """Convenience function to log payment events."""
    StructuredLogger.log_payment(action, order_id, amount, currency, status, user_id, error)


def log_error(
    error_type: str,
    message: str,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Convenience function to log errors."""
    StructuredLogger.log_error(error_type, message, user_id, request_id, details)


def log_celery_task(
    task_name: str,
    status: str,
    duration_ms: Optional[float] = None,
    user_id: Optional[str] = None,
    error: Optional[str] = None,
    retry_count: int = 0,
) -> None:
    """Convenience function to log Celery task events."""
    StructuredLogger.log_celery_task(task_name, status, duration_ms, user_id, error, retry_count)
