from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column, Enum as SAEnum, DateTime, text
from sqlalchemy.dialects.postgresql import JSONB
from enum import Enum


def utc_now() -> datetime:
    """Return current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class PostStatus(str, Enum):
    """Status for posts (user-generated content)."""
    PENDING = "PENDING"           # Awaiting moderation review
    ACCEPTED = "ACCEPTED"         # Approved by moderator
    DECLINED = "DECLINED"         # Rejected by moderator
    FLAGGED = "FLAGGED"           # Flagged for review due to reports
    ARCHIVED = "ARCHIVED"         # No longer active


class Post(SQLModel, table=True):
    __tablename__ = "posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    content: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )
    status: PostStatus = Field(
        sa_column=Column(SAEnum(PostStatus, name="post_status_enum")),
        default=PostStatus.PENDING,
    )
    like_count: int = Field(default=0)
    comment_count: int = Field(default=0)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )


class PostComment(SQLModel, table=True):
    __tablename__ = "post_comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="posts.id", ondelete="CASCADE", index=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    content: str
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )


class PostLike(SQLModel, table=True):
    __tablename__ = "post_likes"
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uix_post_user_like"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="posts.id", ondelete="CASCADE", index=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE", index=True)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), server_default=text("now()")),
    )


