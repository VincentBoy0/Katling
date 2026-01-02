from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Date, Enum as SAEnum, Index
from sqlmodel import Field, SQLModel


class LeaderboardType(str, Enum):
    xp = "xp"
    streak = "streak"


class LeaderboardSnapshot(SQLModel, table=True):
    __tablename__ = "leaderboard_snapshots"
    __table_args__ = (
        Index(
            "ix_leaderboard_snapshots_user_type_date",
            "user_id",
            "type",
            "snapshot_date",
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    type: LeaderboardType = Field(
        sa_column=Column(
            SAEnum(LeaderboardType, name="leaderboard_type_enum"),
            nullable=False,
        ),
        index=True,
    )
    rank: int = Field(nullable=False)
    snapshot_date: date = Field(
        sa_column=Column(Date, nullable=False),
        index=True,
    )
