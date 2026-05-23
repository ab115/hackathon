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

import hashlib

# --- Project Flag Registry ---
# The local apps must decrypt these flags using their correct state, 
# then hash (TEAM_NAME + flag) to generate the final 6-char key.
PROJECT_FLAGS = {
    "rogue_override": {
        1: "flag_ro_1_x8f2",
        2: "flag_ro_2_p9q1",
        3: "flag_ro_3_m4n2",
        4: "flag_ro_4_1111",
        5: "flag_ro_5_2222",
        6: "flag_ro_6_3333",
        7: "flag_ro_7_4444",
        8: "flag_ro_8_5555",
        9: "flag_ro_9_6666",
        10: "flag_ro_10_7777" 
    },
    "project_chronos": {
        1: "flag_pc_1_a1b2",
        2: "flag_pc_2_c3d4",
        3: "flag_pc_3_e5f6",
        4: "flag_pc_4_g7h8",
        5: "flag_pc_5_i9j0",
        6: "flag_pc_6_k1l2",
        7: "flag_pc_7_m3n4",
        8: "flag_pc_8_o5p6",
        9: "flag_pc_9_q7r8",
        10: "flag_pc_10_s9t0"
    },
    "project_quantum": {
        1: "flag_pq_1_1111",
        2: "flag_pq_2_2222",
        3: "flag_pq_3_3333",
        4: "flag_pq_4_4444",
        5: "flag_pq_5_5555",
        6: "flag_pq_6_6666",
        7: "flag_pq_7_7777",
        8: "flag_pq_8_8888",
        9: "flag_pq_9_9999",
        10: "flag_pq_10_0000"
    }
}

class SubmitKeyRequest(BaseModel):
    team_name: str
    project_id: str
    key: str

@app.post("/submit")
def submit_key(request: SubmitKeyRequest, db: Session = Depends(get_db)):
    if request.project_id not in PROJECT_FLAGS:
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
        
    secret_flag = PROJECT_FLAGS[request.project_id].get(current_stage)
    if not secret_flag:
        raise HTTPException(status_code=400, detail="No flag configured for this stage.")
        
    expected_key = hashlib.md5(f"{request.team_name}_{secret_flag}".encode()).hexdigest()[:6]
    
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
