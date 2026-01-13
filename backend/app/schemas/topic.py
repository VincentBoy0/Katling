from __future__ import annotations

from typing import List, Literal, Optional
from datetime import datetime

from pydantic import BaseModel, Field


TopicStatus = Literal["completed", "current", "locked"]


class TopicCreate(BaseModel):
    """Schema for creating a new topic."""
    name: str = Field(..., min_length=1, max_length=255, description="Topic name")
    description: Optional[str] = Field(default=None, max_length=1000, description="Topic description")
    order_index: int = Field(default=0, ge=0, description="Display order")

    class Config:
        extra = "forbid"


class TopicUpdate(BaseModel):
    """Schema for updating a topic."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255, description="Topic name")
    description: Optional[str] = Field(default=None, max_length=1000, description="Topic description")
    order_index: Optional[int] = Field(default=None, ge=0, description="Display order")

    class Config:
        extra = "forbid"


class TopicResponse(BaseModel):
    """Schema for topic response."""
    id: int = Field(..., description="Topic ID")
    name: str = Field(..., description="Topic name")
    description: Optional[str] = Field(default=None, description="Topic description")
    order_index: int = Field(..., description="Display order")
    created_by: int = Field(..., description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class TopicProgressOut(BaseModel):
    id: int = Field(..., description="Topic ID")
    name: str = Field(..., description="Topic name")
    description: Optional[str] = Field(default=None, description="Topic description")
    status: TopicStatus = Field(..., description="Topic status")
    progress: int = Field(..., ge=0, le=100, description="Completion percentage (0-100)")
    total_lessons: int = Field(default=0, description="Total number of lessons in this topic")
    completed_lessons: int = Field(default=0, description="Number of completed lessons")


class TopicsResponse(BaseModel):
    topics: List[TopicProgressOut] = Field(default_factory=list, description="Topics with progress")
