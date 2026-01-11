import { api } from "@/lib/api";
import {
  SectionQuestionsResponse,
  QuestionAnswerSubmitResponse,
  QuestionAnswerSubmitRequest,
  NextSectionResponse,
  CompleteSectionRequest,
  CompleteSectionResponse,
  LessonContentResponse,
} from "@/types/lesson";

export const lessonService = {

  async getLessonContent(lessonId: number): Promise<LessonContentResponse> {
    const response = await api.get<LessonContentResponse>(`/lessons/${lessonId}/content`);
    return response.data;
  },

  async getSectionQuestions(sectionId: number): Promise<SectionQuestionsResponse> {
    const response = await api.get<SectionQuestionsResponse>(`/sections/${sectionId}/questions`);
    return response.data;
  },

  async submitQuestionAnswer(
    questionId: number,
    payload: QuestionAnswerSubmitRequest
  ): Promise<QuestionAnswerSubmitResponse> {
    const response = await api.post<QuestionAnswerSubmitResponse>(
      `/questions/${questionId}/answer`,
      payload
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
    payload: CompleteSectionRequest
  ): Promise<CompleteSectionResponse> {
    const response = await api.post<CompleteSectionResponse>(
      `/lessons/${lessonId}/sections/${sectionId}/complete`,
      payload
    );
    return response.data;
  },
};

export default lessonService;
