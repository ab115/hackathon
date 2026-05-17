from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
from app.models.base import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # Accepts both 'STUDENT' and 'student' — normalised below
    phone: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def normalise_role(cls, v: str) -> str:
        """Accept uppercase roles from the frontend (e.g. 'STUDENT') by lowercasing."""
        if isinstance(v, str):
            v = v.lower()
        try:
            return UserRole(v).value
        except ValueError:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {[r.value for r in UserRole]}")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: Optional[str]) -> Optional[str]:
        if v:
            digits = "".join(c for c in v if c.isdigit())
            if len(digits) < 10:
                raise ValueError("Phone must have at least 10 digits")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    bio: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
