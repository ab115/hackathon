from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MentorCreate(BaseModel):
    name: str
    title: Optional[str] = None
    expertise: Optional[str] = None
    price: float = 0.0
    availability: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    avatar: Optional[str] = None
    meeting_link: Optional[str] = None


class MentorUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    expertise: Optional[str] = None
    price: Optional[float] = None
    availability: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    avatar: Optional[str] = None
    meeting_link: Optional[str] = None


class MentorOut(BaseModel):
    id: int
    name: str
    title: Optional[str] = None
    expertise: Optional[str] = None
    rating: float
    sessions: int
    price: float
    availability: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    avatar: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
