from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

from sqlalchemy import Column, Enum as SAEnum, DateTime, text
from sqlalchemy.dialects.postgresql import JSONB  
from enum import Enum
from typing import Optional, Dict, Any



def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class LessonStatus(str, Enum):
    """Status for lessons and content."""
    DRAFT = "DRAFT"               # Work in progress, not published
    PENDING = "PENDING"           # Awaiting moderation review
    PUBLISHED = "PUBLISHED"       # Approved and visible to users
    ARCHIVED = "ARCHIVED"         # No longer active but kept for history
    REJECTED = "REJECTED"         # Declined by moderator


class Topic(SQLModel, table=True):
    __tablename__ = "topics"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_by: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    name: str = Field(max_length=255)
    description: Optional[str] = None
    order_index: int = Field(default=0, index=True)
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    is_deleted: bool = Field(default=False)


class LessonType(str, Enum):
    READING = "READING"           
    LISTENING = "LISTENING"       
    SPEAKING = "SPEAKING"         
    WRITING = "WRITING"           
    VOCABULARY = "VOCABULARY"     
    GRAMMAR = "GRAMMAR"           
    TEST = "TEST"


class Lesson(SQLModel, table=True):
    __tablename__ = "lessons"

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topics.id", ondelete="CASCADE", index=True)
    created_by: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    type: LessonType = Field(
        sa_column=Column(SAEnum(LessonType, name="lesson_type_enum")), 
    )
    title: str = Field(max_length=150)
    description: Optional[str] = None
    audio_url: Optional[str] = Field(default=None, max_length=512)
    image_url: Optional[str] = Field(default=None, max_length=512)
    content: Optional[Dict[str, Any]] = Field(
        default=None, 
        sa_column=Column(JSONB, nullable=True)
    )
    status: LessonStatus = Field(
        sa_column=Column(SAEnum(LessonStatus, name="lesson_status_enum")),
        default=LessonStatus.DRAFT,
    )
    order_index: int = Field(default=0, index=True)
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    is_deleted: bool = Field(default=False)


class LessonSection(SQLModel, table=True):
    __tablename__ = "lesson_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_by: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    lesson_id: int = Field(foreign_key="lessons.id", ondelete="CASCADE", index=True)
    title: str = Field(max_length=150)
    order_index: int = Field(default=0, index=True)
    content: Optional[Dict[str, Any]] = Field(
        default=None, 
        sa_column=Column(JSONB, nullable=True)
    )
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    is_deleted: bool = Field(default=False)


class QuestionType(str, Enum):
    MCQ = "MCQ"                   
    MULTIPLE_SELECT = "MULTIPLE_SELECT" 
    TRUE_FALSE = "TRUE_FALSE"     
    
    FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK" 
    MATCHING = "MATCHING"         
    ORDERING = "ORDERING"         
    
    PRONUNCIATION = "PRONUNCIATION" 
    TRANSCRIPT = "TRANSCRIPT"


class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_by: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    # lesson_id: int = Field(foreign_key="lessons.id", ondelete="CASCADE", index=True)
    section_id: int = Field(foreign_key="lesson_sections.id", ondelete="CASCADE", index=True)
    type: QuestionType = Field(
        sa_column=Column(SAEnum(QuestionType, name="question_type_enum")), 
    )
    content: Optional[Dict[str, Any]] = Field(
        default=None, 
        sa_column=Column(JSONB, nullable=True)
    )
    correct_answer: Optional[Dict[str, Any]] = Field(
        default=None, 
        sa_column=Column(JSONB, nullable=True)
    )
    audio_url: Optional[str] = Field(default=None, max_length=512)
    explanation: Optional[str] = None
    order_index: int = Field(default=0, index=True)
    created_at: datetime = Field(
        default_factory=utc_now, 
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"))
    )
    is_deleted: bool = Field(default=False)
