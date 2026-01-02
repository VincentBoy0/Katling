from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.chatbot import (
    GeneratePracticeRequest,
    GeneratePracticeResponse,
    AssessmentResponse,
    ChatbotRequest,
    ChatbotResponse,
    SentenceGenerationRequest,
    SentenceGenerationResponse,
    BatchSentenceRequest,
    BatchSentenceResponse,
)
from services.chatbot_service import ChatbotService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chatbot", tags=["Pronunciation Chatbot"])

# Lazy initialize service to avoid import errors at module load time
chatbot_service = None

def get_chatbot_service():
    global chatbot_service
    if chatbot_service is None:
        try:
            chatbot_service = ChatbotService()
        except ImportError as e:
            if "torch" in str(e) or "CUDA" in str(e):
                raise HTTPException(
                    status_code=503,
                    detail="ML models not available. Please install PyTorch CPU version: pip install torch --index-url https://download.pytorch.org/whl/cpu"
                )
            raise
    return chatbot_service


@router.post("/generate", response_model=GeneratePracticeResponse)
async def generate_practice_text(request: GeneratePracticeRequest):
    """
    Generate practice text

    Request:
        {
            "level": "beginner",
            "topic": "daily_life"
        }

    Response:
        {
            "practice_text": "Hello, how are you today?",
            "level": "beginner",
            "topic": "daily_life",
            "instruction": "Please read this sentence..."
        }
    """

    try:
        result = get_chatbot_service().generate_practice(
            level=request.level, topic=request.topic
        )
        return result

    except Exception as e:
        logger.error(f"Error generating practice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assess", response_model=AssessmentResponse)
async def assess_pronunciation(reference_text: str, audio: UploadFile = File(...)):
    """
    Assess pronunciation

    Form data:
        - reference_text: Text mẫu (từ /generate)
        - audio: Audio file (WAV/MP3)

    Response:
        {
            "assessment": {
                "overall_score": -4.5,
                "overall_rating": "good",
                "word_scores": [...],
                "predicted_text": "...",
                "reference_text": "..."
            },
            "feedback": "Great job! Try improving..."
        }
    """

    try:
        # Validate audio
        if audio.filename and not audio.filename.endswith((".wav", ".mp3", ".ogg")):
            raise HTTPException(
                status_code=400, detail="Audio must be WAV, MP3, or OGG format"
            )

        # Read audio bytes
        audio_bytes = await audio.read()

        # Assess
        result = get_chatbot_service().assess_pronunciation(
            audio_bytes=audio_bytes, reference_text=reference_text
        )

        return result

    except Exception as e:
        logger.error(f"Error assessing pronunciation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatbotResponse)
async def chat_with_bot(request: ChatbotRequest):
    """
    Chat with the pronunciation chatbot

    Request:
        {
            "message": "Give me a simple sentence about food",
            "sentence_type": "simple"
        }

    Response:
        {
            "response": "Here's a simple sentence...",
            "sentence_type": "simple"
        }
    """
    try:
        response = get_chatbot_service().chat(
            message=request.message, sentence_type=request.sentence_type
        )
        return response

    except Exception as e:
        logger.error(f"Error in chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-sentence", response_model=SentenceGenerationResponse)
async def generate_sentence(request: SentenceGenerationRequest):
    """
    Generate a single sentence for pronunciation practice

    Request:
        {
            "sentence_type": "simple",
            "topic": "food",
            "context": "breakfast"
        }

    Response:
        {
            "sentence": "I like to eat eggs for breakfast.",
            "sentence_type": "simple",
            "topic": "food"
        }
    """
    try:
        result = get_chatbot_service().generate_sentence(
            sentence_type=request.sentence_type,
            topic=request.topic,
            context=request.context,
        )
        return result

    except Exception as e:
        logger.error(f"Error generating sentence: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-batch", response_model=BatchSentenceResponse)
async def generate_sentence_batch(request: BatchSentenceRequest):
    """
    Generate multiple sentences for pronunciation practice

    Request:
        {
            "count": 5,
            "sentence_type": "mixed",
            "topics": ["food", "weather", "travel"]
        }

    Response:
        {
            "sentences": [
                {
                    "sentence": "...",
                    "type": "simple",
                    "topic": "food",
                    "index": 1
                },
                ...
            ],
            "total_count": 5
        }
    """
    try:
        result = get_chatbot_service().generate_batch(
            count=request.count,
            sentence_type=request.sentence_type,
            topics=request.topics,
        )
        return result

    except Exception as e:
        logger.error(f"Error generating batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clear-history")
async def clear_chat_history():
    """
    Clear the chatbot conversation history

    Response:
        {
            "message": "Conversation history cleared"
        }
    """
    try:
        get_chatbot_service().clear_history()
        return {"message": "Conversation history cleared"}

    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_chat_history():
    """
    Get the chatbot conversation history

    Response:
        {
            "history": [
                {
                    "role": "user",
                    "content": "..."
                },
                {
                    "role": "assistant",
                    "content": "..."
                }
            ]
        }
    """
    try:
        history = get_chatbot_service().get_history()
        return {"history": history}

    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
