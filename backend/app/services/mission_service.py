from __future__ import annotations

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.daily_mission import MissionStatus, MissionType, utc_now
from models.lesson import LessonType
from models.user import ActivityType
from repositories.dailyMissionRepository import DailyMissionRepository
from repositories.userDailyMissionRepository import UserDailyMissionRepository
from repositories.userRepository import UserRepository


class MissionService:
    """Business logic for Daily Missions."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.daily_mission_repo = DailyMissionRepository(session)
        self.user_daily_mission_repo = UserDailyMissionRepository(session)
        self.user_repo = UserRepository(session)

    @staticmethod
    def today_local() -> date:
        tz = ZoneInfo(settings.app_timezone)
        return datetime.now(tz).date()

    async def assign_daily_missions(self, *, user_id: int, date_value: date) -> None:
        existing = await self.user_daily_mission_repo.list_by_date(user_id=user_id, date_value=date_value)
        if existing:
            return

        missions = await self.daily_mission_repo.random_missions(4)
        if not missions:
            return

        await self.user_daily_mission_repo.insert_for_user(
            user_id=user_id,
            date_value=date_value,
            missions=missions,
            commit=False,
        )

    async def get_daily_missions(self, *, user_id: int, date_value: date) -> list[dict]:
        await self.assign_daily_missions(user_id=user_id, date_value=date_value)

        rows = await self.user_daily_mission_repo.list_by_date(user_id=user_id, date_value=date_value)
        missions_out: list[dict] = []
        for user_mission, mission in rows:
            status = "completed" if user_mission.status == MissionStatus.COMPLETED else "in_progress"
            can_claim = user_mission.status == MissionStatus.COMPLETED and not bool(user_mission.is_claimed)
            missions_out.append(
                {
                    "id": int(user_mission.id),
                    "description": mission.description,
                    "progress": int(user_mission.progress or 0),
                    "target": int(user_mission.target_value or mission.target_value or 0),
                    "xp": int(mission.xp_reward or 0),
                    "status": status,
                    "is_claimed": bool(user_mission.is_claimed),
                    "can_claim": bool(can_claim),
                }
            )
        return missions_out

    def _lesson_specific_mission_type(self, lesson_type: LessonType) -> MissionType | None:
        mapping: dict[LessonType, MissionType] = {
            LessonType.LISTENING: MissionType.COMPLETE_LISTENING,
            LessonType.WRITING: MissionType.COMPLETE_WRITING,
            LessonType.SPEAKING: MissionType.COMPLETE_SPEAKING,
            LessonType.READING: MissionType.COMPLETE_READING,
            LessonType.VOCABULARY: MissionType.COMPLETE_VOCABULARY,
            LessonType.GRAMMAR: MissionType.COMPLETE_GRAMMAR,
        }
        return mapping.get(lesson_type)

    async def on_lesson_completed(self, *, user_id: int, lesson_type: LessonType, score: int) -> None:
        date_value = self.today_local()
        await self.assign_daily_missions(user_id=user_id, date_value=date_value)

        mission_types: list[MissionType] = [MissionType.COMPLETE_SECTION]
        if score >= 80:
            mission_types.append(MissionType.COMPLETE_SECTION_SCORE_80)
        if score >= 90:
            mission_types.append(MissionType.COMPLETE_SECTION_SCORE_90)
        specific = self._lesson_specific_mission_type(lesson_type)
        if specific is not None:
            mission_types.append(specific)

        rows = await self.user_daily_mission_repo.list_in_progress_matching_event(
            user_id=user_id,
            date_value=date_value,
            mission_types=mission_types,
            lesson_type=lesson_type,
        )
        if not rows:
            return

        now = utc_now()

        for user_mission, _mission in rows:
            new_progress = int(user_mission.progress or 0) + 1
            await self.user_daily_mission_repo.set_progress(user_mission, progress=new_progress, commit=False)

            target = int(user_mission.target_value or 0) or 1
            if new_progress >= target:
                await self.user_daily_mission_repo.mark_completed(user_mission, completed_at=now, commit=False)

    async def on_word_saved(self, *, user_id: int) -> None:
        date_value = self.today_local()
        await self.assign_daily_missions(user_id=user_id, date_value=date_value)

        rows = await self.user_daily_mission_repo.list_in_progress_matching_event(
            user_id=user_id,
            date_value=date_value,
            mission_types=[MissionType.SAVE_WORD],
            lesson_type=None,
        )
        if not rows:
            return

        now = utc_now()
        for user_mission, _mission in rows:
            new_progress = int(user_mission.progress or 0) + 1
            await self.user_daily_mission_repo.set_progress(user_mission, progress=new_progress, commit=False)
            target = int(user_mission.target_value or 0) or 1
            if new_progress >= target:
                await self.user_daily_mission_repo.mark_completed(user_mission, completed_at=now, commit=False)

    async def on_flashcard_reviewed(self, *, user_id: int) -> None:
        date_value = self.today_local()
        await self.assign_daily_missions(user_id=user_id, date_value=date_value)

        rows = await self.user_daily_mission_repo.list_in_progress_matching_event(
            user_id=user_id,
            date_value=date_value,
            mission_types=[MissionType.REVIEW_FLASHCARD],
            lesson_type=None,
        )
        if not rows:
            return

        now = utc_now()
        for user_mission, _mission in rows:
            new_progress = int(user_mission.progress or 0) + 1
            await self.user_daily_mission_repo.set_progress(user_mission, progress=new_progress, commit=False)
            target = int(user_mission.target_value or 0) or 1
            if new_progress >= target:
                await self.user_daily_mission_repo.mark_completed(user_mission, completed_at=now, commit=False)

    async def claim_mission(self, *, user_id: int, user_daily_mission_id: int) -> tuple[int, int]:
        date_value = self.today_local()

        row = await self.user_daily_mission_repo.get_by_id_for_user(
            user_daily_mission_id=user_daily_mission_id,
            user_id=user_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Mission not found")

        user_mission, mission = row

        if user_mission.date != date_value:
            raise HTTPException(status_code=403, detail="Can only claim today's missions")
        if user_mission.status != MissionStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Mission is not completed")
        if user_mission.is_claimed:
            raise HTTPException(status_code=409, detail="Mission already claimed")

        xp_reward = int(mission.xp_reward or 0)
        if xp_reward <= 0:
            raise HTTPException(status_code=400, detail="Mission has no XP reward")

        now = utc_now()

        await self.user_daily_mission_repo.mark_claimed(user_mission, claimed_at=now, commit=False)
        await self.user_repo.add_xp(user_id, amount=xp_reward, commit=False)
        await self.user_repo.log_xp_activity(
            user_id,
            activity_type=ActivityType.DAILY_MISSION,
            xp_amount=xp_reward,
            commit=False,
        )

        user_point = await self.user_repo.get_user_point(user_id)
        total_xp = int(getattr(user_point, "xp", 0) or 0) if user_point else 0
        return xp_reward, total_xp
