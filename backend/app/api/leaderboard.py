from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from models.leaderboard_snapshot import LeaderboardType
from repositories.leaderboardRepository import LeaderboardPeriod, LeaderboardRepository


router = APIRouter(tags=["Leaderboard"])


@router.get("/leaderboard")
async def get_leaderboard(
	lb_type: LeaderboardType = Query(..., alias="type"),
	period: LeaderboardPeriod = Query(LeaderboardPeriod.all),
	limit: int = Query(50, ge=1),
	offset: int = Query(0, ge=0),
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
):
	repo = LeaderboardRepository(session)
	items = await repo.get_leaderboard(
		lb_type=lb_type,
		period=period,
		limit=limit,
		offset=offset,
	)
	my_user_id = int(getattr(current_user, "id"))
	for item in items:
		item["is_me"] = int(item.get("user_id")) == my_user_id
	return items


@router.get("/leaderboard/me")
async def get_my_leaderboard_rank(
	lb_type: LeaderboardType = Query(..., alias="type"),
	period: LeaderboardPeriod = Query(LeaderboardPeriod.all),
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
):
	repo = LeaderboardRepository(session)
	row = await repo.get_user_rank(
		user_id=current_user.id,
		lb_type=lb_type,
		period=period,
	)
	if row is None:
		return {"user_id": int(current_user.id), "rank": None, "xp": 0, "streak": 0}
	return row


