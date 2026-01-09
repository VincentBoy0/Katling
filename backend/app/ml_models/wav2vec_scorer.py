from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import numpy as np
from scipy.special import log_softmax
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class Wav2VecScorer:
    """Singleton - Load model một lần"""

    _instance: Optional["Wav2VecScorer"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_id: str = "facebook/wav2vec2-base-960h"):
        if hasattr(self, "initialized"):
            return

        logger.info(f"🔄 Loading Wav2Vec2: {model_id}")

        self.processor = Wav2Vec2Processor.from_pretrained(model_id)
        self.model = Wav2Vec2ForCTC.from_pretrained(model_id)
        self.model.eval()

        self.initialized = True
        logger.info("✅ Wav2Vec2 loaded")

    def score_pronunciation(
        self, audio: np.ndarray, reference_text: str, sample_rate: int = 16000
    ) -> Dict:
        """
        Chấm điểm phát âm - Pure function

        Args:
            audio: Audio array (numpy)
            reference_text: Text mẫu
            sample_rate: Audio sample rate

        Returns:
            dict: {
                "overall_score": float,
                "overall_rating": str,
                "word_scores": List[dict],
                "predicted_text": str,
                "reference_text": str
            }
        """

        # Preprocess audio
        inputs = self.processor(
            audio, sampling_rate=sample_rate, return_tensors="pt", padding=True
        )

        # Get predictions
        with torch.no_grad():
            logits = self.model(inputs.input_values).logits

        predicted_ids = torch.argmax(logits, dim=-1)
        predicted_text = self.processor.batch_decode(predicted_ids)[0]

        # Calculate log probabilities
        log_probs = log_softmax(logits[0].cpu().numpy(), axis=-1)

        # Score each word
        words = reference_text.lower().split()
        word_scores = []

        for word in words:
            word_tokens = self.processor.tokenizer.encode(
                word, add_special_tokens=False
            )
            score = self._calculate_word_score(log_probs, word_tokens)
            rating = self._score_to_rating(score)

            word_scores.append({"word": word, "score": float(score), "rating": rating})

        # Overall score
        overall_score = np.mean([w["score"] for w in word_scores])

        return {
            "overall_score": float(overall_score),
            "overall_rating": self._score_to_rating(overall_score),
            "word_scores": word_scores,
            "predicted_text": predicted_text.lower(),
            "reference_text": reference_text.lower(),
        }

    def _calculate_word_score(self, log_probs, word_tokens):
        """Calculate average log-likelihood for word tokens"""
        if not word_tokens:
            return -10.0

        token_scores = []
        for token_id in word_tokens:
            if token_id < log_probs.shape[1]:
                max_prob = np.max(log_probs[:, token_id])
                token_scores.append(max_prob)

        return np.mean(token_scores) if token_scores else -10.0

    def _score_to_rating(self, score: float) -> str:
        """Convert numeric score to rating"""
        if score > -3.0:
            return "excellent"
        elif score > -6.0:
            return "good"
        elif score > -10.0:
            return "fair"
        else:
            return "poor"


def extract_pronunciation_errors(word_scores):
    errors = []

    for w in word_scores:
        if w["rating"] in ["fair", "poor"]:
            errors.append(
                {
                    "word": w["word"],
                    "phoneme": "vowel/consonant cluster",
                    "error_type": "substitution",
                    "severity": "moderate" if w["rating"] == "fair" else "severe",
                }
            )

    return errors
