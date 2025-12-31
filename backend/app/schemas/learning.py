from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional, Union

from pydantic import BaseModel, Field


class LessonSectionOut(BaseModel):
    id: int = Field(..., description="Section ID")
    lesson_id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Section title")
    order_index: int = Field(..., description="Section order")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Section content")
    created_at: datetime = Field(..., description="Section creation timestamp")

    class Config:
        from_attributes = True


class NextSectionAvailable(BaseModel):
    lesson_id: int = Field(..., description="Lesson ID")
    section: LessonSectionOut = Field(..., description="Next uncompleted section")


class NextSectionCompleted(BaseModel):
    status: str = Field(default="completed", description="Completion status")
    message: str = Field(..., description="Completion message")


NextSectionResponse = Union[NextSectionAvailable, NextSectionCompleted]
