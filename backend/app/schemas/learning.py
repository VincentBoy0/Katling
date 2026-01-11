from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field

from models.lesson import LessonType


class LessonSectionOut(BaseModel):
    id: int = Field(..., description="Section ID")
    lesson_id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Section title")
    order_index: int = Field(..., description="Section order")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Section content")
    created_at: datetime = Field(..., description="Section creation timestamp")

    class Config:
        from_attributes = True


class LessonSectionSummary(BaseModel):
    id: int = Field(..., description="Section ID")
    title: str = Field(..., description="Section title")
    order_index: int = Field(..., description="Section order")
    question_count: int = Field(default=0, description="Number of questions in the section")
    completed: bool = Field(default=False, description="Whether the section is completed")

    class Config:
        from_attributes = True


class NextSectionAvailable(BaseModel):
    lesson_id: int = Field(..., description="Lesson ID")
    section: LessonSectionOut = Field(..., description="Next uncompleted section")


class NextSectionCompleted(BaseModel):
    status: str = Field(default="completed", description="Completion status")
    message: str = Field(..., description="Completion message")


NextSectionResponse = Union[NextSectionAvailable, NextSectionCompleted]


class CompleteSectionRequest(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Score for the section (0-100)")


class CompleteSectionResponse(BaseModel):
    lesson_id: int = Field(..., description="Lesson ID")
    section_id: int = Field(..., description="Section ID")
    score: int = Field(..., description="Submitted score")
    xp: int = Field(..., description="Earned XP")
    streak: Optional[int] = Field(default=None, description="Current streak (if applicable)")


LessonInTopicStatus = Literal["available", "completed", "locked"]


class LessonInTopicOut(BaseModel):
    id: int = Field(..., description="Lesson ID")
    type: str = Field(..., description="Lesson type")
    title: str = Field(..., description="Lesson title")
    description: Optional[str] = Field(default=None, description="Lesson description")
    progress: int = Field(..., ge=0, le=100, description="Lesson completion percentage (0-100)")
    status: LessonInTopicStatus = Field(..., description="Lesson status")
    order_index: int = Field(..., description="Lesson order in topic")


class LessonSectionsResponse(BaseModel):
    lesson_id: int = Field(..., description="Lesson ID")
    sections: List[LessonSectionSummary] = Field(default_factory=list, description="Sections in the lesson")


class TopicLessonsResponse(BaseModel):
    topic_id: int = Field(..., description="Topic ID")
    lessons: List[LessonInTopicOut] = Field(default_factory=list, description="Lessons in the topic")


class LessonContentResponse(BaseModel):
    id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Lesson title")
    type: LessonType = Field(..., description="Lesson type")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Lesson content as JSON")
    audio_url: Optional[str] = Field(default=None, description="Audio URL")
    image_url: Optional[str] = Field(default=None, description="Image URL")

    class Config:
        from_attributes = True
