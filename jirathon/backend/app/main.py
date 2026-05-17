from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, UniqueConstraint
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os

# --- Database Setup ---
DATABASE_URL = "sqlite:///./jirathon.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TeamProgress(Base):
    __tablename__ = "team_progress"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, index=True)
    project_id = Column(String, index=True)
    score = Column(Integer, default=0)
    stage = Column(Integer, default=1)
    
    __table_args__ = (UniqueConstraint('team_name', 'project_id', name='_team_project_uc'),)

Base.metadata.create_all(bind=engine)

# --- FastAPI App ---
app = FastAPI(title="Jirathon Backend (Modular)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Project Key Registry ---
PROJECT_KEYS = {
    "rogue_override": {
        1: "73c2a1",
        2: "d5666ed4",
        3: "de7795f2b8",
        4: "1a81c0c5f6",
        5: "3dff9bc8da",
        6: "95e4ce16bf",
        7: "5749f2bd66",
        8: "12f7f562da",
        9: "c7ae70b333",
        10: "9cc49f98ffc9205d7be4080607669b83fe7c9760916a23612115af85ede31d7d" 
    },
    "project_chronos": {
        1: "1999-12-31T23:59:59Z",
        2: "8b19523e",
        3: "OGIxOTUyM2",
        4: "dd8b059cde",
        5: "ZGQ4YjA1OW",
        6: "cad3aca4b7",
        7: "Y2FkM2FjYT",
        8: "e4654fdc79",
        9: "ZTQ2NTRmZG",
        10: "784e658f69216d39a210c772cf9022505fe0b3f9a6235e4eb96fb8c3bb526029"
    }
}

class SubmitKeyRequest(BaseModel):
    team_name: str
    project_id: str
    key: str

@app.post("/submit")
def submit_key(request: SubmitKeyRequest, db: Session = Depends(get_db)):
    if request.project_id not in PROJECT_KEYS:
        raise HTTPException(status_code=400, detail="Invalid Project ID.")
        
    team = db.query(TeamProgress).filter(
        TeamProgress.team_name == request.team_name,
        TeamProgress.project_id == request.project_id
    ).first()
    
    if not team:
        team = TeamProgress(team_name=request.team_name, project_id=request.project_id, score=0, stage=1)
        db.add(team)
        db.commit()
        db.refresh(team)
        
    current_stage = team.stage
    
    if current_stage > 10:
        return {"message": "All stages completed!", "team": team.team_name, "score": team.score, "stage": team.stage}
        
    expected_key = PROJECT_KEYS[request.project_id].get(current_stage)
    
    # "pass" is allowed for easy admin testing
    if request.key == expected_key or request.key == "pass":
        team.stage += 1
        team.score += (current_stage * 10) # 10 pts for stage 1, 20 for stage 2...
        db.commit()
        return {"success": True, "message": f"Stage {current_stage} cleared!", "new_score": team.score, "next_stage": team.stage}
    
    raise HTTPException(status_code=400, detail="Invalid Key.")

@app.get("/progress/{project_id}/{team_name}")
def get_progress(project_id: str, team_name: str, db: Session = Depends(get_db)):
    team = db.query(TeamProgress).filter(
        TeamProgress.team_name == team_name,
        TeamProgress.project_id == project_id
    ).first()
    
    if not team:
        return {"team_name": team_name, "project_id": project_id, "score": 0, "stage": 1}
    return {"team_name": team.team_name, "project_id": team.project_id, "score": team.score, "stage": team.stage}

@app.get("/leaderboard/{project_id}")
def get_leaderboard(project_id: str, db: Session = Depends(get_db)):
    teams = db.query(TeamProgress).filter(TeamProgress.project_id == project_id).order_by(TeamProgress.score.desc()).all()
    return [{"team_name": t.team_name, "score": t.score, "stage": t.stage} for t in teams]
