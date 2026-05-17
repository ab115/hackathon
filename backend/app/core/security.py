from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import bcrypt

# Fix for bcrypt 4.0.0+ / passlib 1.7.4 compatibility
# Bcrypt 4.0+ raises ValueError for passwords > 72 bytes.
# Passlib's internal self-test uses a 73-byte password and fails.
# We monkeypatch bcrypt.hashpw to truncate automatically.
original_hashpw = bcrypt.hashpw
def patched_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode("utf-8")
    if len(password) > 72:
        password = password[:72]
    return original_hashpw(password, salt)
bcrypt.hashpw = patched_hashpw

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("JWT_SECRET")

if not SECRET_KEY or SECRET_KEY == "your-default-secret-key-change-this-in-env":
    raise ValueError(
        "JWT_SECRET environment variable must be set and not use default value. "
        "Generate a strong secret key and set it in the .env file."
    )

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))  # Default: 15 minutes

# HTTP Bearer token scheme
security = HTTPBearer()

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verify JWT token from Authorization header.
    Raises HTTPException if token is invalid or expired.
    Returns the user_id from the token subject.
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    """
    Optionally verify JWT token. Returns user_id if valid token provided, None otherwise.
    """
    if credentials is None:
        return None
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
