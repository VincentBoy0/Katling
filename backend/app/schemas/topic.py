from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


TopicStatus = Literal["completed", "current", "locked"]


class TopicProgressOut(BaseModel):
    id: int = Field(..., description="Topic ID")
    name: str = Field(..., description="Topic name")
    description: Optional[str] = Field(default=None, description="Topic description")
    status: TopicStatus = Field(..., description="Topic status")
    progress: int = Field(..., ge=0, le=100, description="Completion percentage (0-100)")


class TopicsResponse(BaseModel):
    topics: List[TopicProgressOut] = Field(default_factory=list, description="Topics with progress")
