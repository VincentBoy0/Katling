// services/flashcardService.ts
import { api } from "@/lib/api";

export type FlashcardMode = "all" | "review_status" | "category";
export type ReviewStatus = "NEWBIE" | "LEARNING" | "MASTERED";

export interface FlashcardCard {
  user_word_id: number;
  word: string;
  definition: string;
  phonetic: string | null;
  audio_url: string | null;
}

export interface FlashcardsResponse {
  total: number;
  cards: FlashcardCard[];
}

export interface CompleteFlashcardsRequest {
  user_word_ids: number[];
}

export const flashcardService = {
  /**
   * Get flashcards với filter
   * @param mode - all | review_status | category
   * @param reviewStatus - NEW | LEARNING | MASTERED (nếu mode = review_status)
   * @param category - tên category (nếu mode = category)
   */
  async getFlashcards(
    mode: FlashcardMode = "all",
    reviewStatus?: ReviewStatus,
    category?: string
  ): Promise<FlashcardsResponse> {
    const params: any = { mode };
    
    if (mode === "review_status" && reviewStatus) {
      params.review_status = reviewStatus;
    }
    
    if (mode === "category" && category) {
      params.category = category;
    }

    const response = await api.get<FlashcardsResponse>(
      "/learning/flashcards",
      { params }
    );
    return response.data;
  },

  /**
   * Đánh dấu các flashcard đã ôn tập xong
   */
  async completeFlashcards(userWordIds: number[]): Promise<void> {
    await api.post("/learning/flashcards/complete", {
      user_word_ids: userWordIds,
    });
  },
};
