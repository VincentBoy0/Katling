export type FlashcardMode = "all" | "review_status" | "category";
export type ReviewStatus = "NEWBIE" | "LEARNING" | "MASTERED";


export interface FlashcardsResponse {
  total: number;
  cards: FlashcardCard[];
}

export interface FlashcardCard {
  user_word_id: number;
  word: string;
  definition: string;
  phonetic?: string | null;
  audio_url?: string | null;
}

export interface FlashcardsCompleteRequest {
  user_word_ids: number[];
}
