from pydantic import BaseModel
from typing import Optional


class ConversationRequest(BaseModel):
    message: str


class ConversationResponse(BaseModel):
    response: str


class VoiceChatResponse(BaseModel):
    user_text: str
    response_text: str
    has_audio: bool
    audio_lang: Optional[str] = None
