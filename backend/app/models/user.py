from datetime import date, datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Date, Text, UniqueConstraint, Column, Enum as SAEnum, DateTime, text
from enum import Enum


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: Optional[str] = Field(default=None, max_length=255, index=True, unique=True)
    email: Optional[str] = Field(default=None, max_length=255, unique=True, index=True)
    username: Optional[str] = Field(default="User", max_length=150)
    is_banned: bool = Field(default=False)
    last_active_date: Optional[datetime] = Field(
        default=None, 
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )


class UserPoints(SQLModel, table=True):
    __tablename__ = "user_points"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    xp: Optional[int] = Field(default=0)
    streak: Optional[int] = Field(default=0)

    energy: int = Field(default=30)
    last_energy_update: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"), nullable=False),
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
    DAILY_MISSION = "DAILY_MISSION"
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


class Sex(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    UNDISCLOSED = "UNDISCLOSED"


class UserInfo(SQLModel, table=True):
    __tablename__ = "user_info"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)

    # Name fields
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=255, index=True)

    # Personal information
    date_of_birth: Optional[date] = Field(
        default=None,
        sa_column=Column(Date, nullable=True),
    )
    sex: Optional[Sex] = Field(
        default=None,
        sa_column=Column(SAEnum(Sex, name="sex_enum")),
    )

    # Contact / location
    phone: Optional[str] = Field(default=None, max_length=32)
    email_alternate: Optional[str] = Field(default=None, max_length=255)
    country: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=255)

    # Profile
    # avatar_url: Optional[str] = Field(default=None, max_length=512)
    bio: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )