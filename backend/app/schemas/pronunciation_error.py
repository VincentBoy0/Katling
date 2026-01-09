from pydantic import BaseModel
from typing import Literal, List


class PhonemeError(BaseModel):
    word: str
    phoneme: str
    error_type: Literal["substitution", "deletion", "insertion", "stress"]
    severity: Literal["minor", "moderate", "severe"]


class PronunciationErrorReport(BaseModel):
    overall_score: float
    overall_rating: str
    cefr_level: str
    errors: List[PhonemeError]
