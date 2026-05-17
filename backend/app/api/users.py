from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import shutil
import uuid

from app.db.session import get_db
from app.models.base import User
from app.schemas.auth import UserOut, UserUpdate
from app.core.security import verify_token
from app.core.cache import get_cached, set_cached, invalidate

router = APIRouter()

UPLOAD_DIR = "/app/uploads/avatars"


@router.get("/me", response_model=UserOut)
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Get the currently authenticated user's full profile. Cached 120s."""
    from fastapi.responses import JSONResponse
    cache_key = f"users:me:{user_id}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "role": user.role, "profile_image": user.profile_image, "bio": user.bio,
        "phone": user.phone, "college": user.college, "city": user.city,
        "state": user.state, "skills": user.skills, "interests": user.interests,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
    await set_cached(cache_key, data, ttl=120)
    return JSONResponse(content=data)


@router.patch("/me", response_model=UserOut)
async def update_profile(
    updates: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Update the current user's profile fields."""
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    # Bust profile cache
    await invalidate(f"users:me:{user_id}")
    return user


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Upload a profile image (JPEG/PNG only, max 5MB)."""
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are allowed")

    # Read into memory to check size
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 5MB")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{user_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    user.profile_image = f"/uploads/avatars/{filename}"
    await db.commit()
    await db.refresh(user)

    # Bust profile cache
    await invalidate(f"users:me:{user_id}")
    return user


@router.get("/{user_id}", response_model=UserOut)
async def get_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get a public user profile by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/me/recommendations", response_model=list[dict])
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Get AI teammate recommendations based on overlapping skills and interests."""
    # Get current user
    result = await db.execute(select(User).where(User.id == int(user_id)))
    current_user = result.scalars().first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    my_skills = set(s.strip().lower() for s in (current_user.skills or "").split(",") if s.strip())
    my_interests = set(i.strip().lower() for i in (current_user.interests or "").split(",") if i.strip())

    # Get all other active users
    result = await db.execute(select(User).where(User.id != int(user_id), User.is_active == True))
    other_users = result.scalars().all()

    recommendations = []
    for u in other_users:
        u_skills_raw = [s.strip() for s in (u.skills or "").split(",") if s.strip()]
        u_interests_raw = [i.strip() for i in (u.interests or "").split(",") if i.strip()]
        
        u_skills = set(s.lower() for s in u_skills_raw)
        u_interests = set(i.lower() for i in u_interests_raw)

        # Simple recommendation engine: Jaccard-ish similarity or weighted overlap
        # +20 base score just for existing
        # +10 for each overlapping skill
        # +5 for each overlapping interest
        score = 20
        skill_overlap = my_skills.intersection(u_skills)
        interest_overlap = my_interests.intersection(u_interests)
        
        score += len(skill_overlap) * 15
        score += len(interest_overlap) * 10
        
        # Add a tiny bit of random jitter so it's not identical if 0 overlap
        import random
        score += random.randint(0, 10)
        
        score = min(score, 99)  # Cap at 99%

        recommendations.append({
            "id": u.id,
            "name": u.full_name or "Unknown User",
            "avatar": u.full_name or "User",
            "skills": u_skills_raw,
            "interests": u_interests_raw,
            "matchScore": score,
            "hackathons": random.randint(0, 5),  # Dummy stat since we don't track historical hackathons yet
            "wins": random.randint(0, 2),        # Dummy stat
        })

    # Sort by matchScore descending
    recommendations.sort(key=lambda x: x["matchScore"], reverse=True)
    
    return recommendations[:10]  # Return top 10

