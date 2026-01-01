from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from repositories.userRepository import UserRepository


router = APIRouter(prefix="/home", tags=["Home"])


@router.get("/summary")
async def get_summary(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    user_repo = UserRepository(session)
    
    effective_streak, is_active_today = await user_repo.reconcile_streak_on_read(
        user_id=current_user.id,
        last_active_date=current_user.last_active_date,
    )

    user_point = await user_repo.regen_energy_if_needed(current_user.id)

    return {
        "streak": effective_streak,
        "is_streak_active_today": is_active_today,
        "xp": int(getattr(user_point, "xp", 0) or 0),
        "energy": int(getattr(user_point, "energy", 0) or 0),
        "max_energy": user_repo.MAX_ENERGY,
    }