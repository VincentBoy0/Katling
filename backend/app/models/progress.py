from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field, UniqueConstraint

class UserPogress(SQLModel, table=True):
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

    status: str                     # "not_started", "completed"
    score: Optional[int] = None     # percentage of correct answers

    started_at: datetime
    completed_at: Optional[datetime] = None
