from typing import Dict, List, Optional, Literal
import logging
import librosa
import numpy as np
import io

from ml_models.text_generator import TextGenerator, PronunciationChatbot
from ml_models.pronunciation_scorer import PronunciationScorer
from ml_models.feedback_generator import FeedbackGenerator

logger = logging.getLogger(__name__)


class ChatbotService:
    """
    Chatbot service - Stateless
    Mỗi request độc lập, không lưu history
    """

    def __init__(self):
        # Initialize ML models (singleton)
        self.text_gen = TextGenerator()
        self.scorer = PronunciationScorer()
        self.feedback_gen = FeedbackGenerator(self.text_gen)
        self.chatbot = PronunciationChatbot()  # Add chatbot instance

        logger.info("✅ ChatbotService initialized")

    def generate_practice(self, level: str, topic: str) -> Dict:
        """
        Step 1: Generate practice text
        Pure function - no side effects

        Returns:
            {
                "practice_text": str,
                "level": str,
                "topic": str,
                "instruction": str
            }
        """

        logger.info(f"Generating practice: level={level}, topic={topic}")

        practice_text = self.text_gen.generate_practice_text(level, topic)

        return {
            "practice_text": practice_text,
            "level": level,
            "topic": topic,
            "instruction": "Please read this sentence aloud clearly and record your voice.",
        }

    def assess_pronunciation(self, audio_bytes: bytes, reference_text: str) -> Dict:
        """
        Step 2: Assess pronunciation và generate feedback
        Pure function - no side effects

        Returns:
            {
                "assessment": {...},
                "feedback": str
            }
        """

        logger.info(f"Assessing pronunciation for: {reference_text}")

        # Load audio
        audio_array = load_audio_from_bytes(audio_bytes)

        # Score pronunciation
        assessment = self.scorer.score_pronunciation(audio_array, reference_text)

        # Generate feedback
        feedback = self.feedback_gen.generate_feedback(assessment)

        return {"assessment": assessment, "feedback": feedback}

    def chat(
        self,
        message: str,
        sentence_type: Literal["simple", "academic", "auto"] = "auto",
    ) -> Dict:
        """
        Chat with the pronunciation bot

        Args:
            message: User's message
            sentence_type: Type of sentence to generate

        Returns:
            {
                "response": str,
                "sentence_type": str
            }
        """
        logger.info(f"Chat message: {message}")

        # Determine actual sentence type used
        if sentence_type == "auto":
            actual_type = self.chatbot._determine_sentence_type(message)
        else:
            actual_type = sentence_type

        # Get response from chatbot
        response = self.chatbot.chat(message, sentence_type)

        return {"response": response, "sentence_type": actual_type}

    def generate_sentence(
        self,
        sentence_type: Literal["simple", "academic"],
        topic: str = "daily life",
        context: Optional[str] = None,
    ) -> Dict:
        """
        Generate a single sentence

        Args:
            sentence_type: Type of sentence
            topic: Topic for the sentence
            context: Optional context

        Returns:
            {
                "sentence": str,
                "sentence_type": str,
                "topic": str
            }
        """
        logger.info(f"Generating {sentence_type} sentence about {topic}")

        if sentence_type == "simple":
            sentence = self.chatbot.generate_simple_sentence(topic, context)
        else:
            sentence = self.chatbot.generate_academic_sentence(topic, context)

        return {"sentence": sentence, "sentence_type": sentence_type, "topic": topic}

    def generate_batch(
        self,
        count: int = 5,
        sentence_type: Literal["simple", "academic", "mixed"] = "mixed",
        topics: Optional[List[str]] = None,
    ) -> Dict:
        """
        Generate multiple sentences

        Args:
            count: Number of sentences
            sentence_type: Type of sentences
            topics: List of topics

        Returns:
            {
                "sentences": List[Dict],
                "total_count": int
            }
        """
        logger.info(f"Generating {count} {sentence_type} sentences")

        sentences = self.chatbot.generate_sentence_batch(count, sentence_type, topics)

        return {"sentences": sentences, "total_count": len(sentences)}

    def clear_history(self):
        """Clear conversation history"""
        self.chatbot.clear_history()
        logger.info("Conversation history cleared")

    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.chatbot.get_history()


def load_audio_from_bytes(audio_bytes: bytes, sr: int = 16000) -> np.ndarray:
    """
    Load audio from bytes

    Args:
        audio_bytes: Audio file bytes
        sr: Target sample rate

    Returns:
        np.ndarray: Audio array
    """

    # Load from bytes using librosa
    audio, _ = librosa.load(io.BytesIO(audio_bytes), sr=sr)

    # Truncate if too long (max 30 seconds)
    max_samples = 30 * sr
    if len(audio) > max_samples:
        audio = audio[:max_samples]

    return audio
