"""
Schemas for report/issue creation, updates, and responses.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from models.report import ReportStatus, ReportSeverity, ReportCategory


class ReportCreate(BaseModel):
    """Schema for creating a new report."""
    title: str = Field(..., max_length=255, description="Title of the issue")
    description: str = Field(..., min_length=10, description="Detailed description of the issue")
    severity: ReportSeverity = Field(
        default=ReportSeverity.MEDIUM,
        description="How severe the issue is"
    )
    category: ReportCategory = Field(
        default=ReportCategory.OTHER,
        description="Category of the issue"
    )
    affected_url: Optional[str] = Field(
        default=None,
        max_length=512,
        description="URL where the issue occurred"
    )
    affected_lesson_id: Optional[int] = Field(
        default=None,
        description="ID of affected lesson (if applicable)"
    )
    affected_post_id: Optional[int] = Field(
        default=None,
        description="ID of affected post (if applicable)"
    )

    class Config:
        extra = "forbid"


class ReportUpdate(BaseModel):
    """Schema for updating a report (admin/moderator use)."""
    status: Optional[ReportStatus] = Field(
        default=None,
        description="New status"
    )
    severity: Optional[ReportSeverity] = Field(
        default=None,
        description="Updated severity"
    )
    resolution_notes: Optional[str] = Field(
        default=None,
        description="Notes about resolution"
    )

    class Config:
        extra = "forbid"


class ReportResponse(BaseModel):
    """Schema for report response."""
    id: int
    user_id: int
    title: str
    description: str
    status: ReportStatus
    severity: ReportSeverity
    category: ReportCategory
    affected_url: Optional[str]
    affected_lesson_id: Optional[int]
    affected_post_id: Optional[int]
    resolved_by: Optional[int]
    resolution_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Schema for report list response."""
    id: int
    title: str
    status: ReportStatus
    severity: ReportSeverity
    category: ReportCategory
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
