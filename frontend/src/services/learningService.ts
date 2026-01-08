import { api } from "@/lib/api";
import {
  TopicsResponse,
  TopicLessonsResponse,
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
};

export default learningService;
