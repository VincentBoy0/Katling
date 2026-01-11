class FeedbackService:
    def __init__(self, llm):
        self.llm = llm

    def generate(self, assessment: dict):
        # Format errors for better feedback
        errors_text = ""
        for error in assessment.get("errors", []):
            word = error.get("word", "")
            predicted = error.get("predicted", "")
            description = error.get("description", "")
            severity = error.get("severity", "moderate")

            if description:
                errors_text += f"- {description} (severity: {severity})\n"
            elif predicted and predicted != word:
                errors_text += (
                    f"- '{word}' was heard as '{predicted}' (severity: {severity})\n"
                )
            else:
                errors_text += (
                    f"- '{word}' pronunciation unclear (severity: {severity})\n"
                )

        if not errors_text:
            errors_text = "No significant errors detected."

        # Get predicted text for context
        predicted_text = assessment.get("predicted_text", "")
        reference_text = assessment.get("reference_text", "")

        prompt = f"""
You are an English pronunciation coach.

Target text: "{reference_text}"
What was heard: "{predicted_text}"
Overall score: {assessment['score']} / 10

Pronunciation issues:
{errors_text}

Rules:
- Respond in Vietnamese
- Focus only on listed errors
- Explain briefly what went wrong
- Give EXACTLY 2 specific practice tips
- No CEFR, no grading explanation
- Simple, encouraging tone
- If score >= 8, give praise and minor improvement tips

Format:
Nhận xét:
Mẹo 1:
Mẹo 2:
"""
        return self.llm.generate(prompt)
