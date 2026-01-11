from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import numpy as np
from scipy.special import log_softmax
from typing import Dict, List, Optional
import logging
import re
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


def normalize_text(text: str) -> str:
    """Normalize text for comparison - remove punctuation, lowercase, extra spaces"""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s']", "", text)  # Keep apostrophes for contractions
    text = re.sub(r"\s+", " ", text)
    return text


def get_word_similarity(word1: str, word2: str) -> float:
    """Calculate similarity between two words using SequenceMatcher"""
    return SequenceMatcher(None, word1.lower(), word2.lower()).ratio()


def calculate_text_match_score(predicted: str, reference: str) -> Dict:
    """
    Calculate matching score between predicted and reference text.
    Returns score from 0-100 and word-level details.
    """
    pred_normalized = normalize_text(predicted)
    ref_normalized = normalize_text(reference)

    pred_words = pred_normalized.split()
    ref_words = ref_normalized.split()

    if not ref_words:
        return {"score": 0, "matched_words": [], "missing_words": [], "extra_words": []}

    # For single word, use fuzzy matching
    if len(ref_words) == 1:
        if not pred_words:
            return {
                "score": 0,
                "matched_words": [],
                "missing_words": ref_words,
                "extra_words": [],
                "word_scores": [{"word": ref_words[0], "score": 0, "rating": "poor"}],
            }

        # Find best matching word from prediction
        best_similarity = 0
        best_pred_word = pred_words[0] if pred_words else ""

        for pred_word in pred_words:
            similarity = get_word_similarity(pred_word, ref_words[0])
            if similarity > best_similarity:
                best_similarity = similarity
                best_pred_word = pred_word

        # Convert similarity to score (0-100)
        score = best_similarity * 100

        # Determine rating based on similarity
        if best_similarity >= 0.9:
            rating = "excellent"
        elif best_similarity >= 0.7:
            rating = "good"
        elif best_similarity >= 0.5:
            rating = "fair"
        else:
            rating = "poor"

        return {
            "score": score,
            "matched_words": [ref_words[0]] if best_similarity >= 0.5 else [],
            "missing_words": [] if best_similarity >= 0.5 else ref_words,
            "extra_words": [],
            "word_scores": [
                {
                    "word": ref_words[0],
                    "score": score,
                    "rating": rating,
                    "predicted": best_pred_word,
                }
            ],
        }

    # For sentences, use word-by-word matching with flexibility
    matched_words = []
    missing_words = []
    word_scores = []

    # Create a copy of predicted words to track which are used
    remaining_pred_words = pred_words.copy()

    for ref_word in ref_words:
        best_match = None
        best_similarity = 0
        best_idx = -1

        # Find best matching word in remaining predictions
        for idx, pred_word in enumerate(remaining_pred_words):
            similarity = get_word_similarity(pred_word, ref_word)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = pred_word
                best_idx = idx

        # Consider it a match if similarity >= 0.6 (allowing some pronunciation variance)
        if best_similarity >= 0.6:
            matched_words.append(ref_word)
            if best_idx >= 0:
                remaining_pred_words.pop(best_idx)

            if best_similarity >= 0.9:
                rating = "excellent"
            elif best_similarity >= 0.75:
                rating = "good"
            else:
                rating = "fair"

            word_scores.append(
                {
                    "word": ref_word,
                    "score": best_similarity * 100,
                    "rating": rating,
                    "predicted": best_match,
                }
            )
        else:
            missing_words.append(ref_word)
            word_scores.append(
                {
                    "word": ref_word,
                    "score": best_similarity * 100 if best_similarity > 0 else 0,
                    "rating": "poor",
                    "predicted": best_match if best_match else "",
                }
            )

    # Calculate overall score based on matched words percentage
    match_percentage = len(matched_words) / len(ref_words) if ref_words else 0

    # Also factor in the quality of matches (average similarity of matched words)
    if word_scores:
        avg_quality = np.mean([ws["score"] for ws in word_scores])
        # Combine match percentage (60%) and quality (40%)
        score = (match_percentage * 60) + (avg_quality * 0.4)
    else:
        score = 0

    return {
        "score": score,
        "matched_words": matched_words,
        "missing_words": missing_words,
        "extra_words": remaining_pred_words,
        "word_scores": word_scores,
    }


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
        Chấm điểm phát âm - Hybrid approach combining:
        1. Speech recognition confidence (log-probability)
        2. Text matching between predicted and reference

        Args:
            audio: Audio array (numpy)
            reference_text: Text mẫu
            sample_rate: Audio sample rate

        Returns:
            dict: {
                "overall_score": float (0-100 scale),
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

        logger.info(f"Predicted text: '{predicted_text}'")
        logger.info(f"Reference text: '{reference_text}'")

        # Use text matching to calculate score
        match_result = calculate_text_match_score(predicted_text, reference_text)

        # Get word scores from matching result
        word_scores = match_result.get("word_scores", [])

        # Convert score from 0-100 to rating
        overall_score = match_result["score"]

        # Map 0-100 score to raw score format (-12 to -2) for compatibility
        # Score 100 -> -2, Score 0 -> -12
        raw_score_equivalent = -12.0 + (overall_score / 100.0) * 10.0

        return {
            "overall_score": float(raw_score_equivalent),
            "overall_rating": self._score_to_rating_from_percentage(overall_score),
            "word_scores": word_scores,
            "predicted_text": predicted_text.lower(),
            "reference_text": reference_text.lower(),
            "match_details": {
                "matched_words": match_result.get("matched_words", []),
                "missing_words": match_result.get("missing_words", []),
                "score_percentage": overall_score,
            },
        }

    def _score_to_rating_from_percentage(self, score: float) -> str:
        """Convert percentage score (0-100) to rating"""
        if score >= 85:
            return "excellent"
        elif score >= 65:
            return "good"
        elif score >= 45:
            return "fair"
        else:
            return "poor"

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
    """
    Extract pronunciation errors from word scores.
    Now includes predicted word for better feedback.
    """
    errors = []

    for w in word_scores:
        if w.get("rating") in ["fair", "poor"]:
            predicted = w.get("predicted", "")
            word = w.get("word", "")

            # Determine error type based on prediction
            if not predicted:
                error_type = "missing"
                description = f"Từ '{word}' không được nhận diện"
            elif predicted.lower() != word.lower():
                error_type = "mispronunciation"
                description = f"'{word}' được nghe thành '{predicted}'"
            else:
                error_type = "unclear"
                description = f"Phát âm từ '{word}' chưa rõ ràng"

            errors.append(
                {
                    "word": word,
                    "predicted": predicted,
                    "error_type": error_type,
                    "severity": "moderate" if w.get("rating") == "fair" else "severe",
                    "description": description,
                }
            )

    return errors
