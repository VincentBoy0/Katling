from __future__ import annotations

from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.daily_mission import DailyMission


class DailyMissionRepository:
    """Repository for DailyMission queries."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> list[DailyMission]:
        statement = select(DailyMission).order_by(DailyMission.id)
        result = await self.session.exec(statement)
        return result.all()

    async def random_missions(self, n: int) -> list[DailyMission]:
        if n <= 0:
            return []
        statement = select(DailyMission).order_by(func.random()).limit(n)
        result = await self.session.exec(statement)
        return result.all()
