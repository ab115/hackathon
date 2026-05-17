from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.db.session import get_db
from app.models.base import Mentor, MentorshipBooking
from app.schemas.mentors import MentorCreate, MentorUpdate, MentorOut
from app.core.security import verify_token
from app.core.rbac import require_admin
from app.core.cache import get_cached, set_cached, invalidate_pattern
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("/bookings/my")
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """List current user's mentorship bookings."""
    q = select(MentorshipBooking).options(joinedload(MentorshipBooking.mentor)).where(MentorshipBooking.user_id == int(user_id)).order_by(MentorshipBooking.created_at.desc())
    result = await db.execute(q)
    bookings = result.scalars().all()
    return bookings


@router.get("/", response_model=List[MentorOut])
async def list_mentors(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List mentors. Open to authenticated users."""
    cache_key = f"mentors:list:{skip}:{limit}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return cached

    q = select(Mentor).order_by(Mentor.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    mentors = result.scalars().all()

    data = [MentorOut.model_validate(m).model_dump(mode="json") for m in mentors]
    await set_cached(cache_key, data, ttl=60)
    return mentors


@router.get("/{mentor_id}", response_model=MentorOut)
async def get_mentor(mentor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_id))
    mentor = result.scalars().first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


@router.post("/", response_model=MentorOut, status_code=status.HTTP_201_CREATED)
async def create_mentor(
    mentor_in: MentorCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Create a new mentor. Requires ADMIN role."""
    new_mentor = Mentor(**mentor_in.model_dump())
    db.add(new_mentor)
    await db.commit()
    await db.refresh(new_mentor)
    
    await invalidate_pattern("mentors:*")
    return new_mentor


@router.patch("/{mentor_id}", response_model=MentorOut)
async def update_mentor(
    mentor_id: int,
    updates: MentorUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_id))
    mentor = result.scalars().first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(mentor, key, value)

    await db.commit()
    await db.refresh(mentor)
    await invalidate_pattern("mentors:*")
    return mentor


@router.delete("/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mentor(
    mentor_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_id))
    mentor = result.scalars().first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    await db.delete(mentor)
    await db.commit()
    await invalidate_pattern("mentors:*")
