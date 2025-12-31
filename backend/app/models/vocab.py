from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, Enum as SAEnum, DateTime, UniqueConstraint, text, String
from enum import Enum
from typing import Optional, Dict, Any


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ReviewStatus(str, Enum):
    NEW = "NEW"
    LEARNING = "LEARNING"
    MASTERED = "MASTERED"


class Vocab(SQLModel, table=True):
    __tablename__ = "vocabs"

    id: Optional[int] = Field(default=None, primary_key=True)
    word: str = Field(max_length=255, unique=True, index=True)
    definition: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )
    audio_url: Optional[str] = Field(
        default=None,
        max_length=512,
    )
    # review_status: ReviewStatus = Field(
    #     sa_column=Column(SAEnum(ReviewStatus, name="review_status_enum")), 
    #     default=ReviewStatus.NEW,
    # )
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )




class UserWord(SQLModel, table=True):
    __tablename__ = "user_words"
    __table_args__ = (
        UniqueConstraint("user_id", "word_id", name="uix_user_word"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    word_id: int = Field(foreign_key="vocabs.id", ondelete="CASCADE", index=True)
    status: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )
    review_status: ReviewStatus = Field(
        sa_column=Column(SAEnum(ReviewStatus, name="review_status_enum")), 
        default=ReviewStatus.NEW
    )
    last_reviewed_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    next_reviewed_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )
    