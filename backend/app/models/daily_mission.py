from __future__ import annotations

from datetime import datetime, timezone
import datetime as dt
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Date as SADate, DateTime, Enum as SAEnum, UniqueConstraint, text
from sqlmodel import Field, SQLModel

from .lesson import LessonType


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MissionType(str, Enum):
    COMPLETE_SECTION = "COMPLETE_SECTION"
    COMPLETE_SECTION_SCORE_80 = "COMPLETE_SECTION_SCORE_80"
    COMPLETE_SECTION_SCORE_90 = "COMPLETE_SECTION_SCORE_90"
    SAVE_WORD = "SAVE_WORD"
    REVIEW_FLASHCARD = "REVIEW_FLASHCARD"

    COMPLETE_LISTENING = "COMPLETE_LISTENING"
    COMPLETE_WRITING = "COMPLETE_WRITING"
    COMPLETE_SPEAKING = "COMPLETE_SPEAKING"
    COMPLETE_READING = "COMPLETE_READING"
    COMPLETE_VOCABULARY = "COMPLETE_VOCABULARY"
    COMPLETE_GRAMMAR = "COMPLETE_GRAMMAR"


class MissionStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class DailyMission(SQLModel, table=True):
    __tablename__ = "daily_missions"

    id: Optional[int] = Field(default=None, primary_key=True)

    type: MissionType = Field(
        sa_column=Column(SAEnum(MissionType, name="mission_type_enum")),
    )
    description: str = Field(max_length=255)
    target_value: int = Field(default=1)
    xp_reward: int = Field(default=0)

    lesson_type: Optional[LessonType] = Field(
        default=None,
        sa_column=Column(SAEnum(LessonType, name="lesson_type_enum"), nullable=True),
    )


class UserDailyMission(SQLModel, table=True):
    __tablename__ = "user_daily_missions"
    __table_args__ = (
        UniqueConstraint("user_id", "mission_id", "date", name="uix_user_mission_date"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    mission_id: int = Field(foreign_key="daily_missions.id", ondelete="CASCADE", index=True)

    date: dt.date = Field(sa_column=Column(SADate, nullable=False, index=True))

    progress: int = Field(default=0)
    target_value: int = Field(default=1)

    status: MissionStatus = Field(
        default=MissionStatus.IN_PROGRESS,
        sa_column=Column(
            SAEnum(MissionStatus, name="mission_status_enum"),
            nullable=False,
            server_default=text("'IN_PROGRESS'"),
        ),
    )

    is_claimed: bool = Field(default=False)

    completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    claimed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
