"""
Admin User Management endpoints.
GET    /api/admin/users               — paginated list with search/filter
PATCH  /api/admin/users/{id}          — update role or active status
DELETE /api/admin/users/{id}          — deactivate (soft delete)
POST   /api/admin/users/bulk-import   — CSV upload bulk create
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from typing import Optional
import csv
import io

from app.db.session import get_db
from app.models.base import User, UserRole, Registration
from app.core.rbac import require_admin
from app.core.security import get_password_hash
from app.core.cache import invalidate, invalidate_pattern

router = APIRouter()


# ─────────────────────────────────────────────────────
# GET /api/admin/users
# ─────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, description="Search by name, email, college"),
    role: Optional[str] = Query(None, description="Filter by role: student, admin, judge, mentor"),
    is_active: Optional[bool] = Query(None),
):
    """List all users with search, role filter, and pagination. Admin-only."""

    q = select(User)

    if search:
        like = f"%{search}%"
        q = q.where(
            or_(
                User.full_name.ilike(like),
                User.email.ilike(like),
                User.college.ilike(like),
            )
        )

    if role:
        try:
            q = q.where(User.role == UserRole(role.lower()))
        except ValueError:
            pass

    if is_active is not None:
        q = q.where(User.is_active == is_active)

    # Total count for pagination
    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    q = q.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    users = result.scalars().all()

    # Registration count per user
    reg_result = await db.execute(
        select(Registration.user_id, func.count(Registration.id).label("reg_count"))
        .group_by(Registration.user_id)
    )
    reg_map = {row.user_id: row.reg_count for row in reg_result.all()}

    data = [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "phone": u.phone or "",
            "college": u.college or "",
            "city": u.city or "",
            "state": u.state or "",
            "skills": u.skills or "",
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "hackathons_count": reg_map.get(u.id, 0),
        }
        for u in users
    ]

    return {"total": total, "skip": skip, "limit": limit, "users": data}


# ─────────────────────────────────────────────────────
# PATCH /api/admin/users/{user_id}
# ─────────────────────────────────────────────────────

@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    updates: dict,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
):
    """Update a user's role or active status. Admin-only."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    allowed = {"role", "is_active", "full_name", "phone", "college", "city", "state"}
    for field, value in updates.items():
        if field in allowed:
            if field == "role":
                try:
                    value = UserRole(value.lower())
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Invalid role: {value}")
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    await invalidate(f"users:me:{user_id}")
    return {"id": user.id, "full_name": user.full_name, "email": user.email,
            "role": user.role, "is_active": user.is_active}


# ─────────────────────────────────────────────────────
# DELETE /api/admin/users/{user_id}  (soft deactivate)
# ─────────────────────────────────────────────────────

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
):
    """Soft-deactivate a user. Does not delete data. Admin-only."""
    if int(admin_id) == user_id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    await db.commit()
    await invalidate(f"users:me:{user_id}")
    return {"message": f"User {user.email} has been deactivated"}


# ─────────────────────────────────────────────────────
# POST /api/admin/users
# ─────────────────────────────────────────────────────

@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_individual_user(
    user_data: dict,
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
):
    """Create a single user manually. Admin-only."""
    email = (user_data.get("email") or "").strip().lower()
    full_name = (user_data.get("full_name") or "").strip()
    password = (user_data.get("password") or "").strip()

    if not email or not full_name or not password:
        raise HTTPException(status_code=400, detail="Missing required fields: email, full_name, password")

    # Check duplicate
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="User with this email already exists")

    role_str = (user_data.get("role") or "student").strip().lower()
    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.STUDENT

    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role=role,
        college=(user_data.get("college") or "").strip() or None,
        phone=(user_data.get("phone") or "").strip() or None,
        city=(user_data.get("city") or "").strip() or None,
        state=(user_data.get("state") or "").strip() or None,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"id": new_user.id, "email": new_user.email, "full_name": new_user.full_name, "role": new_user.role}


# ─────────────────────────────────────────────────────
# POST /api/admin/users/bulk-import  (CSV)
# ─────────────────────────────────────────────────────

@router.post("/users/bulk-import")
async def bulk_import_users(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
):
    """
    Bulk-create users from a CSV file.

    Expected CSV columns (header row required):
        full_name, email, password, role [optional], college [optional],
        phone [optional], city [optional], state [optional]

    Role defaults to 'student' if omitted.
    Duplicate emails are skipped with a warning.
    """
    if file.content_type not in {"text/csv", "text/plain", "application/vnd.ms-excel"}:
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File must be smaller than 5MB")

    try:
        text = contents.decode("utf-8-sig")  # handles BOM
        reader = csv.DictReader(io.StringIO(text))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file")

    required_cols = {"full_name", "email", "password"}
    if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=422,
            detail=f"CSV must have columns: {', '.join(required_cols)}. "
                   f"Optional: role, college, phone, city, state",
        )

    created, skipped, errors = [], [], []

    for i, row in enumerate(reader, start=2):  # row 1 is header
        email = (row.get("email") or "").strip().lower()
        full_name = (row.get("full_name") or "").strip()
        password = (row.get("password") or "").strip()

        if not email or not full_name or not password:
            errors.append({"row": i, "reason": "Missing required field(s)"})
            continue

        # Check duplicate
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalars().first():
            skipped.append(email)
            continue

        role_str = (row.get("role") or "student").strip().lower()
        try:
            role = UserRole(role_str)
        except ValueError:
            role = UserRole.STUDENT

        new_user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=role,
            college=(row.get("college") or "").strip() or None,
            phone=(row.get("phone") or "").strip() or None,
            city=(row.get("city") or "").strip() or None,
            state=(row.get("state") or "").strip() or None,
            is_active=True,
        )
        db.add(new_user)
        created.append(email)

    await db.commit()

    return {
        "message": f"Import complete: {len(created)} created, {len(skipped)} skipped (duplicates), {len(errors)} errors",
        "created": created,
        "skipped": skipped,
        "errors": errors,
    }
