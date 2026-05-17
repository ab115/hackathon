from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResourceCreate(BaseModel):
    title: str
    type: str
    description: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    category: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    category: Optional[str] = None


class ResourceOut(BaseModel):
    id: int
    title: str
    type: str
    description: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    category: Optional[str] = None
    downloads: int
    rating: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
