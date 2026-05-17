from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta

from app.db.session import get_db
from app.models.base import User, PasswordResetToken
from app.schemas.auth import UserCreate, UserLogin, Token, UserOut, PasswordReset, PasswordResetConfirm
from app.core import security
from app.core.logging import log_auth

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check uniqueness
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        log_auth(action="register", email=user_in.email, success=False, reason="Email already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    hashed_password = security.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        college=user_in.college,
        city=user_in.city,
        state=user_in.state,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    log_auth(action="register", email=user_in.email, success=True)
    return new_user


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()

    if not user or not security.verify_password(user_in.password, user.hashed_password):
        log_auth(action="login", email=user_in.email, success=False, reason="Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )

    access_token = security.create_access_token(subject=user.id)
    log_auth(action="login", email=user_in.email, success=True)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(security.verify_token),
):
    """Issue a fresh access token for an authenticated user (token rotation)."""
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_token = security.create_access_token(
        subject=user.id,
        expires_delta=timedelta(days=7),
    )
    return {"access_token": new_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(reset_in: PasswordReset, db: AsyncSession = Depends(get_db)):
    """Generate a password reset token and store it in the database."""
    result = await db.execute(select(User).where(User.email == reset_in.email))
    user = result.scalars().first()

    if not user:
        # We return 200 even if email not found for security (to prevent email enumeration)
        return {"message": "If an account with that email exists, a reset link has been sent."}

    import uuid
    from datetime import datetime, timedelta
    
    reset_token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=1)
    
    token_entry = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires
    )
    db.add(token_entry)
    await db.commit()
    
    # In a real app, we'd send an actual email here
    print(f"\n[MOCK EMAIL] Password reset request for {reset_in.email}")
    print(f"[MOCK EMAIL] Reset Link: http://localhost/reset-password?token={reset_token}")
    print(f"[MOCK EMAIL] Token will expire in 1 hour.\n")

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(reset_in: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """Reset password using a valid token."""
    from datetime import datetime
    
    result = await db.execute(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.token == reset_in.token,
            PasswordResetToken.is_used == False,
            PasswordResetToken.expires_at > datetime.utcnow()
        )
    )
    token_entry = result.scalars().first()
    
    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
        
    user_result = await db.execute(select(User).where(User.id == token_entry.user_id))
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = security.get_password_hash(reset_in.new_password)
    token_entry.is_used = True
    
    await db.commit()
    
    log_auth(action="password_reset", email=user.email, success=True)
    return {"message": "Password successfully reset."}
