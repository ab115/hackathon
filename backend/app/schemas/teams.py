from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TeamCreate(BaseModel):
    hackathon_id: int
    name: str
    description: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None

class TeamMemberOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    role: str
    status: str

class TeamOut(BaseModel):
    id: int
    hackathon_id: int
    hackathon_name: Optional[str] = None
    name: str
    creator_id: int
    created_at: Optional[datetime] = None
    members: List[TeamMemberOut] = []

    model_config = {"from_attributes": True}

class InvitationOut(BaseModel):
    id: int
    team_id: int
    team_name: str
    hackathon_id: int
    role: str
    status: str
    created_at: Optional[datetime] = None
