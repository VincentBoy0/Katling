from typing import Dict
import logging
import torch

logger = logging.getLogger(__name__)

class FeedbackGenerator:
    """Generate feedback using Qwen3"""

    def __init__(self, text_generator):
        """
        Args:
            text_generator: TextGenerator instance (reuse)
        """
        self.generator = text_generator

    def generate_feedback(self, assessment: Dict) -> str:
        """
        Generate feedback - Pure function

        Args:
            assessment: Dict from PronunciationScorer.score_pronunciation()

        Returns:
            str: Feedback text
        """

        overall = assessment["overall_rating"]
        word_scores = assessment["word_scores"]

        # Find weak words
        weak_words = [w for w in word_scores if w["rating"] in ["fair", "poor"]]

        if weak_words:
            weak_list = ", ".join([f'"{w["word"]}"' for w in weak_words])
            prompt = f"""
              You are an English pronunciation tutor. Provide encouraging feedback.

              Student's performance: {overall}
              Words needing improvement: {weak_list}

              Give 2-3 specific, actionable tips. Be encouraging.

              Feedback:"""
        else:
            prompt = f"""
              You are an English pronunciation tutor. Provide positive feedback.

              Student's performance: {overall}
              All words pronounced excellently!

              Give encouraging reinforcement in 2-3 sentences.

              Feedback:"""

        inputs = self.generator.tokenizer(prompt, return_tensors="pt").to(
            self.generator.model.device
        )

        with torch.no_grad():
            outputs = self.generator.model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.generator.tokenizer.eos_token_id
            )

        feedback = self.generator.tokenizer.decode(outputs[0], skip_special_tokens=True)
        feedback = feedback.split("Feedback:")[-1].strip()
        feedback = feedback.split("\n\n")[0].strip()

        return feedback
