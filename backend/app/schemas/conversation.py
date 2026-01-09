from pydantic import BaseModel


class ConversationRequest(BaseModel):
    message: str


class ConversationResponse(BaseModel):
    response: str
