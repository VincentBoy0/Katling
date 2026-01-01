// services/learning.service.ts
import { api } from "@/lib/api";
import {
  QuestionContent,
  AnswerSubmitResponse,
  SectionQuestionsResponse,
  NextSectionResponse,
} from "@/types/learning";

export const learningService = {
  async getSectionQuestions(sectionId: number): Promise<SectionQuestionsResponse> {
    const response = await api.get<SectionQuestionsResponse>(
      `/sections/${sectionId}/questions`
    );
    return response.data;
  },

  async submitAnswer(
    questionId: number,
    answer: QuestionContent
  ): Promise<AnswerSubmitResponse> {
    const response = await api.post<AnswerSubmitResponse>(
      `/questions/${questionId}/answer`,
      { answer }
    );
    return response.data;
  },

  async getNextSection(lessonId: number): Promise<NextSectionResponse> {
    const response = await api.get<NextSectionResponse>(
      `/lessons/${lessonId}/next-section`
    );
    return response.data;
  },
};

export default learningService;
