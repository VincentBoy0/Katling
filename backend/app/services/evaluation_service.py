from services.audio_utils import load_audio_from_bytes
from services.score_mapper import map_raw_score_to_10
from ml_models.wav2vec_scorer import extract_pronunciation_errors


class PronunciationEvaluationService:
    def __init__(self, scorer):
        self.scorer = scorer

    def evaluate(self, audio_bytes: bytes, reference: str):
        audio = load_audio_from_bytes(audio_bytes)
        raw = self.scorer.score_pronunciation(audio, reference)

        score_10 = map_raw_score_to_10(raw["overall_score"])

        return {
            "score": score_10,              # 👈 dùng cho UI
            "raw_score": raw["overall_score"],  # 👈 debug
            "word_scores": raw["word_scores"],
            "errors": extract_pronunciation_errors(raw["word_scores"]),
            "predicted_text": raw["predicted_text"],
            "reference_text": raw["reference_text"],
        }
