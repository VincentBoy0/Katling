from pydantic import BaseModel
from typing import Literal, List

class GenerateMaterialRequest(BaseModel):
    level: str = "beginner"
    topic: str = "daily"
    count: int = 5
    mode: Literal["word", "sentence"] = "sentence"


class WordItem(BaseModel):
    type: Literal["word"] = "word"
    text: str


class SentenceItem(BaseModel):
    type: Literal["sentence"] = "sentence"
    text: str


PracticeItem = WordItem | SentenceItem


class GenerateMaterialResponse(BaseModel):
    items: List[PracticeItem]

class PronunciationError(BaseModel):
    word: str
    severity: Literal["minor", "moderate", "severe"]


class AssessmentResult(BaseModel):
    score: float  # 0–10
    errors: list[PronunciationError]


class AssessPronunciationResponse(BaseModel):
    assessment: AssessmentResult
    feedback: str
