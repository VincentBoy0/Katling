from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column, Enum as SAEnum, DateTime, text
from enum import Enum


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: Optional[str] = Field(default=None, max_length=255, index=True, unique=True)
    email: Optional[str] = Field(default=None, max_length=255, unique=True, index=True)
    username: Optional[str] = Field(default=None, max_length=150, unique=True, index=True)
    xp: Optional[int] = Field(default=0)
    streak: Optional[int] = Field(default=0)
    is_banned: bool = Field(default=False)
    last_active_date: Optional[datetime] = Field(
        default=None, 
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )


class RoleType(str, Enum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    LEARNER = "LEARNER"


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    type: RoleType = Field(
        sa_column=Column(SAEnum(RoleType, name="role_type_enum")),
    )
    description: Optional[str] = Field(default=None, max_length=255)


class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("role_id", "user_id", name="uix_role_user"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="roles.id", ondelete="CASCADE", index=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)


class ActivityType(str, Enum):
    LESSON_COMPLETE = "LESSON_COMPLETE"
    STREAK_BONUS = "STREAK_BONUS"
    DAILY_QUEST = "DAILY_QUEST"
    PERFECT_SCORE = "PERFECT_SCORE"
    REFERRAL_BONUS = "REFERRAL_BONUS"


class UserXPLog(SQLModel, table=True):
    __tablename__ = "user_xp_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    activity_type: ActivityType = Field(
        sa_column=Column(SAEnum(ActivityType, name="activity_type_enum")),
    )
    xp_amount: int = Field(default=0)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )
