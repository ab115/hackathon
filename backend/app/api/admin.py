from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, extract
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.base import User, Hackathon, Registration, Submission, UserRole
from app.core.rbac import require_admin
from app.core.cache import get_cached, set_cached

router = APIRouter()

@router.get("/stats")
async def get_admin_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin_id: str = Depends(require_admin),
):
    """
    Get consolidated dashboard statistics for administrators.
    Cached for 5 minutes to ensure high performance under load.
    """
    cache_key = "admin:dashboard:stats"
    cached = await get_cached(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    # 1. Basic Counts
    user_count_q = await db.execute(select(func.count(User.id)))
    user_count = user_count_q.scalar() or 0

    hackathon_count_q = await db.execute(select(func.count(Hackathon.id)))
    hackathon_count = hackathon_count_q.scalar() or 0

    submission_count_q = await db.execute(select(func.count(Submission.id)))
    submission_count = submission_count_q.scalar() or 0

    # 2. Revenue (Sum of successful registration fees)
    revenue_q = await db.execute(
        select(func.sum(Registration.registration_fee))
        .where(Registration.payment_status.in_(["SUCCESS", "FREE"]))
    )
    total_revenue = float(revenue_q.scalar() or 0.0)

    # 3. Registration Trend (Last 6 months)
    # Using extract for portable year/month grouping
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    trend_q = await db.execute(
        select(
            func.extract('year', User.created_at).label('year'),
            func.extract('month', User.created_at).label('month'),
            func.count(User.id).label('count')
        )
        .where(User.created_at >= six_months_ago)
        .group_by('year', 'month')
        .order_by('year', 'month')
    )
    rows = trend_q.all()
    
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    registration_trend = [
        {"month": month_names[int(row.month)-1], "count": row.count}
        for row in rows
    ]

    # 4. Category Distribution
    category_q = await db.execute(
        select(Hackathon.category, func.count(Hackathon.id))
        .group_by(Hackathon.category)
    )
    categories = [
        {"name": row[0] or "Other", "value": row[1]}
        for row in category_q.all()
    ]

    # 5. Top Performing Hackathons (by participant count)
    top_h_q = await db.execute(
        select(
            Hackathon.title,
            func.count(Registration.id).label('participants'),
            func.coalesce(func.sum(Registration.registration_fee), 0.0).label('revenue')
        )
        .outerjoin(Registration, Hackathon.id == Registration.hackathon_id)
        .where(Registration.payment_status.in_(["SUCCESS", "FREE"]))
        .group_by(Hackathon.id, Hackathon.title)
        .order_by(desc('participants'))
        .limit(5)
    )
    top_hackathons = [
        {"name": row.title, "participants": row.participants, "revenue": float(row.revenue)}
        for row in top_h_q.all()
    ]

    # 6. Recent Activity (Last 5 actions across the platform)
    # We'll combine recent registrations and submissions for a "timeline" feel
    recent_registrations = await db.execute(
        select(Registration, User.full_name, Hackathon.title)
        .join(User, Registration.user_id == User.id)
        .join(Hackathon, Registration.hackathon_id == Hackathon.id)
        .order_by(Registration.created_at.desc())
        .limit(5)
    )
    
    recent_activity = []
    for reg, user_name, h_title in recent_registrations.all():
        recent_activity.append({
            "action": "New Registration",
            "detail": f"{user_name} registered for {h_title}",
            "time": reg.created_at.isoformat()
        })

    # Sort combined activity by time desc and limit
    recent_activity.sort(key=lambda x: x["time"], reverse=True)
    recent_activity = recent_activity[:5]

    data = {
        "summary": {
            "total_users": user_count,
            "total_revenue": total_revenue,
            "active_hackathons": hackathon_count,
            "total_submissions": submission_count,
        },
        "registration_trend": registration_trend,
        "category_distribution": categories,
        "top_hackathons": top_hackathons,
        "recent_activity": recent_activity
    }

    await set_cached(cache_key, data, ttl=300) # 5 minute cache
    return data
