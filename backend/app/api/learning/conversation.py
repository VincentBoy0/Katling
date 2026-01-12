from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from schemas.conversation import (
    ConversationRequest,
    ConversationResponse,
    VoiceChatResponse,
)
from services.chat_service import ConversationChatService
from services.gemini_client import GeminiClient
from services.tts_service import TTSService
from services.stt_service import get_stt_service
from services.audio_utils import load_audio_from_bytes
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Conversation"])

llm = GeminiClient()
chat_service = ConversationChatService(llm)
tts_service = TTSService()


@router.post("/message", response_model=ConversationResponse)
def chat(req: ConversationRequest):
    reply = chat_service.chat(req.message)
    return {"response": reply}


@router.post("/voice", response_model=VoiceChatResponse)
async def voice_chat(
    audio: UploadFile = File(...),
    force_english: bool = Form(default=False)
):
    """
    Voice chat endpoint:
    1. Receive audio from user
    2. Transcribe to text using STT
    3. Generate response using chat service
    4. Convert response to audio using TTS
    5. Return both text and audio
    
    Args:
        audio: Audio file from user
        force_english: If True, bot will respond in English only (for voice mode)
    """
    try:
        # Read audio bytes
        audio_bytes = await audio.read()
        logger.info(f"Received voice message: {len(audio_bytes)} bytes, force_english={force_english}")

        # Convert to numpy array
        audio_array = load_audio_from_bytes(audio_bytes)

        # Transcribe audio to text
        stt_service = get_stt_service()
        user_text = stt_service.transcribe(audio_array)
        logger.info(f"Transcribed user message: '{user_text}'")

        if not user_text.strip():
            error_msg = "Sorry, I couldn't hear you clearly. Could you please try again?" if force_english else "Xin lỗi, mình không nghe rõ. Bạn có thể nói lại không?"
            return {
                "user_text": "",
                "response_text": error_msg,
                "has_audio": False,
            }

        # Generate chat response (with English requirement if force_english)
        if force_english:
            response_text = chat_service.chat_english(user_text)
        else:
            response_text = chat_service.chat(user_text)
        logger.info(f"Chat response: '{response_text[:100]}...'")

        # Detect language and generate TTS
        lang = tts_service.detect_language(response_text)

        return {
            "user_text": user_text,
            "response_text": response_text,
            "has_audio": True,
            "audio_lang": lang,
        }

    except Exception as e:
        logger.error(f"Voice chat error: {e}")
        return {
            "user_text": "",
            "response_text": f"Xin lỗi, có lỗi xảy ra: {str(e)}",
            "has_audio": False,
        }


@router.post("/voice/tts")
async def text_to_speech(text: str = Form(...), lang: str = Form(default="en")):
    """
    Convert text to speech audio
    Returns MP3 audio bytes
    """
    try:
        audio_bytes = tts_service.synthesize(text, lang)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=response.mp3"},
        )
    except Exception as e:
        logger.error(f"TTS error: {e}")
        return Response(status_code=500, content=str(e))


@router.post("/reset")
def reset():
    chat_service.reset()
    return {"message": "Conversation reset"}


@router.get("/history")
def history():
    return {"history": chat_service.get_history()}
