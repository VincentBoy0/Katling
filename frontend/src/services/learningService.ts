import { api } from "@/lib/api";
import {
  TopicsResponse,
  TopicLessonsResponse,
  LessonSectionsResponse,
} from "@/types/learning";

export const learningService = {

  async getTopics(): Promise<TopicsResponse> {
    const response = await api.get<TopicsResponse>('/topics');
    return response.data;
  },

  async getTopicLessons(topicId: number): Promise<TopicLessonsResponse> {
    const response = await api.get<TopicLessonsResponse>(`/topics/${topicId}/lessons`);
    return response.data;
  },

  async getLessonSections(lessonId: number): Promise<LessonSectionsResponse> {
    const response = await api.get<LessonSectionsResponse>(`/lessons/${lessonId}/sections`);
    return response.data;
  }
};

export default learningService;
