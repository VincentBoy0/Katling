import { useState } from "react";
import { flashcardService } from "@/services/flashcardService";
import { FlashcardCard } from "@/types/flashcard";

export function useFlashcardSession() {
  const [cards, setCards] = useState<FlashcardCard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const start = (cards: FlashcardCard[]) => {
    if (cards.length === 0) return;
    setCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const next = async () => {
    if (!cards) return;
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
      return;
    }
    await flashcardService.completeFlashcards({
      user_word_ids: cards.map(c => c.user_word_id),
    });

    reset();
  };

  const reset = () => {
    setCards(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cards ? cards[currentIndex] : null;
  const progress =
    cards && cards.length > 0
      ? ((currentIndex + 1) / cards.length) * 100
      : 0;

  return {
    cards,
    currentIndex,
    currentCard,
    isFlipped,
    progress,

    setIsFlipped,
    start,
    next,
    exit: reset,
  };
}

