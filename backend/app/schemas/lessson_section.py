from datetime import datetime
from typing import Any, Dict, Optional, List

from pydantic import BaseModel, Field


class LessonSectionCreate(BaseModel):
    """Schema for creating a new lesson section."""
    lesson_id: int = Field(..., description="Lesson ID")
    title: str = Field(..., min_length=1, max_length=150, description="Section title")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Section content as JSON")
    order_index: int = Field(default=0, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class LessonSectionUpdate(BaseModel):
    """Schema for updating a lesson section."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=150, description="Section title")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Section content as JSON")
    order_index: Optional[int] = Field(default=None, ge=0, description="Ordering index")

    class Config:
        extra = "forbid"


class LessonSectionResponse(BaseModel):
    """Schema for lesson section API response."""
    id: int = Field(..., description="Section ID")
    lesson_id: int = Field(..., description="Lesson ID")
    created_by: int = Field(..., description="Creator user ID")
    title: str = Field(..., description="Section title")
    content: Optional[Dict[str, Any]] = Field(default=None, description="Section content")
    order_index: int = Field(..., description="Ordering index")
    is_deleted: bool = Field(..., description="Whether section is soft-deleted")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class LessonSectionListResponse(BaseModel):
    """Schema for lesson section list response."""
    id: int = Field(..., description="Section ID")
    lesson_id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Section title")
    order_index: int = Field(..., description="Ordering index")
    created_by: int = Field(..., description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    is_deleted: bool = Field(..., description="Whether section is soft-deleted")

    class Config:
        from_attributes = True