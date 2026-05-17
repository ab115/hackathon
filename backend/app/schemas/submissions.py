from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubmissionBase(BaseModel):
    team_id: int
    hackathon_id: int
    title: str
    description: Optional[str] = None
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    tech_stack: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionOut(SubmissionBase):
    id: int
    score: float = 0.0
    judge_feedback: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
