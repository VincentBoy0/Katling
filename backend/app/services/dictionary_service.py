from __future__ import annotations

from typing import Any

import httpx


class DictionaryWordNotFoundError(Exception):
    pass


class DictionaryUpstreamError(Exception):
    pass


_DICTIONARY_API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"
_TIMEOUT_SECONDS = 8.0


def _normalize_word(raw: str) -> str:
    return raw.strip().lower()


def _unique_preserve_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for v in values:
        if v in seen:
            continue
        seen.add(v)
        out.append(v)
    return out


def _extract_audio_url(entry: dict[str, Any]) -> str | None:
    phonetics = entry.get("phonetics")
    if not isinstance(phonetics, list):
        return None

    for item in phonetics:
        if not isinstance(item, dict):
            continue
        audio = item.get("audio")
        if isinstance(audio, str) and audio.strip():
            return audio.strip()

    return None


def _extract_definitions(entry: dict[str, Any]) -> dict[str, list[str]]:
    meanings = entry.get("meanings")
    if not isinstance(meanings, list):
        return {}

    out: dict[str, list[str]] = {}
    for meaning in meanings:
        if not isinstance(meaning, dict):
            continue

        part_of_speech = meaning.get("partOfSpeech")
        key = part_of_speech if isinstance(part_of_speech, str) and part_of_speech else "other"

        defs = meaning.get("definitions")
        if not isinstance(defs, list):
            continue

        collected: list[str] = []
        for d in defs:
            if not isinstance(d, dict):
                continue
            text = d.get("definition")
            if isinstance(text, str) and text.strip():
                collected.append(text.strip())

        if not collected:
            continue

        out[key] = _unique_preserve_order(out.get(key, []) + collected)

    return out


async def lookup_word(raw_word: str) -> dict[str, Any]:
    """Look up a word from dictionaryapi.dev and return normalized payload.

    Returns:
        { "word": str, "definition": {pos: [..]}, "audio_url": str | None }

    Raises:
        DictionaryWordNotFoundError: when the word does not exist (upstream 404)
        DictionaryUpstreamError: for timeouts, network errors, non-200 responses, or unexpected payload
    """

    word = _normalize_word(raw_word)
    if not word:
        raise ValueError("word is required")

    url = f"{_DICTIONARY_API_BASE_URL}/{word}"

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
            resp = await client.get(url)
    except httpx.TimeoutException as exc:
        raise DictionaryUpstreamError("Dictionary API timeout") from exc
    except httpx.HTTPError as exc:
        raise DictionaryUpstreamError("Dictionary API request failed") from exc

    if resp.status_code == 404:
        raise DictionaryWordNotFoundError("Word not found")

    if resp.status_code != 200:
        raise DictionaryUpstreamError(f"Dictionary API returned {resp.status_code}")

    try:
        data = resp.json()
    except ValueError as exc:
        raise DictionaryUpstreamError("Dictionary API returned invalid JSON") from exc

    if not isinstance(data, list) or not data or not isinstance(data[0], dict):
        raise DictionaryUpstreamError("Dictionary API returned unexpected payload")

    entry: dict[str, Any] = data[0]

    result_word = entry.get("word")
    if not isinstance(result_word, str) or not result_word.strip():
        result_word = word

    definition = _extract_definitions(entry)
    audio_url = _extract_audio_url(entry)

    return {
        "word": result_word.strip().lower(),
        "definition": definition,
        "audio_url": audio_url,
    }
