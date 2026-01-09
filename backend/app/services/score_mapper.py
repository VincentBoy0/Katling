def map_raw_score_to_10(raw_score: float) -> float:
    """
    Map wav2vec raw score (~ -12 to -2) to 0–10 scale
    """
    min_raw = -12.0
    max_raw = -2.0

    # clamp
    raw_score = max(min_raw, min(max_raw, raw_score))

    normalized = (raw_score - min_raw) / (max_raw - min_raw)
    score_10 = normalized * 10

    return round(score_10, 1)
