"""
Role-Based Access Control (RBAC)
---------------------------------
FastAPI dependency functions for role enforcement.
Use as a drop-in replacement or alongside `verify_token`.

Usage:
    @router.post("/")
    async def create_hackathon(user_id: str = Depends(require_admin)):
        ...
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.base import User, UserRole
from app.core.security import verify_token


async def _get_user_from_token(
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Internal helper: resolves user_id to a User ORM object."""
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated",
        )
    return user


async def require_admin(user: User = Depends(_get_user_from_token)) -> str:
    """Dependency: allows only ADMIN role."""
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return str(user.id)


async def require_judge_or_admin(user: User = Depends(_get_user_from_token)) -> str:
    """Dependency: allows ADMIN or JUDGE roles."""
    if user.role not in [UserRole.ADMIN, UserRole.JUDGE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Judge access required",
        )
    return str(user.id)


async def require_authenticated(user: User = Depends(_get_user_from_token)) -> str:
    """Dependency: any authenticated, active user."""
    return str(user.id)
