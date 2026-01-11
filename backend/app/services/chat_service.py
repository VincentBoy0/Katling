from typing import List, Dict
from services.gemini_client import GeminiClient


class ConversationChatService:
    """
    Conversation-only chatbot
    - No pronunciation scoring
    - No wav2vec
    """

    def __init__(self, llm: GeminiClient):
        self.llm = llm
        self.history: List[Dict[str, str]] = []

    def chat(self, message: str) -> str:
        prompt = self._build_prompt(message)
        reply = self.llm.generate(prompt)

        self.history.append({"role": "user", "content": message})
        self.history.append({"role": "assistant", "content": reply})

        return reply

    def reset(self):
        self.history.clear()

    def get_history(self):
        return self.history

    def _build_prompt(self, message: str) -> str:
        history_text = "\n".join(
            f"{h['role'].capitalize()}: {h['content']}"
            for h in self.history[-6:]  # limit memory
        )

        return f"""
You are a friendly language learning assistant named Katbot.

Rules:
- IMPORTANT: Always respond in the SAME language the user is using. If the user writes in Vietnamese, respond entirely in Vietnamese. If the user writes in English, respond entirely in English. If the user mixes languages, respond in their dominant language.
- Speak naturally and conversationally
- Use simple, clear language appropriate for learners
- Gently correct mistakes when helping with language learning
- Encourage and motivate the learner
- Be helpful, friendly, and supportive

Conversation so far:
{history_text}

User: {message}
Assistant:
"""
