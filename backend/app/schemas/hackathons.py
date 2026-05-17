from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.base import HackathonStatus


class HackathonCreate(BaseModel):
    title: str                              # renamed from 'name'
    description: Optional[str] = None
    category: Optional[str] = None
    status: HackathonStatus = HackathonStatus.OPEN
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    registration_fee: float = 0.0
    prize_pool: float = 0.0
    max_teams: Optional[int] = None
    team_size: int = 4
    is_public: bool = True
    banner_image: Optional[str] = None
    problem_statement: Optional[str] = None
    problem_statement_file: Optional[str] = None
    rules: Optional[str] = None
    timeline: Optional[str] = None


class HackathonOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: HackathonStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    registration_fee: float
    prize_pool: float
    max_teams: Optional[int] = None
    team_size: int
    is_public: bool
    banner_image: Optional[str] = None
    problem_statement: Optional[str] = None
    problem_statement_file: Optional[str] = None
    rules: Optional[str] = None
    timeline: Optional[str] = None
    created_at: Optional[datetime] = None
    
    registration_count: Optional[int] = 0
    submission_count: Optional[int] = 0
    total_revenue: Optional[float] = 0.0

    model_config = {"from_attributes": True}


class TeamCreate(BaseModel):
    hackathon_id: int
    name: str
    description: Optional[str] = None


class TeamOut(BaseModel):
    id: int
    hackathon_id: int
    name: str
    creator_id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
