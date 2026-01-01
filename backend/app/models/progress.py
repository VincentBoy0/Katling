from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Column, DateTime, Enum as SAEnum, text
from sqlmodel import Field, SQLModel, UniqueConstraint


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ProgressStatus(str, Enum):
    NOT_STARTED = "not_started"
    COMPLETED = "completed"

class UserProgress(SQLModel, table=True):
    __tablename__ = "user_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id", "section_id",
            name="uix_user_section"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(
        foreign_key="users.id",
        ondelete="CASCADE",
        index=True
    )

    lesson_id: int = Field(
        foreign_key="lessons.id",
        ondelete="CASCADE",
        index=True
    )

    section_id: int = Field(
        foreign_key="lesson_sections.id",
        ondelete="CASCADE",
        index=True
    )

    status: ProgressStatus = Field(
        sa_column=Column(SAEnum(ProgressStatus, name="progress_status_enum")),
        default=ProgressStatus.NOT_STARTED,
    )
    score: Optional[int] = None     # percentage of correct answers

    started_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
