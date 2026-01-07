export type ReviewStatus = "NEWBIE" | "LEARNING" | "MASTERED";

export interface VocabSearchResponse {
  word: string;
  definition: Record<string, string[]>;
  audio_url?: string | null;
  phonetic?: string | null;
}

export interface UserWordWithVocabOut {
  id: number;
  user_id: number;
  vocab_id: number;
  category?: string | null;
  status?: Record<string, any> | null;
  review_status: ReviewStatus;
  last_reviewed_at: string;
  created_at: string;
  word: string;
  definition?: Record<string, any> | null;
  audio_url?: string | null;
  phonetic?: string | null;
}

export interface UserWordOut {
  id: number;
  user_id: number;
  vocab_id: number;
  category?: string | null;
  status?: Record<string, any> | null;
  review_status: ReviewStatus;
  last_reviewed_at: string;
  next_reviewed_at: string;
  created_at: string;
}

export interface SaveVocabRequest {
  word: string;
  definition: Record<string, any>;
  audio_url?: string | null;
  phonetic?: string | null;
  category?: string | null;
}
