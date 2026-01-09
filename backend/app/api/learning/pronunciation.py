from fastapi import APIRouter, UploadFile, File, Form
from services.pronunciation_service import PracticeService
from services.evaluation_service import PronunciationEvaluationService
from services.feedback_service import FeedbackService
from services.gemini_client import GeminiClient
from ml_models.wav2vec_scorer import Wav2VecScorer
from schemas.pronunciation import AssessPronunciationResponse, GenerateMaterialRequest, GenerateMaterialResponse

router = APIRouter(prefix="/pronunciation")

llm = GeminiClient()

practice = PracticeService(llm)
evaluator = PronunciationEvaluationService(Wav2VecScorer())
feedback = FeedbackService(llm)


@router.post("/material", response_model=GenerateMaterialResponse)
def generate_material(req: GenerateMaterialRequest):
    if req.mode == "word":
        items = [
            {"type": "word", "text": w["word"]}
            for w in practice.generate_words(
                req.count, req.level, req.topic
            )
        ]
    else:
        items = [
            {"type": "sentence", "text": s["sentence"]}
            for s in practice.generate_sentences(
                req.count, req.level, req.topic
            )
        ]

    return {"items": items}


@router.post("/assess")
async def assess(
    reference: str = Form(...),
    audio: UploadFile = File(...)
):
    audio_bytes = await audio.read()
    score = evaluator.evaluate(audio_bytes, reference)
    tips = feedback.generate(score)

    return {
        "assessment": score,
        "feedback": tips
    }
