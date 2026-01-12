from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from models.post import PostStatus


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)

    class Config:
        extra = "forbid"


class PostCreateResponse(BaseModel):
    id: int


class PostCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)

    class Config:
        extra = "forbid"


class PostCommentCreateResponse(BaseModel):
    id: int


class PostCommentResponse(BaseModel):
    comment_id: int
    post_id: int
    author_id: int
    author_username: str | None
    content: str
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Admin Schemas ============

class AdminPostResponse(BaseModel):
    """Response schema for individual post in admin panel"""
    id: int
    user_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    content: Optional[Dict[str, Any]] = None
    status: PostStatus
    like_count: int
    comment_count: int
    created_at: datetime
    is_deleted: Optional[bool] = False

    class Config:
        from_attributes = True


class AdminPostListItem(BaseModel):
    """Schema for post item in list view"""
    id: int
    user_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    content: Optional[Dict[str, Any]] = None
    status: PostStatus
    like_count: int
    comment_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AdminPostListResponse(BaseModel):
    """Response schema for list of posts with pagination"""
    total: int
    skip: int
    limit: int
    posts: list[AdminPostListItem]


class AdminUserPostsResponse(BaseModel):
    """Response schema for user's posts"""
    user_id: int
    total: int
    skip: int
    limit: int
    posts: list[Dict[str, Any]]


class PostStatusUpdate(BaseModel):
    """Request schema for updating post status"""
    status: PostStatus


class PostBulkDeleteRequest(BaseModel):
    """Request schema for bulk deleting posts"""
    post_ids: list[int] = Field(..., min_items=1)


class PostStatsResponse(BaseModel):
    """Response schema for post statistics"""
    total_posts: int
    deleted_posts: int
    by_status: Dict[str, int]


class AdminCommentItem(BaseModel):
    """Schema for comment item in admin panel"""
    id: int
    user_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminPostCommentsResponse(BaseModel):
    """Response schema for post comments"""
    post_id: int
    comments: list[AdminCommentItem]
