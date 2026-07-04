from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Alert
from app.schemas.schemas import AlertResponse, AlertUpdate

router = APIRouter()


@router.get("/", response_model=List[AlertResponse])
async def read_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    stmt = select(Alert).where(Alert.user_id == current_user.id).order_by(desc(Alert.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.patch("/{id}", response_model=AlertResponse)
async def update_alert(
    id: str,
    alert_in: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(Alert).where(Alert.id == id, Alert.user_id == current_user.id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    if alert_in.resolved is not None:
        alert.resolved = alert_in.resolved
        
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.delete("/{id}", response_class=Response, status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert).where(Alert.id == id, Alert.user_id == current_user.id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    await db.delete(alert)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
