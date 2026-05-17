from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
import os
import uuid
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete, literal_column
from sqlalchemy.orm import aliased
from typing import List, Optional

from app.db.session import get_db
from app.models.base import Hackathon, Team, TeamMember, Registration, HackathonStatus, Submission
from app.schemas.hackathons import HackathonCreate, HackathonOut, TeamCreate, TeamOut
from app.core.security import verify_token
from app.core.rbac import require_admin
from app.core.cache import get_cached, set_cached, invalidate_pattern

router = APIRouter()


@router.get("/", response_model=List[HackathonOut])
async def list_hackathons(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status: open, closed, draft, completed"),
    include_private: bool = Query(False, description="Include private hackathons (admin only)"),
):
    """List hackathons with optional status filter and pagination. Results cached for 60s."""
    cache_key = f"hackathons:list:{skip}:{limit}:{status or 'all'}:{include_private}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    # ── Single aggregated query — no N+1 ──
    # Subquery: registration counts + revenue per hackathon
    reg_sq = (
        select(
            Registration.hackathon_id,
            func.count(Registration.id).label("reg_count"),
            func.coalesce(func.sum(Registration.registration_fee), 0.0).label("total_rev"),
        )
        .group_by(Registration.hackathon_id)
        .subquery()
    )
    # Subquery: submission counts per hackathon
    sub_sq = (
        select(
            Submission.hackathon_id,
            func.count(Submission.id).label("sub_count"),
        )
        .group_by(Submission.hackathon_id)
        .subquery()
    )

    main_q = (
        select(
            Hackathon,
            func.coalesce(reg_sq.c.reg_count, 0).label("registration_count"),
            func.coalesce(reg_sq.c.total_rev, 0.0).label("total_revenue"),
            func.coalesce(sub_sq.c.sub_count, 0).label("submission_count"),
        )
        .outerjoin(reg_sq, Hackathon.id == reg_sq.c.hackathon_id)
        .outerjoin(sub_sq, Hackathon.id == sub_sq.c.hackathon_id)
    )

    if not include_private:
        main_q = main_q.where(Hackathon.is_public == True)
    if status:
        main_q = main_q.where(Hackathon.status == status)
    main_q = main_q.order_by(Hackathon.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(main_q)
    rows = result.all()   # each row = (Hackathon, reg_count, total_rev, sub_count)

    data = [
        {
            "id": h.id,
            "title": h.title,
            "description": h.description,
            "category": h.category,
            "status": h.status,
            "start_date": h.start_date.isoformat() if h.start_date else None,
            "end_date": h.end_date.isoformat() if h.end_date else None,
            "registration_start": h.registration_start.isoformat() if h.registration_start else None,
            "registration_end": h.registration_end.isoformat() if h.registration_end else None,
            "registration_fee": h.registration_fee,
            "prize_pool": h.prize_pool,
            "max_teams": h.max_teams,
            "team_size": h.team_size,
            "is_public": h.is_public,
            "banner_image": h.banner_image,
            "problem_statement": h.problem_statement,
            "problem_statement_file": h.problem_statement_file,
            "rules": h.rules,
            "timeline": h.timeline,
            "created_at": h.created_at.isoformat() if h.created_at else None,
            "registration_count": int(reg_count),
            "submission_count": int(sub_count),
            "total_revenue": float(total_rev),
        }
        for h, reg_count, total_rev, sub_count in rows
    ]

    await set_cached(cache_key, data, ttl=60)
    return data


@router.get("/my-registrations", response_model=List[dict])
async def get_my_registrations(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Get all hackathons the current user is registered for. Cached per-user for 30s."""
    cache_key = f"registrations:user:{user_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(
        select(Registration).where(Registration.user_id == int(user_id))
    )
    registrations = result.scalars().all()
    data = [
        {
            "id": r.id,
            "hackathon_id": r.hackathon_id,
            "registration_date": r.created_at.isoformat() if r.created_at else None,
            "payment_status": r.payment_status,
        }
        for r in registrations
    ]
    await set_cached(cache_key, data, ttl=30)
    return data


@router.get("/{hackathon_id}", response_model=HackathonOut)
async def get_hackathon(hackathon_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single hackathon by ID. Cached for 5 minutes."""
    cache_key = f"hackathons:single:{hackathon_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hackathon = result.scalars().first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    data = {
        "id": hackathon.id, "title": hackathon.title, "description": hackathon.description,
        "category": hackathon.category, "status": hackathon.status,
        "start_date": hackathon.start_date.isoformat() if hackathon.start_date else None,
        "end_date": hackathon.end_date.isoformat() if hackathon.end_date else None,
        "registration_start": hackathon.registration_start.isoformat() if hackathon.registration_start else None,
        "registration_end": hackathon.registration_end.isoformat() if hackathon.registration_end else None,
        "registration_fee": hackathon.registration_fee, "prize_pool": hackathon.prize_pool,
        "max_teams": hackathon.max_teams, "team_size": hackathon.team_size,
        "is_public": hackathon.is_public, "banner_image": hackathon.banner_image,
        "problem_statement": hackathon.problem_statement, "rules": hackathon.rules, "timeline": hackathon.timeline,
        "created_at": hackathon.created_at.isoformat() if hackathon.created_at else None,
    }
    await set_cached(cache_key, data, ttl=300)
    return hackathon


@router.post("/", response_model=HackathonOut, status_code=status.HTTP_201_CREATED)
async def create_hackathon(
    hackathon_in: HackathonCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),   # RBAC: admin only
):
    """Create a new hackathon. Requires ADMIN role."""
    new_hackathon = Hackathon(**hackathon_in.model_dump(), created_by=int(user_id))
    db.add(new_hackathon)
    await db.commit()
    await db.refresh(new_hackathon)

    # Bust list cache
    await invalidate_pattern("hackathons:list:*")
    return new_hackathon


@router.patch("/{hackathon_id}", response_model=HackathonOut)
async def update_hackathon(
    hackathon_id: int,
    updates: dict,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Update hackathon fields. Requires ADMIN role."""
    result = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hackathon = result.scalars().first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    allowed = {
        "title", "description", "category", "status", "start_date", "end_date",
        "registration_start", "registration_end", "registration_fee", "prize_pool", 
        "max_teams", "team_size", "is_public", "banner_image",
        "problem_statement", "problem_statement_file", "rules", "timeline"
    }
    for field, value in updates.items():
        if field in allowed:
            # Handle date strings if passed from JSON
            if "date" in field or "start" in field or "end" in field:
                if value and isinstance(value, str):
                    from datetime import datetime
                    # Parse standard ISO formats if possible, otherwise rely on SQLAlchemy/driver
                    try:
                        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
                    except ValueError:
                        pass
            setattr(hackathon, field, value)

    await db.commit()
    await db.refresh(hackathon)
    await invalidate_pattern("hackathons:*")
    return hackathon


@router.post("/upload-banner")
async def upload_banner(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Upload a hackathon banner image (JPEG/PNG only, max 10MB)."""
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are allowed")

    # Read into memory to check size
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 10MB")

    upload_dir = "/app/uploads/banners"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"banner_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    return {"banner_url": f"/uploads/banners/{filename}"}


@router.post("/upload-problem-statement")
async def upload_problem_statement(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Upload a problem statement document (PDF, DOCX, TXT, ZIP, JAR)."""
    allowed_types = {
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/zip",
        "application/x-zip-compressed",
        "application/java-archive",
        "application/x-java-archive",
        "application/octet-stream",  # For some JARs/ZIPs that don't have proper mime types
        "application/x-gzip",
        "application/x-tar"
    }
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, TXT, ZIP, JAR, or TAR.GZ documents are allowed")

    # Read into memory to check size
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Document must be smaller than 20MB")

    upload_dir = "/app/uploads/docs"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "pdf"
    filename = f"ps_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    return {"file_url": f"/uploads/docs/{filename}"}


@router.delete("/{hackathon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hackathon(
    hackathon_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Soft-delete by setting status=CLOSED. Requires ADMIN role."""
    result = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hackathon = result.scalars().first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    # Manually delete child records to avoid foreign key constraint violations
    await db.execute(delete(Registration).where(Registration.hackathon_id == hackathon_id))
    await db.execute(delete(Submission).where(Submission.hackathon_id == hackathon_id))
    
    # Team members might reference team.id, so delete members first
    # Actually team members don't reference hackathon_id, but teams do.
    # We need to delete team members of teams in this hackathon
    teams_result = await db.execute(select(Team.id).where(Team.hackathon_id == hackathon_id))
    team_ids = [t_id for t_id in teams_result.scalars().all()]
    if team_ids:
        await db.execute(delete(TeamMember).where(TeamMember.team_id.in_(team_ids)))
    
    await db.execute(delete(Team).where(Team.hackathon_id == hackathon_id))

    await db.delete(hackathon)
    await db.commit()
    await invalidate_pattern("hackathons:*")


@router.post("/{hackathon_id}/register", status_code=status.HTTP_201_CREATED)
async def register_free_hackathon(
    hackathon_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """
    Register directly for a FREE hackathon (no payment required).
    For paid hackathons use the /payments/initiate flow.
    """
    result = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hackathon = result.scalars().first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    if hackathon.registration_fee > 0:
        raise HTTPException(
            status_code=400,
            detail="This hackathon has a registration fee. Use /api/payments/initiate instead.",
        )

    # ── Row-level lock: prevents duplicate registrations under concurrent requests ──
    existing = await db.execute(
        select(Registration)
        .where(
            Registration.user_id == int(user_id),
            Registration.hackathon_id == hackathon_id,
        )
        .with_for_update(skip_locked=True)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="You are already registered for this hackathon")

    registration = Registration(
        user_id=int(user_id),
        hackathon_id=hackathon_id,
        registration_fee=0.0,
        payment_status="FREE",
        transaction_id=f"FREE_{user_id}_{hackathon_id}",
    )
    db.add(registration)
    await db.commit()
    await db.refresh(registration)

    # Invalidate per-user registration cache
    await invalidate(f"registrations:user:{user_id}")

    # Trigger async email confirmation
    from app.tasks import worker as celery_worker
    try:
        celery_worker.send_registration_confirmation.delay(
            registration.user_id,
            registration.hackathon_id,
        )
    except Exception:
        pass

    return {
        "status": "success",
        "message": "Successfully registered for hackathon",
        "registration_id": registration.id,
        "hackathon": hackathon.title,
    }


@router.get("/{hackathon_id}/registrations")
async def get_hackathon_registrations(
    hackathon_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """
    Get all registrations for a specific hackathon with participant + team details.
    Admin-only. Returns full user info, payment status, team membership.
    """
    from app.models.base import User as UserModel

    # Fetch registrations joined with user info
    reg_result = await db.execute(
        select(Registration, UserModel)
        .join(UserModel, Registration.user_id == UserModel.id)
        .where(Registration.hackathon_id == hackathon_id)
        .order_by(Registration.created_at.desc())
    )
    rows = reg_result.all()

    # Fetch teams for this hackathon
    team_result = await db.execute(
        select(Team, TeamMember)
        .outerjoin(TeamMember, Team.id == TeamMember.team_id)
        .where(Team.hackathon_id == hackathon_id)
    )
    team_rows = team_result.all()

    # Build a user_id -> team lookup
    user_team_map: dict = {}
    for team, member in team_rows:
        if member:
            user_team_map[member.user_id] = {
                "team_id": team.id,
                "team_name": team.name,
                "role": member.role,
            }

    data = []
    for reg, user in rows:
        data.append({
            "registration_id": reg.id,
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone or "",
            "college": user.college or "",
            "payment_status": reg.payment_status,
            "registration_fee": reg.registration_fee,
            "transaction_id": reg.transaction_id or "",
            "registered_at": reg.created_at.isoformat() if reg.created_at else None,
            "team": user_team_map.get(user.id),
        })

    return {
        "hackathon_id": hackathon_id,
        "total": len(data),
        "registrations": data,
    }


@router.post("/teams", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_in: TeamCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Create a team for a hackathon. User becomes team leader."""
    new_team = Team(**team_in.model_dump(), creator_id=int(user_id))
    db.add(new_team)
    await db.commit()
    await db.refresh(new_team)

    new_member = TeamMember(team_id=new_team.id, user_id=int(user_id), role="leader")
    db.add(new_member)
    await db.commit()

    return new_team
