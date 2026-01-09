from fastapi import APIRouter
from schemas.conversation import ConversationRequest, ConversationResponse
from services.chat_service import ConversationChatService
from services.gemini_client import GeminiClient

router = APIRouter(prefix="/chat", tags=["Conversation"])

llm = GeminiClient()
chat_service = ConversationChatService(llm)


@router.post("/message", response_model=ConversationResponse)
def chat(req: ConversationRequest):
    reply = chat_service.chat(req.message)
    return {"response": reply}


@router.post("/reset")
def reset():
    chat_service.reset()
    return {"message": "Conversation reset"}


@router.get("/history")
def history():
    return {"history": chat_service.get_history()}
