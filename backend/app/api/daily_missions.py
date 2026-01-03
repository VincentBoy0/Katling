from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from schemas.daily_mission import ClaimMissionResponse, DailyMissionsResponse
from services.mission_service import MissionService


router = APIRouter(tags=["Daily Missions"])


@router.get("/daily-missions", response_model=DailyMissionsResponse)
async def get_daily_missions(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> DailyMissionsResponse:
    mission_service = MissionService(session)
    date_value = mission_service.today_local()
    missions = await mission_service.get_daily_missions(user_id=current_user.id, date_value=date_value)
    return DailyMissionsResponse(date=date_value, missions=missions)


@router.post("/daily-missions/{user_daily_mission_id}/claim", response_model=ClaimMissionResponse)
async def claim_daily_mission(
    user_daily_mission_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
) -> ClaimMissionResponse:
    mission_service = MissionService(session)
    xp, total_xp = await mission_service.claim_mission(
        user_id=current_user.id,
        user_daily_mission_id=user_daily_mission_id,
    )
    return ClaimMissionResponse(xp=xp, total_xp=total_xp)
