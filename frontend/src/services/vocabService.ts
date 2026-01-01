import { api } from "@/lib/api";

export const vocabService = {
  // search vocab (backend đã normalize)
  search(word: string) {
    return api.get("/vocabs/search", {
      params: { word },
    });
  },

  // list user saved words
  getUserWords() {
    return api.get("/user-words");
  },

  // save vocab
  saveWord(payload: {
    word: string;
    definition: Record<string, string[]>;
    phonetic?: string | null;
    audio_url?: string | null;
    category?: string | null;
  }) {
    return api.post("/user-words", payload);
  },

  // delete vocab
  deleteWord(word: string) {
    return api.delete(`/user-words/${word}`);
  },

  // promote NEW → LEARNING → MASTERED
  promote(vocabId: number) {
    return api.post(`/user-words/${vocabId}/promote`);
  },
};
