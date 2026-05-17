from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv
import logging
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.logging import log_celery_task, log_error

load_dotenv()

REDIS_URL    = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/hackfusion"
).replace("asyncpg", "psycopg2")

# ──────────────────────────────────────────────
# Celery App
# ──────────────────────────────────────────────

worker = Celery(
    "hackfusion",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.worker"],
)

worker.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",       # IST for scheduled tasks
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,       # 30-min hard limit
    task_soft_time_limit=25 * 60,  # 25-min soft limit
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    # Beat schedule (requires celery-beat service)
    beat_schedule={
        "update-leaderboards-every-5-minutes": {
            "task": "update_all_leaderboards",
            "schedule": crontab(minute="*/5"),
        },
        "cleanup-expired-sessions-daily": {
            "task": "cleanup_expired_sessions",
            "schedule": crontab(hour=2, minute=0),   # 2 AM IST
        },
        "archive-old-submissions-weekly": {
            "task": "archive_old_submissions",
            "schedule": crontab(day_of_week="sunday", hour=3, minute=0),
        },
    },
)

logger = logging.getLogger(__name__)

# Sync SQLAlchemy session for Celery tasks (Celery is not async-native)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
Session = sessionmaker(bind=engine)


# ──────────────────────────────────────────────
# Email Tasks
# ──────────────────────────────────────────────

@worker.task(bind=True, max_retries=3, name="send_registration_confirmation")
def send_registration_confirmation(self, user_id: int, hackathon_id: int):
    """Send registration confirmation email. Retries 3× with exponential backoff."""
    start = time.time()
    try:
        from app.models.base import User, Hackathon
        from app.services.email import send_registration_confirmation as _send

        session = Session()
        try:
            user      = session.query(User).filter(User.id == user_id).first()
            hackathon = session.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
            if not user or not hackathon:
                log_error("DataNotFoundError", f"user={user_id} hackathon={hackathon_id}", str(user_id))
                return

            # hackathon.title (renamed from .name)
            success = _send(user_email=user.email, user_name=user.full_name, hackathon_name=hackathon.title)
            if not success:
                raise Exception("Email send returned False")

            log_celery_task("send_registration_confirmation", "completed",
                            (time.time() - start) * 1000, str(user_id))
        finally:
            session.close()

    except Exception as exc:
        retry_count = self.request.retries
        log_celery_task("send_registration_confirmation",
                        "retried" if retry_count < 3 else "failed",
                        (time.time() - start) * 1000, str(user_id), str(exc), retry_count)
        raise self.retry(exc=exc, countdown=60 * (2 ** retry_count))


@worker.task(bind=True, max_retries=3, name="send_payment_confirmation")
def send_payment_confirmation(self, registration_id: int, user_id: int, hackathon_id: int, status: str):
    """Send payment confirmation or failure email."""
    start = time.time()
    try:
        from app.models.base import User, Hackathon, Registration
        from app.services.email import send_payment_confirmation as _send

        session = Session()
        try:
            user         = session.query(User).filter(User.id == user_id).first()
            hackathon    = session.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
            registration = session.query(Registration).filter(Registration.id == registration_id).first()
            if not user or not hackathon or not registration:
                log_error("DataNotFoundError", f"reg={registration_id} user={user_id}", str(user_id))
                return

            success = _send(
                user_email=user.email, user_name=user.full_name,
                hackathon_name=hackathon.title,          # .title (renamed)
                amount=registration.registration_fee, status=status,
            )
            if not success:
                raise Exception("Email send returned False")

            log_celery_task("send_payment_confirmation", "completed",
                            (time.time() - start) * 1000, str(user_id))
        finally:
            session.close()

    except Exception as exc:
        retry_count = self.request.retries
        log_celery_task("send_payment_confirmation",
                        "retried" if retry_count < 3 else "failed",
                        (time.time() - start) * 1000, str(user_id), str(exc), retry_count)
        raise self.retry(exc=exc, countdown=60 * (2 ** retry_count))


@worker.task(bind=True, max_retries=3, name="send_submission_received_email")
def send_submission_received_email(self, submission_id: int, user_id: int, hackathon_id: int):
    """Notify team that their submission was received."""
    start = time.time()
    try:
        from app.models.base import User, Hackathon, Submission
        from app.services.email import send_submission_received as _send

        session = Session()
        try:
            user       = session.query(User).filter(User.id == user_id).first()
            hackathon  = session.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
            submission = session.query(Submission).filter(Submission.id == submission_id).first()
            if not user or not hackathon or not submission:
                log_error("DataNotFoundError", f"sub={submission_id} user={user_id}", str(user_id))
                return

            success = _send(
                user_email=user.email, user_name=user.full_name,
                hackathon_name=hackathon.title,          # .title
                submission_title=submission.title,
            )
            if not success:
                raise Exception("Email send returned False")

            log_celery_task("send_submission_received_email", "completed",
                            (time.time() - start) * 1000, str(user_id))
        finally:
            session.close()

    except Exception as exc:
        retry_count = self.request.retries
        log_celery_task("send_submission_received_email",
                        "retried" if retry_count < 3 else "failed",
                        (time.time() - start) * 1000, str(user_id), str(exc), retry_count)
        raise self.retry(exc=exc, countdown=60 * (2 ** retry_count))


# ──────────────────────────────────────────────
# Scheduled Tasks
# ──────────────────────────────────────────────

@worker.task(name="update_all_leaderboards")
def update_all_leaderboards():
    """Recalculate leaderboards for all active hackathons every 5 minutes."""
    start = time.time()
    try:
        from app.models.base import Hackathon, HackathonStatus, Submission
        session = Session()
        try:
            active = session.query(Hackathon).filter(
                Hackathon.status == HackathonStatus.OPEN
            ).all()
            for hackathon in active:
                # Scores are set by judges via JudgingPortal
                pass  # Leaderboard reads are live from DB/cache in real-time
            log_celery_task("update_all_leaderboards", "completed", (time.time() - start) * 1000)
        finally:
            session.close()
    except Exception as exc:
        log_celery_task("update_all_leaderboards", "failed", (time.time() - start) * 1000, error=str(exc))


@worker.task(name="cleanup_expired_sessions")
def cleanup_expired_sessions():
    """Daily cleanup of stale data."""
    start = time.time()
    log_celery_task("cleanup_expired_sessions", "started")
    # Extend: clear expired JWT deny-list from Redis, temp files, etc.
    log_celery_task("cleanup_expired_sessions", "completed", (time.time() - start) * 1000)


@worker.task(name="archive_old_submissions")
def archive_old_submissions(days: int = 365):
    """Weekly archive of submissions older than `days`."""
    start = time.time()
    log_celery_task("archive_old_submissions", "started")
    # Extend: move to cold storage / S3
    log_celery_task("archive_old_submissions", "completed", (time.time() - start) * 1000)


@worker.task(name="hello_task")
def hello_task():
    """Smoke-test task — verify Celery worker is alive."""
    return "Scalegrad worker is running!"


if __name__ == "__main__":
    worker.start()
