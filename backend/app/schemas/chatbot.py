from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GeneratePracticeRequest(BaseModel):
    """Request for generating practice text"""
    level: str = Field(default="beginner", description="beginner, intermediate, or advanced")
    topic: str = Field(default="daily_life", description="Topic category")

class GeneratePracticeResponse(BaseModel):
    """Response with practice text"""
    practice_text: str
    level: str
    topic: str
    instruction: str

class ChatbotRequest(BaseModel):
    """Request for chatbot conversation"""
    message: str = Field(..., description="User's message to the chatbot")
    sentence_type: Literal["simple", "academic", "auto"] = Field(
        default="auto",
        description="Type of sentence to generate"
    )

class ChatbotResponse(BaseModel):
    """Response from chatbot"""
    response: str = Field(..., description="Chatbot's response")
    sentence_type: str = Field(..., description="Type of sentence generated")

class SentenceGenerationRequest(BaseModel):
    """Request for generating sentences"""
    sentence_type: Literal["simple", "academic"] = Field(
        default="simple",
        description="Type of sentence to generate"
    )
    topic: str = Field(
        default="daily life",
        description="Topic for the sentence"
    )
    context: Optional[str] = Field(
        default=None,
        description="Optional context to guide generation"
    )

class SentenceGenerationResponse(BaseModel):
    """Response with generated sentence"""
    sentence: str
    sentence_type: str
    topic: str

class BatchSentenceRequest(BaseModel):
    """Request for generating multiple sentences"""
    count: int = Field(default=5, ge=1, le=20, description="Number of sentences to generate")
    sentence_type: Literal["simple", "academic", "mixed"] = Field(
        default="mixed",
        description="Type of sentences to generate"
    )
    topics: Optional[List[str]] = Field(
        default=None,
        description="List of topics to use"
    )

class SentenceInfo(BaseModel):
    """Information about a generated sentence"""
    sentence: str
    type: str
    topic: str
    index: int

class BatchSentenceResponse(BaseModel):
    """Response with multiple generated sentences"""
    sentences: List[SentenceInfo]
    total_count: int

class WordScore(BaseModel):
    """Individual word score"""
    word: str
    score: float
    rating: str

class AssessmentDetail(BaseModel):
    """Detailed assessment"""
    overall_score: float
    overall_rating: str
    word_scores: List[WordScore]
    predicted_text: str
    reference_text: str

class AssessmentResponse(BaseModel):
    """Response with assessment and feedback"""
    assessment: AssessmentDetail
    feedback: str


