"""
Report/Issue model for user error reporting and tracking.
Users can report issues, and admins/moderators can manage and resolve them.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Enum as SAEnum, DateTime, Text, text
from enum import Enum


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ReportStatus(str, Enum):
    """Status of a report/issue."""
    PENDING = "PENDING"           # Just reported, not yet reviewed
    IN_PROGRESS = "IN_PROGRESS"   # Being investigated/worked on
    RESOLVED = "RESOLVED"         # Fixed/resolved
    CLOSED = "CLOSED"             # Closed without resolution
    WONT_FIX = "WONT_FIX"         # Won't be fixed (by design, out of scope, etc)


class ReportSeverity(str, Enum):
    """Severity level of the issue."""
    LOW = "LOW"                   # Minor issue, doesn't affect functionality
    MEDIUM = "MEDIUM"             # Notable issue, some impact
    HIGH = "HIGH"                 # Significant issue, major impact
    CRITICAL = "CRITICAL"         # Critical issue, blocks functionality


class ReportCategory(str, Enum):
    """Category/type of the report."""
    BUG = "BUG"                   # Something is broken
    FEATURE_REQUEST = "FEATURE_REQUEST"  # Request for new feature
    CONTENT_ERROR = "CONTENT_ERROR"      # Error in lesson/content
    PERFORMANCE = "PERFORMANCE"   # Performance/speed issue
    ACCESSIBILITY = "ACCESSIBILITY"      # Accessibility issue
    POST = "POST"
    OTHER = "OTHER"               # Other issue


class Report(SQLModel, table=True):
    """User error/issue report model."""
    __tablename__ = "reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Reporter information
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    
    # Report details
    title: str = Field(max_length=255, index=True)
    description: str = Field(sa_column=Column(Text))
    
    # Classification
    status: ReportStatus = Field(
        sa_column=Column(SAEnum(ReportStatus, name="report_status_enum")),
        default=ReportStatus.PENDING,
    )
    severity: ReportSeverity = Field(
        sa_column=Column(SAEnum(ReportSeverity, name="report_severity_enum")),
        default=ReportSeverity.MEDIUM,
    )
    category: ReportCategory = Field(
        sa_column=Column(SAEnum(ReportCategory, name="report_category_enum")),
        default=ReportCategory.OTHER,
    )
    
    # Resolution tracking
    resolved_by: Optional[int] = Field(
        default=None,
        foreign_key="users.id",
        ondelete="SET NULL",
    )
    resolution_notes: Optional[str] = Field(
        default=None,
        sa_column=Column(Text),
    )
    
    # Additional context
    affected_url: Optional[str] = Field(
        default=None,
        max_length=512,
        description="URL where the issue occurred",
    )
    affected_lesson_id: Optional[int] = Field(
        default=None,
        foreign_key="lessons.id",
        ondelete="SET NULL",
    )
    affected_post_id: Optional[int] = Field(
        default=None,
        foreign_key="posts.id",
        ondelete="SET NULL",
    )
    
    # Timestamps
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )
    resolved_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
