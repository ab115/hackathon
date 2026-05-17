from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.db.session import get_db
from app.models.base import Resource
from app.schemas.resources import ResourceCreate, ResourceUpdate, ResourceOut
from app.core.security import verify_token
from app.core.rbac import require_admin
from app.core.cache import get_cached, set_cached, invalidate_pattern

router = APIRouter()


@router.get("/", response_model=List[ResourceOut])
async def list_resources(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    type: Optional[str] = None
):
    """List resources. Open to authenticated users."""
    cache_key = f"resources:list:{skip}:{limit}:{type or 'all'}"
    cached = await get_cached(cache_key)
    if cached is not None:
        return cached

    q = select(Resource)
    if type:
        q = q.where(Resource.type == type)
    q = q.order_by(Resource.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(q)
    resources = result.scalars().all()

    data = [ResourceOut.model_validate(r).model_dump(mode="json") for r in resources]
    await set_cached(cache_key, data, ttl=60)
    return resources


@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource(resource_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.post("/", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_in: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    """Create a new resource. Requires ADMIN role."""
    new_resource = Resource(**resource_in.model_dump())
    db.add(new_resource)
    await db.commit()
    await db.refresh(new_resource)
    
    await invalidate_pattern("resources:*")
    return new_resource


@router.patch("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: int,
    updates: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(resource, key, value)

    await db.commit()
    await db.refresh(resource)
    await invalidate_pattern("resources:*")
    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(require_admin),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    await db.delete(resource)
    await db.commit()
    await invalidate_pattern("resources:*")
