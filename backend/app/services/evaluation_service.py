import logging
from services.audio_utils import load_audio_from_bytes
from services.score_mapper import map_raw_score_to_10
from ml_models.wav2vec_scorer import extract_pronunciation_errors

logger = logging.getLogger(__name__)


class PronunciationEvaluationService:
    def __init__(self, scorer):
        self.scorer = scorer

    def evaluate(self, audio_bytes: bytes, reference: str):
        logger.info(f"Evaluating pronunciation for: '{reference}'")
        logger.info(f"Audio size: {len(audio_bytes)} bytes")

        audio = load_audio_from_bytes(audio_bytes)
        logger.info(
            f"Loaded audio shape: {audio.shape}, duration: {len(audio)/16000:.2f}s"
        )

        # Check if audio is too quiet or empty
        import numpy as np

        audio_max = np.max(np.abs(audio))
        logger.info(f"Audio max amplitude: {audio_max}")

        if audio_max < 0.01:
            logger.warning("Audio appears to be very quiet or silent")

        raw = self.scorer.score_pronunciation(audio, reference)
        logger.info(
            f"Raw score: {raw['overall_score']}, predicted: '{raw['predicted_text']}'"
        )

        score_10 = map_raw_score_to_10(raw["overall_score"])
        logger.info(f"Mapped score: {score_10}/10")

        return {
            "score": score_10,
            "raw_score": raw["overall_score"],
            "word_scores": raw["word_scores"],
            "errors": extract_pronunciation_errors(raw["word_scores"]),
            "predicted_text": raw["predicted_text"],
            "reference_text": raw["reference_text"],
        }
