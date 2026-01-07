import { api } from "@/lib/api";
import { UserWordWithVocabOut, VocabSearchResponse, SaveVocabRequest, UserWordOut } from "@/types/vocab";


export const vocabService = {

  async search(word: string): Promise<VocabSearchResponse> {
    const response = await api.get<VocabSearchResponse>(
      `/vocabs/search`,
      { params: { word } }
    );
    return response.data;
  },

  async listUserWords(): Promise<UserWordWithVocabOut[]> {
    const response = await api.get<UserWordWithVocabOut[]>(`/user-words`);
    return response.data;
  },

  async saveUserWord(payload: SaveVocabRequest): Promise<UserWordOut> {
    const response = await api.post<UserWordOut>("/user-words", payload);
    return response.data;
  },

  async deleteUserWord(word: string) {
    return await api.delete(`/user-words/${word}`);
  },

  async promoteUserWord(vocabId: number) {
    const response = await api.post(`/user-words/${vocabId}/promote`);
    return response.data;
  },
};

export default vocabService;
