from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FlashcardMode(str, Enum):
    all = "all"
    review_status = "review_status"
    category = "category"


class FlashcardCard(BaseModel):
    user_word_id: int
    word: str
    definition: str
    phonetic: Optional[str] = None
    audio_url: Optional[str] = None


class FlashcardsResponse(BaseModel):
    total: int
    cards: list[FlashcardCard]


class FlashcardsCompleteRequest(BaseModel):
    user_word_ids: list[int] = Field(default_factory=list)
