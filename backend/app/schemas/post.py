from datetime import datetime
from pydantic import BaseModel, Field


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
