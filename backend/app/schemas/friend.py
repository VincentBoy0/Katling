from pydantic import BaseModel, Field


class FriendRequestCreate(BaseModel):
    receiver_id: int = Field(..., ge=1)

    class Config:
        extra = "forbid"
