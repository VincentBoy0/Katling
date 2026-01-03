from __future__ import annotations

from datetime import date, datetime
from typing import Iterable

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.daily_mission import DailyMission, MissionStatus, MissionType, UserDailyMission
from models.lesson import LessonType


class UserDailyMissionRepository:
    """Repository for UserDailyMission queries and persistence."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_by_date(self, *, user_id: int, date_value: date) -> list[tuple[UserDailyMission, DailyMission]]:
        statement = (
            select(UserDailyMission, DailyMission)
            .join(DailyMission, DailyMission.id == UserDailyMission.mission_id)
            .where(UserDailyMission.user_id == user_id)
            .where(UserDailyMission.date == date_value)
            .order_by(UserDailyMission.id)
        )
        result = await self.session.exec(statement)
        return result.all()

    async def insert_for_user(
        self,
        *,
        user_id: int,
        date_value: date,
        missions: Iterable[DailyMission],
        commit: bool = True,
    ) -> list[UserDailyMission]:
        rows: list[UserDailyMission] = []
        for mission in missions:
            rows.append(
                UserDailyMission(
                    user_id=user_id,
                    mission_id=mission.id,
                    date=date_value,
                    progress=0,
                    target_value=int(mission.target_value or 0) or 1,
                    status=MissionStatus.IN_PROGRESS,
                    is_claimed=False,
                    completed_at=None,
                    claimed_at=None,
                )
            )

        self.session.add_all(rows)
        if commit:
            await self.session.commit()
            for row in rows:
                await self.session.refresh(row)
        else:
            await self.session.flush()

        return rows

    async def list_in_progress_matching_event(
        self,
        *,
        user_id: int,
        date_value: date,
        mission_types: list[MissionType],
        lesson_type: LessonType | None,
    ) -> list[tuple[UserDailyMission, DailyMission]]:
        if not mission_types:
            return []

        statement = (
            select(UserDailyMission, DailyMission)
            .join(DailyMission, DailyMission.id == UserDailyMission.mission_id)
            .where(UserDailyMission.user_id == user_id)
            .where(UserDailyMission.date == date_value)
            .where(UserDailyMission.status == MissionStatus.IN_PROGRESS)
            .where(DailyMission.type.in_(mission_types))
        )

        if lesson_type is None:
            statement = statement.where(DailyMission.lesson_type.is_(None))
        else:
            statement = statement.where(
                (DailyMission.lesson_type.is_(None)) | (DailyMission.lesson_type == lesson_type)
            )

        result = await self.session.exec(statement)
        return result.all()

    async def set_progress(
        self,
        row: UserDailyMission,
        *,
        progress: int,
        commit: bool = True,
    ) -> UserDailyMission:
        row.progress = max(0, int(progress))
        self.session.add(row)
        if commit:
            await self.session.commit()
            await self.session.refresh(row)
        else:
            await self.session.flush()
        return row

    async def mark_completed(
        self,
        row: UserDailyMission,
        *,
        completed_at: datetime,
        commit: bool = True,
    ) -> UserDailyMission:
        row.status = MissionStatus.COMPLETED
        row.completed_at = completed_at
        self.session.add(row)
        if commit:
            await self.session.commit()
            await self.session.refresh(row)
        else:
            await self.session.flush()
        return row

    async def mark_claimed(
        self,
        row: UserDailyMission,
        *,
        claimed_at: datetime,
        commit: bool = True,
    ) -> UserDailyMission:
        row.is_claimed = True
        row.claimed_at = claimed_at
        self.session.add(row)
        if commit:
            await self.session.commit()
            await self.session.refresh(row)
        else:
            await self.session.flush()
        return row

    async def get_by_id_for_user(
        self,
        *,
        user_daily_mission_id: int,
        user_id: int,
    ) -> tuple[UserDailyMission, DailyMission] | None:
        statement = (
            select(UserDailyMission, DailyMission)
            .join(DailyMission, DailyMission.id == UserDailyMission.mission_id)
            .where(UserDailyMission.id == user_daily_mission_id)
            .where(UserDailyMission.user_id == user_id)
        )
        result = await self.session.exec(statement)
        return result.first()

    async def list_claimable(
        self,
        *,
        user_id: int,
        date_value: date,
    ) -> list[tuple[UserDailyMission, DailyMission]]:
        statement = (
            select(UserDailyMission, DailyMission)
            .join(DailyMission, DailyMission.id == UserDailyMission.mission_id)
            .where(UserDailyMission.user_id == user_id)
            .where(UserDailyMission.date == date_value)
            .where(UserDailyMission.status == MissionStatus.COMPLETED)
            .where(UserDailyMission.is_claimed.is_(False))
            .order_by(UserDailyMission.id)
        )
        result = await self.session.exec(statement)
        return result.all()
