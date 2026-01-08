import { useEffect, useMemo, useState } from "react";
import vocabService from "@/services/vocabService";
import flashcardService from "@/services/flashcardService";
import { UserWordWithVocabOut } from "@/types/vocab";
import { FlashcardCard, FlashcardMode, ReviewStatus } from "@/types/flashcard";

export function useFlashcardLibrary() {
  const [savedWords, setSavedWords] = useState<UserWordWithVocabOut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vocabService
      .listUserWords()
      .then(setSavedWords)
      .catch(() => setError("Không tải được từ vựng"));
  }, []);

  const folders = useMemo(() => {
    return Array.from(
      new Set(savedWords.map(w => w.category).filter((c): c is string => typeof c === "string"))
    );
  }, [savedWords]);

  const statusCounts = useMemo(() => ({
    NEWBIE: savedWords.filter(w => w.review_status === "NEWBIE").length,
    LEARNING: savedWords.filter(w => w.review_status === "LEARNING").length,
    MASTERED: savedWords.filter(w => w.review_status === "MASTERED").length,
  }), [savedWords]);

  const startSession = async ( opts: {
    mode: FlashcardMode,
    reviewStatus?: ReviewStatus,
    category?: string
  }): Promise<FlashcardCard[]> => {

    setIsLoading(true);
    setError(null);

    try {
      const res = await flashcardService.getFlashcards(
        opts.mode,
        opts.reviewStatus,
        opts.category
      );

      if (res.cards.length === 0) {
        throw new Error("Không có flashcards để học");
      }

      return res.cards;

    } catch {
      setError("Không tải được flashcards");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    savedWords,
    folders,
    statusCounts,
    startSession,
    isLoading,
    error,
  };
}
