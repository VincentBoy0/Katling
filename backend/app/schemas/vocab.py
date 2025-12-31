from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SaveVocabRequest(BaseModel):
    word: str = Field(..., description="Word to save")
    definition: Dict[str, Any] = Field(..., description="Definition payload for vocab")
    audio_url: Optional[str] = Field(default=None, description="Audio URL for vocab")


class UserWordOut(BaseModel):
    id: int
    user_id: int
    vocab_id: int = Field(..., alias="word_id")
    status: Optional[Dict[str, Any]] = None
    review_status: str
    last_reviewed_at: datetime
    next_reviewed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
        allow_population_by_field_name = True
