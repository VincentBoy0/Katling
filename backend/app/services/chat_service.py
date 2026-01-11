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
You are an English conversation partner.

Rules:
- Speak naturally
- Use simple, clear English
- Gently correct mistakes
- Do NOT score pronunciation
- Encourage the learner
- Use language similar to the user's messages. If they use Vietnamese to ask a question, respond in Vietnamese. If they use English, respond in English.

Conversation so far:
{history_text}

User: {message}
Assistant:
"""
