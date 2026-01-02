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
