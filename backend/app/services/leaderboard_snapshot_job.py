from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Callable

from sqlalchemy import delete
from sqlmodel.ext.asyncio.session import AsyncSession

from models.leaderboard_snapshot import LeaderboardSnapshot, LeaderboardType
from repositories.leaderboardRepository import LeaderboardPeriod, LeaderboardRepository


logger = logging.getLogger(__name__)


class LeaderboardSnapshotJob:
    def __init__(self, session_factory: Callable[[], AsyncSession]):
        self._session_factory = session_factory

    async def run(self, snapshot_date: date | None = None) -> None:
        date_value = snapshot_date or datetime.now(timezone.utc).date()
        logger.info("LeaderboardSnapshotJob started (snapshot_date=%s)", date_value)

        async with self._session_factory() as session:
            repo = LeaderboardRepository(session)
            for lb_type in (LeaderboardType.xp, LeaderboardType.streak):
                rows = await repo.compute_full_rankings(lb_type=lb_type, period=LeaderboardPeriod.all)
                await self._store(session, lb_type, date_value, rows)

        logger.info("LeaderboardSnapshotJob finished (snapshot_date=%s)", date_value)

    async def _store(
        self,
        session: AsyncSession,
        lb_type: LeaderboardType,
        snapshot_date: date,
        rows: list[tuple[int, int]],
    ) -> None:
        await session.exec(
            delete(LeaderboardSnapshot).where(
                (LeaderboardSnapshot.type == lb_type)
                & (LeaderboardSnapshot.snapshot_date == snapshot_date)
            )
        )

        session.add_all(
            [
                LeaderboardSnapshot(
                    user_id=user_id,
                    type=lb_type,
                    rank=rank,
                    snapshot_date=snapshot_date,
                )
                for user_id, rank in rows
            ]
        )
        await session.commit()
