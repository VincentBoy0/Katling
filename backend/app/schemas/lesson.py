from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from models.lesson import QuestionType


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
