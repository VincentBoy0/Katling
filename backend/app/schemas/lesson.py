from datetime import datetime
from typing import Any, Dict, Optional, List

from pydantic import BaseModel, Field

from models.lesson import LessonStatus, LessonType, QuestionType


class QuestionInfo(BaseModel):
    id: int = Field(..., description="Question ID")
    lesson_id: int = Field(..., description="Lesson ID")
    section_id: int = Field(..., description="Section ID")
    type: QuestionType = Field(..., description="Question type")

    content: Optional[Dict[str, Any]] = Field(default=None, description="Question content")
    audio_url: Optional[str] = Field(default=None, description="Audio URL")
    explanation: Optional[str] = Field(default=None, description="Explanation")

    order_index: int = Field(default=0, description="Ordering index")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class SectionQuestionsResponse(BaseModel):
    section_id: int = Field(..., description="Section ID")
    questions: list[QuestionInfo] = Field(default_factory=list, description="Questions in the section")


class QuestionAnswerSubmitRequest(BaseModel):
    answer: Dict[str, Any] = Field(..., description="Submitted answer payload")


class LearningState(BaseModel):
    energy: int = Field(..., description="Remaining energy")


class QuestionAnswerSubmitResponse(BaseModel):
    question_id: int = Field(..., description="Question ID")
    section_id: int = Field(..., description="Section ID")
    is_correct: bool = Field(..., description="Whether the submitted answer is correct")
    correct_answer: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Correct answer (only returned when submitted answer is wrong)",
    )
    learning_state: LearningState = Field(..., description="Learning state after submitting the answer")


# Lesson Management Schemas
class LessonCreate(BaseModel):
    """Schema for creating a new lesson."""
    topic_id: int = Field(..., description="Topic ID")
    type: LessonType = Field(..., description="Lesson type")
    title: str = Field(..., min_length=1, max_length=150, description="Lesson title")
    description: Optional[str] = Field(default=None, max_length=1000, description="Lesson description")
    audio_url: Optional[str] = Field(default=None, max_length=512, description="Audio URL")
    image_url: Optional[str] = Field(default=None, max_length=512, description="Image URL")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Lesson content as JSON")
    status: LessonStatus = Field(default=LessonStatus.DRAFT, description="Lesson status")
    order_index: int = Field(default=0, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class LessonUpdate(BaseModel):
    """Schema for updating a lesson."""
    type: Optional[LessonType] = Field(default=None, description="Lesson type")
    title: Optional[str] = Field(default=None, min_length=1, max_length=150, description="Lesson title")
    description: Optional[str] = Field(default=None, max_length=1000, description="Lesson description")
    audio_url: Optional[str] = Field(default=None, max_length=512, description="Audio URL")
    image_url: Optional[str] = Field(default=None, max_length=512, description="Image URL")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Lesson content as JSON")
    status: Optional[LessonStatus] = Field(default=None, description="Lesson status")
    order_index: Optional[int] = Field(default=None, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class LessonResponse(BaseModel):
    """Schema for lesson API response."""
    id: int = Field(..., description="Lesson ID")
    topic_id: int = Field(..., description="Topic ID")
    created_by: int = Field(..., description="Creator user ID")
    type: LessonType = Field(..., description="Lesson type")
    title: str = Field(..., description="Lesson title")
    description: Optional[str] = Field(default=None, description="Lesson description")
    audio_url: Optional[str] = Field(default=None, description="Audio URL")
    image_url: Optional[str] = Field(default=None, description="Image URL")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Lesson content")
    status: LessonStatus = Field(..., description="Lesson status")
    order_index: int = Field(..., description="Ordering index")
    is_deleted: bool = Field(..., description="Whether lesson is soft-deleted")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class LessonListResponse(BaseModel):
    """Schema for lesson list response."""
    id: int = Field(..., description="Lesson ID")
    topic_id: int = Field(..., description="Topic ID")
    title: str = Field(..., description="Lesson title")
    type: LessonType = Field(..., description="Lesson type")
    status: LessonStatus = Field(..., description="Lesson status")
    order_index: int = Field(..., description="Ordering index")
    created_by: int = Field(..., description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True