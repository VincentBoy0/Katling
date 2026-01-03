from datetime import datetime
from typing import Any, Dict, Optional, List

from pydantic import BaseModel, Field

from models.lesson import QuestionType


class QuestionCreate(BaseModel):
    """Schema for creating a new question."""
    section_id: int = Field(..., description="Lesson section ID")
    type: QuestionType = Field(..., description="Question type (MCQ, TRUE_FALSE, FILL_IN_THE_BLANK, etc.)")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Question content as JSON")
    correct_answer: Optional[Dict[str, Any]] = Field(default=None, description="Correct answer as JSON")
    audio_url: Optional[str] = Field(default=None, max_length=512, description="Audio URL for question")
    explanation: Optional[str] = Field(default=None, max_length=2000, description="Explanation for the answer")
    order_index: int = Field(default=0, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class QuestionUpdate(BaseModel):
    """Schema for updating a question."""
    type: Optional[QuestionType] = Field(default=None, description="Question type")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Question content as JSON")
    correct_answer: Optional[Dict[str, Any]] = Field(default=None, description="Correct answer as JSON")
    audio_url: Optional[str] = Field(default=None, max_length=512, description="Audio URL")
    explanation: Optional[str] = Field(default=None, max_length=2000, description="Explanation for the answer")
    order_index: Optional[int] = Field(default=None, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class QuestionResponse(BaseModel):
    """Schema for question API response."""
    id: int = Field(..., description="Question ID")
    section_id: int = Field(..., description="Lesson section ID")
    created_by: int = Field(..., description="Creator user ID")
    type: QuestionType = Field(..., description="Question type")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Question content")
    correct_answer: Optional[Dict[str, Any]] = Field(default=None, description="Correct answer")
    audio_url: Optional[str] = Field(default=None, description="Audio URL")
    explanation: Optional[str] = Field(default=None, description="Explanation for the answer")
    order_index: int = Field(..., description="Ordering index")
    is_deleted: bool = Field(..., description="Whether question is soft-deleted")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    """Schema for question list response (summary)."""
    id: int = Field(..., description="Question ID")
    section_id: int = Field(..., description="Lesson section ID")
    type: QuestionType = Field(..., description="Question type")
    order_index: int = Field(..., description="Ordering index")
    created_by: int = Field(..., description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    is_deleted: bool = Field(..., description="Whether question is soft-deleted")

    class Config:
        from_attributes = True


class QuestionAnswerRequest(BaseModel):
    """Schema for submitting a question answer."""
    answer: Dict[str, Any] = Field(..., description="Submitted answer payload")


class QuestionAnswerResponse(BaseModel):
    """Schema for question answer response."""
    question_id: int = Field(..., description="Question ID")
    section_id: int = Field(..., description="Section ID")
    is_correct: bool = Field(..., description="Whether the submitted answer is correct")
    correct_answer: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Correct answer (only returned when submitted answer is wrong)",
    )
    explanation: Optional[str] = Field(default=None, description="Explanation for the answer")
    xp_earned: int = Field(default=0, description="XP earned for correct answer")

    class Config:
        from_attributes = True


class SectionQuestionsResponse(BaseModel):
    """Schema for section with all its questions."""
    section_id: int = Field(..., description="Section ID")
    questions: list[QuestionResponse] = Field(default_factory=list, description="Questions in the section")



