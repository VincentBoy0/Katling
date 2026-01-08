import { api } from "@/lib/api";
import { FlashcardMode, FlashcardsCompleteRequest, FlashcardsResponse, ReviewStatus } from "@/types/flashcard";


export const flashcardService = {

  async getFlashcards(
    mode: FlashcardMode,
    reviewStatus?: string,
    category?: string
  ): Promise<FlashcardsResponse> {
    const params: Record<string, any> = { mode };

    if (mode === "review_status" && reviewStatus) {
      params.review_status = reviewStatus;
    }

    if (mode === "category" && category) {
      params.category = category;
    }

    const response = await api.get<FlashcardsResponse>(
      `/learning/flashcards`,
      { params }
    );
    return response.data;
  },

  async completeFlashcards(payload: FlashcardsCompleteRequest): Promise<void> {
    await api.post<void>(`/learning/flashcards/complete`, {
      user_word_ids: payload.user_word_ids,
    });
  },
};

export default flashcardService;
