from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from enum import Enum

from sqlalchemy import and_, func
from sqlalchemy.orm import aliased
from sqlmodel import Select, select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.leaderboard_snapshot import LeaderboardSnapshot, LeaderboardType
from models.user import User, UserPoints


class LeaderboardPeriod(str, Enum):
    all = "all"
    week = "week"
    month = "month"


class LeaderboardRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _apply_period_filter(
        self,
        stmt: Select,
        period: LeaderboardPeriod,
        lb_type: LeaderboardType,
    ) -> Select:
        if period == LeaderboardPeriod.all:
            return stmt
        return stmt

    def _ranked_subquery(self, lb_type: LeaderboardType, period: LeaderboardPeriod):
        if lb_type == LeaderboardType.xp:
            sort_value = func.coalesce(UserPoints.xp, 0)
        else:
            sort_value = func.coalesce(UserPoints.streak, 0)

        base_stmt = (
            select(
                User.id.label("user_id"),
                User.username.label("username"),
                func.coalesce(UserPoints.xp, 0).label("xp"),
                func.coalesce(UserPoints.streak, 0).label("streak"),
                func.rank().over(order_by=(sort_value.desc(), User.id.asc())).label("rank"),
            )
            .select_from(User)
            .outerjoin(UserPoints, UserPoints.user_id == User.id)
            .where(User.is_banned == False)
        )

        base_stmt = self._apply_period_filter(base_stmt, period, lb_type)
        return base_stmt.subquery("current_lb")

    async def get_leaderboard(
        self,
        *,
        lb_type: LeaderboardType,
        period: LeaderboardPeriod,
        limit: int = 50,
        offset: int = 0,
        snapshot_date: date | None = None,
    ) -> list[dict]:
        current_lb = self._ranked_subquery(lb_type, period)

        snap_date = snapshot_date
        if snap_date is None:
            snap_date = datetime.now(timezone.utc).date() - timedelta(days=1)

        snap = aliased(LeaderboardSnapshot)
        stmt = (
            select(
                current_lb.c.rank,
                current_lb.c.user_id,
                current_lb.c.username,
                current_lb.c.xp,
                current_lb.c.streak,
                (snap.rank - current_lb.c.rank).label("rank_change"),
            )
            .select_from(current_lb)
            .outerjoin(
                snap,
                and_(
                    snap.user_id == current_lb.c.user_id,
                    snap.type == lb_type,
                    snap.snapshot_date == snap_date,
                ),
            )
            .order_by(current_lb.c.rank.asc(), current_lb.c.user_id.asc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.exec(stmt)
        rows = result.all()

        items: list[dict] = []
        for row in rows:
            items.append(
                {
                    "rank": int(row.rank),
                    "user_id": int(row.user_id),
                    "username": row.username,
                    "xp": int(row.xp or 0),
                    "streak": int(row.streak or 0),
                    "rank_change": (int(row.rank_change) if row.rank_change is not None else None),
                }
            )
        return items

    async def compute_full_rankings(
        self,
        *,
        lb_type: LeaderboardType,
        period: LeaderboardPeriod = LeaderboardPeriod.all,
    ) -> list[tuple[int, int]]:
        current_lb = self._ranked_subquery(lb_type, period)
        stmt = select(current_lb.c.user_id, current_lb.c.rank).select_from(current_lb)
        result = await self.session.exec(stmt)
        return [(int(r.user_id), int(r.rank)) for r in result.all()]

    async def get_user_rank(
        self,
        *,
        user_id: int,
        lb_type: LeaderboardType,
        period: LeaderboardPeriod,
    ) -> dict | None:
        current_lb = self._ranked_subquery(lb_type, period)
        stmt = (
            select(
                current_lb.c.user_id,
                current_lb.c.rank,
                current_lb.c.xp,
                current_lb.c.streak,
            )
            .select_from(current_lb)
            .where(current_lb.c.user_id == user_id)
        )

        result = await self.session.exec(stmt)
        row = result.first()
        if row is None:
            return None

        return {
            "user_id": int(row.user_id),
            "rank": int(row.rank),
            "xp": int(row.xp or 0),
            "streak": int(row.streak or 0),
        }
