"""
Speech-to-Text Service using Wav2Vec2 or Whisper
"""

import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)


class STTService:
    """Speech-to-Text service"""

    def __init__(self):
        self.processor = None
        self.model = None
        self._initialized = False

    def _ensure_initialized(self):
        """Lazy load the model"""
        if self._initialized:
            return

        try:
            from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
            import torch

            model_id = "facebook/wav2vec2-base-960h"
            logger.info(f"🔄 Loading STT model: {model_id}")

            self.processor = Wav2Vec2Processor.from_pretrained(model_id)
            self.model = Wav2Vec2ForCTC.from_pretrained(model_id)
            self.model.eval()

            self._initialized = True
            logger.info("✅ STT model loaded")

        except Exception as e:
            logger.error(f"Failed to load STT model: {e}")
            raise

    def transcribe(self, audio: np.ndarray, sample_rate: int = 16000) -> str:
        """
        Transcribe audio to text

        Args:
            audio: Audio numpy array
            sample_rate: Audio sample rate (default 16000)

        Returns:
            Transcribed text
        """
        import torch

        self._ensure_initialized()

        if audio is None or len(audio) == 0:
            return ""

        try:
            # Preprocess audio
            inputs = self.processor(
                audio, sampling_rate=sample_rate, return_tensors="pt", padding=True
            )

            # Get predictions
            with torch.no_grad():
                logits = self.model(inputs.input_values).logits

            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = self.processor.batch_decode(predicted_ids)[0]

            logger.info(f"Transcribed: '{transcription}'")
            return transcription.strip()

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise


# Singleton instance
_stt_service: Optional[STTService] = None


def get_stt_service() -> STTService:
    global _stt_service
    if _stt_service is None:
        _stt_service = STTService()
    return _stt_service
