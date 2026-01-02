from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


class DailyMissionOut(BaseModel):
    id: int = Field(..., description="User daily mission ID")
    description: str = Field(..., description="Mission description")
    progress: int = Field(..., description="Current progress")
    target: int = Field(..., description="Target value")
    xp: int = Field(..., description="XP reward (claimable)")
    status: str = Field(..., description="Mission status: in_progress|completed")
    is_claimed: bool = Field(..., description="Whether the mission reward was claimed")
    can_claim: bool = Field(..., description="Whether the mission can be claimed now")


class DailyMissionsResponse(BaseModel):
    date: dt.date = Field(..., description="Local date")
    missions: list[DailyMissionOut] = Field(default_factory=list)


class ClaimMissionResponse(BaseModel):
    xp: int = Field(..., description="Claimed XP")
    total_xp: int = Field(..., description="User total XP after claim")
