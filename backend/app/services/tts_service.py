"""
Text-to-Speech Service using gTTS (Google Text-to-Speech)
Free and doesn't require API key
"""

import io
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)


class TTSService:
    """Text-to-Speech service using gTTS"""

    def __init__(self, default_lang: str = "en"):
        self.default_lang = default_lang

    def synthesize(self, text: str, lang: str = None) -> bytes:
        """
        Convert text to speech audio bytes (MP3 format)

        Args:
            text: Text to convert to speech
            lang: Language code (e.g., 'en', 'vi')

        Returns:
            Audio bytes in MP3 format
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        lang = lang or self.default_lang

        try:
            # Create gTTS object
            tts = gTTS(text=text, lang=lang, slow=False)

            # Save to bytes buffer
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)

            audio_bytes = audio_buffer.read()
            logger.info(
                f"Generated TTS audio: {len(audio_bytes)} bytes for text: '{text[:50]}...'"
            )

            return audio_bytes

        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise

    def detect_language(self, text: str) -> str:
        """
        Simple language detection based on character analysis
        """
        # Check for Vietnamese characters
        vietnamese_chars = set(
            "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
        )
        text_lower = text.lower()

        vietnamese_count = sum(1 for char in text_lower if char in vietnamese_chars)

        # If more than 5% Vietnamese chars, assume Vietnamese
        if len(text) > 0 and vietnamese_count / len(text) > 0.05:
            return "vi"

        return "en"
