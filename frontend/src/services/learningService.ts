// services/learning.service.ts
import { api } from "@/lib/api";
import {
  QuestionContent,
  AnswerSubmitResponse,
  SectionQuestionsResponse,
  NextSectionResponse,
  CompleteSectionResponse,
  TopicsResponse,
  CompleteSectionRequest,
  TopicProgressOut,
  AnswerSubmitRequest,
} from "@/types/learning";

export const learningService = {

  async getTopics(): Promise<TopicsResponse> {
    const response = await api.get<TopicsResponse>('/topics');
    return response.data;
  },

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

  async completeSection(
    lessonId: number,
    sectionId: number,
    score: number
  ): Promise<CompleteSectionResponse> {
    const response = await api.post<CompleteSectionResponse>(
      `/lessons/${lessonId}/sections/${sectionId}/complete`,
      { score }
    );
    return response.data;
  },
};

export default learningService;
