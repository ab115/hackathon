from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from typing import List

from app.db.session import get_db
from app.models.base import Team, TeamMember, User, Hackathon
from app.schemas.teams import TeamCreate, TeamUpdate, TeamOut, InvitationOut
from app.core.security import verify_token
from app.core.cache import get_cached, set_cached, invalidate, invalidate_keys

router = APIRouter()


def _team_cache_key(user_id: str) -> str:
    return f"teams:user:{user_id}"


def _invitation_cache_key(user_id: str) -> str:
    return f"teams:invitations:{user_id}"


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Create a new team for a hackathon."""
    # Check if hackathon exists
    hackathon = await db.execute(select(Hackathon).where(Hackathon.id == team_data.hackathon_id))
    if not hackathon.scalars().first():
        raise HTTPException(status_code=404, detail="Hackathon not found")

    # Create Team
    team = Team(
        name=team_data.name,
        hackathon_id=team_data.hackathon_id,
        creator_id=int(user_id),
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)

    # Add creator as ACCEPTED leader
    member = TeamMember(
        team_id=team.id,
        user_id=int(user_id),
        role="leader",
        status="ACCEPTED",
    )
    db.add(member)
    await db.commit()

    # Fetch full team with members and hackathon name
    mem_result = await db.execute(
        select(TeamMember, User, Team, Hackathon)
        .join(User, TeamMember.user_id == User.id)
        .join(Team, TeamMember.team_id == Team.id)
        .join(Hackathon, Team.hackathon_id == Hackathon.id)
        .where(TeamMember.team_id == team.id)
    )
    results = mem_result.all()

    # Bust team list cache for this user
    await invalidate(_team_cache_key(user_id))

    return {
        "id": team.id,
        "hackathon_id": team.hackathon_id,
        "hackathon_name": results[0].Hackathon.title if results else "Unknown",
        "name": team.name,
        "creator_id": team.creator_id,
        "created_at": team.created_at,
        "members": [
            {
                "id": r.TeamMember.id,
                "user_id": r.User.id,
                "full_name": r.User.full_name or "Unknown",
                "role": r.TeamMember.role,
                "status": r.TeamMember.status
            }
            for r in results
        ]
    }


@router.get("", response_model=List[TeamOut])
async def list_my_teams(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """List teams the user is part of. Cached per-user for 60s."""
    cache_key = _team_cache_key(user_id)
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    # Find team IDs the user belongs to
    member_subquery = select(TeamMember.team_id).where(TeamMember.user_id == int(user_id))

    # Fetch teams with members and hackathon info
    result = await db.execute(
        select(Team, TeamMember, User, Hackathon)
        .join(TeamMember, Team.id == TeamMember.team_id)
        .join(User, TeamMember.user_id == User.id)
        .join(Hackathon, Team.hackathon_id == Hackathon.id)
        .where(Team.id.in_(member_subquery))
    )
    rows = result.all()

    # Group by team
    teams_dict = {}
    for row in rows:
        t_id = row.Team.id
        if t_id not in teams_dict:
            teams_dict[t_id] = {
                "id": t_id,
                "hackathon_id": row.Team.hackathon_id,
                "hackathon_name": row.Hackathon.title,
                "name": row.Team.name,
                "creator_id": row.Team.creator_id,
                "created_at": row.Team.created_at.isoformat() if row.Team.created_at else None,
                "members": []
            }
        teams_dict[t_id]["members"].append({
            "id": row.TeamMember.id,
            "user_id": row.User.id,
            "full_name": row.User.full_name or "Unknown",
            "role": row.TeamMember.role,
            "status": row.TeamMember.status
        })

    data = list(teams_dict.values())
    await set_cached(cache_key, data, ttl=60)
    return data


@router.put("/{team_id}", response_model=TeamOut)
async def update_team(
    team_id: int,
    team_data: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Edit a team (requires leader)."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == int(user_id))
    )
    member = result.scalars().first()
    if not member or member.role != "leader":
        raise HTTPException(status_code=403, detail="Not authorized to edit this team")

    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalars().first()
    if team_data.name:
        team.name = team_data.name

    await db.commit()
    await db.refresh(team)

    # Bust cache for all members (simplified: just bust for this user)
    await invalidate(_team_cache_key(user_id))
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Delete a team (requires leader)."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == int(user_id))
    )
    member = result.scalars().first()
    if not member or member.role != "leader":
        raise HTTPException(status_code=403, detail="Not authorized to delete this team")

    await db.execute(delete(TeamMember).where(TeamMember.team_id == team_id))
    await db.execute(delete(Team).where(Team.id == team_id))
    await db.commit()

    # Bust team cache
    await invalidate(_team_cache_key(user_id))


# --- INVITATIONS ---

@router.get("/invitations", response_model=List[InvitationOut])
async def list_invitations(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Get pending invitations for the current user. Cached per-user for 30s."""
    cache_key = _invitation_cache_key(user_id)
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    result = await db.execute(
        select(TeamMember, Team)
        .join(Team, TeamMember.team_id == Team.id)
        .where(TeamMember.user_id == int(user_id), TeamMember.status == "PENDING")
    )
    invites = result.all()
    data = [
        {
            "id": i.TeamMember.id,
            "team_id": i.Team.id,
            "team_name": i.Team.name,
            "hackathon_id": i.Team.hackathon_id,
            "role": i.TeamMember.role,
            "status": i.TeamMember.status,
        }
        for i in invites
    ]
    await set_cached(cache_key, data, ttl=30)
    return data


@router.post("/{team_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_user(
    team_id: int,
    invitee_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Invite a user to a team (requires leader)."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == int(user_id))
    )
    member = result.scalars().first()
    if not member or member.role != "leader":
        raise HTTPException(status_code=403, detail="Only team leaders can invite members")

    # Check if already invited or member
    existing = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == invitee_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="User is already in team or invited")

    new_member = TeamMember(
        team_id=team_id,
        user_id=invitee_id,
        role="member",
        status="PENDING",
    )
    db.add(new_member)
    await db.commit()

    # Bust invitee's invitation cache
    await invalidate(_invitation_cache_key(str(invitee_id)))
    return {"message": "Invitation sent"}


@router.delete("/{team_id}/members/{user_id}")
async def remove_member(
    team_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(verify_token),
):
    """Remove a member from a team (requires leader)."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == int(current_user_id))
    )
    leader = result.scalars().first()
    if not leader or leader.role != "leader":
        raise HTTPException(status_code=403, detail="Only team leaders can remove members")

    if int(current_user_id) == user_id:
        raise HTTPException(status_code=400, detail="Leaders cannot remove themselves. Delete the team instead.")

    await db.execute(
        delete(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
    )
    await db.commit()

    # Bust affected user's team cache
    await invalidate_keys(_team_cache_key(str(user_id)), _team_cache_key(current_user_id))
    return {"message": "Member removed"}


@router.post("/invitations/{member_id}/accept")
async def accept_invitation(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Accept a pending invitation."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.id == member_id, TeamMember.user_id == int(user_id))
    )
    member = result.scalars().first()
    if not member or member.status != "PENDING":
        raise HTTPException(status_code=404, detail="Invitation not found or already processed")

    member.status = "ACCEPTED"
    await db.commit()

    # Bust both teams list and invitations cache
    await invalidate_keys(_team_cache_key(user_id), _invitation_cache_key(user_id))
    return {"message": "Invitation accepted"}


@router.post("/invitations/{member_id}/reject")
async def reject_invitation(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """Reject a pending invitation."""
    result = await db.execute(
        select(TeamMember).where(TeamMember.id == member_id, TeamMember.user_id == int(user_id))
    )
    member = result.scalars().first()
    if not member or member.status != "PENDING":
        raise HTTPException(status_code=404, detail="Invitation not found or already processed")

    await db.execute(delete(TeamMember).where(TeamMember.id == member_id))
    await db.commit()

    # Bust invitation cache
    await invalidate(_invitation_cache_key(user_id))
    return {"message": "Invitation rejected"}
