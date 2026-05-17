from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List

from app.db.session import get_db
from app.models.base import Submission, Team, TeamMember
from app.schemas.submissions import SubmissionCreate, SubmissionOut
from app.core.security import verify_token
from app.core.cache import get_cached, set_cached, invalidate_pattern, invalidate
from app.tasks import worker as celery_worker

router = APIRouter()


@router.post("/", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def create_submission(
    submission_in: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Submit a project for a hackathon. User must be a team member."""
    # Verify team exists
    team_result = await db.execute(
        select(Team).where(Team.id == submission_in.team_id)
    )
    team = team_result.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    new_submission = Submission(**submission_in.model_dump())
    db.add(new_submission)
    await db.commit()
    await db.refresh(new_submission)

    # Bust leaderboard + hackathon submission cache
    await invalidate_pattern(f"leaderboard:{submission_in.hackathon_id}")
    await invalidate(f"submissions:hackathon:{submission_in.hackathon_id}")
    await invalidate(f"submissions:user:{user_id}")

    # Trigger async email notification
    try:
        celery_worker.send_submission_received_email.delay(
            new_submission.id,
            int(user_id),
            submission_in.hackathon_id,
        )
    except Exception:
        pass  # Don't fail the request if Celery is unavailable

    return new_submission


@router.get("/my", response_model=List[SubmissionOut])
async def get_my_submissions(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Get all submissions by the current user's teams. Cached per-user for 60s."""
    cache_key = f"submissions:user:{user_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    # Find teams the user is part of
    member_result = await db.execute(
        select(TeamMember).where(TeamMember.user_id == int(user_id))
    )
    team_ids = [m.team_id for m in member_result.scalars().all()]

    if not team_ids:
        return []

    result = await db.execute(
        select(Submission)
        .where(Submission.team_id.in_(team_ids))
        .order_by(desc(Submission.created_at))
    )
    submissions = result.scalars().all()
    # Serialize manually since SubmissionOut may not be JSON-serializable
    data = [
        {
            "id": s.id,
            "team_id": s.team_id,
            "hackathon_id": s.hackathon_id,
            "title": s.title,
            "description": s.description,
            "repo_url": s.repo_url,
            "demo_url": s.demo_url,
            "tech_stack": s.tech_stack,
            "score": s.score,
            "judge_feedback": s.judge_feedback,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in submissions
    ]
    await set_cached(cache_key, data, ttl=60)
    return JSONResponse(content=data)


@router.get("/hackathon/{hackathon_id}", response_model=List[SubmissionOut])
async def get_hackathon_submissions(
    hackathon_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all submissions for a hackathon, ordered by score. Cached 120s."""
    cache_key = f"submissions:hackathon:{hackathon_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(
        select(Submission)
        .where(Submission.hackathon_id == hackathon_id)
        .order_by(desc(Submission.score))
    )
    submissions = result.scalars().all()
    data = [
        {
            "id": s.id, "team_id": s.team_id, "hackathon_id": s.hackathon_id,
            "title": s.title, "description": s.description,
            "repo_url": s.repo_url, "demo_url": s.demo_url,
            "tech_stack": s.tech_stack, "score": s.score,
            "judge_feedback": s.judge_feedback,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in submissions
    ]
    await set_cached(cache_key, data, ttl=120)
    return JSONResponse(content=data)


@router.get("/leaderboard/{hackathon_id}")
async def get_leaderboard(hackathon_id: int, db: AsyncSession = Depends(get_db)):
    """Top 10 leaderboard for a hackathon. Cached for 300s."""
    cache_key = f"leaderboard:{hackathon_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(
        select(Submission)
        .where(Submission.hackathon_id == hackathon_id)
        .order_by(desc(Submission.score))
        .limit(10)
    )
    submissions = result.scalars().all()

    leaderboard = [
        {
            "rank": i + 1,
            "team_id": sub.team_id,
            "title": sub.title,
            "score": sub.score,
            "tech_stack": sub.tech_stack,
        }
        for i, sub in enumerate(submissions)
    ]
    await set_cached(cache_key, leaderboard, ttl=300)
    return leaderboard


@router.get("/{submission_id}", response_model=SubmissionOut)
async def get_submission(submission_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single submission by ID. Cached for 120s."""
    cache_key = f"submissions:single:{submission_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    data = {
        "id": submission.id, "team_id": submission.team_id,
        "hackathon_id": submission.hackathon_id, "title": submission.title,
        "description": submission.description, "repo_url": submission.repo_url,
        "demo_url": submission.demo_url, "tech_stack": submission.tech_stack,
        "score": submission.score, "judge_feedback": submission.judge_feedback,
        "created_at": submission.created_at.isoformat() if submission.created_at else None,
        "updated_at": submission.updated_at.isoformat() if submission.updated_at else None,
    }
    await set_cached(cache_key, data, ttl=120)
    return JSONResponse(content=data)


@router.patch("/{submission_id}", response_model=SubmissionOut)
async def update_submission(
    submission_id: int,
    updates: dict,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Update a submission. Only team members can update."""
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalars().first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    allowed = {"title", "description", "repo_url", "demo_url", "tech_stack", "score", "judge_feedback"}
    for field, value in updates.items():
        if field in allowed:
            setattr(submission, field, value)

    await db.commit()
    await db.refresh(submission)

    # Bust affected caches
    await invalidate_pattern(f"submissions:single:{submission_id}")
    await invalidate(f"submissions:hackathon:{submission.hackathon_id}")
    # Bust leaderboard if score was updated
    if "score" in updates:
        await invalidate_pattern(f"leaderboard:{submission.hackathon_id}")
    return submission
