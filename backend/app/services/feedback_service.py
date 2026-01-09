class FeedbackService:
    def __init__(self, llm):
        self.llm = llm

    def generate(self, assessment: dict):
        prompt = f"""
You are an English pronunciation coach.

Overall score: {assessment['score']} / 10

Pronunciation errors:
{assessment['errors']}

Rules:
- Focus only on listed errors
- Explain briefly what went wrong
- Give EXACTLY 2 specific practice tips
- No CEFR, no grading explanation
- Simple, encouraging tone

Format:
Explanation:
Tip 1:
Tip 2:
"""
        return self.llm.generate(prompt)
