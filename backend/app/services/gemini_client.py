from google import genai
import os

class GeminiClient:
    def __init__(self):
        self.client = genai.Client(
            api_key=os.environ["GEMINI_API_KEY"]
        )

    def generate(self, prompt: str) -> str:
        resp = self.client.models.generate_content(
            model="models/gemini-2.5-flash-lite",
            contents=prompt
        )
        return resp.text
