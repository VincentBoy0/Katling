from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class UserWordSaveIn(BaseModel):
    vocab_id: int = Field(..., description="Vocab ID to save")
    status: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata for saved word")


class UserWordOut(BaseModel):
    id: int
    user_id: int
    word_id: int
    status: Optional[Dict[str, Any]] = None
    review_status: str
    last_reviewed_at: datetime
    next_reviewed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
