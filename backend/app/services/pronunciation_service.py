import re
from typing import Dict
import json
from services.gemini_client import GeminiClient


class PracticeService:
    def __init__(self, llm: GeminiClient):
        self.llm = llm

    def generate_words(self, count: int, level: str, topic: str) -> Dict:
        prompt = f"""
You are an English teacher.

Generate {count} English word for pronunciation practice.

Constraints:
- Level: {level}
- Topic: {topic}
- Common word
- Clear pronunciation

Respond ONLY in valid JSON array:
[
  {{ "word": "..." }},
  {{ "word": "..." }}
]
"""
        return self._call_llm(prompt)

    def generate_sentences(self, count: int, level: str, topic: str) -> Dict:
        prompt = f"""
You are an English pronunciation coach.

Generate {count} English sentence for pronunciation practice.

Constraints:
- Level: {level}
- Topic: {topic}
- 6-12 words
- Natural spoken English

Return ONLY valid JSON:
{{"sentence": "...", "focus": "..."}}
"""
        return self._call_llm(prompt)

    def _call_llm(self, prompt: str) -> Dict:
        raw = self.llm.generate(prompt)

        cleaned = raw.strip()

        # Remove ```json or ``` wrappers
        cleaned = re.sub(r"^```json\s*", "", cleaned)
        cleaned = re.sub(r"^```\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            return json.loads(cleaned)
        except Exception:
            raise ValueError(f"LLM returned invalid JSON: {raw}")
