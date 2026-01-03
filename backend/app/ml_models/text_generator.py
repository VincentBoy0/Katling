import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Optional, List, Dict, Literal
import logging

logger = logging.getLogger(__name__)


class TextGenerator:
    """Singleton - Load model một lần duy nhất"""

    _instance: Optional["TextGenerator"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_id: str = "Qwen/Qwen3-0.6B"):
        if hasattr(self, "initialized"):
            return

        logger.info(f"🔄 Loading Qwen3: {model_id}")

        self.tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            device_map="auto",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
        self.model.eval()

        self.initialized = True
        logger.info("✅ Qwen3 loaded")

    def generate_practice_text(
        self, level: str = "beginner", topic: str = "daily_life"
    ) -> str:
        """
        Sinh câu luyện tập - Pure function, không side effects

        Args:
            level: beginner, intermediate, advanced
            topic: daily_life, business, travel, etc.

        Returns:
            str: Practice sentence
        """

        prompts = {
            "beginner": f"Generate a simple English sentence about {topic} (5-8 words).\nSentence:",
            "intermediate": f"Generate a natural English sentence about {topic} (8-12 words).\nSentence:",
            "advanced": f"Generate a complex English sentence about {topic} (12-15 words).\nSentence:",
        }

        prompt = prompts.get(level, prompts["beginner"])

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=50,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract and clean
        sentence = generated.split("Sentence:")[-1].strip()
        sentence = sentence.split("\n")[0].strip()

        if not sentence.endswith((".", "!", "?")):
            sentence = sentence.split(".")[0] + "."

        return sentence

    def generate_word(self, level: str, topic: str) -> Dict:
        prompt = f"""
        Generate ONE English word for pronunciation practice.

        Level: {level}
        Topic: {topic}

        Respond in JSON:
        {{
          "word": "...",
          "phonetic": "...",
          "meaning": "..."
        }}
        """

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=60,
                temperature=0.7,
                do_sample=True,
            )

        text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        json_text = extract_json(text)  # helper parse JSON

        return json_text


class PronunciationChatbot:
    """
    Chatbot using Qwen3 to generate sentences for pronunciation practice
    Supports simple and academic sentence generation
    """

    _instance: Optional["PronunciationChatbot"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_id: str = "Qwen/Qwen3-0.6B"):
        if hasattr(self, "initialized"):
            return

        logger.info(f"🔄 Loading Qwen3 Chatbot: {model_id}")

        self.tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            device_map="auto",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
        self.model.eval()

        # Conversation history
        self.conversation_history: List[Dict[str, str]] = []

        self.initialized = True
        logger.info("✅ Qwen3 Chatbot loaded")

    def generate_simple_sentence(
        self, topic: str = "daily life", context: Optional[str] = None
    ) -> str:
        """
        Generate a simple sentence for beginner pronunciation practice

        Args:
            topic: Topic for the sentence (e.g., "food", "weather", "travel")
            context: Optional context to guide generation

        Returns:
            str: A simple English sentence (5-10 words)
        """
        if context:
            prompt = f"Generate a simple English sentence about {topic}. Context: {context}\nUse basic vocabulary and simple grammar. Sentence (5-10 words):"
        else:
            prompt = f"Generate a simple English sentence about {topic}.\nUse basic vocabulary and simple grammar. Sentence (5-10 words):"

        return self._generate_sentence(prompt, max_words=10, temperature=0.7)

    def generate_academic_sentence(
        self, topic: str = "science", context: Optional[str] = None
    ) -> str:
        """
        Generate an academic sentence for advanced pronunciation practice

        Args:
            topic: Academic topic (e.g., "biology", "economics", "technology")
            context: Optional context to guide generation

        Returns:
            str: An academic English sentence (12-20 words)
        """
        if context:
            prompt = f"Generate an academic English sentence about {topic}. Context: {context}\nUse formal language and complex vocabulary. Sentence (12-20 words):"
        else:
            prompt = f"Generate an academic English sentence about {topic}.\nUse formal language and complex vocabulary. Sentence (12-20 words):"

        return self._generate_sentence(prompt, max_words=25, temperature=0.8)

    def chat(
        self,
        user_message: str,
        sentence_type: Literal["simple", "academic", "auto"] = "auto",
    ) -> str:
        """
        Chat with the user and generate appropriate sentences

        Args:
            user_message: User's message or request
            sentence_type: Type of sentence to generate ("simple", "academic", or "auto")

        Returns:
            str: Chatbot response with generated sentence
        """
        # Add user message to history
        self.conversation_history.append({"role": "user", "content": user_message})

        # Build conversation context
        context = self._build_context()

        # Determine sentence type if auto
        if sentence_type == "auto":
            sentence_type = self._determine_sentence_type(user_message)

        # Generate appropriate response
        if sentence_type == "simple":
            topic = self._extract_topic(user_message)
            sentence = self.generate_simple_sentence(topic, context)
            response = f'Here\'s a simple sentence for you to practice:\n\n"{sentence}"\n\nTry to pronounce it clearly!'
        else:  # academic
            topic = self._extract_topic(user_message)
            sentence = self.generate_academic_sentence(topic, context)
            response = f'Here\'s an academic sentence for you to practice:\n\n"{sentence}"\n\nFocus on the formal vocabulary and complex structure!'

        # Add response to history
        self.conversation_history.append({"role": "assistant", "content": response})

        return response

    def generate_sentence_batch(
        self,
        count: int = 5,
        sentence_type: Literal["simple", "academic", "mixed"] = "mixed",
        topics: Optional[List[str]] = None,
    ) -> List[Dict[str, str]]:
        """
        Generate multiple sentences for practice

        Args:
            count: Number of sentences to generate
            sentence_type: Type of sentences ("simple", "academic", or "mixed")
            topics: List of topics to use (random if None)

        Returns:
            List of dictionaries with sentence info
        """
        default_topics = {
            "simple": ["food", "weather", "family", "hobbies", "daily life"],
            "academic": ["science", "technology", "economics", "psychology", "history"],
        }

        sentences = []
        for i in range(count):
            if sentence_type == "mixed":
                current_type = "simple" if i % 2 == 0 else "academic"
            else:
                current_type = sentence_type

            if topics:
                topic = topics[i % len(topics)]
            else:
                topic_list = default_topics.get(current_type, default_topics["simple"])
                topic = topic_list[i % len(topic_list)]

            if current_type == "simple":
                sentence = self.generate_simple_sentence(topic)
            else:
                sentence = self.generate_academic_sentence(topic)

            sentences.append(
                {
                    "sentence": sentence,
                    "type": current_type,
                    "topic": topic,
                    "index": i + 1,
                }
            )

        return sentences

    def _generate_sentence(
        self, prompt: str, max_words: int = 15, temperature: float = 0.7
    ) -> str:
        """
        Internal method to generate sentence from prompt

        Args:
            prompt: Generation prompt
            max_words: Maximum words in sentence
            temperature: Sampling temperature

        Returns:
            str: Generated sentence
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_words * 2,  # Approximate tokens per word
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                top_k=50,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract sentence after prompt
        sentence = generated.split("Sentence:")[-1].strip()
        if "\n" in sentence:
            sentence = sentence.split("\n")[0].strip()

        # Clean and format
        sentence = sentence.strip('"').strip("'").strip()

        # Ensure proper punctuation
        if not sentence.endswith((".", "!", "?")):
            if "." in sentence:
                sentence = sentence.split(".")[0] + "."
            else:
                sentence = sentence + "."

        return sentence

    def _build_context(self) -> Optional[str]:
        """Build context from recent conversation history"""
        if len(self.conversation_history) < 2:
            return None

        # Get last 3 exchanges
        recent = self.conversation_history[-6:]
        context_parts = []

        for msg in recent:
            if msg["role"] == "user":
                context_parts.append(msg["content"])

        return " ".join(context_parts) if context_parts else None

    def _determine_sentence_type(
        self, user_message: str
    ) -> Literal["simple", "academic"]:
        """Determine sentence type from user message"""
        academic_keywords = ["academic", "formal", "complex", "advanced", "scientific"]
        simple_keywords = ["simple", "easy", "basic", "beginner"]

        message_lower = user_message.lower()

        if any(keyword in message_lower for keyword in academic_keywords):
            return "academic"
        elif any(keyword in message_lower for keyword in simple_keywords):
            return "simple"

        # Default to simple for beginners
        return "simple"

    def _extract_topic(self, user_message: str) -> str:
        """Extract topic from user message"""
        # Simple keyword extraction
        common_topics = [
            "food",
            "weather",
            "travel",
            "family",
            "work",
            "hobbies",
            "science",
            "technology",
            "health",
            "education",
            "sports",
            "economics",
            "history",
            "psychology",
            "biology",
            "physics",
        ]

        message_lower = user_message.lower()

        for topic in common_topics:
            if topic in message_lower:
                return topic

        # Default topic
        return "daily life"

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        logger.info("Conversation history cleared")

    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history.copy()



def extract_json(text: str) -> Dict:
    """
    Extract JSON object from text

    Args:
        text: Text containing JSON

    Returns:
        Dict: Parsed JSON object
    """
    import json
    import re

    # Find JSON substring
    json_pattern = r"\{(?:[^{}]|(?R))*\}"
    match = re.search(json_pattern, text, re.DOTALL)

    if match:
        json_str = match.group(0)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return {}
    else:
        logger.error("No JSON found in text")
        return {}
