import librosa
import numpy as np
import io


def load_audio_from_bytes(audio_bytes: bytes, sr: int = 16000) -> np.ndarray:
    audio, _ = librosa.load(io.BytesIO(audio_bytes), sr=sr)

    max_len = sr * 30
    return audio[:max_len]
